import { AppService } from './app.service';
import { DataRepository } from '../repository/data.repository';

// Mock del DataRepository. Usamos jest.fn() para simular los métodos y controlar su comportamiento.
const mockDataRepository = {
  findAllUsers: jest.fn(),
  findUserByUsername: jest.fn(),
  createUser: jest.fn(),
  findAllCanciones: jest.fn(),
  getAllCollections: jest.fn(),
  // Si DataRepository tuviera 'findUserByUsernameAndPassword', se añadiría aquí también si AppService lo usara
  findUserByUsernameAndPassword: jest.fn(),
};

describe('AppService', () => {
  let service: AppService; // Instancia del servicio que vamos a probar

  beforeEach(() => {
    // Instanciamos AppService directamente, pasando el mock del repositorio.
    // Usamos 'as any' porque el mock no implementa completamente la interfaz de DataRepository,
    // lo cual es aceptable para pruebas unitarias donde solo nos interesa simular los métodos usados.
    service = new AppService(mockDataRepository as any);

    // Limpiar mocks antes de cada test para asegurar que los resultados de un test no afecten a otro.
    jest.clearAllMocks();
  });

  describe('getHello', () => {
    it('debería retornar el mensaje de bienvenida', () => {
      const result = service.getHello();
      expect(result).toBe('Feature Flags Test Server está funcionando!');
    });
  });

  describe('getAllUsers', () => {
    it('debería retornar lista de usuarios cuando existen usuarios', async () => {
      const mockUsers = [
        { id: '1', username: 'test1', email: 'test1@test.com', role: 'user' },
        { id: '2', username: 'test2', email: 'test2@test.com', role: 'admin' },
      ];

      // Configuramos el mock para que devuelva los usuarios simulados
      mockDataRepository.findAllUsers.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers();

      // Verificamos que el resultado sea el esperado
      expect(result).toEqual({
        message: 'Lista de usuarios',
        users: mockUsers,
        count: 2,
      });
      // Aseguramos que el método findAllUsers del repositorio fue llamado exactamente una vez
      expect(mockDataRepository.findAllUsers).toHaveBeenCalledTimes(1);
    });

    it('debería retornar lista vacía cuando no hay usuarios', async () => {
      // Configuramos el mock para que devuelva un array vacío
      mockDataRepository.findAllUsers.mockResolvedValue([]);

      const result = await service.getAllUsers();

      // Verificamos que el resultado contenga un array vacío y un conteo de 0
      expect(result).toEqual({
        message: 'Lista de usuarios',
        users: [],
        count: 0,
      });
      expect(mockDataRepository.findAllUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('createUser', () => {
    const newUserData = {
      username: 'newuser',
      password: 'password123',
      email: 'newuser@test.com',
      role: 'user',
    };

    it('debería crear un usuario exitosamente', async () => {
      const mockCreatedUser = {
        id: '123',
        username: 'newuser',
        email: 'newuser@test.com',
        role: 'user',
      };

      // Simula que el usuario no existe y que la creación es exitosa
      mockDataRepository.findUserByUsername.mockResolvedValue(null);
      mockDataRepository.createUser.mockResolvedValue(mockCreatedUser);

      const result = await service.createUser(newUserData);

      // Verificamos el resultado del servicio
      expect(result).toEqual({
        success: true,
        message: 'Usuario creado exitosamente',
        user: {
          id: '123',
          username: 'newuser',
          email: 'newuser@test.com',
          role: 'user',
        },
      });
      // Verificamos que los métodos del repositorio fueron llamados con los argumentos correctos
      expect(mockDataRepository.findUserByUsername).toHaveBeenCalledWith('newuser');
      expect(mockDataRepository.createUser).toHaveBeenCalledWith(newUserData);
    });

    it('debería fallar si el usuario ya existe', async () => {
      const existingUser = { username: 'newuser' };
      // Simula que findUserByUsername encuentra un usuario existente
      mockDataRepository.findUserByUsername.mockResolvedValue(existingUser);

      const result = await service.createUser(newUserData);

      // Verificamos el mensaje de error para usuario existente
      expect(result).toEqual({
        success: false,
        message: 'El usuario ya existe',
        username: 'newuser',
      });
      // Aseguramos que createUser no fue llamado si el usuario ya existe
      expect(mockDataRepository.createUser).not.toHaveBeenCalled();
    });

    it('debería usar role por defecto "user" si no se proporciona', async () => {
      const userDataWithoutRole = {
        username: 'user_no_role',
        password: 'password123',
        email: 'user_no_role@test.com',
      };

      const mockCreatedUser = {
        id: '124',
        username: 'user_no_role',
        email: 'user_no_role@test.com',
        role: 'user',
      };

      mockDataRepository.findUserByUsername.mockResolvedValue(null);
      mockDataRepository.createUser.mockResolvedValue(mockCreatedUser);

      await service.createUser(userDataWithoutRole);

      // Verificamos que createUser fue llamado con el rol por defecto 'user'
      expect(mockDataRepository.createUser).toHaveBeenCalledWith({
        ...userDataWithoutRole,
        role: 'user',
      });
    });

    it('debería manejar errores de la base de datos al crear usuario', async () => {
      // Simula que findUserByUsername no encuentra el usuario, pero createUser falla
      mockDataRepository.findUserByUsername.mockResolvedValue(null);
      mockDataRepository.createUser.mockRejectedValue(new Error('Database error'));

      const result = await service.createUser(newUserData);

      // Verificamos que el resultado contenga el mensaje de error de la base de datos
      expect(result).toEqual({
        success: false,
        message: 'Error al crear usuario',
        error: 'Database error',
      });
      expect(mockDataRepository.findUserByUsername).toHaveBeenCalledWith(newUserData.username);
      expect(mockDataRepository.createUser).toHaveBeenCalledWith(newUserData);
    });
  });

  describe('login', () => {
    const loginData = {
      username: 'testuser',
      password: 'correctpassword',
    };

    it('debería hacer login exitoso con credenciales correctas', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        password: 'correctpassword', // En una app real, aquí compararías hashes
        email: 'test@test.com',
        role: 'user',
      };

      // Simula que el usuario es encontrado
      mockDataRepository.findUserByUsername.mockResolvedValue(mockUser);

      const result = await service.login(loginData.username, loginData.password);

      // Verificamos el éxito del login y los datos del usuario retornado
      expect(result).toEqual({
        success: true,
        message: 'Login exitoso',
        user: {
          id: '123',
          username: 'testuser',
          email: 'test@test.com',
          role: 'user',
        },
      });
      expect(mockDataRepository.findUserByUsername).toHaveBeenCalledWith(loginData.username);
    });

    it('debería fallar si el usuario no existe', async () => {
      // Simula que el usuario no es encontrado
      mockDataRepository.findUserByUsername.mockResolvedValue(null);

      const result = await service.login(loginData.username, loginData.password);

      // Verificamos el mensaje de "Usuario no encontrado"
      expect(result).toEqual({
        success: false,
        message: 'Usuario no encontrado',
      });
      expect(mockDataRepository.findUserByUsername).toHaveBeenCalledWith(loginData.username);
    });

    it('debería fallar si la contraseña es incorrecta', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        password: 'correctpassword',
        email: 'test@test.com',
        role: 'user',
      };

      // Simula que el usuario es encontrado, pero la contraseña no coincide
      mockDataRepository.findUserByUsername.mockResolvedValue(mockUser);

      const result = await service.login(loginData.username, 'wrongpassword');

      // Verificamos el mensaje de "Contraseña incorrecta"
      expect(result).toEqual({
        success: false,
        message: 'Contraseña incorrecta',
      });
      expect(mockDataRepository.findUserByUsername).toHaveBeenCalledWith(loginData.username);
    });

    it('debería manejar errores de la base de datos al iniciar sesión', async () => {
      // Simula un error en la búsqueda del usuario en el repositorio
      mockDataRepository.findUserByUsername.mockRejectedValue(new Error('Database connection failed'));

      const result = await service.login(loginData.username, loginData.password);

      // Verificamos el mensaje de error general de login
      expect(result).toEqual({
        success: false,
        message: 'Error en el login',
        error: 'Database connection failed',
      });
      expect(mockDataRepository.findUserByUsername).toHaveBeenCalledWith(loginData.username);
    });
  });

  describe('getDataFromExcel', () => {
    it('debería retornar datos de canciones y colecciones exitosamente', async () => {
      const mockCanciones = [
        { Nombre: 'Canción 1', Artista: 'Artista 1' },
        { Nombre: 'Canción 2', Artista: 'Artista 2' },
      ];
      const mockCollections = ['canciones', 'users'];

      // Configuramos los mocks para que devuelvan datos exitosamente
      mockDataRepository.findAllCanciones.mockResolvedValue(mockCanciones);
      mockDataRepository.getAllCollections.mockResolvedValue(mockCollections);

      const result = await service.getDataFromExcel();

      // Verificamos que el resultado sea exitoso y contenga los datos esperados
      expect(result.success).toBe(true);
      expect(result.message).toBe('Datos desde Excel importados (requiere feature flag DATA_ACCESS)');
      expect(result.collectionsAvailable).toEqual(mockCollections);
      // Usamos el operador de encadenamiento opcional (?) ya que 'canciones' es opcional en caso de error
      expect(result.canciones?.count).toBe(2);
      expect(result.canciones?.data).toEqual(mockCanciones);
      expect(result.timestamp).toBeDefined(); // Verifica que el timestamp exista
      expect(mockDataRepository.findAllCanciones).toHaveBeenCalledTimes(1);
      expect(mockDataRepository.getAllCollections).toHaveBeenCalledTimes(1);
    });

    it('debería manejar errores al obtener datos de Excel', async () => {
      // Simula un fallo al obtener las canciones
      mockDataRepository.findAllCanciones.mockRejectedValue(new Error('Database connection failed'));

      const result = await service.getDataFromExcel();

      // Verificamos que el resultado indique fallo y contenga el mensaje de error
      expect(result.message).toBe('Error al obtener datos desde Excel');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(result.timestamp).toEqual(expect.any(String)); // Verifica que el timestamp exista y sea un string
      // Aseguramos que las propiedades 'canciones' y 'collectionsAvailable' no estén presentes en caso de error
      expect(result).not.toHaveProperty('canciones');
      expect(result).not.toHaveProperty('collectionsAvailable');
    });

    it('debería retornar datos vacíos si no hay canciones disponibles', async () => {
      // Simula que no hay canciones, pero las colecciones se obtienen
      mockDataRepository.findAllCanciones.mockResolvedValue([]);
      mockDataRepository.getAllCollections.mockResolvedValue(['users']);

      const result = await service.getDataFromExcel();

      // Verificamos que el resultado sea exitoso pero con canciones vacías
      expect(result.success).toBe(true);
      expect(result.message).toBe('Datos desde Excel importados (requiere feature flag DATA_ACCESS)');
      expect(result.collectionsAvailable).toEqual(['users']);
      expect(result.canciones?.count).toBe(0);
      expect(result.canciones?.data).toEqual([]);
      expect(result.timestamp).toEqual(expect.any(String));
    });
  });
});