'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Exercise } from '@/types/training-plan';
import { ExerciseSortableList } from '@/components/plans/ExerciseSortableList';
import { createTrainingPlanSchema } from '@/lib/validations/plans';
import { z } from 'zod';

type CreatePlanForm = z.infer<typeof createTrainingPlanSchema>;

interface FieldError {
  [key: string]: string | undefined;
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

function CreatePlanPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<FieldError>({});
  const [newTag, setNewTag] = React.useState('');
  const [currentExercise, setCurrentExercise] = React.useState<Exercise>(EMPTY_EXERCISE);
  const [existingExercises, setExistingExercises] = React.useState<Exercise[]>([]);
  const [selectedLibIds, setSelectedLibIds] = React.useState<string[]>([]);
  const [showLibPicker, setShowLibPicker] = React.useState(true);
  const [libSearch, setLibSearch] = React.useState('');

  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/admin/exercises', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setExistingExercises(d.exercises ?? []); });
  }, []);

  const [form, setForm] = React.useState<CreatePlanForm>({
    title: '',
    shortDescription: '',
    fullDescription: '',
    difficulty: 'principiante',
    duration: 1,
    estimatedDuration: 0,
    price: 0,
    currency: 'USD',
    coverImage: '',
    categoryIds: [],
    exercises: [],
  });

  // ── Tags ─────────────────────────────────────────────────────────────
  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !form.categoryIds.includes(tag)) {
      setForm(prev => ({ ...prev, categoryIds: [...prev.categoryIds, tag] }));
      setNewTag('');
    }
  };
  const removeTag = (tag: string) =>
    setForm(prev => ({ ...prev, categoryIds: prev.categoryIds.filter(t => t !== tag) }));

  // ── Exercise helpers ──────────────────────────────────────────────────
  const addExercise = () => {
    const errors: FieldError = {};
    if (!currentExercise.name?.trim()) errors.exName = 'El nombre es requerido';
    if (!currentExercise.description?.trim()) errors.exDesc = 'La descripción es requerida';
    if (Object.keys(errors).length) { setFieldErrors(prev => ({ ...prev, ...errors })); return; }

    const exercise: Exercise = { ...currentExercise, id: Date.now().toString() };
    setForm(prev => ({ ...prev, exercises: [...prev.exercises, exercise] }));
    setCurrentExercise(EMPTY_EXERCISE);
    setFieldErrors(prev => ({ ...prev, exName: undefined, exDesc: undefined }));
  };

  const addFromLibrary = () => {
    const toAdd = existingExercises.filter(e => selectedLibIds.includes(e.id));
    const existingIds = new Set(form.exercises.map(e => e.id));
    const unique = toAdd.filter(e => !existingIds.has(e.id));
    setForm(prev => ({ ...prev, exercises: [...prev.exercises, ...unique] }));
    setSelectedLibIds([]);
    setShowLibPicker(false);
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');
    try {
      const validationResult = createTrainingPlanSchema.safeParse(form);
      if (!validationResult.success) {
        const errors: FieldError = {};
        validationResult.error.errors.forEach(err => {
          errors[err.path.join('_')] = err.message;
        });
        setFieldErrors(errors);
        setSubmitError('Revisa los campos del formulario: ' + validationResult.error.errors.map(e => e.message).join(', '));
        return;
      }

      const authToken = localStorage.getItem('authToken');
      if (!authToken) return;

      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const { data } = await response.json();
        router.push(`/app/admin/plans/${data.id}`);
      } else {
        const err = await response.json();
        setSubmitError(err.error || 'Error al crear el plan');
      }
    } catch (error: any) {
      setSubmitError(error.message || 'Error inesperado');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crear Plan de Entrenamiento</CardTitle>
          <CardDescription>Añadir un nuevo plan de entrenamiento a la plataforma</CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Información básica ─────────────────────────────────────── */}
        <Card>
          <CardHeader><CardTitle>Información Básica</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título</label>
              <Input
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título del plan"
                required
              />
              {fieldErrors.title && <p className="text-sm text-destructive mt-1">{fieldErrors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción Corta</label>
              <textarea
                value={form.shortDescription}
                onChange={e => setForm(prev => ({ ...prev, shortDescription: e.target.value }))}
                placeholder="Descripción breve del plan"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
                required
              />
              {fieldErrors.shortDescription && <p className="text-sm text-destructive mt-1">{fieldErrors.shortDescription}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción Completa</label>
              <textarea
                value={form.fullDescription}
                onChange={e => setForm(prev => ({ ...prev, fullDescription: e.target.value }))}
                placeholder="Descripción detallada del plan"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={5}
                required
              />
              {fieldErrors.fullDescription && <p className="text-sm text-destructive mt-1">{fieldErrors.fullDescription}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Nivel de dificultad</label>
                <select
                  value={form.difficulty}
                  onChange={e => setForm(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duración (semanas)</label>
                <Input
                  type="number" min="1"
                  value={form.duration}
                  onChange={e => setForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                  placeholder="4"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Duración estimada (minutos)</label>
                <Input
                  type="number" min="0"
                  value={form.estimatedDuration}
                  onChange={e => setForm(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                  placeholder="60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Precio</label>
                <Input
                  type="number" min="0" step="0.01"
                  value={form.price}
                  onChange={e => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">URL de imagen de portada (opcional)</label>
              <Input
                type="url"
                value={form.coverImage || ''}
                onChange={e => setForm(prev => ({ ...prev, coverImage: e.target.value }))}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {fieldErrors.coverImage && <p className="text-sm text-destructive mt-1">{fieldErrors.coverImage}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Etiquetas / Categorías</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder="Añadir etiqueta"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>Añadir</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.categoryIds.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ✕
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Ejercicios ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Ejercicios del Plan</CardTitle>
            <CardDescription>Añade los ejercicios directamente al plan en el orden deseado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Exercise list */}
            {form.exercises.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Ejercicios añadidos ({form.exercises.length})</h4>
                <ExerciseSortableList
                  exercises={form.exercises}
                  onChange={exs => setForm(prev => ({ ...prev, exercises: exs }))}
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
                    <label className="block text-sm font-medium mb-1">Nombre del ejercicio</label>
                    <Input
                      value={currentExercise.name}
                      onChange={e => setCurrentExercise(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nombre del ejercicio"
                    />
                    {fieldErrors.exName && <p className="text-sm text-destructive mt-1">{fieldErrors.exName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo (EMOM, EMOM 2', etc.)</label>
                    <Input
                      value={currentExercise.tipo || ''}
                      onChange={e => setCurrentExercise(prev => ({ ...prev, tipo: e.target.value }))}
                      placeholder="Tipo de ejercicio"
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Series</label>
                    <Input
                      type="number" min="0"
                      value={currentExercise.sets}
                      onChange={e => setCurrentExercise(prev => ({ ...prev, sets: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Repeticiones</label>
                    <Input
                      value={currentExercise.reps}
                      onChange={e => setCurrentExercise(prev => ({ ...prev, reps: e.target.value }))}
                      placeholder="10-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Descanso (seg)</label>
                    <Input
                      type="number" min="0"
                      value={currentExercise.restTime}
                      onChange={e => setCurrentExercise(prev => ({ ...prev, restTime: parseInt(e.target.value) || 0 }))}
                      placeholder="60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    value={currentExercise.description}
                    onChange={e => setCurrentExercise(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción del ejercicio"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={2}
                  />
                  {fieldErrors.exDesc && <p className="text-sm text-destructive mt-1">{fieldErrors.exDesc}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">URL de vídeo (opcional)</label>
                  <Input
                    type="url"
                    value={currentExercise.videoUrl || ''}
                    onChange={e => setCurrentExercise(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Instrucciones (una por línea)</label>
                  <textarea
                    value={currentExercise.instructions?.join('\n') || ''}
                    onChange={e => setCurrentExercise(prev => ({
                      ...prev,
                      instructions: e.target.value.split('\n').filter(i => i.trim()),
                    }))}
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

        {/* ── Submit ─────────────────────────────────────────────────── */}        {submitError && (
          <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">{submitError}</div>
        )}        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Creando...' : 'Crear Plan de Entrenamiento'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreatePlanPage;
