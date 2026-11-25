# Imagen base con Node.js
FROM node:24-alpine

WORKDIR /app

# Dependencias
COPY package*.json ./
RUN npm install --omit=dev

# Certificado de Amazon RDS para cifrar la conexión con la base de datos
ADD https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem ./rds-ca.pem

# Código de la API
COPY server.js ./

EXPOSE 3000

CMD ["node", "server.js"]