"use client";

import React, { useState } from "react";
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
    const [showCreateExercise, setShowCreateExercise] = useState(false);

    const handleSaveNewExercise = async () => {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      try {
        const res = await fetch('/api/admin/exercises', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentExercise),
        });
        const data = await res.json();
        if (data.success && data.exercise) {
          setExistingExercises(prev => [...prev, data.exercise]);
          setSelectedExistingExercises(prev => [...prev, data.exercise.id]);
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
  const [modules, setModules] = useState<Module[]>([]);
  const [newModule, setNewModule] = useState<Module>({
      id: "",
      name: "",
      description: "",
      estimatedDuration: 0,
      exercises: [],
  });
  const [currentExercise, setCurrentExercise] = useState<Exercise>({
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
  const [instructionInput, setInstructionInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingExercises, setExistingExercises] = useState<Exercise[]>([]);
  const [selectedExistingExercises, setSelectedExistingExercises] = useState<string[]>([]);

  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/admin/exercises', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.exercises)) {
          setExistingExercises(data.exercises);
        }
      });
  }, []);

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
      instructions: currentExercise.instructions.filter((_, i) => i !== idx),
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
    const exercisesToAdd = existingExercises.filter(ex => selectedExistingExercises.includes(ex.id));
    setNewModule(prev => ({
      ...prev,
      exercises: [...prev.exercises, ...exercisesToAdd]
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
              exercises: newModule.exercises.map(ex => ({
                ...ex,
                id: ex.id || undefined,
              })),
        }),
      });
      if (!res.ok) throw new Error('Error al guardar el módulo');
      const savedModule = await res.json();
      setModules([...modules, savedModule]);
      setNewModule({
        id: "",
        name: "",
        description: "",
        estimatedDuration: 0,
        exercises: [],
      });
    } catch (err) {
      alert((err as Error).message);
    }
    setLoading(false);
  };

  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showExerciseForm, setShowExerciseForm] = useState(false);

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
                    {existingExercises.map(ex => (
                      <li key={ex.id} className="mb-2">
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedExistingExercises.includes(ex.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedExistingExercises(prev => [...prev, ex.id]);
                              } else {
                                setSelectedExistingExercises(prev => prev.filter(id => id !== ex.id));
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
                  <Input label="Nombre" value={currentExercise.name} onChange={e => setCurrentExercise({ ...currentExercise, name: e.target.value })} required />
                  <Input label="Descripción" value={currentExercise.description} onChange={e => setCurrentExercise({ ...currentExercise, description: e.target.value })} required />
                  <Input label="Series" type="number" value={currentExercise.sets} onChange={e => setCurrentExercise({ ...currentExercise, sets: Number(e.target.value) })} required />
                  <Input label="Repeticiones" value={currentExercise.reps} onChange={e => setCurrentExercise({ ...currentExercise, reps: e.target.value })} required />
                  <Input label="Descanso (segundos)" type="number" value={currentExercise.restTime} onChange={e => setCurrentExercise({ ...currentExercise, restTime: Number(e.target.value) })} required />
                  <Input label="URL video" value={currentExercise.videoUrl} onChange={e => setCurrentExercise({ ...currentExercise, videoUrl: e.target.value })} />
                  <Input label="URL imagen" value={currentExercise.imageUrl} onChange={e => setCurrentExercise({ ...currentExercise, imageUrl: e.target.value })} />
                  <Input label="Instrucción" value={instructionInput} onChange={e => setInstructionInput(e.target.value)} />
                  <Button type="button" onClick={handleAddInstruction}>Añadir instrucción</Button>
                  <ul className="mt-2">
                    {currentExercise.instructions.map((inst, idx) => (
                      <li key={idx}>{inst} <Button type="button" size="sm" onClick={() => handleRemoveInstruction(idx)}>Eliminar</Button></li>
                    ))}
                  </ul>
                  <Button type="button" className="mt-4" onClick={handleSaveNewExercise}>Guardar ejercicio</Button>
                  <Button type="button" className="mt-2" onClick={() => setShowCreateExercise(false)}>Cancelar</Button>
                </div>
              )}
              <Input label="Nombre del módulo" value={newModule.name} onChange={e => setNewModule({ ...newModule, name: e.target.value })} required />
              <Input label="Descripción" value={newModule.description} onChange={e => setNewModule({ ...newModule, description: e.target.value })} required />
              <Input label="Duración estimada (minutos)" type="number" value={newModule.estimatedDuration} onChange={e => setNewModule({ ...newModule, estimatedDuration: Number(e.target.value) })} required />
              <hr className="my-4" />
              <Button onClick={handleAddModule} loading={loading} className="mt-4">Guardar módulo</Button>
            </div>
          )}
          <div className="mt-8">
            <h4 className="font-semibold mb-2">Resumen de módulos</h4>
            {modules.length === 0 ? (
              <div>No hay módulos creados.</div>
            ) : (
              <ul>
                {modules.map((module, idx) => (
                  <li key={module.id} className="mb-4">
                    <strong>{module.name}</strong>: {module.description} | Duración: {module.estimatedDuration} min
                    <ul className="ml-4">
                      {module.exercises.map((ex, idx2) => (
                        <li key={ex.id} className="mb-2">
                          <strong>{ex.name}</strong>: {ex.description} | Series: {ex.sets} | Reps: {ex.reps} | Descanso: {ex.restTime}s
                          <ul className="ml-4">
                            {ex.instructions.map((inst, idx3) => (
                              <li key={idx3}>{inst}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminModulesPage;