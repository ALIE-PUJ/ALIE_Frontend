# Etapa base
FROM node:latest AS base

# Crea el directorio de la aplicación
WORKDIR /usr/src/app

# Etapa de compilación
FROM base AS build

# Copia el codigo
COPY . .

# Instala las dependencias
RUN npm install

# Compila el codigo
RUN npm run build

# Etapa de ejecución
FROM base AS production

# Copia la aplicación compilada
COPY --from=build /usr/src/app/dist/alie-frontend/ .

# Ejecuta la aplicación
CMD ["node", "server/server.mjs"]
EXPOSE 4000
