@echo off

REM ==== API ====
cd WebAPISalo
docker build -t salo-api .
docker tag salo-api:latest novakvova/salo-api:latest
docker push novakvova/salo-api:latest

echo DONE
pause
