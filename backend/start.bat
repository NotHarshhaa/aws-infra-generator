@echo off
REM AWS Infra Generator Backend Startup Script for Windows

echo Starting AWS Infra Generator Backend...

REM Set environment variables
if "%ALLOWED_ORIGINS%"=="" set ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
if "%LOG_LEVEL%"=="" set LOG_LEVEL=INFO

REM Install dependencies if needed
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Start the server
echo Starting server on http://localhost:8000
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
