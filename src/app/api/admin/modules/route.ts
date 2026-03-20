import { NextRequest, NextResponse } from 'next/server';
import { createModule, listModules, updateModule, deleteModule } from '@/server/services/ModulesService';
import { admin } from '@/lib/firebase-admin';
import { usersRepository } from '@/server/repositories/UsersRepository';
import { canViewModules } from '@/lib/permissions/modules';

export async function GET(req: NextRequest) {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Token faltante' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 });
    }
    // Buscar usuario en la base de datos
    const user = await usersRepository.getById(decoded.uid);
    if (!user || !canViewModules(user) || (user.role !== 'owner' && user.role !== 'coach')) {
      return NextResponse.json({ success: false, error: 'Permisos insuficientes.' }, { status: 403 });
    }
    const modules = await listModules();
    return NextResponse.json({ success: true, modules });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Error listing modules' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    // Verificación de token y rol
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Token faltante' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 });
    }
    const user = await usersRepository.getById(decoded.uid);
    if (!user || (user.role !== 'owner' && user.role !== 'coach')) {
      return NextResponse.json({ success: false, error: 'Permisos insuficientes.' }, { status: 403 });
    }
    const { name, description, estimatedDuration, exercises } = await req.json();
    if (!name) return NextResponse.json({ success: false, error: 'Missing name' }, { status: 400 });
    const module = await createModule({ name, description, estimatedDuration, exercises });
    return NextResponse.json({ success: true, module });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Error creating module' }, { status: 500 });
  }
}


export async function PUT(req: NextRequest) {
  try {
    // Verificación de token y rol
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Token faltante' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 });
    }
    const user = await usersRepository.getById(decoded.uid);
    if (!user || (user.role !== 'owner' && user.role !== 'coach')) {
      return NextResponse.json({ success: false, error: 'Permisos insuficientes.' }, { status: 403 });
    }
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
    // Verificación de token y rol
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Token faltante' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 });
    }
    const user = await usersRepository.getById(decoded.uid);
    if (!user || (user.role !== 'owner' && user.role !== 'coach')) {
      return NextResponse.json({ success: false, error: 'Permisos insuficientes.' }, { status: 403 });
    }
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    try {
      await deleteModule(id);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message || 'Error deleting module' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Error deleting module' }, { status: 500 });
  }
}

