#!/bin/bash

set -e

PROJECT_ID=${1:-""}
REGION=${2:-"europe-west1"}
SERVICE_NAME="owl-coach-app"
PUBLIC_FIREBASE_ENV_VARS="NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAQ0zuspsoBEQ54rCDGTKbAeHM96DVl3ZU,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=owl-coach.firebaseapp.com,NEXT_PUBLIC_FIREBASE_PROJECT_ID=owl-coach,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=owl-coach.firebasestorage.app,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=831473832501,NEXT_PUBLIC_FIREBASE_APP_ID=1:831473832501:web:2e88bf60073fe84947177c,NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-HBKC82DJ4Q"

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: Debes proporcionar PROJECT_ID"
  echo "💡 Uso: ./deploy.sh TU_PROJECT_ID [REGION]"
  exit 1
fi

echo "🚀 Desplegando Owl Coach a Cloud Run..."
echo "📍 Proyecto: $PROJECT_ID"
echo "📍 Región: $REGION"
echo "📍 Servicio: $SERVICE_NAME"

gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# Despliegue directo desde código fuente (sin cloudbuild.yaml)
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 20 \
  --set-env-vars "NODE_ENV=production,$PUBLIC_FIREBASE_ENV_VARS,OWNER_EMAILS=f14agui@gmail.com"

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)')
echo "✅ Despliegue completado"
echo "🌐 URL: $SERVICE_URL"
