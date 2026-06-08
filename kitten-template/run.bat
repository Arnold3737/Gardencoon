@echo off
REM =========================================================================
REM  Garden State Coon — Add Kitten Launcher (Windows)
REM
REM  КАК ПОЛЬЗОВАТЬСЯ:
REM  1. Скопируй эту папку (kitten-template) рядом с фотографиями нового котёнка
REM     ИЛИ положи run.bat + kitten.json в папку с фото.
REM  2. Ниже укажи полный путь к папке репозитория garden-state-coon на своём ПК.
REM  3. Отредактируй kitten.json (имя, пол, окрас, дата, цена и т.д.).
REM  4. Двойной клик по run.bat — скрипт обработает фото, создаст карточку
REM     и опубликует изменения на GitHub (сайт обновится через ~1 минуту).
REM =========================================================================

REM >>> ОТРЕДАКТИРУЙ ЭТУ СТРОКУ — укажи путь к репозиторию garden-state-coon <<<
set "REPO=C:\Users\%USERNAME%\garden-state-coon"

REM ─── не меняй ниже ──────────────────────────────────────────────────────
if not exist "%REPO%\scripts\add-kitten.js" (
  echo [ОШИБКА] Скрипт не найден: %REPO%\scripts\add-kitten.js
  echo Проверь переменную REPO в этом файле.
  pause
  exit /b 1
)

pushd "%REPO%"
node "%REPO%\scripts\add-kitten.js" "%~dp0"
set EXITCODE=%ERRORLEVEL%
popd

echo.
if %EXITCODE%==0 (
  echo [УСПЕХ] Карточка опубликована. Сайт обновится через ~1 минуту.
) else (
  echo [ОШИБКА] Что-то пошло не так. Код: %EXITCODE%
)
pause
