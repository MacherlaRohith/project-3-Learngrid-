@echo off
@setlocal

set MAVEN_PROJECTBASEDIR=%~dp0
if "%MAVEN_PROJECTBASEDIR:~-1%"=="\" set MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%

set MAVEN_HOME=%MAVEN_PROJECTBASEDIR%\.mvn\apache-maven-3.9.9
set PATH=%MAVEN_HOME%\bin;%PATH%

call mvn %*

@endlocal
