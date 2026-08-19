@echo off
echo Starting Spring Boot Japanese Learning App Backend...
cd %~dp0
if exist mvnw.cmd (
    call mvnw.cmd spring-boot:run
) else (
    mvn spring-boot:run
)
pause
