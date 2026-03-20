"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: string;
  restTime: number;
  videoUrl?: string;
  imageUrl?: string;
  instructions: string[];
}

interface Module {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number;
  exercises: Exercise[];
}

const AdminModulesPage: React.FC = () => {
  // Estados principales
  const [showCreateExercise, setShowCreateExercise] = React.useState(false);
  const [modules, setModules] = React.useState<Module[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [existingExercises, setExistingExercises] = React.useState<Exercise[]>([]);
  const [selectedExistingExercises, setSelectedExistingExercises] = React.useState<string[]>([]);
  const [newModule, setNewModule] = React.useState<Module>({
    id: "",
    name: "",
    description: "",
    estimatedDuration: 0,
    exercises: [],
  });
  const [currentExercise, setCurrentExercise] = React.useState<Exercise>({
    id: "",
    name: "",
    description: "",
    sets: 3,
    reps: "",
    restTime: 60,
    videoUrl: "",
    imageUrl: "",
    instructions: [],
  });
  const [instructionInput, setInstructionInput] = React.useState("");
  const [editModule, setEditModule] = React.useState<Module | null>(null);
  const [deleteModuleId, setDeleteModuleId] = React.useState<string | null>(null);

  // Handlers principales
  const handleEditModule = (module: Module) => {
    setEditModule(module);
  };

  const handleDeleteModule = (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar este módulo?')) {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      fetch('/api/admin/modules', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setModules((prev: Module[]) => prev.filter((m: Module) => m.id !== id));
          }
        })
        .finally(() => setLoading(false));
    }
  };

  const handleSaveEditModule = async () => {
    if (!editModule) return;
    setLoading(true);
    const token = localStorage.getItem('authToken');
    const res = await fetch('/api/admin/modules', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: editModule.id,
        name: editModule.name,
        description: editModule.description,
        estimatedDuration: editModule.estimatedDuration,
        exercises: editModule.exercises,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setModules((prev: Module[]) => prev.map((m: Module) => m.id === editModule.id ? { ...m, ...editModule } : m));
      setEditModule(null);
    }
    setLoading(false);
  };

  const handleSaveNewExercise = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(currentExercise),
      });
      const data = await res.json();
      if (data && data.exercise) {
        setExistingExercises((prev: Exercise[]) => [...prev, data.exercise]);
        setSelectedExistingExercises((prev: string[]) => [...prev, data.exercise.id]);
        setShowCreateExercise(false);
        setCurrentExercise({
          id: "",
          name: "",
          description: "",
          sets: 3,
          reps: "",
          restTime: 60,
          videoUrl: "",
          imageUrl: "",
          instructions: [],
        });
      }
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstruction = () => {
    if (instructionInput.trim()) {
      setCurrentExercise({
        ...currentExercise,
        instructions: [...currentExercise.instructions, instructionInput.trim()],
      });
      setInstructionInput("");
    }
  };

  const handleRemoveInstruction = (idx: number) => {
    setCurrentExercise({
      ...currentExercise,
      instructions: currentExercise.instructions.filter((_: string, i: number) => i !== idx),
    });
  };

  const handleAddExercise = () => {
    setNewModule({
      ...newModule,
      exercises: [...newModule.exercises, { ...currentExercise, id: Date.now().toString() }],
    });
    setCurrentExercise({
      id: "",
      name: "",
      description: "",
      sets: 3,
      reps: "",
      restTime: 60,
      videoUrl: "",
      imageUrl: "",
      instructions: [],
    });
  };

  const handleAddExistingExercises = () => {
    const exercisesToAdd = existingExercises.filter((ex: Exercise) => selectedExistingExercises.includes(ex.id));
    // Evitar duplicados por id
    const currentIds = newModule.exercises.map((ex: Exercise) => ex.id);
    const uniqueExercises = exercisesToAdd.filter((ex: Exercise) => !currentIds.includes(ex.id));
    setNewModule((prev: Module) => ({
      ...prev,
      exercises: [...prev.exercises, ...uniqueExercises]
    }));
    setSelectedExistingExercises([]);
  };

  const handleAddModule = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newModule.name,
          description: newModule.description,
          estimatedDuration: newModule.estimatedDuration,
          exercises: newModule.exercises.map((ex: Exercise) => ({
            ...ex,
            id: ex.id || undefined,
          })),
        }),
      });
      if (!res.ok) throw new Error('Error al guardar el módulo');
      const data = await res.json();
      if (data && data.id && data.exercises) {
        setModules([...modules, data]);
      } else if (data && data.module && data.module.id && data.module.exercises) {
        setModules([...modules, data.module]);
      }
      setNewModule({
        id: "",
        name: "",
        description: "",
        estimatedDuration: 0,
        exercises: [],
      });
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showExerciseForm, setShowExerciseForm] = useState(false);

  React.useEffect(() => {
    const fetchModules = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('No hay token de autenticación. Por favor, inicia sesión.');
        return;
      }
      const res = await fetch('/api/admin/modules', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.status === 401) {
        alert('Token inválido o expirado. Por favor, vuelve a iniciar sesión.');
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.modules)) {
        setModules(data.modules);
      }
    };
    fetchModules();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Módulos</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowModuleForm(!showModuleForm)} className="mb-4">{showModuleForm ? 'Cerrar formulario' : 'Crear módulo'}</Button>
          {showModuleForm && (
            <div className="mb-4 grid gap-2">
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Añadir ejercicios existentes</h4>
                {existingExercises.length === 0 ? (
                  <div>No hay ejercicios disponibles.</div>
                ) : (
                  <ul>
                    {existingExercises.map((ex: Exercise) => (
                      <li key={ex.id} className="mb-2">
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedExistingExercises.includes(ex.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedExistingExercises((prev: string[]) => [...prev, ex.id]);
                              } else {
                                setSelectedExistingExercises((prev: string[]) => prev.filter((id: string) => id !== ex.id));
                              }
                            }}
                          />
                          <strong>{ex.name}</strong>: {ex.description} | Series: {ex.sets} | Reps: {ex.reps} | Descanso: {ex.restTime}s
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2 mt-2">
                  <Button type="button" onClick={handleAddExistingExercises}>Añadir ejercicios seleccionados</Button>
                  <Button type="button" onClick={() => setShowCreateExercise(true)}>Crear ejercicio</Button>
                </div>
              </div>

              {showCreateExercise && (
                <div className="mb-4 p-4 border rounded bg-gray-50">
                  <h4 className="font-semibold mb-2">Crear nuevo ejercicio</h4>
                  <Input label="Nombre" value={currentExercise.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentExercise({ ...currentExercise, name: e.target.value })} required />
                  <Input label="Descripción" value={currentExercise.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentExercise({ ...currentExercise, description: e.target.value })} required />
                  <Input label="Series" type="number" value={currentExercise.sets} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentExercise({ ...currentExercise, sets: Number(e.target.value) })} required />
                  <Input label="Repeticiones" value={currentExercise.reps} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentExercise({ ...currentExercise, reps: e.target.value })} required />
                  <Input label="Descanso (segundos)" type="number" value={currentExercise.restTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentExercise({ ...currentExercise, restTime: Number(e.target.value) })} required />
                  <Input label="URL video" value={currentExercise.videoUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentExercise({ ...currentExercise, videoUrl: e.target.value })} />
                  <Input label="URL imagen" value={currentExercise.imageUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentExercise({ ...currentExercise, imageUrl: e.target.value })} />
                  <Input label="Instrucción" value={instructionInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstructionInput(e.target.value)} />
                  <Button type="button" onClick={handleAddInstruction}>Añadir instrucción</Button>
                  <ul className="mt-2">
                    {currentExercise.instructions.map((inst: string, idx: number) => (
                      <li key={idx}>{inst} <Button type="button" size="sm" onClick={() => handleRemoveInstruction(idx)}>Eliminar</Button></li>
                    ))}
                  </ul>
                  <Button type="button" className="mt-4" onClick={handleSaveNewExercise}>Guardar ejercicio</Button>
                  <Button type="button" className="mt-2" onClick={() => setShowCreateExercise(false)}>Cancelar</Button>
                </div>
              )}
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Ejercicios añadidos al módulo</h4>
                {newModule.exercises.length === 0 ? (
                  <div>No hay ejercicios añadidos.</div>
                ) : (
                  <ul>
                    {newModule.exercises.map((ex: Exercise, idx: number) => (
                      <li key={ex.id || idx} className="mb-2">
                        <strong>{ex.name}</strong>: {ex.description} | Series: {ex.sets} | Reps: {ex.reps} | Descanso: {ex.restTime}s
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Input label="Nombre del módulo" value={newModule.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewModule({ ...newModule, name: e.target.value })} required />
              <Input label="Descripción" value={newModule.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewModule({ ...newModule, description: e.target.value })} required />
              <Input label="Duración estimada (minutos)" type="number" value={newModule.estimatedDuration} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewModule({ ...newModule, estimatedDuration: Number(e.target.value) })} required />
              <hr className="my-4" />
              <Button onClick={handleAddModule} loading={loading} className="mt-4">Guardar módulo</Button>
            </div>
          )}
          <div className="mt-8">
            <h4 className="font-semibold mb-2">Resumen de módulos</h4>
            {modules.length === 0 ? (
              <div>No hay módulos creados.</div>
            ) : (
              <div className="grid gap-6">
                {modules.map((module: Module) => {
                  // Simulación: comprobar si el módulo está en un plan publicado
                  // En producción, deberías consultar la API/DB para saberlo
                  const isInPublishedPlan = false; // Cambia esto por la lógica real
                  return (
                    <div key={module.id} className="border rounded-lg p-4 bg-white shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-blue-700">{module.name}</span>
                        <span className="text-sm text-gray-500">Duración: {module.estimatedDuration} min</span>
                      </div>
                      <div className="mb-2 text-gray-700">{module.description}</div>
                      <div>
                        <span className="font-semibold text-gray-800">Ejercicios:</span>
                        {module.exercises.length === 0 ? (
                          <div className="text-sm text-gray-400">No hay ejercicios en este módulo.</div>
                        ) : (
                          <ul className="mt-2 grid gap-2">
                            {module.exercises.map((ex: Exercise) => (
                              <li key={ex.id} className="border rounded p-2 bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-blue-600">{ex.name}</span>
                                  <span className="text-xs text-gray-500">Descanso: {ex.restTime}s</span>
                                </div>
                                <div className="text-sm text-gray-700 mb-1">{ex.description}</div>
                                <div className="text-xs text-gray-600 mb-1">Series: {ex.sets} | Reps: {ex.reps}</div>
                                {ex.instructions && ex.instructions.length > 0 && (
                                  <ul className="ml-4 text-xs text-gray-500">
                                    {ex.instructions.map((inst: string, idx3: number) => (
                                      <li key={idx3}>• {inst}</li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button disabled={isInPublishedPlan} onClick={() => handleEditModule(module)} variant="outline">Editar</Button>
                        <Button disabled={isInPublishedPlan} onClick={() => handleDeleteModule(module.id)} variant="destructive">Eliminar</Button>
                        {isInPublishedPlan && <span className="text-xs text-red-500">No se puede editar/eliminar: módulo en plan publicado</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Renderizar formulario de edición si editModule está activo */}
          {editModule && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Editar módulo</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input label="Nombre del módulo" value={editModule.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditModule({ ...editModule, name: e.target.value })} required />
                  <Input label="Descripción" value={editModule.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditModule({ ...editModule, description: e.target.value })} required />
                  <Input label="Duración estimada (minutos)" type="number" value={editModule.estimatedDuration} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditModule({ ...editModule, estimatedDuration: Number(e.target.value) })} required />
                  {/* Aquí podrías añadir edición de ejercicios si lo necesitas */}
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleSaveEditModule} loading={loading}>Guardar cambios</Button>
                    <Button variant="outline" onClick={() => setEditModule(null)}>Cancelar</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminModulesPage;