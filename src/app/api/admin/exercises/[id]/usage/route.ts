import { NextRequest, NextResponse } from 'next/server';
import { getExerciseUsageInModules } from '@/server/services/ExercisesService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing exercise id' }, { status: 400 });
    }

    const modules = await getExerciseUsageInModules(id);
    return NextResponse.json({ success: true, modules });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Error getting exercise usage' }, { status: 500 });
  }
}