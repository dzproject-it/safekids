FROM node:20-alpine

WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Donner les droits à l'utilisateur non-root
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

# Exécute les migrations puis démarre le serveur
CMD ["sh", "-c", "node migrations/run.js && node index.js"]
