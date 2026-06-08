@echo off
chcp 65001 >nul
REM =========================================================================
REM  Garden State Coon — Изменить текст на сайте (Windows)
REM
REM  КАК ПОЛЬЗОВАТЬСЯ:
REM    Просто дважды кликните по этому файлу (edit-text.bat).
REM    Дальше отвечайте на вопросы:
REM      1) выберите страницу (по номеру),
REM      2) вставьте кусочек старого текста,
REM      3) введите новый текст,
REM      4) подтвердите — и изменение само уедет на сайт.
REM
REM  Ничего настраивать не нужно — путь к репозиторию определяется
REM  автоматически (этот файл лежит в корне репозитория).
REM =========================================================================

setlocal
set "REPO=%~dp0"
set "SCRIPT=%REPO%scripts\edit-text.js"

if not exist "%SCRIPT%" (
  echo [ОШИБКА] Не найден scripts\edit-text.js рядом с этим файлом.
  echo Этот .bat должен лежать в корне репозитория Gardencoon.
  pause
  exit /b 1
)

pushd "%REPO%"
node "%SCRIPT%"
set EXITCODE=%ERRORLEVEL%
popd

echo.
if %EXITCODE%==0 (
  echo [ГОТОВО] Если были изменения — сайт обновится через ~1 минуту.
) else (
  echo [ОШИБКА] Что-то пошло не так. Код: %EXITCODE%
)
pause
endlocal
