"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TrainingModule, Exercise } from '@/types/training-plan';

interface ExistingModule {
  id: string;
  name: string;
  description: string;
  estimatedDuration?: number;
  exercises?: Exercise[];
}

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
  const [editPlan, setEditPlan] = useState<TrainingPlan | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Estado para módulos existentes
  const [existingModules, setExistingModules] = useState<ExistingModule[]>([]);
  const [selectedExistingModules, setSelectedExistingModules] = useState<string[]>([]);

  // Cargar módulos existentes
  useEffect(() => {
    const fetchExistingModules = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("/api/admin/modules", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setExistingModules(data.modules || []);
        }
      } catch (error) {
        console.error("Error fetching existing modules:", error);
      }
    };
    fetchExistingModules();
  }, []);

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

  useEffect(() => {
    if (plan) setEditPlan(plan);
  }, [plan]);

  // Variables para los returns condicionales
  let content: React.ReactNode = null;
  if (loading) {
    content = <div>Cargando...</div>;
  } else if (error) {
    content = <div>Error: {error}</div>;
  } else if (!plan) {
    content = <div>No se encontró el plan.</div>;
  } else if (plan.isPublished) {
    content = (
      <Card>
        <CardHeader>
          <CardTitle>Plan publicado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">Este plan ya está publicado y no puede ser editado.</div>
        </CardContent>
      </Card>
    );
  } else if (!editPlan) {
    content = null;
  }


  if (content !== null) {
    return content;
  }

  // Si editPlan es null, no renderizar el formulario
  if (!editPlan) {
    return null;
  }

  const handleChange = (field: keyof TrainingPlan, value: any) => {
    setEditPlan(prev => prev ? { ...prev, [field]: value } : prev);
  };

  // Añadir módulos existentes al plan
  const addExistingModulesToPlan = () => {
    const modulesToAdd = existingModules.filter(m => selectedExistingModules.includes(m.id));
    setEditPlan((prev) => prev ? ({
      ...prev,
      fullModules: [...(prev.fullModules || []), ...modulesToAdd.map(m => ({
        id: m.id,
        title: m.name || '',
        description: m.description || '',
        exercises: (m.exercises || []).map((ex: any) => ({
          id: ex.id || '',
          name: ex.name || '',
          description: ex.description || '',
          sets: ex.sets || 0,
          reps: ex.reps || '',
          restTime: ex.restTime || 0,
          videoUrl: ex.videoUrl || '',
          imageUrl: ex.imageUrl || '',
          instructions: Array.isArray(ex.instructions) ? ex.instructions : [],
        })),
        estimatedDuration: m.estimatedDuration || 0,
      }))]
    }) : prev);
    setSelectedExistingModules([]);
  };

  // Eliminar módulo de previewModules
  const removePreviewModule = (moduleId: string) => {
    setEditPlan(prev => prev ? ({
      ...prev,
      previewModules: prev.previewModules.filter((m: TrainingModule) => m.id !== moduleId)
    }) : prev);
  };

  // Eliminar módulo de fullModules
  const removeFullModule = (moduleId: string) => {
    setEditPlan(prev => prev ? ({
      ...prev,
      fullModules: (prev.fullModules || []).filter((m: TrainingModule) => m.id !== moduleId)
    }) : prev);
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
    <div className="space-y-6">
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
          <Button onClick={handleSave} loading={saving} className="mt-4">Guardar cambios</Button>
        </CardContent>
      </Card>

      {/* Gestión de módulos existentes */}
      <Card>
        <CardHeader>
          <CardTitle>Añadir Módulos Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          {existingModules.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-2">Selecciona módulos existentes para añadir al plan:</p>
              {existingModules.map(mod => (
                <div key={mod.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={mod.id}
                    checked={selectedExistingModules.includes(mod.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedExistingModules(prev => [...prev, mod.id]);
                      } else {
                        setSelectedExistingModules(prev => prev.filter(id => id !== mod.id));
                      }
                    }}
                  />
                  <label htmlFor={mod.id} className="text-sm">{mod.name} - {mod.description}</label>
                </div>
              ))}
              <Button 
                type="button" 
                onClick={addExistingModulesToPlan} 
                disabled={selectedExistingModules.length === 0} 
                className="mt-2"
              >
                Añadir Módulos Seleccionados
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Módulos de Vista Previa */}
      <Card>
        <CardHeader>
          <CardTitle>Módulos de Vista Previa ({editPlan.previewModules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {editPlan.previewModules.map((mod, modIdx) => (
            <div key={mod.id} className="mb-4 p-4 border rounded">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold">{mod.title}</h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removePreviewModule(mod.id)}
                >
                  Eliminar
                </Button>
              </div>
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
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Módulos Existentes Añadidos */}
      {editPlan.fullModules && editPlan.fullModules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Módulos Existentes Añadidos ({editPlan.fullModules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {editPlan.fullModules.map((module: TrainingModule) => (
              <div key={module.id} className="mb-3 p-4 border rounded">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium">{module.title}</h5>
                    <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                    <div className="text-sm text-muted-foreground">
                      {module.exercises.length} ejercicios • Módulo existente
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeFullModule(module.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlanEditPage;
