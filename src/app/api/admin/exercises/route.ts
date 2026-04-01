import { NextRequest, NextResponse } from 'next/server';
import { createExercise, listExercises, updateExercise, deleteExercise, getExerciseUsageInModules } from '@/server/services/ExercisesService';

export async function GET() {
  try {
    const exercises = await listExercises();
    return NextResponse.json({ success: true, exercises });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Error listing exercises' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const exerciseData = await req.json();
    if (!exerciseData.name) return NextResponse.json({ success: false, error: 'Missing name' }, { status: 400 });
    // tipo is optional, but always pass it
    const exercise = await createExercise({ ...exerciseData, tipo: exerciseData.tipo || '' });
    return NextResponse.json({ success: true, exercise });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Error creating exercise' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const updateData = await req.json();
    if (!updateData.id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    
    const { id, ...exerciseData } = updateData;
    await updateExercise(id, exerciseData);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Error updating exercise' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    await deleteExercise(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Error deleting exercise' }, { status: 500 });
  }
}
