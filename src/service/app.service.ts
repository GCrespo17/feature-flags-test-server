import { Injectable } from '@nestjs/common';
import { DataRepository } from '../repository/data.repository';

@Injectable()
export class AppService {
  constructor(private readonly dataRepository: DataRepository) {}

  getHello(): string {
    return 'Feature Flags Test Server está funcionando!';
  }

  async getAllUsers() {
    const users = await this.dataRepository.findAllUsers();
    return {
      message: 'Lista de usuarios',
      users: users,
      count: users.length
    };
  }

  // Crear usuario nuevo
  async createUser(userData: { username: string; password: string; email: string; role?: string }) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.dataRepository.findUserByUsername(userData.username);
      if (existingUser) {
        return {
          success: false,
          message: 'El usuario ya existe',
          username: userData.username
        };
      }

      // Crear nuevo usuario
      const newUser = await this.dataRepository.createUser({
        username: userData.username,
        password: userData.password, // En producción deberías hashear la contraseña
        email: userData.email,
        role: userData.role || 'user'
      });

      return {
        success: true,
        message: 'Usuario creado exitosamente',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al crear usuario',
        error: error.message
      };
    }
  }

  // Login de usuario
  async login(username: string, password: string) {
    try {
      const user = await this.dataRepository.findUserByUsername(username);
      
      if (!user) {
        return { 
          success: false, 
          message: 'Usuario no encontrado' 
        };
      }

      // Verificar contraseña (en producción usarías bcrypt para comparar hashes)
      if (user.password !== password) {
        return { 
          success: false, 
          message: 'Contraseña incorrecta' 
        };
      }

      return {
        success: true,
        message: 'Login exitoso',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error en el login',
        error: error.message
      };
    }
  }

  async getDataFromExcel() {
    try {
      // Obtener todas las canciones
      const canciones = await this.dataRepository.findAllCanciones();
      
      // Obtener todas las colecciones disponibles
      const collections = await this.dataRepository.getAllCollections();
      
      return {
        message: 'Datos desde Excel importados (requiere feature flag DATA_ACCESS)',
        success: true,
        collectionsAvailable: collections,
        canciones: {
          count: canciones.length,
          data: canciones
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        message: 'Error al obtener datos desde Excel',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}