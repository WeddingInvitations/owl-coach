/**
 * Script para probar añadir módulos a un plan
 * Ejecutar con: npx ts-node scripts/test-add-modules.ts <plan-id>
 */

import { trainingPlansRepository } from '../src/server/repositories/TrainingPlansRepository';

async function testAddModules() {
  try {
    const planId = process.argv[2];
    
    if (!planId) {
      console.error('❌ Uso: npx ts-node scripts/test-add-modules.ts <plan-id>');
      process.exit(1);
    }
    
    console.log(`🔍 Buscando plan: ${planId}...\n`);
    
    const plan = await trainingPlansRepository.getById(planId);
    
    if (!plan) {
      console.error('❌ Plan no encontrado');
      process.exit(1);
    }
    
    console.log(`📋 Plan encontrado: ${plan.title}`);
    console.log(`   - Preview Modules actuales: ${plan.previewModules?.length || 0}`);
    console.log(`   - Full Modules actuales: ${plan.fullModules?.length || 0}\n`);
    
    // Crear un módulo de prueba
    const testModule = {
      id: `test-module-${Date.now()}`,
      title: 'Módulo de Prueba',
      description: 'Este es un módulo de prueba para verificar el guardado',
      estimatedDuration: 30,
      exercises: [
        {
          id: `test-exercise-${Date.now()}`,
          name: 'Ejercicio de Prueba',
          description: 'Ejercicio de prueba',
          sets: 3,
          reps: '10',
          restTime: 60,
          videoUrl: '',
          imageUrl: '',
          instructions: ['Instrucción 1', 'Instrucción 2'],
        }
      ]
    };
    
    console.log('➕ Añadiendo módulo de prueba...\n');
    
    const updateData = {
      fullModules: [...(plan.fullModules || []), testModule],
    };
    
    console.log('📤 Datos a actualizar:', {
      fullModulesLength: updateData.fullModules.length,
      newModule: testModule.title
    });
    
    await trainingPlansRepository.updateTrainingPlan(planId, updateData);
    
    console.log('✅ Actualización enviada a Firestore\n');
    
    // Verificar que se guardó
    const updatedPlan = await trainingPlansRepository.getById(planId);
    
    console.log('📊 Resultado después de actualizar:');
    console.log(`   - Preview Modules: ${updatedPlan?.previewModules?.length || 0}`);
    console.log(`   - Full Modules: ${updatedPlan?.fullModules?.length || 0}`);
    
    if (updatedPlan?.fullModules && updatedPlan.fullModules.length > plan.fullModules?.length!) {
      console.log('\n✅ ¡Módulo añadido exitosamente!');
      console.log('\n📋 Módulos en el plan:');
      updatedPlan.fullModules.forEach((mod, idx) => {
        console.log(`   ${idx + 1}. ${mod.title} - ${mod.exercises?.length || 0} ejercicios`);
      });
    } else {
      console.log('\n❌ El módulo NO se guardó correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAddModules();
