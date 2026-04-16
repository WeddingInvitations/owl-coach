# 🚀 Despliegue en Cloud Run con Stripe

## 📋 Variables de Entorno Requeridas

Después del despliegue en Cloud Run, debes configurar las siguientes variables de entorno:

### 🔐 Variables de Stripe (OBLIGATORIAS para pagos)

En la consola de Cloud Run, ve a tu servicio > Editar y Desplegar Nueva Revisión > Variables y Secretos:

```bash
# Stripe Keys (PRODUCCIÓN - obtén de https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_TU_CLAVE_SECRETA_DE_PRODUCCION
STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_DE_PRODUCCION

# Stripe Public Keys (también se pueden pasar como build args)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_TU_CLAVE_PUBLICA_DE_PRODUCCION
NEXT_PUBLIC_BASE_URL=https://tu-dominio.run.app
```

### 🔥 Variables de Firebase Admin (ya configuradas)

```bash
FIREBASE_PROJECT_ID=owl-coach
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@owl-coach.iam.gserviceaccount.com
```

### 📧 Variables de Owners (opcional)

```bash
OWNER_EMAILS=tu-email@ejemplo.com
NEXT_PUBLIC_OWNER_EMAILS=tu-email@ejemplo.com
```

---

## 🎯 Pasos para Configurar Stripe en Producción

### 1️⃣ Activar Stripe en Modo Live

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
2. Cambia del modo **TEST** a **LIVE** (toggle arriba a la derecha)
3. Completa los datos de tu negocio si es necesario

### 2️⃣ Obtener API Keys de Producción

1. Ve a: **Developers > API keys**
2. Copia:
   - **Publishable key** (empieza con `pk_live_`)
   - **Secret key** (empieza con `sk_live_`) - Click en "Reveal live key"

### 3️⃣ Configurar Webhook de Producción

1. Ve a: **Developers > Webhooks**
2. Click en **"Add endpoint"**
3. URL del endpoint: `https://tu-dominio.run.app/api/billing/webhook`
4. Eventos a escuchar:
   - ✅ `checkout.session.completed`
   - ✅ `checkout.session.expired` (opcional)
   - ✅ `checkout.session.async_payment_failed` (opcional)
5. Click en **"Add endpoint"**
6. Copia el **Signing secret** (empieza con `whsec_`)

### 4️⃣ Configurar Variables en Cloud Run

**Opción A: Por consola web**

