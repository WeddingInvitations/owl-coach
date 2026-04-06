import * as React from 'react';
import { Button } from '@/components/ui/Button';

type AnyExercise = {
  id: string;
  name: string;
  sets?: number;
  reps?: string;
  restTime?: number;
};

interface ExerciseSortableListProps<T extends AnyExercise> {
  exercises: T[];
  onChange: (exercises: T[]) => void;
  /** Label shown on the remove button. Defaults to "Quitar" */
  removeLabel?: string;
}

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function ExerciseSortableList<T extends AnyExercise>({
  exercises,
  onChange,
  removeLabel = 'Quitar',
}: ExerciseSortableListProps<T>) {
  if (exercises.length === 0) return null;

  const move = (idx: number, direction: -1 | 1) => {
    const to = idx + direction;
    if (to < 0 || to >= exercises.length) return;
    onChange(moveItem(exercises, idx, to));
  };

  const remove = (idx: number) => {
    onChange(exercises.filter((_, i) => i !== idx));
  };

  return (
    <ul className="space-y-2">
      {exercises.map((ex, idx) => (
        <li
          key={ex.id || idx}
          className="flex items-center gap-2 p-2 bg-muted rounded border"
        >
          {/* Order badge */}
          <span className="shrink-0 w-6 text-center text-sm font-semibold text-muted-foreground">
            {idx + 1}
          </span>

          {/* Exercise info */}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{ex.name}</div>
            {(ex.sets !== undefined || ex.reps) && (
              <div className="text-xs text-muted-foreground">
                {ex.sets} series × {ex.reps}
                {ex.restTime ? ` · ${ex.restTime}s descanso` : ''}
              </div>
            )}
          </div>

          {/* Reorder buttons */}
          <div className="flex flex-col gap-0.5 shrink-0">
            <button
              type="button"
              disabled={idx === 0}
              onClick={() => move(idx, -1)}
              className="h-5 w-5 flex items-center justify-center rounded text-xs
                         disabled:opacity-30 hover:bg-accent transition-colors"
              title="Subir"
            >
              ▲
            </button>
            <button
              type="button"
              disabled={idx === exercises.length - 1}
              onClick={() => move(idx, 1)}
              className="h-5 w-5 flex items-center justify-center rounded text-xs
                         disabled:opacity-30 hover:bg-accent transition-colors"
              title="Bajar"
            >
              ▼
            </button>
          </div>

          {/* Remove */}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="shrink-0"
            onClick={() => remove(idx)}
          >
            {removeLabel}
          </Button>
        </li>
      ))}
    </ul>
  );
}
