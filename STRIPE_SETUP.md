# 🔐 Configuración de Stripe - Guía Paso a Paso

## ✅ PASO 1: Crear Cuenta de Stripe (GRATIS)

1. Ve a https://dashboard.stripe.com/register
2. Crea una cuenta gratuita
3. Completa el registro (no necesitas tarjeta de crédito)
4. Activa el **modo TEST** (botón arriba a la derecha)

---

## 🔑 PASO 2: Obtener las API Keys

1. En el Dashboard de Stripe, ve a: **Developers > API keys**
   - URL directa: https://dashboard.stripe.com/test/apikeys

2. Verás dos tipos de keys:
   - **Publishable key** (empieza con `pk_test_`)
   - **Secret key** (empieza con `sk_test_`) - Click en "Reveal test key"

3. **Copia ambas keys**

---

## 📝 PASO 3: Actualizar .env.local

Abre el archivo **`.env.local`** en la raíz del proyecto y reemplaza:

```env
# Reemplaza estas líneas:
STRIPE_SECRET_KEY=sk_test_REEMPLAZA_CON_TU_CLAVE_SECRETA_DE_STRIPE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_REEMPLAZA_CON_TU_CLAVE_PUBLICA_DE_STRIPE
```

Por tus keys reales:

```env
# Ejemplo (usa tus propias keys):
STRIPE_SECRET_KEY=sk_test_51PxYz123456789abcdefgh...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51PxYz123456789abcdefgh...
```

---

## 🎣 PASO 4: Configurar Webhook (Local Development)

### Opción A: Usar Stripe CLI (Recomendado)

1. **Descargar Stripe CLI:**
   - Windows: https://github.com/stripe/stripe-cli/releases/latest
   - Descarga `stripe_X.X.X_windows_x86_64.zip`
   - Extrae y agrega a tu PATH o usa directamente

2. **Login a Stripe:**
   ```powershell
   stripe login
   ```
   - Se abrirá tu navegador
   - Acepta el acceso

3. **Forward webhooks a tu servidor local:**
   ```powershell
   stripe listen --forward-to localhost:3000/api/billing/webhook
   ```

4. **Copia el webhook signing secret:**
   - Verás algo como: `whsec_xxxxxxxxxxxxx`
   - Cópialo al `.env.local`:

   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

5. **¡Deja la terminal abierta!** El comando debe seguir corriendo

### Opción B: Sin Stripe CLI (Usando ngrok - más complejo)

Si no puedes usar Stripe CLI, necesitas exponer tu servidor local:

1. Instala ngrok: https://ngrok.com/download
2. Ejecuta: `ngrok http 3000`
3. Copia la URL https que te da (ej: `https://abc123.ngrok.io`)
4. En Stripe Dashboard > Webhooks, añade endpoint: `https://abc123.ngrok.io/api/billing/webhook`
5. Selecciona evento: `checkout.session.completed`
6. Copia el webhook secret al `.env.local`

---

## 🚀 PASO 5: Reiniciar el Servidor

```powershell
# Detén el servidor (Ctrl+C)
npm run dev
```

Deberías ver en la consola:
```
✓ Stripe configured successfully
```

Si ves advertencias de Stripe, revisa que las keys estén correctas.

---

## 🧪 PASO 6: Probar el Pago

1. **Limpia los datos de prueba antiguos en Firestore:**
   - Ve a Firebase Console > Firestore
   - Elimina documentos en `purchases` y `userEntitlements` de tu usuario

2. **Ve a un plan en tu app:**
   - http://localhost:3000/app/plans/[slug]

3. **Haz clic en "Comprar Plan"**
   - Deberías ser redirigido a Stripe Checkout

4. **Usa tarjeta de prueba:**
   - Número: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura (ej: `12/34`)
   - CVC: Cualquier 3 dígitos (ej: `123`)
   - Código postal: Cualquiera (ej: `12345`)

5. **Completa el pago**
   - Serás redirigido de vuelta a tu app
   - Deberías ver el contenido desbloqueado

---

## 🐛 Solución de Problemas

### Error: "Stripe is not configured"
- ✅ Verifica que las keys estén en `.env.local`
- ✅ Verifica que no tengan el texto "REEMPLAZA"
- ✅ Reinicia el servidor después de cambiar `.env.local`

### Error: "Webhook signature verification failed"
- ✅ Verifica que `STRIPE_WEBHOOK_SECRET` esté correcto
- ✅ Si usas Stripe CLI, asegúrate que esté corriendo
- ✅ El secret debe empezar con `whsec_`

### El pago se completa pero no desbloquea contenido
- ✅ Verifica que Stripe CLI esté corriendo (webhooks)
- ✅ Revisa la consola del servidor para ver logs del webhook
- ✅ Verifica en Stripe Dashboard > Webhooks que el evento llegó

### "You already purchased this product" pero no compré nada
- ✅ Hay datos de prueba antiguos en Firestore
- ✅ Elimina documentos en `purchases` y `userEntitlements`

---

## 📚 Recursos

- **Stripe Dashboard:** https://dashboard.stripe.com/
- **API Keys:** https://dashboard.stripe.com/test/apikeys
- **Webhooks:** https://dashboard.stripe.com/test/webhooks
- **Stripe CLI:** https://stripe.com/docs/stripe-cli
- **Test Cards:** https://stripe.com/docs/testing

---

## ✅ Checklist Final

- [ ] Cuenta de Stripe creada
- [ ] Modo TEST activado
- [ ] API keys copiadas a `.env.local`
- [ ] Stripe CLI instalado y corriendo (`stripe listen...`)
- [ ] Webhook secret copiado a `.env.local`
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Datos de prueba antiguos eliminados de Firestore
- [ ] Pago de prueba completado exitosamente

---

**¡Ya está todo listo para aceptar pagos! 🎉**

Para pasar a producción, simplemente cambia las keys de TEST por las de PRODUCCIÓN en tu hosting (Vercel/Cloud Run).
