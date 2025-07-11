import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remover propiedades no definidas en DTOs
      forbidNonWhitelisted: true, // Lanzar error si hay propiedades extra
      transform: true, // Transformar automáticamente los tipos
    }),
  );

  // Configurar CORS para desarrollo
  app.enableCors({
    origin: '*', // Permitir todos los orígenes
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Puerto fijo
  const port = 3000;
  
  await app.listen(port, '0.0.0.0'); // Escuchar en todas las interfaces para Docker
  
  console.log("Servidor Iniciado, Feature Flags Test corriendo correctamente")
  
  // Log de configuración del sistema
  console.log('🔧 Configuración del sistema:', {
    port: port,
    environment: 'development',
    mongoUri: 'mongodb://mongodb:27017/feature-flags-db',
    corsOrigin: '*',
    dataAccessEnabled: false,
    premiumFeaturesEnabled: false,
    enabledUsers: ['admin', 'testuser'],
  });

  // Log de endpoints disponibles
  console.log('📍 Endpoints principales:');
  console.log('   GET    /                                    - Health check');
  console.log('   GET    /users                               - Listar usuarios');
  console.log('   POST   /users                               - Crear usuario');
  console.log('   POST   /auth/login                          - Login');
  console.log('   GET    /data                                - Datos (requiere DATA_ACCESS)');
  console.log('   GET    /premium                             - Premium (requiere PREMIUM_FEATURES)');
  console.log('   PUT    /feature-flags/data-access/enable    - Activar acceso a datos');
  console.log('   PUT    /feature-flags/data-access/disable   - Desactivar acceso a datos');
  console.log('   GET    /feature-flags/all                   - Ver todas las feature flags');
  console.log('');
}

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception thrown:', error);
  process.exit(1);
});

// Manejar cierre elegante
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

bootstrap().catch((error) => {
  console.error('❌ Error al iniciar la aplicación:', error);
  process.exit(1);
});