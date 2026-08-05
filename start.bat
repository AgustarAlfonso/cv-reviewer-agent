@echo off
echo Starting CVSight Backend and Frontend...

:: Start Backend in a new window
echo Starting Backend (FastAPI)...
start "CVSight Backend" cmd /k "cd backend && uv run uvicorn main:app --reload"

:: Start Frontend in a new window
echo Starting Frontend (Vite)...
start "CVSight Frontend" cmd /k "cd frontend && npm run dev"

echo Done! The services are starting in separate windows.
