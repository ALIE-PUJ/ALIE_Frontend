# Etapa de compilación
FROM oven/bun:latest AS build

# Instala Node.js
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get update && apt-get install -y nodejs

# Copia los archivos de configuracion
COPY package.json ./
COPY bun.lockb ./

# Instala las dependencias
RUN bun install

# Copia el codigo
COPY . .

# Compila el codigo
RUN bun run build

# Etapa de ejecución
FROM oven/bun:latest

# Copia la aplicación compilada
COPY --from=build /home/bun/app/dist ./dist

# Ejecuta la aplicación
CMD ["bun", "run", "dist/alie-frontend/server/server.mjs"]
EXPOSE 4000
