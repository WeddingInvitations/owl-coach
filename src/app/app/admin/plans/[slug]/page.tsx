"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TrainingModule, Exercise } from '@/types/training-plan';

interface TrainingPlan {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  coverImage: string;
  coachId: string;
  coachName: string;
  difficulty: string;
  duration: number;
  price: number;
  currency: string;
  isPublished: boolean;
  categoryIds: string[];
  previewModules: any[];
  fullModules: any[];
  createdAt: string;
  updatedAt: string;
}

const PlanEditPage = ({ params }: { params: { slug: string } }) => {
  const router = useRouter();
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`/api/plans/${params.slug}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("No se pudo cargar el plan");
        const data = await res.json();
        setPlan(data.data);
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchPlan();
  }, [params.slug]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!plan) return <div>No se encontró el plan.</div>;

  if (plan.isPublished) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan publicado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">Este plan ya está publicado y no puede ser editado.</div>
        </CardContent>
      </Card>
    );
  }

  // Estado editable
  const [editPlan, setEditPlan] = useState<TrainingPlan | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (plan) setEditPlan(plan);
  }, [plan]);

  if (!editPlan) return null;

  const handleChange = (field: keyof TrainingPlan, value: any) => {
    setEditPlan(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleModuleChange = (idx: number, module: Partial<TrainingModule>) => {
    setEditPlan(prev => prev ? {
      ...prev,
      previewModules: prev.previewModules.map((m: TrainingModule, i: number) => i === idx ? { ...m, ...module } : m)
    } : prev);
  };

  const handleExerciseChange = (modIdx: number, exIdx: number, exercise: Partial<Exercise>) => {
    setEditPlan(prev => prev ? {
      ...prev,
      previewModules: prev.previewModules.map((m: TrainingModule, i: number) => i === modIdx ? {
        ...m,
        exercises: m.exercises.map((ex: Exercise, j: number) => j === exIdx ? { ...ex, ...exercise } : ex)
      } : m)
    } : prev);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/plans/${editPlan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(editPlan),
      });
      if (!res.ok) throw new Error("Error al guardar el plan");
      // Opcional: feedback o redirección
    } catch (err) {
      alert((err as Error).message);
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Plan: {editPlan.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-2">
          <Input label="Título" value={editPlan.title} onChange={e => handleChange("title", e.target.value)} />
          <Input label="Descripción corta" value={editPlan.shortDescription} onChange={e => handleChange("shortDescription", e.target.value)} />
          <Input label="Descripción completa" value={editPlan.fullDescription} onChange={e => handleChange("fullDescription", e.target.value)} />
          {/* Otros campos básicos... */}
        </div>
        <hr className="my-4" />
        <div>
          <h4 className="font-semibold mb-2">Módulos</h4>
          {editPlan.previewModules.map((mod, modIdx) => (
            <div key={mod.id} className="mb-4 p-2 border rounded">
              <Input label="Título del módulo" value={mod.title} onChange={e => handleModuleChange(modIdx, { title: e.target.value })} />
              <Input label="Descripción" value={mod.description} onChange={e => handleModuleChange(modIdx, { description: e.target.value })} />
              <Input label="Duración estimada" type="number" value={mod.estimatedDuration} onChange={e => handleModuleChange(modIdx, { estimatedDuration: Number(e.target.value) })} />
              <div className="ml-4">
                <h5 className="font-semibold mb-2">Ejercicios</h5>
                {mod.exercises.map((ex: Exercise, exIdx: number) => (
                  <div key={ex.id} className="mb-2 p-1 border rounded">
                    <Input label="Nombre" value={ex.name} onChange={e => handleExerciseChange(modIdx, exIdx, { name: e.target.value })} />
                    <Input label="Descripción" value={ex.description} onChange={e => handleExerciseChange(modIdx, exIdx, { description: e.target.value })} />
                    <Input label="Series" type="number" value={ex.sets} onChange={e => handleExerciseChange(modIdx, exIdx, { sets: Number(e.target.value) })} />
                    <Input label="Repeticiones" value={ex.reps} onChange={e => handleExerciseChange(modIdx, exIdx, { reps: e.target.value })} />
                    <Input label="Descanso (segundos)" type="number" value={ex.restTime} onChange={e => handleExerciseChange(modIdx, exIdx, { restTime: Number(e.target.value) })} />
                    <Input label="URL de video" value={ex.videoUrl || ""} onChange={e => handleExerciseChange(modIdx, exIdx, { videoUrl: e.target.value })} />
                    <Input label="URL de imagen" value={ex.imageUrl || ""} onChange={e => handleExerciseChange(modIdx, exIdx, { imageUrl: e.target.value })} />
                    {/* Instrucciones: editable como lista, se puede mejorar con UI adicional */}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button onClick={handleSave} loading={saving} className="mt-4">Guardar cambios</Button>
      </CardContent>
    </Card>
  );
};

export default PlanEditPage;
