# --- Build stage ---
FROM node:24-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# --- Production stage ---
FROM node:24-slim AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app
EXPOSE 3000

# Créer un script de démarrage qui initialise la DB puis lance l'app
RUN echo '#!/bin/sh\nset -e\nnode scripts/init-db.js\nexec node src/server.js' > /app/start.sh && \
    chmod +x /app/start.sh

CMD ["/app/start.sh"]
