"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Exercise } from '@/types/training-plan';
import { ExerciseSortableList } from '@/components/plans/ExerciseSortableList';

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
  estimatedDuration: number;
  price: number;
  currency: string;
  isPublished: boolean;
  categoryIds: string[];
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

const EMPTY_EXERCISE: Exercise = {
  id: '',
  name: '',
  description: '',
  tipo: '',
  sets: 0,
  reps: '',
  restTime: 0,
  videoUrl: '',
  imageUrl: '',
  instructions: [],
};

const PlanEditPage = ({ params }: { params: { slug: string } }) => {

  const router = useRouter();
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editPlan, setEditPlan] = useState<TrainingPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [newTag, setNewTag] = useState('');
  const [currentExercise, setCurrentExercise] = useState<Exercise>(EMPTY_EXERCISE);
  const [exError, setExError] = useState<{ name?: string; desc?: string }>({});
  const [existingExercises, setExistingExercises] = useState<Exercise[]>([]);
  const [selectedLibIds, setSelectedLibIds] = useState<string[]>([]);
  const [showLibPicker, setShowLibPicker] = useState(true);
  const [libSearch, setLibSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/admin/exercises', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setExistingExercises(d.exercises ?? []); });
  }, []);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`/api/plans/${params.slug}`, {
          headers: { "Authorization": `Bearer ${token}` },
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
    if (plan) setEditPlan({ ...plan, exercises: plan.exercises ?? [] });
  }, [plan]);

  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-destructive">Error: {error}</div>;
  if (!plan || !editPlan) return <div className="p-8">No se encontró el plan.</div>;

  const handleChange = (field: keyof TrainingPlan, value: any) =>
    setEditPlan(prev => prev ? { ...prev, [field]: value } : prev);

  // Tags
  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !editPlan.categoryIds.includes(tag)) {
      handleChange('categoryIds', [...editPlan.categoryIds, tag]);
      setNewTag('');
    }
  };
  const removeTag = (tag: string) =>
    handleChange('categoryIds', editPlan.categoryIds.filter(t => t !== tag));

  // Exercises
  const addExercise = () => {
    const errs: { name?: string; desc?: string } = {};
    if (!currentExercise.name?.trim()) errs.name = 'El nombre es requerido';
    if (!currentExercise.description?.trim()) errs.desc = 'La descripción es requerida';
    if (Object.keys(errs).length) { setExError(errs); return; }
    const ex: Exercise = { ...currentExercise, id: Date.now().toString() };
    handleChange('exercises', [...editPlan.exercises, ex]);
    setCurrentExercise(EMPTY_EXERCISE);
    setExError({});
  };

  const addFromLibrary = () => {
    const toAdd = existingExercises.filter(e => selectedLibIds.includes(e.id));
    const existingIds = new Set(editPlan.exercises.map(e => e.id));
    const unique = toAdd.filter(e => !existingIds.has(e.id));
    handleChange('exercises', [...editPlan.exercises, ...unique]);
    setSelectedLibIds([]);
    setShowLibPicker(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/plans/${editPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(editPlan),
      });
      if (!res.ok) {
        const err = await res.json();
        setSaveError(err.error || 'Error al guardar el plan');
      }
    } catch (err) {
      setSaveError((err as Error).message);
    }
    setSaving(false);
  };

  const handlePublish = async () => {
    handleChange('isPublished', true);
    await handleSave();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Editar Plan: {editPlan.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {editPlan.isPublished
                ? <span className="text-green-600 font-medium">Publicado</span>
                : <span className="text-yellow-600 font-medium">Borrador</span>}
            </p>
          </div>
          <div className="flex gap-2">
            {!editPlan.isPublished && (
              <Button variant="outline" onClick={handlePublish} disabled={saving}>
                Publicar
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Basic info */}
      <Card>
        <CardHeader><CardTitle>Información Básica</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <Input value={editPlan.title} onChange={e => handleChange("title", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción corta</label>
            <textarea
              value={editPlan.shortDescription}
              onChange={e => handleChange("shortDescription", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción completa</label>
            <textarea
              value={editPlan.fullDescription}
              onChange={e => handleChange("fullDescription", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={5}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Nivel de dificultad</label>
              <select
                value={editPlan.difficulty}
                onChange={e => handleChange("difficulty", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duración (semanas)</label>
              <Input type="number" min="1" value={editPlan.duration} onChange={e => handleChange("duration", parseInt(e.target.value) || 1)} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Duración estimada (minutos)</label>
              <Input type="number" min="0" value={editPlan.estimatedDuration ?? 0} onChange={e => handleChange("estimatedDuration", parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio</label>
              <Input type="number" min="0" step="0.01" value={editPlan.price} onChange={e => handleChange("price", parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL de imagen de portada</label>
            <Input type="url" value={editPlan.coverImage || ''} onChange={e => handleChange("coverImage", e.target.value)} placeholder="https://ejemplo.com/imagen.jpg" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Etiquetas / Categorías</label>
            <div className="flex gap-2 mb-2">
              <Input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Nueva etiqueta" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
              <Button type="button" onClick={addTag}>Añadir</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editPlan.categoryIds.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag} ✕
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      <Card>
        <CardHeader>
          <CardTitle>Ejercicios del Plan</CardTitle>
          <CardDescription>Gestiona los ejercicios del plan. Usa las flechas para reordenar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {editPlan.exercises.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Ejercicios ({editPlan.exercises.length})</h4>
              <ExerciseSortableList
                exercises={editPlan.exercises}
                onChange={exs => handleChange('exercises', exs)}
                removeLabel="Eliminar"
              />
            </div>
          )}

          {/* Library picker */}
          {existingExercises.length > 0 && (
            <div className="border rounded-lg p-4 bg-blue-50/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Añadir desde biblioteca de ejercicios</h4>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowLibPicker(v => !v)}>
                  {showLibPicker ? 'Ocultar' : `Seleccionar (${existingExercises.length} disponibles)`}
                </Button>
              </div>
              {showLibPicker && (
                <div className="space-y-3">
                  <Input
                    placeholder="Buscar ejercicio..."
                    value={libSearch}
                    onChange={e => setLibSearch(e.target.value)}
                  />
                  <ul className="max-h-52 overflow-y-auto space-y-1">
                    {existingExercises
                      .filter(e => e.name.toLowerCase().includes(libSearch.toLowerCase()))
                      .map(ex => (
                        <li key={ex.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={selectedLibIds.includes(ex.id)}
                            onChange={e => setSelectedLibIds(prev =>
                              e.target.checked ? [...prev, ex.id] : prev.filter(id => id !== ex.id)
                            )}
                          />
                          <div>
                            <div className="font-medium text-sm">{ex.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {ex.sets > 0 ? `${ex.sets} series` : ''}{ex.reps ? ` × ${ex.reps}` : ''}
                              {ex.tipo ? ` · ${ex.tipo}` : ''}
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                  <Button
                    type="button"
                    disabled={selectedLibIds.length === 0}
                    onClick={addFromLibrary}
                  >
                    Añadir {selectedLibIds.length > 0 ? `(${selectedLibIds.length})` : ''} seleccionados
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Add exercise form */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h4 className="font-medium mb-4">Añadir ejercicio</h4>
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <Input value={currentExercise.name} onChange={e => setCurrentExercise(p => ({ ...p, name: e.target.value }))} placeholder="Nombre del ejercicio" />
                  {exError.name && <p className="text-sm text-destructive mt-1">{exError.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <Input value={currentExercise.tipo || ''} onChange={e => setCurrentExercise(p => ({ ...p, tipo: e.target.value }))} placeholder="EMOM, AMRAP…" />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Series</label>
                  <Input type="number" min="0" value={currentExercise.sets} onChange={e => setCurrentExercise(p => ({ ...p, sets: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Repeticiones</label>
                  <Input value={currentExercise.reps} onChange={e => setCurrentExercise(p => ({ ...p, reps: e.target.value }))} placeholder="10-12" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descanso (seg)</label>
                  <Input type="number" min="0" value={currentExercise.restTime} onChange={e => setCurrentExercise(p => ({ ...p, restTime: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={currentExercise.description}
                  onChange={e => setCurrentExercise(p => ({ ...p, description: e.target.value }))}
                  placeholder="Descripción del ejercicio"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={2}
                />
                {exError.desc && <p className="text-sm text-destructive mt-1">{exError.desc}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL de vídeo (opcional)</label>
                <Input type="url" value={currentExercise.videoUrl || ''} onChange={e => setCurrentExercise(p => ({ ...p, videoUrl: e.target.value }))} placeholder="https://youtube.com/..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Instrucciones (una por línea)</label>
                <textarea
                  value={currentExercise.instructions?.join('\n') || ''}
                  onChange={e => setCurrentExercise(p => ({ ...p, instructions: e.target.value.split('\n').filter(i => i.trim()) }))}
                  placeholder="Paso 1&#10;Paso 2&#10;Paso 3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
              </div>

              <Button type="button" onClick={addExercise} className="w-full">
                ＋ Añadir ejercicio al plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer save */}
      {saveError && (
        <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">{saveError}</div>
      )}
      <div className="flex gap-4 pb-8">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    </div>
  );
};

export default PlanEditPage;