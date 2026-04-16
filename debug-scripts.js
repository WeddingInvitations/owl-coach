/**
 * 🧰 Helper Scripts para Desarrollo
 * 
 * Copia y pega estos scripts en la consola del navegador (F12)
 * cuando estés en tu aplicación para debugging.
 */

/**
 * 1️⃣ Ver estado de compras y entitlements del usuario actual
 */
async function verEstadoUsuario() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('❌ No hay usuario autenticado');
      return;
    }

    const response = await fetch('/api/debug/user-purchases', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Estado del Usuario:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👤 User ID:', data.data.userId);
      console.log('');
      console.log('📦 COMPRAS (' + data.data.purchases.length + '):');
      console.table(data.data.purchases);
      console.log('');
      console.log('🎟️ ENTITLEMENTS (' + data.data.entitlements.length + '):');
      console.table(data.data.entitlements);
      console.log('');
      console.log('🔓 PLANES DESBLOQUEADOS:');
      console.log(data.data.unlockedPlanIds);
      console.log('');
      console.log('📊 RESUMEN:');
      console.table(data.data.summary);
    } else {
      console.error('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Error al obtener estado:', error);
  }
}

/**
 * 2️⃣ Limpiar TODAS las compras y entitlements del usuario actual
 * ⚠️ USAR CON CUIDADO - Esto borra datos reales
 */
async function limpiarMisCompras() {
  const confirmacion = confirm(
    '⚠️ ADVERTENCIA\n\n' +
    'Esto eliminará TODAS tus compras y entitlements.\n' +
    'Perderás acceso a todos los planes comprados.\n\n' +
    '¿Estás seguro de continuar?'
  );

  if (!confirmacion) {
    console.log('❌ Operación cancelada');
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('❌ No hay usuario autenticado');
      return;
    }

    // Primero obtener el estado actual
    const response = await fetch('/api/debug/user-purchases', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Error al obtener datos:', data.error);
      return;
    }

    console.log('🧹 Iniciando limpieza...');
    console.log('Purchases a eliminar:', data.data.purchases.length);
    console.log('Entitlements a eliminar:', data.data.entitlements.length);
    
    // NOTA: Necesitarías crear endpoints de DELETE en tu API
    // Por ahora, muestra las IDs para eliminar manualmente en Firestore
    console.log('');
    console.log('📋 IDs a eliminar manualmente en Firestore:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (data.data.purchases.length > 0) {
      console.log('🔹 Colección: purchases');
      data.data.purchases.forEach(p => console.log('  - ' + p.id));
    }
    
    if (data.data.entitlements.length > 0) {
      console.log('🔹 Colección: userEntitlements');
      data.data.entitlements.forEach(e => console.log('  - ' + e.id));
    }
    
    console.log('');
    console.log('📝 Para eliminarlos:');
    console.log('1. Ve a Firebase Console > Firestore');
    console.log('2. Busca cada documento por su ID');
    console.log('3. Elimínalo');
    console.log('');
    console.log('💡 O usa el script de limpieza: npx tsx scripts/clean-user-purchases.ts');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * 3️⃣ Verificar si Stripe está configurado
 */
async function verificarStripe() {
  try {
    console.log('🔍 Verificando configuración de Stripe...');
    console.log('');
    
    // Verificar keys públicas
    const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    console.log('🔑 Claves Públicas:');
    console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', publicKey ? '✅ Configurada' : '❌ No configurada');
    console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || window.location.origin);
    console.log('');
    
    // Intentar crear una sesión de prueba
    console.log('🧪 Probando creación de sesión de checkout...');
    console.log('(Esto puede fallar si no hay un plan válido)');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * 4️⃣ Verificar acceso a un plan específico
 */
async function verificarAccesoPlan(planId) {
  if (!planId) {
    console.error('❌ Proporciona un planId');
    console.log('Uso: verificarAccesoPlan("plan_id_aqui")');
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('❌ No hay usuario autenticado');
      return;
    }

    const response = await fetch(`/api/entitlements?planId=${planId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    
    console.log('🔍 Verificación de acceso:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Plan ID:', planId);
    console.log('🔓 Tienes acceso:', data.data?.hasAccess ? '✅ SÍ' : '❌ NO');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * 5️⃣ Obtener info del usuario actual
 */
function verUsuarioActual() {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('authToken');
  
  if (!user && !token) {
    console.error('❌ No hay usuario autenticado');
    return;
  }
  
  console.log('👤 Usuario Actual:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (user) {
    const userData = JSON.parse(user);
    console.table(userData);
  }
  
  console.log('');
  console.log('🔑 Token:', token ? '✅ Presente' : '❌ No presente');
}

// Mostrar ayuda
console.log('🧰 Scripts de Debug Cargados');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Funciones disponibles:');
console.log('');
console.log('1️⃣  verEstadoUsuario()         - Ver compras y entitlements');
console.log('2️⃣  limpiarMisCompras()        - Limpiar todas las compras (requiere confirmación)');
console.log('3️⃣  verificarStripe()          - Verificar configuración de Stripe');
console.log('4️⃣  verificarAccesoPlan(id)    - Verificar acceso a un plan específico');
console.log('5️⃣  verUsuarioActual()         - Ver info del usuario logueado');
console.log('');
console.log('💡 Tip: Copia y pega cada función en la consola para usarla');
