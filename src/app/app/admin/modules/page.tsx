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

  const handleAddModule = async () => {
    setLoading(true);
    setModules([...modules, { ...newModule, id: Date.now().toString() }]);
    setNewModule({
      id: "",
      name: "",
      description: "",
      estimatedDuration: 0,
      exercises: [],
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Módulos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-2">
            <Input label="Nombre del módulo" value={newModule.name} onChange={e => setNewModule({ ...newModule, name: e.target.value })} required />
            <Input label="Descripción" value={newModule.description} onChange={e => setNewModule({ ...newModule, description: e.target.value })} required />
            <Input label="Duración estimada (minutos)" type="number" value={newModule.estimatedDuration} onChange={e => setNewModule({ ...newModule, estimatedDuration: Number(e.target.value) })} required />
            <hr className="my-4" />
            <div>
              <h4 className="font-semibold mb-2">Añadir ejercicio al módulo</h4>
              <Input label="Nombre del ejercicio" value={currentExercise.name} onChange={e => setCurrentExercise({ ...currentExercise, name: e.target.value })} required />
              <Input label="Descripción" value={currentExercise.description} onChange={e => setCurrentExercise({ ...currentExercise, description: e.target.value })} required />
              <Input label="Series" type="number" value={currentExercise.sets} onChange={e => setCurrentExercise({ ...currentExercise, sets: Number(e.target.value) })} required />
              <Input label="Repeticiones" value={currentExercise.reps} onChange={e => setCurrentExercise({ ...currentExercise, reps: e.target.value })} required />
              <Input label="Descanso (segundos)" type="number" value={currentExercise.restTime} onChange={e => setCurrentExercise({ ...currentExercise, restTime: Number(e.target.value) })} required />
              <Input label="URL de video" value={currentExercise.videoUrl || ""} onChange={e => setCurrentExercise({ ...currentExercise, videoUrl: e.target.value })} />
              <Input label="URL de imagen" value={currentExercise.imageUrl || ""} onChange={e => setCurrentExercise({ ...currentExercise, imageUrl: e.target.value })} />
              <div>
                <label className="block text-sm font-medium mb-1">Instrucciones</label>
                <div className="flex gap-2 mb-2">
                  <Input value={instructionInput} onChange={e => setInstructionInput(e.target.value)} placeholder="Añadir instrucción" />
                  <Button type="button" onClick={handleAddInstruction}>Añadir</Button>
                </div>
                <ul>
                  {currentExercise.instructions.map((inst, idx) => (
                    <li key={idx} className="flex items-center gap-2 mb-1">
                      <span>{inst}</span>
                      <Button size="sm" variant="destructive" type="button" onClick={() => handleRemoveInstruction(idx)}>Eliminar</Button>
                    </li>
                  ))}
                </ul>
              </div>
              <Button type="button" onClick={handleAddExercise} className="mt-2">Añadir ejercicio al módulo</Button>
            </div>
            <hr className="my-4" />
            <div>
              <h4 className="font-semibold mb-2">Ejercicios añadidos</h4>
              {newModule.exercises.length === 0 ? (
                <div>No hay ejercicios en este módulo.</div>
              ) : (
                <ul>
                  {newModule.exercises.map((ex, idx) => (
                    <li key={ex.id} className="mb-2">
                      <strong>{ex.name}</strong>: {ex.description} | Series: {ex.sets} | Reps: {ex.reps} | Descanso: {ex.restTime}s
                      <ul className="ml-4">
                        {ex.instructions.map((inst, idx2) => (
                          <li key={idx2}>{inst}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button onClick={handleAddModule} loading={loading} className="mt-4">Añadir módulo</Button>
          </div>
        </CardContent>
      </Card>
      <div className="mt-8">
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
    </div>
  );
};

export default AdminModulesPage;