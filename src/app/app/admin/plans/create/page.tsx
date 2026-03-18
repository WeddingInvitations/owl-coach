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

export default function CreatePlanPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
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
    if (!currentExercise.name.trim()) return;

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
  };

  const removeExercise = (exerciseId: string) => {
    setCurrentModule((prev: TrainingModule) => ({
      ...prev,
      exercises: prev.exercises.filter((ex: Exercise) => ex.id !== exerciseId)
    }));
  };

  const addModule = () => {
    if (!currentModule.title.trim()) return;

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
      
      // Validate form
      createTrainingPlanSchema.parse(form);

      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          <CardTitle>Create Training Plan</CardTitle>
          <CardDescription>
            Add a new training plan to the platform
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm((prev: CreatePlanForm) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter plan title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={form.shortDescription}
                onChange={(e) => setForm((prev: CreatePlanForm) => ({ ...prev, shortDescription: e.target.value }))}
                placeholder="Describe the training plan"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={4}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Level</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm((prev: CreatePlanForm) => ({ 
                    ...prev, 
                    difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price ($)</label>
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
              <label className="block text-sm font-medium mb-2">Image URL (optional)</label>
              <Input
                type="url"
                value={form.coverImage || ''}
                onChange={(e) => setForm((prev: CreatePlanForm) => ({ ...prev, coverImage: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Tags Section */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>Add</Button>
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
            <CardTitle>Training Modules</CardTitle>
            <CardDescription>
              Create modules and exercises for your training plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Module Form */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="font-medium mb-4">Add New Module</h4>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Module Title</label>
                    <Input
                      value={currentModule.title}
                      onChange={(e) => setCurrentModule((prev: TrainingModule) => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter module title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Module Description</label>
                    <Input
                      value={currentModule.description}
                      onChange={(e) => setCurrentModule((prev: TrainingModule) => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter module description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Estimated Duration (minutes)</label>
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
                  <h5 className="font-medium mb-4">Add Exercise</h5>
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">Exercise Name</label>
                        <Input
                          value={currentExercise.name}
                          onChange={(e) => setCurrentExercise((prev: Exercise) => ({ ...prev, name: e.target.value }))}
                          placeholder="Exercise name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Sets</label>
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
                        <label className="block text-sm font-medium mb-1">Reps</label>
                        <Input
                          value={currentExercise.reps}
                          onChange={(e) => setCurrentExercise((prev: Exercise) => ({ ...prev, reps: e.target.value }))}
                          placeholder="10-12 or 30 seconds"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Rest Time (seconds)</label>
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
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Input
                        value={currentExercise.description}
                        onChange={(e) => setCurrentExercise((prev: Exercise) => ({ ...prev, description: e.target.value }))}
                        placeholder="Exercise description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Video URL (optional)</label>
                      <Input
                        type="url"
                        value={currentExercise.videoUrl || ''}
                        onChange={(e) => setCurrentExercise((prev: Exercise) => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                    <Button type="button" onClick={addExercise} className="w-full">
                      Add Exercise
                    </Button>
                  </div>

                  {/* Current Module Exercises */}
                  {currentModule.exercises.length > 0 && (
                    <div className="mt-4">
                      <h6 className="font-medium mb-2">Exercises in this module:</h6>
                      <div className="space-y-2">
                        {currentModule.exercises.map((exercise: Exercise) => (
                          <div key={exercise.id} className="flex justify-between items-center p-2 bg-muted rounded">
                            <div>
                              <div className="font-medium">{exercise.name}</div>
                              <div className="text-sm text-muted-foreground">{exercise.sets} sets × {exercise.reps}</div>
                            </div>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeExercise(exercise.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button type="button" onClick={addModule} className="w-full">
                  Add Module to Plan
                </Button>
              </div>
            </div>

            {/* Existing Modules */}
            {form.previewModules.length > 0 && (
              <div>
                <h4 className="font-medium mb-4">Plan Modules ({form.previewModules.length})</h4>
                <div className="space-y-4">
                  {form.previewModules.map((module: TrainingModule) => (
                    <Card key={module.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium">{module.title}</h5>
                            <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                            <div className="text-sm text-muted-foreground">
                              {module.exercises.length} exercises
                            </div>
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeModule(module.id)}
                          >
                            Remove
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
            {loading ? 'Creating...' : 'Create Training Plan'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}