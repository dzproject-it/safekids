FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3001

# Exécute les migrations puis démarre le serveur
CMD ["sh", "-c", "node migrations/run.js && node index.js"]
