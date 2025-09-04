@echo off
setlocal enabledelayedexpansion
echo 🚀 Desplegando cambios...

REM Agregar todos los archivos
git add .

REM Obtener información de cambios
echo 📊 Analizando cambios...

REM Obtener archivos modificados
for /f "delims=" %%i in ('git diff --name-only --cached 2^>nul') do (
    if not defined modified_files (
        set "modified_files=%%i"
    ) else (
        set "modified_files=!modified_files!, %%i"
    )
)

REM Si no hay archivos en staging, obtener archivos modificados sin staging
if not defined modified_files (
    for /f "delims=" %%i in ('git diff --name-only 2^>nul') do (
        if not defined modified_files (
            set "modified_files=%%i"
        ) else (
            set "modified_files=!modified_files!, %%i"
        )
    )
)

REM Obtener estadísticas de cambios
for /f "tokens=1" %%i in ('git diff --stat --cached 2^>nul ^| find "file" 2^>nul') do set files_changed=%%i
for /f "tokens=1" %%i in ('git diff --stat --cached 2^>nul ^| find "insertion" 2^>nul') do set insertions=%%i
for /f "tokens=1" %%i in ('git diff --stat --cached 2^>nul ^| find "deletion" 2^>nul') do set deletions=%%i

REM Si no hay cambios en staging, usar working directory
if not defined files_changed (
    for /f "tokens=1" %%i in ('git diff --stat 2^>nul ^| find "file" 2^>nul') do set files_changed=%%i
    for /f "tokens=1" %%i in ('git diff --stat 2^>nul ^| find "insertion" 2^>nul') do set insertions=%%i
    for /f "tokens=1" %%i in ('git diff --stat 2^>nul ^| find "deletion" 2^>nul') do set deletions=%%i
)

REM Crear mensaje de commit descriptivo
for /f "tokens=1-4 delims=/ " %%i in ('date /t') do set mydate=%%i-%%j-%%k
for /f "tokens=1-2 delims=: " %%i in ('time /t') do set mytime=%%i:%%j

REM Determinar tipo de cambio principal
set "change_type=feat"
if defined modified_files (
    echo !modified_files! | findstr /i "fix bug error" >nul && set "change_type=fix"
    echo !modified_files! | findstr /i "doc readme" >nul && set "change_type=docs"
    echo !modified_files! | findstr /i "style css" >nul && set "change_type=style"
    echo !modified_files! | findstr /i "test spec" >nul && set "change_type=test"
    echo !modified_files! | findstr /i "config package json" >nul && set "change_type=config"
)

REM Construir mensaje descriptivo
if defined modified_files (
    set "commit_msg=%change_type%: Updated !modified_files!"
    if defined files_changed (
        set "commit_msg=!commit_msg! (!files_changed! files"
        if defined insertions set "commit_msg=!commit_msg!, +!insertions!"
        if defined deletions set "commit_msg=!commit_msg!, -!deletions!"
        set "commit_msg=!commit_msg!)"
    )
) else (
    set "commit_msg=chore: Auto-deploy %mydate% %mytime% - General updates"
)

REM Hacer commit
echo 💬 Commit: %commit_msg%
git commit -m "%commit_msg%"

REM Push a origin
echo 📤 Enviando a origin...
git push origin

if %errorlevel% equ 0 (
    echo ✅ Despliegue exitoso!
) else (
    echo ❌ Error en el despliegue
)

echo 🏁 Terminado.
pause