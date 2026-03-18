param([string]$ProjectId)

if (-not $ProjectId) {
  Write-Host "Error: Debes proporcionar el PROJECT_ID" -ForegroundColor Red
  Write-Host "Uso: .\deploy-simple.ps1 TU_PROJECT_ID" -ForegroundColor Yellow
    exit 1
}

$ServiceName = "owl-coach"
$Region = "us-central1"

Write-Host "Desplegando Owl Coach a Cloud Run..." -ForegroundColor Green
Write-Host "Proyecto: $ProjectId" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan
Write-Host "Servicio: $ServiceName" -ForegroundColor Cyan

# Configurar proyecto
gcloud config set project $ProjectId

# Habilitar APIs necesarias
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# Despliegue directo desde código fuente (sin cloudbuild.yaml)
gcloud run deploy $ServiceName `
  --source . `
  --platform managed `
  --region $Region `
  --allow-unauthenticated `
  --port 8080 `
  --memory 512Mi `
  --cpu 1 `
  --max-instances 10 `
  --set-env-vars "NODE_ENV=production,NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAQ0zuspsoBEQ54rCDGTKbAeHM96DVl3ZU,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=owl-coach.firebaseapp.com,NEXT_PUBLIC_FIREBASE_PROJECT_ID=owl-coach,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=owl-coach.firebasestorage.app,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=831473832501,NEXT_PUBLIC_FIREBASE_APP_ID=1:831473832501:web:2e88bf60073fe84947177c,NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-HBKC82DJ4Q"

$ServiceUrl = gcloud run services describe $ServiceName --region $Region --format "value(status.url)"
Write-Host "Despliegue completado" -ForegroundColor Green
Write-Host "URL: $ServiceUrl" -ForegroundColor Green
