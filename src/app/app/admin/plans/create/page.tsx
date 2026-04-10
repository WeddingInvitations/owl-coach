'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { TrainingPlan, TrainingModule, Exercise } from '@/types/training-plan';
import { ExerciseSortableList } from '@/components/plans/ExerciseSortableList';

interface ExistingModule {
  id: string;
  name: string;
  description: string;
  estimatedDuration?: number;
  exercises?: Exercise[];
}
import { createTrainingPlanSchema } from '@/lib/validations/plans';
import { z } from 'zod';

type CreatePlanForm = z.infer<typeof createTrainingPlanSchema>;

interface FieldError {
  [key: string]: string | undefined;
}
function CreatePlanPage() {
  // ...existing code...
  const [existingModules, setExistingModules] = React.useState<ExistingModule[]>([]);
  const [selectedExistingModules, setSelectedExistingModules] = React.useState<string[]>([]);

  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/admin/modules', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.modules)) {
          setExistingModules(data.modules);
        }
      });
  }, []);
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<FieldError>({});
  const [form, setForm] = React.useState<CreatePlanForm>({
    title: '',
    shortDescription: '',
    fullDescription: '',
    difficulty: 'principiante',
    duration: 1,
    price: 0,
    currency: 'EUR',
    coverImage: '/images/owl.png',
    categoryIds: [],
    previewModules: [],
    fullModules: [],
  });

  const validateField = React.useCallback((fieldName: string, value: any) => {
    try {
      if (fieldName === 'title') {
        if (!value?.trim()) {
          setFieldErrors(prev => ({ ...prev, title: 'El título es requerido' }));
        } else {
          setFieldErrors(prev => ({ ...prev, title: undefined }));
        }
      } else if (fieldName === 'shortDescription') {
        if (!value?.trim()) {
          setFieldErrors(prev => ({ ...prev, shortDescription: 'La descripción corta es requerida' }));
        } else {
          setFieldErrors(prev => ({ ...prev, shortDescription: undefined }));
        }
      } else if (fieldName === 'fullDescription') {
        if (!value?.trim()) {
          setFieldErrors(prev => ({ ...prev, fullDescription: 'La descripción completa es requerida' }));
        } else {
          setFieldErrors(prev => ({ ...prev, fullDescription: undefined }));
        }
      }
    } catch (error) {
      // Silently handle validation errors
    }
  }, []);

  const [newTag, setNewTag] = React.useState('');
  const [currentModule, setCurrentModule] = React.useState<TrainingModule>({
    id: '',
    title: '',
    description: '',
    exercises: [],
    estimatedDuration: 0,
  });
  const [currentExercise, setCurrentExercise] = React.useState<Exercise>({
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
  });

  const addTag = () => {
    if (newTag.trim() && !form.categoryIds.includes(newTag.trim())) {
      setForm((prev: CreatePlanForm) => ({
        ...prev,
        categoryIds: [...prev.categoryIds, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm((prev: CreatePlanForm) => ({
      ...prev,
      categoryIds: prev.categoryIds.filter((tag: string) => tag !== tagToRemove)
    }));
  };

  const addExercise = () => {
    const exerciseErrors: FieldError = {};
    if (!currentExercise.name?.trim()) {
      exerciseErrors.exerciseName = 'El nombre del ejercicio es requerido';
    }
    if (!currentExercise.description?.trim()) {
      exerciseErrors.exerciseDescription = 'La descripción del ejercicio es requerida';
    }
    if (!currentExercise.instructions || currentExercise.instructions.length === 0) {
      exerciseErrors.exerciseInstructions = 'Al menos una instrucción es requerida';
    }

    if (Object.keys(exerciseErrors).length > 0) {
      setFieldErrors(prev => ({ ...prev, ...exerciseErrors }));
      return;
    }

    const exercise: Exercise = {
      ...currentExercise,
      id: Date.now().toString(),
    };

    setCurrentModule((prev: TrainingModule) => ({
      ...prev,
      exercises: [...prev.exercises, exercise]
    }));

    setCurrentExercise({
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
    });

    setFieldErrors(prev => ({ 
      ...prev, 
      exerciseName: undefined, 
      exerciseDescription: undefined,
      exerciseInstructions: undefined 
    }));
  };

  const removeExercise = (exerciseId: string) => {
    setCurrentModule((prev: TrainingModule) => ({
      ...prev,
      exercises: prev.exercises.filter((ex: Exercise) => ex.id !== exerciseId)
    }));
  };

  const addModule = () => {
    const moduleErrors: FieldError = {};
    if (!currentModule.title?.trim()) {
      moduleErrors.moduleTitle = 'El título del módulo es requerido';
    }
    if (!currentModule.description?.trim()) {
      moduleErrors.moduleDescription = 'La descripción del módulo es requerida';
    }
    if (currentModule.exercises.length === 0) {
      moduleErrors.moduleExercises = 'Al menos un ejercicio es requerido en el módulo';
    }

    if (Object.keys(moduleErrors).length > 0) {
      setFieldErrors(prev => ({ ...prev, ...moduleErrors }));
      return;
    }

    const module: TrainingModule = {
      ...currentModule,
      id: Date.now().toString(),
    };

    setForm((prev: CreatePlanForm) => ({
      ...prev,
      previewModules: [...prev.previewModules, module]
    }));
  };

  const addExistingModulesToPlan = () => {
    const modulesToAdd = existingModules.filter(m => selectedExistingModules.includes(m.id));
    setForm((prev: CreatePlanForm) => ({
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
    }));
    setSelectedExistingModules([]);
  };

  const removeModule = (moduleId: string) => {
    setForm((prev: CreatePlanForm) => ({
      ...prev,
      previewModules: prev.previewModules.filter((m: TrainingModule) => m.id !== moduleId)
    }));
  };

  const removeFullModule = (moduleId: string) => {
    setForm((prev: CreatePlanForm) => ({
      ...prev,
      fullModules: (prev.fullModules || []).filter((m: TrainingModule) => m.id !== moduleId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate entire form structure
      const validationResult = createTrainingPlanSchema.safeParse(form);
      
      if (!validationResult.success) {
        const errors: FieldError = {};
        validationResult.error.errors.forEach((err) => {
          const path = err.path.join('_');
          errors[path] = err.message;
        });
        setFieldErrors(errors);
        console.error('Validation errors:', validationResult.error.errors);
        return;
      }

      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const { data } = await response.json();
        router.push(`/app/admin/plans/${data.id}`);
      } else {
        console.error('Error creating plan');
      }
    } catch (error) {
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
          <CardDescription>
            Añadir un nuevo plan de entrenamiento a la plataforma
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título</label>
              <Input
                value={form.title}
                onChange={(e) => {
                  setForm((prev: CreatePlanForm) => ({ ...prev, title: e.target.value }));
                  validateField('title', e.target.value);
                }}
                placeholder="Introducir título del plan"
                required
              />
              {fieldErrors.title && (
                <p className="text-sm text-destructive mt-1">{fieldErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción Corta</label>
              <textarea
                value={form.shortDescription}
                onChange={(e) => {
                  setForm((prev: CreatePlanForm) => ({ ...prev, shortDescription: e.target.value }));
                  validateField('shortDescription', e.target.value);
                }}
                placeholder="Describir el plan de entrenamiento"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={4}
                required
              />
              {fieldErrors.shortDescription && (
                <p className="text-sm text-destructive mt-1">{fieldErrors.shortDescription}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción Completa</label>
              <textarea
                value={form.fullDescription}
                onChange={(e) => {
                  setForm((prev: CreatePlanForm) => ({ ...prev, fullDescription: e.target.value }));
                  validateField('fullDescription', e.target.value);
                }}
                placeholder="Descripción detallada del plan"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={5}
                required
              />
              {fieldErrors.fullDescription && (
                <p className="text-sm text-destructive mt-1">{fieldErrors.fullDescription}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Nivel</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm((prev: CreatePlanForm) => ({ 
                    ...prev, 
                    difficulty: e.target.value as 'principiante' | 'intermedio' | 'avanzado' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Precio (€)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((prev: CreatePlanForm) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Imagen del Plan</label>
              <div className="space-y-3">
                {/* Preview de la imagen */}
                {form.coverImage && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                    <img
                      src={form.coverImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/owl.png';
                      }}
                    />
                  </div>
                )}
                
                {/* Input de archivo */}
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      setUploadingImage(true);
                      try {
                        const formData = new FormData();
                        formData.append('file', file);

                        const response = await fetch('/api/upload', {
                          method: 'POST',
                          body: formData,
                        });

                        const data = await response.json();
                        if (data.imageUrl) {
                          setForm((prev: CreatePlanForm) => ({ ...prev, coverImage: data.imageUrl }));
                        } else {
                          alert('Error al subir la imagen');
                        }
                      } catch (error) {
                        console.error('Error:', error);
                        alert('Error al subir la imagen');
                      } finally {
                        setUploadingImage(false);
                      }
                    }}
                    className="flex-1 text-sm"
                    disabled={uploadingImage}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForm((prev: CreatePlanForm) => ({ ...prev, coverImage: '/images/owl.png' }))}
                  >
                    Imagen por defecto
                  </Button>
                </div>
                {uploadingImage && (
                  <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
                )}
              </div>
            </div>

            {/* Tags Section */}
            <div>
              <label className="block text-sm font-medium mb-2">Etiquetas</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Añadir una etiqueta"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>Añadir</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.categoryIds.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ✕
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules Section */}
        <Card>
          <CardHeader>
            <CardTitle>Módulos de Entrenamiento</CardTitle>
            <CardDescription>
              Crear módulos y ejercicios para tu plan de entrenamiento o añadir módulos ya creados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing Modules List */}
            {existingModules.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium mb-2">Añadir módulos ya creados</h4>
                <div className="space-y-2">
                  {existingModules.map(mod => (
                    <label key={mod.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedExistingModules.includes(mod.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedExistingModules(prev => [...prev, mod.id]);
                          } else {
                            setSelectedExistingModules(prev => prev.filter(id => id !== mod.id));
                          }
                        }}
                      />
                      <span className="font-medium">{mod.name}</span>
                      <span className="text-sm text-muted-foreground">{mod.description}</span>
                    </label>
                  ))}
                </div>
                <Button type="button" onClick={addExistingModulesToPlan} disabled={selectedExistingModules.length === 0} className="mt-2">
                  Añadir módulos seleccionados al plan
                </Button>
              </div>
            )}
            {/* Current Module Form */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="font-medium mb-4">Añadir Nuevo Módulo</h4>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Título del Módulo</label>
                    <Input
                      value={currentModule.title}
                      onChange={(e) => setCurrentModule((prev: TrainingModule) => ({ ...prev, title: e.target.value }))}
                      placeholder="Introducir título del módulo"
                    />
                    {fieldErrors.moduleTitle && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors.moduleTitle}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Descripción del Módulo</label>
                    <Input
                      value={currentModule.description}
                      onChange={(e) => setCurrentModule((prev: TrainingModule) => ({ ...prev, description: e.target.value }))}
                      placeholder="Introducir descripción del módulo"
                    />
                    {fieldErrors.moduleDescription && (
                      <p className="text-sm text-destructive mt-1">{fieldErrors.moduleDescription}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Duración Estimada (minutos)</label>
                    <Input
                      type="number"
                      min="0"
                      value={currentModule.estimatedDuration}
                      onChange={(e) => setCurrentModule((prev: TrainingModule) => ({ 
                        ...prev, 
                        estimatedDuration: parseInt(e.target.value) || 0 
                      }))}
                      placeholder="60"
                    />
                  </div>
                </div>

                {/* Exercises for Current Module */}
                <div className="border rounded-lg p-4 bg-background">
                  <h5 className="font-medium mb-4">Añadir Ejercicio</h5>
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nombre del Ejercicio</label>
                        <Input
                          value={currentExercise.name}
                          onChange={(e) => setCurrentExercise((prev: Exercise) => ({ ...prev, name: e.target.value }))}
                          placeholder="Nombre del ejercicio"
                        />
                        <label className="block text-sm font-medium mb-1 mt-2">Tipo de ejercicio (EMOM, EMOM 2', etc.)</label>
                        <Input
                          value={currentExercise.tipo || ''}
                          onChange={(e) => setCurrentExercise((prev: Exercise) => ({ ...prev, tipo: e.target.value }))}
                          placeholder="Tipo de ejercicio"
                        />
                        {fieldErrors.exerciseName && (
                          <p className="text-sm text-destructive mt-1">{fieldErrors.exerciseName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Series</label>
                        <Input
                          type="number"
                          min="0"
                          value={currentExercise.sets}
                          onChange={(e) => setCurrentExercise((prev: Exercise) => ({ 
                            ...prev, 
                            sets: parseInt(e.target.value) || 0 
                          }))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">Repeticiones</label>
                        <Input
                          value={currentExercise.reps}
                          onChange={(e) => setCurrentExercise((prev: Exercise) => ({ ...prev, reps: e.target.value }))}
                          placeholder="10-12 o 30 segundos"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Tiempo de Descanso (segundos)</label>
                        <Input
                          type="number"
                          min="0"
                          value={currentExercise.restTime}
                          onChange={(e) => setCurrentExercise((prev: Exercise) => ({ 
                            ...prev, 
                            restTime: parseInt(e.target.value) || 0 
                          }))}
                          placeholder="60"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Descripción</label>
                      <textarea
                        value={currentExercise.description}
                        onChange={(e) => setCurrentExercise((prev: Exercise) => ({ ...prev, description: e.target.value }))}
                        placeholder="Descripción del ejercicio"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        rows={3}
                      />
                      {fieldErrors.exerciseDescription && (
                        <p className="text-sm text-destructive mt-1">{fieldErrors.exerciseDescription}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">URL de Vídeo (opcional)</label>
                      <Input
                        type="url"
                        value={currentExercise.videoUrl || ''}
                        onChange={(e) => setCurrentExercise((prev: Exercise) => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Instrucciones (una por línea)</label>
                      <textarea
                        value={currentExercise.instructions?.join('\n') || ''}
                        onChange={(e) => setCurrentExercise((prev: Exercise) => ({ 
                          ...prev, 
                          instructions: e.target.value.split('\n').filter(i => i.trim()) 
                        }))}
                        placeholder="Línea 1&#10;Línea 2&#10;Línea 3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        rows={4}
                      />
                      {fieldErrors.exerciseInstructions && (
                        <p className="text-sm text-destructive mt-1">{fieldErrors.exerciseInstructions}</p>
                      )}
                    </div>
                    <Button type="button" onClick={addExercise} className="w-full">
                      Añadir Ejercicio
                    </Button>
                  </div>

                  {/* Current Module Exercises */}
                  {currentModule.exercises.length > 0 && (
                    <div className="mt-4">
                      <h6 className="font-medium mb-2">Ejercicios en este módulo:</h6>
                      <ExerciseSortableList
                        exercises={currentModule.exercises}
                        onChange={(exs) => setCurrentModule((prev: TrainingModule) => ({ ...prev, exercises: exs }))}
                        removeLabel="Eliminar"
                      />
                    </div>
                  )}
                  {fieldErrors.moduleExercises && (
                    <p className="text-sm text-destructive mt-2">{fieldErrors.moduleExercises}</p>
                  )}
                </div>

                <Button type="button" onClick={addModule} className="w-full">
                  Añadir Módulo al Plan
                </Button>
              </div>
            </div>

            {/* Existing Modules */}
            {form.previewModules.length > 0 && (
              <div>
                <h4 className="font-medium mb-4">Módulos de Vista Previa ({form.previewModules.length})</h4>
                <div className="space-y-4">
                  {form.previewModules.map((module: TrainingModule) => (
                    <Card key={module.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium">{module.title}</h5>
                            <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                            <div className="text-sm text-muted-foreground">
                              {module.exercises.length} ejercicios
                            </div>
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeModule(module.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Full Modules (Existing Modules Added) */}
            {(form.fullModules && form.fullModules.length > 0) && (
              <div>
                <h4 className="font-medium mb-4">Módulos Existentes Añadidos ({form.fullModules.length})</h4>
                <div className="space-y-4">
                  {form.fullModules.map((module: TrainingModule) => (
                    <Card key={module.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium">{module.title}</h5>
                            <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                            <div className="text-sm text-muted-foreground">
                              {module.exercises.length} ejercicios • Módulo existente
                            </div>
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeFullModule(module.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
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