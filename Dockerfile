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
CMD ["node", "src/server.js"]
