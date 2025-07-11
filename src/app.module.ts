import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './controller/app.controller';
import { AppService } from './service/app.service';
import { FeatureFlagService } from 'feature-flags-nestjs-lib/dist/services/feature-flag.service';
import { DataRepository } from './repository/data.repository';

// Importar schemas de MongoDB
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    // Configuración de MongoDB
    MongooseModule.forRoot('mongodb://mongodb:27017/feature-flags-db'),
    
    // Registrar schemas de MongoDB
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
    FeatureFlagService,
    DataRepository,
  ],
})
export class AppModule {
  constructor(private readonly featureFlagService: FeatureFlagService) {
    // Inicializar feature flags por defecto al arrancar la aplicación
    this.initializeFeatureFlags();
  }

  private initializeFeatureFlags() {
    console.log('🚩 Inicializando Feature Flags...');
    
    // Configuración inicial de feature flags con valores fijos
    const initialConfig = {
      DATA_ACCESS: {
        enabled: false, // Por defecto deshabilitado para testing
        environment: ['development', 'staging', 'production'],
        users: ['admin', 'testuser'],
      },
      PREMIUM_FEATURES: {
        enabled: false, // Por defecto deshabilitado
        environment: ['production', 'staging'],
        users: ['admin'],
      },
      USER_MANAGEMENT: {
        enabled: true, // Siempre habilitado para gestión básica
        environment: ['development', 'staging', 'production'],
        users: [],
      },
      EXCEL_IMPORT: {
        enabled: true, // Habilitado por defecto
        environment: ['development', 'staging', 'production'],
        users: [],
      },
    };

    this.featureFlagService.loadConfiguration(initialConfig);
    
    console.log('🚩 Feature flags inicializados:', {
      environment: 'development',
      totalFlags: Object.keys(initialConfig).length,
      flags: Object.keys(initialConfig).map(flag => ({
        name: flag,
        enabled: initialConfig[flag].enabled
      })),
      enabledUsers: ['admin', 'testuser']
    });
  }
}