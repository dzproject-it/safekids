# ── Étape 1 : Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# En Docker, l'API est proxifiée par nginx → chaîne vide = URLs relatives /api/...
ENV VITE_API_URL=
ARG VITE_STRIPE_PUBLIC_KEY=
ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY
RUN npm run build

# ── Étape 2 : Serve avec Nginx ────────────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
