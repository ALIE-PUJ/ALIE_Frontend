# Etapa de compilación
FROM oven/bun:latest AS build

# Copia los archivos de configuracion
COPY package.json ./
COPY bun.lockb ./

# Instala las dependencias
RUN bun install

# Copia el codigo
COPY . .

CMD [ "tail", "-f", "/dev/null" ]

# Compila el codigo
# RUN bun run build

# # Etapa de ejecución
# FROM oven/bun:latest

# # Copia la aplicación compilada
# COPY --from=build ./dist ./dist

# # Ejecuta la aplicación
# CMD ["bun", "run", "server/server.mjs"]
# EXPOSE 4200
