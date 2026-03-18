'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { TrainingPlan, TrainingModule, Exercise } from '@/types/training-plan';
import { createTrainingPlanSchema } from '@/lib/validations/plans';
import { z } from 'zod';

type CreatePlanForm = z.infer<typeof createTrainingPlanSchema>;

interface FieldError {
  [key: string]: string | undefined;
}

export default function CreatePlanPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<FieldError>({});
  const [form, setForm] = React.useState<CreatePlanForm>({
    title: '',
    shortDescription: '',
    fullDescription: '',
    difficulty: 'beginner',
    duration: 1,
    price: 0,
    currency: 'USD',
    coverImage: '',
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
      } else if (fieldName === 'coverImage') {
        if (value?.trim() && !value.startsWith('http')) {
          setFieldErrors(prev => ({ ...prev, coverImage: 'La imagen de portada debe ser una URL válida' }));
        } else {
          setFieldErrors(prev => ({ ...prev, coverImage: undefined }));
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

    setCurrentModule({
      id: '',
      title: '',
      description: '',
      exercises: [],
      estimatedDuration: 0,
    });

    setFieldErrors(prev => ({ 
      ...prev, 
      moduleTitle: undefined, 
      moduleDescription: undefined,
      moduleExercises: undefined 
    }));
  };

  const removeModule = (moduleId: string) => {
    setForm((prev: CreatePlanForm) => ({
      ...prev,
      previewModules: prev.previewModules.filter((m: TrainingModule) => m.id !== moduleId)
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
        router.push('/app/admin/plans');
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
                    difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Precio ($)</label>
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
              <label className="block text-sm font-medium mb-2">URL de Imagen (opcional)</label>
              <Input
                type="url"
                value={form.coverImage || ''}
                onChange={(e) => {
                  setForm((prev: CreatePlanForm) => ({ ...prev, coverImage: e.target.value }));
                  validateField('coverImage', e.target.value);
                }}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {fieldErrors.coverImage && (
                <p className="text-sm text-destructive mt-1">{fieldErrors.coverImage}</p>
              )}
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
              Crear módulos y ejercicios para tu plan de entrenamiento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                      <div className="space-y-2">
                        {currentModule.exercises.map((exercise: Exercise) => (
                          <div key={exercise.id} className="flex justify-between items-center p-2 bg-muted rounded">
                            <div>
                              <div className="font-medium">{exercise.name}</div>
                              <div className="text-sm text-muted-foreground">{exercise.sets} series × {exercise.reps}</div>
                            </div>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeExercise(exercise.id)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        ))}
                      </div>
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
                <h4 className="font-medium mb-4">Módulos del Plan ({form.previewModules.length})</h4>
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