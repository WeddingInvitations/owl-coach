import { NextRequest, NextResponse } from 'next/server';
import { createModule, listModules, updateModule, deleteModule } from '@/server/services/ModulesService';

export async function GET() {
  try {
    const modules = await listModules();
    return NextResponse.json({ success: true, modules });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Error listing modules' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();
    if (!name) return NextResponse.json({ success: false, error: 'Missing name' }, { status: 400 });
    const module = await createModule({ name, description });
    return NextResponse.json({ success: true, module });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Error creating module' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, description } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    await updateModule(id, { name, description });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Error updating module' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    await deleteModule(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Error deleting module' }, { status: 500 });
  }
}
