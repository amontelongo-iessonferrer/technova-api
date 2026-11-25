#!/bin/bash
# Script de despliegue de technova-api
set -e

FICHERO_ENV="$HOME/technova.env"

if [ ! -f "$FICHERO_ENV" ]; then
    echo "ERROR: falta el archivo $FICHERO_ENV con los datos de la base de datos"
    exit 1
fi

echo "==> Construyendo la imagen..."
docker build -t technova-api .

echo "==> Eliminando los contenedores anteriores..."
docker rm -f technova-api1 technova-api2 2>/dev/null || true

echo "==> Arrancando los contenedores..."
docker run -d --name technova-api1 --restart unless-stopped \
    --env-file "$FICHERO_ENV" -e "NOMBRE_SERVIDOR=Servidor 1" \
    -p 127.0.0.1:5000:3000 technova-api

docker run -d --name technova-api2 --restart unless-stopped \
    --env-file "$FICHERO_ENV" -e "NOMBRE_SERVIDOR=Servidor 2" \
    -p 127.0.0.1:5001:3000 technova-api

echo "==> Publicando el frontend..."
sudo mkdir -p /var/www/technova
sudo cp -r public/* /var/www/technova/

echo "==> Despliegue completado"
docker ps