"use client";
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

interface Exercise {
  id: string;
  name: string;
  description: string;
  tipo?: string;
  sets: number;
  reps: string;
  restTime: number;
  videoUrl?: string;
  imageUrl?: string;
  instructions: string[];
}
// ...existing code...
function AdminExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newExercise, setNewExercise] = useState<Exercise>({
    id: '',
    name: '',
    description: '',
    tipo: '',
    sets: 3,
    reps: '',
    restTime: 60,
    videoUrl: '',
    imageUrl: '',
    instructions: [],
  });
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [exerciseModules, setExerciseModules] = useState<Array<{ id: string; name: string; description: string }>>([]);
  const [instructionInput, setInstructionInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/admin/exercises', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.exercises)) {
          setExercises(data.exercises);
        }
      });
  }, []);

  const handleAddInstruction = (isEditing: boolean = false) => {
    if (instructionInput.trim()) {
      if (isEditing && editingExercise) {
        setEditingExercise({ 
          ...editingExercise, 
          instructions: [...editingExercise.instructions, instructionInput.trim()] 
        });
      } else {
        setNewExercise({ 
          ...newExercise, 
          instructions: [...newExercise.instructions, instructionInput.trim()] 
        });
      }
      setInstructionInput('');
    }
  };

  const handleRemoveInstruction = (idx: number, isEditing: boolean = false) => {
    if (isEditing && editingExercise) {
      setEditingExercise({ 
        ...editingExercise, 
        instructions: editingExercise.instructions.filter((_, i) => i !== idx) 
      });
    } else {
      setNewExercise({ 
        ...newExercise, 
        instructions: newExercise.instructions.filter((_, i) => i !== idx) 
      });
    }
  };

  const handleAddExercise = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/exercises', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExercise),
      });
      const data = await res.json();
      if (data.success && data.exercise) {
        setExercises(prev => [...prev, data.exercise]);
        setNewExercise({
          id: '',
          name: '',
          description: '',
          tipo: '',
          sets: 3,
          reps: '',
          restTime: 60,
          videoUrl: '',
          imageUrl: '',
          instructions: [],
        });
      }
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleEditExercise = async (exercise: Exercise) => {
    setEditingExercise({ ...exercise });
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/exercises/${exercise.id}/usage`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success) {
        setExerciseModules(data.modules || []);
      }
    } catch (error) {
      // handle error
      setExerciseModules([]);
    } finally {
      setLoading(false);
      setShowEditForm(true);
    }
  };

  const handleUpdateExercise = async () => {
    if (!editingExercise) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/exercises', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingExercise),
      });
      const data = await res.json();
      if (data.success) {
        setExercises(prev => prev.map(ex => 
          ex.id === editingExercise.id ? editingExercise : ex
        ));
        setEditingExercise(null);
        setShowEditForm(false);
        setExerciseModules([]);
      }
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este ejercicio? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/exercises', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: exerciseId }),
      });
      const data = await res.json();
      if (data.success) {
        setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
      }
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Ejercicios</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowExerciseForm(!showExerciseForm)} className="mb-4">{showExerciseForm ? 'Cerrar formulario' : 'Crear ejercicio'}</Button>
          {showExerciseForm && (
            <div className="mb-4 grid gap-2">
              <Input label="Nombre del ejercicio" value={newExercise.name} onChange={e => setNewExercise({ ...newExercise, name: e.target.value })} required />
              <Input label="Descripción" value={newExercise.description} onChange={e => setNewExercise({ ...newExercise, description: e.target.value })} required />
              <Input label="Tipo de ejercicio (EMOM, EMOM 2', etc.)" value={newExercise.tipo || ''} onChange={e => setNewExercise({ ...newExercise, tipo: e.target.value })} />
              <Input label="Series" type="number" value={newExercise.sets} onChange={e => setNewExercise({ ...newExercise, sets: Number(e.target.value) })} required />
              <Input label="Repeticiones" value={newExercise.reps} onChange={e => setNewExercise({ ...newExercise, reps: e.target.value })} required />
              <Input label="Descanso (segundos)" type="number" value={newExercise.restTime} onChange={e => setNewExercise({ ...newExercise, restTime: Number(e.target.value) })} required />
              <Input label="URL de video" value={newExercise.videoUrl || ''} onChange={e => setNewExercise({ ...newExercise, videoUrl: e.target.value })} />
              <Input label="URL de imagen" value={newExercise.imageUrl || ''} onChange={e => setNewExercise({ ...newExercise, imageUrl: e.target.value })} />
              <div>
                <label className="block text-sm font-medium mb-1">Instrucciones</label>
                <div className="flex gap-2 mb-2">
                  <Input value={instructionInput} onChange={e => setInstructionInput(e.target.value)} placeholder="Añadir instrucción" />
                  <Button type="button" onClick={() => handleAddInstruction(false)}>Añadir</Button>
                </div>
                <ul>
                  {newExercise.instructions.map((inst, idx) => (
                    <li key={idx} className="flex items-center gap-2 mb-1">
                      <span>{inst}</span>
                      <Button size="sm" variant="destructive" type="button" onClick={() => handleRemoveInstruction(idx, false)}>Eliminar</Button>
                    </li>
                  ))}
                </ul>
              </div>
              <Button onClick={handleAddExercise} loading={loading} className="mt-2">Guardar ejercicio</Button>
            </div>
          )}
          <div>
            {exercises.length === 0 ? (
              <div>No hay ejercicios creados.</div>
            ) : (
              <div className="space-y-4">
                {exercises.map(exercise => (
                  <div key={exercise.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{exercise.name}</h3>
                        <p className="text-gray-600 mb-2">{exercise.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <span><strong>Tipo:</strong> {exercise.tipo || 'N/A'}</span>
                          <span><strong>Series:</strong> {exercise.sets}</span>
                          <span><strong>Reps:</strong> {exercise.reps}</span>
                          <span><strong>Descanso:</strong> {exercise.restTime}s</span>
                        </div>
                        {exercise.videoUrl && (
                          <p className="text-sm text-blue-600 mt-2">
                            <strong>Video:</strong> {exercise.videoUrl}
                          </p>
                        )}
                        {exercise.imageUrl && (
                          <p className="text-sm text-blue-600 mt-1">
                            <strong>Imagen:</strong> {exercise.imageUrl}
                          </p>
                        )}
                        {exercise.instructions.length > 0 && (
                          <div className="mt-2">
                            <strong className="text-sm">Instrucciones:</strong>
                            <ul className="ml-4 mt-1 text-sm">
                              {exercise.instructions.map((inst, idx) => (
                                <li key={idx} className="list-disc">{inst}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEditExercise(exercise)}
                          disabled={loading}
                        >
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDeleteExercise(exercise.id)}
                          disabled={loading}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edición */}
      {showEditForm && editingExercise && (
        <Modal 
          isOpen={showEditForm} 
          onClose={() => {
            setShowEditForm(false);
            setEditingExercise(null);
            setExerciseModules([]);
            setInstructionInput('');
          }}
        >
          <div className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Editar Ejercicio</h2>
              
              {/* Información sobre los módulos que usan este ejercicio */}
              {exerciseModules.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    ⚠️ Este ejercicio está incluido en {exerciseModules.length} módulo(s):
                  </h4>
                  <ul className="space-y-1">
                    {exerciseModules.map(module => (
                      <li key={module.id} className="text-sm text-yellow-700">
                        • <strong>{module.name}</strong>: {module.description}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-yellow-600 mt-2">
                    Al modificar este ejercicio, los cambios se aplicarán a todos los módulos donde esté incluido.
                  </p>
                </div>
              )}

              <div className="grid gap-4">
                <Input 
                  label="Nombre del ejercicio" 
                  value={editingExercise.name} 
                  onChange={e => setEditingExercise({ ...editingExercise, name: e.target.value })} 
                  required 
                />
                <Input 
                  label="Descripción" 
                  value={editingExercise.description} 
                  onChange={e => setEditingExercise({ ...editingExercise, description: e.target.value })} 
                  required 
                />
                <Input 
                  label="Tipo de ejercicio (EMOM, EMOM 2', etc.)" 
                  value={editingExercise.tipo || ''} 
                  onChange={e => setEditingExercise({ ...editingExercise, tipo: e.target.value })} 
                />
                <Input 
                  label="Series" 
                  type="number" 
                  value={editingExercise.sets} 
                  onChange={e => setEditingExercise({ ...editingExercise, sets: Number(e.target.value) })} 
                  required 
                />
                <Input 
                  label="Repeticiones" 
                  value={editingExercise.reps} 
                  onChange={e => setEditingExercise({ ...editingExercise, reps: e.target.value })} 
                  required 
                />
                <Input 
                  label="Descanso (segundos)" 
                  type="number" 
                  value={editingExercise.restTime} 
                  onChange={e => setEditingExercise({ ...editingExercise, restTime: Number(e.target.value) })} 
                  required 
                />
                <Input 
                  label="URL de video" 
                  value={editingExercise.videoUrl || ''} 
                  onChange={e => setEditingExercise({ ...editingExercise, videoUrl: e.target.value })} 
                />
                <Input 
                  label="URL de imagen" 
                  value={editingExercise.imageUrl || ''} 
                  onChange={e => setEditingExercise({ ...editingExercise, imageUrl: e.target.value })} 
                />
                
                <div>
                  <label className="block text-sm font-medium mb-1">Instrucciones</label>
                  <div className="flex gap-2 mb-2">
                    <Input 
                      value={instructionInput} 
                      onChange={e => setInstructionInput(e.target.value)} 
                      placeholder="Añadir instrucción" 
                    />
                    <Button type="button" onClick={() => handleAddInstruction(true)}>Añadir</Button>
                  </div>
                  <ul>
                    {editingExercise.instructions.map((inst, idx) => (
                      <li key={idx} className="flex items-center gap-2 mb-1">
                        <span>{inst}</span>
                        <Button size="sm" variant="destructive" type="button" onClick={() => handleRemoveInstruction(idx, true)}>Eliminar</Button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUpdateExercise} loading={loading}>
                    Guardar cambios
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingExercise(null);
                      setExerciseModules([]);
                      setInstructionInput('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AdminExercisesPage;
