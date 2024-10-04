# Etapa de compilación
FROM node:latest AS build

# Crea el directorio de la aplicación
WORKDIR /usr/src/app

# Copia el codigo
COPY . .

# Instala las dependencias
RUN npm install

# Compila el codigo
RUN npm run build

# Etapa de ejecución
FROM node:latest

# Copia la aplicación compilada
COPY --from=build /usr/src/app/dist/alie-frontend/server .

# Ejecuta la aplicación
CMD ["node", "server/server.mjs"]
EXPOSE 4000
