FROM node:22-alpine

WORKDIR /app

# Copier les fichiers package pour installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier tout le code source
COPY . .

# Récupérer l'URL de l'API depuis les build args
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Builder l'application React
RUN npm run build

# Exposer le port (Vite preview utilise 4173 par défaut)
EXPOSE 4173

# Servir l'application buildée
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]