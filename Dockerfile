# Usa una imagen base de Node.js ligera y reciente
FROM node:22-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de manifiesto de dependencias primero para aprovechar el cache de Docker
# Esto asegura que las dependencias solo se reinstalen si package.json o package-lock.json cambian
COPY package.json ./

# 'npm ci' requiere este archivo para instalaciones determinísticas.
COPY package-lock.json ./

# Limpiar el caché de npm antes de instalar para evitar problemas de caché corruptos
# Luego, instalar las dependencias de forma limpia y confiable
RUN npm cache clean --force && npm ci

# Copiar el resto del código fuente de la aplicación
COPY . .

# Crear un directorio para datos si es necesario (ajusta según tu aplicación)
RUN mkdir -p /app/data

# Compilar la aplicación TypeScript
RUN npm run build

# Exponer el puerto en el que la aplicación NestJS escuchará
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "run", "dev"]
