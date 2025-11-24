FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copie le reste pour le build initial (sera surchargé par le volume en dev)
COPY . .

# Vite utilise le port 5173 par défaut
EXPOSE 5173

# La commande correspond à ton "scripts": { "dev": "vite" } dans package.json
CMD ["npm", "run", "dev"]