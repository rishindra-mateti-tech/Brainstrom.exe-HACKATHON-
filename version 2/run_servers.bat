@echo off
echo ==============================================
echo 🚀 CUTIeS-IQ Startup Sequence Initiated
echo ==============================================

echo [1/2] Starting Python ML Backend (Port 8000)...
start cmd /k "title ML Backend & cd integration\ml_service && pip install -r requirements.txt && uvicorn main:app --reload --port 8000"

echo [2/2] Starting Next.js Frontend (Port 3005)...
start cmd /k "title Next.js Frontend & cd integration && npm install && npm run dev"

echo.
echo All servers are booting up in separate terminal windows!
echo It may take a minute for npm install to verify packages on first run.
echo Please go to http://localhost:3005 in your browser when ready.
echo.
