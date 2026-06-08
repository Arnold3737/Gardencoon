@echo off
chcp 65001 >nul
REM =========================================================================
REM  Garden State Coon — Добавить котёнка (Windows)
REM
REM  КАК ПОЛЬЗОВАТЬСЯ (два способа):
REM
REM  Способ A (самый простой) — перетаскивание:
REM    Перетащите папку с фотографиями котёнка прямо на этот файл
REM    (add-kitten.bat) мышкой. Скрипт сам задаст вопросы и опубликует.
REM
REM  Способ B — двойной клик:
REM    Дважды кликните по этому файлу. Скрипт попросит указать путь
REM    к папке с фотографиями (можно перетащить папку в окно).
REM
REM  Ничего настраивать не нужно — путь к репозиторию определяется
REM  автоматически (этот файл лежит в корне репозитория).
REM =========================================================================

setlocal
set "REPO=%~dp0"
set "SCRIPT=%REPO%scripts\add-kitten.js"

if not exist "%SCRIPT%" (
  echo [ОШИБКА] Не найден scripts\add-kitten.js рядом с этим файлом.
  echo Этот .bat должен лежать в корне репозитория garden-state-coon.
  pause
  exit /b 1
)

REM Папка котёнка: либо перетащена на .bat (%~1), либо спросим
set "KITTEN=%~1"
if "%KITTEN%"=="" (
  echo.
  echo Перетащите сюда папку с фотографиями котёнка и нажмите Enter
  echo (или вставьте путь к папке^):
  set /p KITTEN=^> 
)

REM Убираем кавычки, если есть
set "KITTEN=%KITTEN:"=%"

if "%KITTEN%"=="" (
  echo [ОШИБКА] Папка не указана.
  pause
  exit /b 1
)
if not exist "%KITTEN%" (
  echo [ОШИБКА] Папка не найдена: %KITTEN%
  pause
  exit /b 1
)

pushd "%REPO%"
node "%SCRIPT%" "%KITTEN%"
set EXITCODE=%ERRORLEVEL%
popd

echo.
if %EXITCODE%==0 (
  echo [УСПЕХ] Карточка опубликована. Сайт обновится через ~1 минуту.
) else (
  echo [ОШИБКА] Что-то пошло не так. Код: %EXITCODE%
)
pause
endlocal
