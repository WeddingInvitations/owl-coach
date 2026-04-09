/**
 * Script para verificar los módulos de los planes en Firestore
 * Ejecutar con: npx ts-node scripts/check-plan-modules.ts
 */

import { trainingPlansRepository } from '../src/server/repositories/TrainingPlansRepository';

async function checkPlanModules() {
  try {
    console.log('🔍 Buscando planes en Firestore...\n');
    
    const plans = await trainingPlansRepository.getAll();
    
    console.log(`📊 Total de planes encontrados: ${plans.length}\n`);
    
    for (const plan of plans) {
      console.log(`\n📋 Plan: ${plan.title} (ID: ${plan.id})`);
      console.log(`   - Preview Modules: ${Array.isArray(plan.previewModules) ? plan.previewModules.length : 'N/A'}`);
      console.log(`   - Full Modules: ${Array.isArray(plan.fullModules) ? plan.fullModules.length : 'N/A'}`);
      
      if (plan.previewModules && plan.previewModules.length > 0) {
        console.log('\n   🔹 Preview Modules:');
        plan.previewModules.forEach((mod, idx) => {
          console.log(`      ${idx + 1}. ${mod.title || 'Sin título'} - ${mod.exercises?.length || 0} ejercicios`);
        });
      }
      
      if (plan.fullModules && plan.fullModules.length > 0) {
        console.log('\n   🔹 Full Modules:');
        plan.fullModules.forEach((mod, idx) => {
          console.log(`      ${idx + 1}. ${mod.title || 'Sin título'} - ${mod.exercises?.length || 0} ejercicios`);
        });
      }
    }
    
    console.log('\n✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error al verificar planes:', error);
  }
}

checkPlanModules();
