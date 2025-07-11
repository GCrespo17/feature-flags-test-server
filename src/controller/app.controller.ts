import { Controller, Get, Post, Body, Put, HttpStatus, HttpCode, Param, BadRequestException, ForbiddenException } from '@nestjs/common';
import { AppService } from '../service/app.service';
// Importa solo el FeatureFlagService, NO el decorador
import { FeatureFlagService } from 'feature-flags-nestjs-lib';
import { FeatureFlagContext } from 'feature-flags-nestjs-lib/dist/interface/feature-flag.interface';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // Inyecta el FeatureFlagService de tu librería
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // ==================== ENDPOINTS DE USUARIOS ====================
  
  @Get('users')
  async getUsers() {
    return this.appService.getAllUsers();
  }

  @Post('users')
  async createUser(@Body() userData: { 
    username: string; 
    password: string; 
    email: string; 
    role?: string 
  }) {
    // Validaciones básicas
    if (!userData.username || !userData.password || !userData.email) {
      throw new BadRequestException('Username, password y email son requeridos');
    }

    return this.appService.createUser(userData);
  }

  @Post('auth/login')
  async login(@Body() loginData: { username: string; password: string }) {
    if (!loginData.username || !loginData.password) {
      throw new BadRequestException('Username y password son requeridos');
    }
    
    return this.appService.login(loginData.username, loginData.password);
  }

  // ==================== ENDPOINTS DE DATOS (VERIFICACIÓN MANUAL) ====================
  
  @Get('data')
  async getData(@Body() body?: { context?: FeatureFlagContext }) {
    // VERIFICACIÓN MANUAL del feature flag
    const isEnabled = this.featureFlagService.isFeatureEnabled('DATA_ACCESS', body?.context);
    
    if (!isEnabled) {
      throw new ForbiddenException({
        success: false,
        message: 'Feature flag DATA_ACCESS está deshabilitado',
        flagStatus: 'disabled',
        timestamp: new Date().toISOString()
      });
    }

    // Si llegamos aquí, el feature flag está habilitado
    return this.appService.getDataFromExcel();
  }

  @Get('premium')
  async getPremiumData(@Body() body?: { context?: FeatureFlagContext }) {
    // VERIFICACIÓN MANUAL del feature flag
    const isEnabled = this.featureFlagService.isFeatureEnabled('PREMIUM_FEATURES', body?.context);
    
    if (!isEnabled) {
      throw new ForbiddenException({
        success: false,
        message: 'Feature flag PREMIUM_FEATURES está deshabilitado',
        flagStatus: 'disabled',
        timestamp: new Date().toISOString()
      });
    }

    return {
      message: 'Esta es una funcionalidad premium (requiere feature flag PREMIUM_FEATURES)',
      accessGranted: true,
      data: 'Datos premium exclusivos',
      timestamp: new Date().toISOString()
    };
  }

  // ==================== ENDPOINTS DE GESTIÓN DE FEATURE FLAGS ====================

  // Endpoint específico para activar el feature flag de acceso a datos
  @Put('feature-flags/data-access/enable')
  @HttpCode(HttpStatus.OK)
  async enableDataAccess(@Body() body: { 
    environment?: string | string[]; 
    users?: string[]; 
    context?: FeatureFlagContext 
  }) {
    const flagConfig = {
      enabled: true,
      environment: body.environment 
        ? (Array.isArray(body.environment) ? body.environment : [body.environment])
        : undefined,
      users: body.users || undefined,
    };

    this.featureFlagService.updateFlag('DATA_ACCESS', flagConfig);
    
    return {
      message: 'Feature flag DATA_ACCESS activado con éxito',
      flagName: 'DATA_ACCESS',
      status: 'enabled',
      currentConfig: this.featureFlagService.getFlagConfig('DATA_ACCESS'),
      timestamp: new Date().toISOString()
    };
  }

  // Endpoint específico para desactivar el feature flag de acceso a datos
  @Put('feature-flags/data-access/disable')
  @HttpCode(HttpStatus.OK)
  async disableDataAccess(@Body() body: { 
    environment?: string | string[]; 
    users?: string[]; 
    context?: FeatureFlagContext 
  }) {
    const flagConfig = {
      enabled: false,
      environment: body.environment 
        ? (Array.isArray(body.environment) ? body.environment : [body.environment])
        : undefined,
      users: body.users || undefined,
    };

    this.featureFlagService.updateFlag('DATA_ACCESS', flagConfig);
    
    return {
      message: 'Feature flag DATA_ACCESS desactivado con éxito',
      flagName: 'DATA_ACCESS',
      status: 'disabled',
      currentConfig: this.featureFlagService.getFlagConfig('DATA_ACCESS'),
      timestamp: new Date().toISOString()
    };
  }

  // Endpoint genérico para habilitar cualquier feature flag
  @Put('feature-flags/enable/:flagName')
  @HttpCode(HttpStatus.OK)
  async enableFeatureFlag(
    @Param('flagName') flagName: string,
    @Body() body: { 
      environment?: string | string[]; 
      users?: string[]; 
      context?: FeatureFlagContext 
    }
  ) {
    const flagConfig = {
      enabled: true,
      environment: body.environment 
        ? (Array.isArray(body.environment) ? body.environment : [body.environment])
        : undefined,
      users: body.users || undefined,
    };

    this.featureFlagService.updateFlag(flagName, flagConfig);
    
    return {
      message: `Feature flag '${flagName}' activado con éxito`,
      flagName: flagName,
      status: 'enabled',
      currentConfig: this.featureFlagService.getFlagConfig(flagName),
      timestamp: new Date().toISOString()
    };
  }

  // Endpoint genérico para deshabilitar cualquier feature flag
  @Put('feature-flags/disable/:flagName')
  @HttpCode(HttpStatus.OK)
  async disableFeatureFlag(
    @Param('flagName') flagName: string,
    @Body() body: { 
      environment?: string | string[]; 
      users?: string[]; 
      context?: FeatureFlagContext 
    }
  ) {
    const flagConfig = {
      enabled: false,
      environment: body.environment 
        ? (Array.isArray(body.environment) ? body.environment : [body.environment])
        : undefined,
      users: body.users || undefined,
    };

    this.featureFlagService.updateFlag(flagName, flagConfig);
    
    return {
      message: `Feature flag '${flagName}' desactivado con éxito`,
      flagName: flagName,
      status: 'disabled',
      currentConfig: this.featureFlagService.getFlagConfig(flagName),
      timestamp: new Date().toISOString()
    };
  }

  // Endpoint para obtener el estado de un feature flag específico
  @Get('feature-flags/status/:flagName')
  @HttpCode(HttpStatus.OK)
  getFeatureFlagStatus(
    @Param('flagName') flagName: string,
    @Body() body?: { context?: FeatureFlagContext }
  ) {
    const isEnabled = this.featureFlagService.isFeatureEnabled(flagName, body?.context);
    const config = this.featureFlagService.getFlagConfig(flagName);
    
    return {
      flagName: flagName,
      isEnabled: isEnabled,
      config: config || 'Flag no configurado',
      context: body?.context || {},
      timestamp: new Date().toISOString()
    };
  }

  // Endpoint para obtener el estado específico del feature flag DATA_ACCESS
  @Get('feature-flags/data-access/status')
  @HttpCode(HttpStatus.OK)
  getDataAccessStatus(@Body() body?: { context?: FeatureFlagContext }) {
    const isEnabled = this.featureFlagService.isFeatureEnabled('DATA_ACCESS', body?.context);
    const config = this.featureFlagService.getFlagConfig('DATA_ACCESS');
    
    return {
      flagName: 'DATA_ACCESS',
      isEnabled: isEnabled,
      config: config || 'Flag no configurado',
      context: body?.context || {},
      message: isEnabled ? 'Acceso a datos habilitado' : 'Acceso a datos deshabilitado',
      timestamp: new Date().toISOString()
    };
  }

  // Endpoint para obtener todas las feature flags
  @Get('feature-flags/all')
  @HttpCode(HttpStatus.OK)
  getAllFeatureFlags() {
    const configuration = this.featureFlagService.getConfiguration();
    const flagNames = this.featureFlagService.getAllFlagNames();
    
    return {
      message: 'Configuración completa de feature flags',
      totalFlags: flagNames.length,
      flagNames: flagNames,
      configuration: configuration,
      timestamp: new Date().toISOString()
    };
  }

  // ==================== ENDPOINTS DE TESTING ====================

  // Endpoint para probar si el acceso a datos funciona
  @Get('test/data-access')
  async testDataAccess(@Body() body?: { context?: FeatureFlagContext }) {
    const isEnabled = this.featureFlagService.isFeatureEnabled('DATA_ACCESS', body?.context);
    
    if (!isEnabled) {
      return {
        message: 'Feature flag DATA_ACCESS está deshabilitado',
        hasAccess: false,
        flagStatus: 'disabled',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const data = await this.appService.getDataFromExcel();
      return {
        message: 'Acceso a datos exitoso',
        hasAccess: true,
        flagStatus: 'enabled',
        dataPreview: {
          songsCount: data.canciones?.count || 0,
          collectionsCount: data.collectionsAvailable?.length || 0
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        message: 'Error al acceder a los datos',
        hasAccess: true,
        flagStatus: 'enabled',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}