1. Ve a [Cloud Run Console](https://console.cloud.google.com/run)
2. Click en tu servicio `owl-coach`
3. Click en **"Edit & Deploy New Revision"**
4. Scroll hasta **"Variables y secretos"**
5. Agrega las variables:

```
STRIPE_SECRET_KEY = sk_live_xxxxx
STRIPE_WEBHOOK_SECRET = whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_xxxxx
NEXT_PUBLIC_BASE_URL = https://tu-dominio.run.app
```

6. Click en **"Deploy"**

**Opción B: Por línea de comandos (gcloud)**

```bash
gcloud run services update owl-coach \
  --region=europe-southwest1 \
  --update-env-vars="\
STRIPE_SECRET_KEY=sk_live_xxxxx,\
STRIPE_WEBHOOK_SECRET=whsec_xxxxx,\
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx,\
NEXT_PUBLIC_BASE_URL=https://owl-coach-914976441542.europe-southwest1.run.app"
```

### 5️⃣ Verificar Configuración

Después del despliegue, verifica:

1. **Logs de Cloud Run:**
   ```bash
   gcloud run services logs read owl-coach --region=europe-southwest1
   ```

2. **Prueba un pago:**
   - Ve a tu aplicación en producción
   - Intenta comprar un plan
   - Deberías ser redirigido a Stripe Checkout
   - Usa la tarjeta de prueba: `4242 4242 4242 4242`

3. **Verifica webhooks:**
   - Ve a Stripe Dashboard > Webhooks
   - Debería aparecer el evento `checkout.session.completed`
   - Status: **Succeeded**

---

## 🧪 Modo Test vs Producción

### 🔬 Modo TEST (para desarrollo)
- Variables empiezan con `sk_test_` y `pk_test_`
- Usa tarjetas de prueba: `4242 4242 4242 4242`
- No se procesan pagos reales
- Webhook secret empieza con `whsec_test_`

### 💰 Modo LIVE (producción)
- Variables empiezan con `sk_live_` y `pk_live_`
- Se procesan pagos reales
- Requiere configuración de negocio en Stripe
- Webhook secret empieza con `whsec_` (sin `test_`)

---

## ⚠️ Seguridad

### ✅ DO (Hacer):
- ✅ Usar variables de entorno para secrets
- ✅ NUNCA commitear keys en el código
- ✅ Rotar keys periódicamente
- ✅ Monitorear logs de Stripe para actividad sospechosa
- ✅ Validar webhooks con signature verification

### ❌ DON'T (No hacer):
- ❌ Compartir keys en Slack/Email/Discord
- ❌ Usar keys de producción en desarrollo
- ❌ Exponer `STRIPE_SECRET_KEY` en el frontend
- ❌ Deshabilitar verificación de webhooks

---

## 🐛 Troubleshooting

### Problema: "Stripe is not configured"

**Solución:**
- Verifica que las variables estén en Cloud Run
- Verifica que empiecen con `sk_live_` (producción) o `sk_test_` (test)
- Reinicia el servicio de Cloud Run

### Problema: "Webhook signature verification failed"

**Solución:**
- Verifica que `STRIPE_WEBHOOK_SECRET` sea correcto
- Verifica que sea el del endpoint de producción (no el de test)
- En Stripe Dashboard, verifica que el endpoint URL sea correcto

### Problema: Pago se completa pero no desbloquea contenido

**Solución:**
- Verifica logs de Cloud Run para ver si el webhook llegó
- En Stripe Dashboard > Webhooks, verifica los eventos
- Si el webhook falló, puedes "Resend" el evento desde Stripe

### Problema: Build falla con error de Stripe

**Solución:**
- El código ya maneja esto con una dummy key durante build
- No es necesario configurar `STRIPE_SECRET_KEY` en build time
- Solo configúralo en runtime (Cloud Run)

---

## 📊 Monitoreo

### Ver logs en tiempo real:

```bash
gcloud run services logs tail owl-coach --region=europe-southwest1
```

### Buscar logs de Stripe:

```bash
gcloud run services logs read owl-coach \
  --region=europe-southwest1 \
  --filter="textPayload:stripe OR textPayload:Stripe OR textPayload:checkout"
```

### Monitorear webhooks en Stripe:

1. Ve a [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click en tu endpoint
3. Ve a la pestaña "Eventos"
4. Verifica que los eventos estén siendo entregados correctamente

---

## 📚 Recursos

- **Stripe Dashboard:** https://dashboard.stripe.com/
- **API Keys (Live):** https://dashboard.stripe.com/apikeys
- **Webhooks:** https://dashboard.stripe.com/webhooks
- **Testing:** https://stripe.com/docs/testing
- **Cloud Run Console:** https://console.cloud.google.com/run
- **Documentación Cloud Run:** https://cloud.google.com/run/docs

---

## ✅ Checklist de Despliegue

Antes de lanzar a producción:

- [ ] Cuenta de Stripe activada en modo LIVE
- [ ] Datos del negocio completados en Stripe
- [ ] API keys de producción obtenidas
- [ ] Webhook configurado con URL de producción
- [ ] Variables de entorno configuradas en Cloud Run
- [ ] Build exitoso en Cloud Build
- [ ] Servicio desplegado en Cloud Run
- [ ] Prueba de compra completada exitosamente
- [ ] Webhooks funcionando correctamente
- [ ] Logs monitoreados sin errores

🎉 **¡Listo para aceptar pagos en producción!**
