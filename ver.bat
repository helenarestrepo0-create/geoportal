@echo off
title Preview geoportal
cd /d "%~dp0"

echo.
echo   PREVIEW DEL GEOPORTAL
echo   ---------------------
echo.

REM --- buscar un Python que sirva ---
set PY=

REM 1) Python de QGIS (OSGeo4W) - el que ya sabemos que funciona
for /d %%D in ("C:\Program Files\QGIS*") do (
    if exist "%%D\bin\python.exe" set "PY=%%D\bin\python.exe"
)

REM 2) OSGeo4W suelto
if not defined PY if exist "C:\OSGeo4W\bin\python.exe" set "PY=C:\OSGeo4W\bin\python.exe"
if not defined PY if exist "C:\OSGeo4W64\bin\python.exe" set "PY=C:\OSGeo4W64\bin\python.exe"

REM 3) Python del sistema (py launcher)
if not defined PY (
    py -3 --version >nul 2>&1
    if not errorlevel 1 set "PY=py -3"
)

if not defined PY (
    echo   ERROR: no se encontro Python.
    echo.
    echo   Abre OSGeo4W Shell, ve a esta carpeta y corre:
    echo       python -m http.server 8000
    echo.
    pause
    exit /b 1
)

echo   Python: %PY%
echo   Sirviendo: %CD%
echo.
echo   Abriendo http://localhost:8000
echo   Cierra esta ventana para detener el servidor.
echo.

start "" http://localhost:8000
"%PY%" -m http.server 8000

echo.
echo   El servidor se detuvo.
pause
