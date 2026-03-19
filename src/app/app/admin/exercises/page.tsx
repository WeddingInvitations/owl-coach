"use client";
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newExercise, setNewExercise] = useState<Exercise>({
    id: '',
    name: '',
    description: '',
    sets: 3,
    reps: '',
    restTime: 60,
    videoUrl: '',
    imageUrl: '',
    instructions: [],
  });
  const [instructionInput, setInstructionInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddInstruction = () => {
    if (instructionInput.trim()) {
      setNewExercise({ ...newExercise, instructions: [...newExercise.instructions, instructionInput.trim()] });
      setInstructionInput('');
    }
  };

  const handleRemoveInstruction = (idx: number) => {
    setNewExercise({ ...newExercise, instructions: newExercise.instructions.filter((_, i) => i !== idx) });
  };

  const handleAddExercise = async () => {
    setLoading(true);
    // TODO: Call service to create exercise
    setExercises([...exercises, { ...newExercise, id: Date.now().toString() }]);
    setNewExercise({
      id: '',
      name: '',
      description: '',
      sets: 3,
      reps: '',
      restTime: 60,
      videoUrl: '',
      imageUrl: '',
      instructions: [],
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Ejercicios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-2">
            <Input label="Nombre del ejercicio" value={newExercise.name} onChange={e => setNewExercise({ ...newExercise, name: e.target.value })} required />
            <Input label="Descripción" value={newExercise.description} onChange={e => setNewExercise({ ...newExercise, description: e.target.value })} required />
            <Input label="Series" type="number" value={newExercise.sets} onChange={e => setNewExercise({ ...newExercise, sets: Number(e.target.value) })} required />
            <Input label="Repeticiones" value={newExercise.reps} onChange={e => setNewExercise({ ...newExercise, reps: e.target.value })} required />
            <Input label="Descanso (segundos)" type="number" value={newExercise.restTime} onChange={e => setNewExercise({ ...newExercise, restTime: Number(e.target.value) })} required />
            <Input label="URL de video" value={newExercise.videoUrl || ''} onChange={e => setNewExercise({ ...newExercise, videoUrl: e.target.value })} />
            <Input label="URL de imagen" value={newExercise.imageUrl || ''} onChange={e => setNewExercise({ ...newExercise, imageUrl: e.target.value })} />
            <div>
              <label className="block text-sm font-medium mb-1">Instrucciones</label>
              <div className="flex gap-2 mb-2">
                <Input value={instructionInput} onChange={e => setInstructionInput(e.target.value)} placeholder="Añadir instrucción" />
                <Button type="button" onClick={handleAddInstruction}>Añadir</Button>
              </div>
              <ul>
                {newExercise.instructions.map((inst, idx) => (
                  <li key={idx} className="flex items-center gap-2 mb-1">
                    <span>{inst}</span>
                    <Button size="sm" variant="destructive" type="button" onClick={() => handleRemoveInstruction(idx)}>Eliminar</Button>
                  </li>
                ))}
              </ul>
            </div>
            <Button onClick={handleAddExercise} loading={loading} className="mt-2">Añadir ejercicio</Button>
          </div>
          <div>
            {exercises.length === 0 ? (
              <div>No hay ejercicios creados.</div>
            ) : (
              <ul>
                {exercises.map(exercise => (
                  <li key={exercise.id} className="mb-2">
                    <strong>{exercise.name}</strong>: {exercise.description} | Series: {exercise.sets} | Reps: {exercise.reps} | Descanso: {exercise.restTime}s
                    <ul className="ml-4">
                      {exercise.instructions.map((inst, idx) => (
                        <li key={idx}>{inst}</li>
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
}
