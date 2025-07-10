FROM node:22-alpine

# Instalar git para poder clonar desde GitHub
RUN apk add --no-cache git

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de manifiesto de dependencias primero para aprovechar el cache de Docker
COPY package.json ./

# Limpiar caché e instalar dependencias
RUN npm cache clean --force && npm install --verbose

# Copiar el resto del código fuente de la aplicación
COPY . .

# Crear un directorio para datos si es necesario
RUN mkdir -p /app/data

# Compilar la aplicación TypeScript
RUN npm run build

# Exponer el puerto en el que la aplicación NestJS escuchará
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "run", "dev"]