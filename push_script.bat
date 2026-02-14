@echo off
echo ==========================================
echo       AUTO-PUSH SCRIPT
echo ==========================================
echo.
echo Checking git status...
git status
echo.
echo Adding all changes...
git add .
echo.
echo Committing changes...
git commit -m "Actualizacion completa del proyecto"
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo ==========================================
echo       DONE
echo ==========================================
pause
