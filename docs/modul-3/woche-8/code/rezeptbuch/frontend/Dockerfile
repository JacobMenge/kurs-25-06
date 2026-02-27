# stage 1: react app bauen
FROM node:20-alpine AS build
WORKDIR /app

# erst package.json kopieren damit npm install gecacht wird
COPY package*.json .
RUN npm install

# restliche dateien kopieren und production build erstellen
COPY . .
RUN npm run build
# ergebnis liegt jetzt in /app/dist

# stage 2: nur die fertigen dateien in ein kleines nginx image kopieren
# alles aus stage 1 (node und node_modules) wird verworfen
FROM nginx:alpine

# build ergebnis aus stage 1 holen
COPY --from=build /app/dist /usr/share/nginx/html

# eigene nginx config mit reverse proxy fuer /api/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
