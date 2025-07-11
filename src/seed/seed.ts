import { connect, connection } from 'mongoose';
import * as XLSX from 'xlsx';
import * as path from 'path';

export class DataSeeder {
  async seedFromExcel() {
    try {
      // Construir URL de MongoDB con autenticación
      const mongoHost = process.env.MONGO_HOST || 'mongodb';
      const mongoPort = process.env.MONGO_PORT || '27017';
      const mongoDatabase = process.env.MONGO_DATABASE || 'feature-flags-db';
      const mongoUsername = process.env.MONGO_USERNAME || 'admin';
      const mongoPassword = process.env.MONGO_PASSWORD || 'password';
      
      const mongoUrl = `mongodb://${mongoUsername}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDatabase}?authSource=admin`;
      
      console.log('🔐 Conectando a MongoDB con autenticación...');
      await connect(mongoUrl);
      console.log('📊 Conectado a MongoDB exitosamente');

      // Leer archivo Excel
      const excelPath = path.join('/app/data', 'data.xlsx');
      console.log(`📖 Leyendo archivo: ${excelPath}`);
      
      const workbook = XLSX.readFile(excelPath);
      console.log(`📄 Hojas encontradas: ${workbook.SheetNames.join(', ')}`);

      // Procesar cada hoja del Excel
      for (const sheetName of workbook.SheetNames) {
        console.log(`📋 Procesando hoja "${sheetName}"...`);
        
        // Definir headers personalizados para canciones
        const headers = ['Nombre', 'Artista', 'Genero', 'Año_de_salida', 'Reproducciones'];
        
        // Leer datos con headers personalizados, empezando desde la fila 2 (saltando encabezados + primer registro)
        const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { 
          header: headers, 
          range: 2  // Empieza desde la fila 2 (salta encabezados en fila 0 y primer registro en fila 1)
        });
        
        console.log(`📝 Datos en bruto: ${rawData.length} registros`);
        
        // Limpiar y filtrar datos
        const cleanData = rawData
          .filter((row: any) => {
            // Filtrar filas que no sean completamente vacías
            return Object.values(row).some(value => 
              value !== null && 
              value !== undefined && 
              value !== '' && 
              value !== 'EMPTY' &&
              String(value).trim() !== ''
            );
          })
          .map((row: any) => {
            // Limpiar cada objeto
            const cleanRow: any = {};
            
            Object.keys(row).forEach(key => {
              let value = row[key];
              
              // Limpiar valores
              if (value === 'EMPTY' || value === '' || value === null || value === undefined) {
                value = null;
              } else if (typeof value === 'string') {
                value = value.trim();
              }
              
              // Solo incluir si el valor no está vacío
              if (value !== null && value !== '') {
                cleanRow[key] = value;
              }
            });
            
            return cleanRow;
          })
          .filter((row: any) => {
            // Segunda filtrada: asegurar que el objeto tenga al menos el nombre
            return row.Nombre && row.Nombre.trim() !== '';
          });
        
        console.log(`✨ Datos limpios: ${cleanData.length} registros válidos`);
        
        if (cleanData.length > 0) {
          // Mostrar estructura de los datos limpios
          console.log('📝 Estructura final:', Object.keys(cleanData[0]));
          console.log('🔍 Primer registro limpio:', cleanData[0]);
          
          // Crear colección basada en el nombre de la hoja (en minúsculas)
          const collectionName = sheetName.toLowerCase();
          const collection = connection.collection(collectionName);
          
          // Limpiar datos existentes
          console.log(`🧹 Limpiando colección "${collectionName}"...`);
          await collection.deleteMany({});
          
          // Insertar nuevos datos limpios
          console.log(`💾 Insertando ${cleanData.length} registros limpios...`);
          await collection.insertMany(cleanData);
          console.log(`✅ Insertados ${cleanData.length} registros en la colección "${collectionName}"`);
        } else {
          console.log(`⚠️ No se encontraron registros válidos en la hoja "${sheetName}"`);
        }
      }

      console.log('🎉 Importación completada exitosamente');
      
      // Mostrar resumen de colecciones
      const collections = await connection.db.listCollections().toArray();
      console.log('📚 Colecciones en la base de datos:');
      for (const col of collections) {
        const count = await connection.collection(col.name).countDocuments();
        const sampleDoc = await connection.collection(col.name).findOne();
        console.log(`  - ${col.name}: ${count} documentos`);
        if (sampleDoc) {
          console.log(`    Estructura: ${Object.keys(sampleDoc).filter(k => k !== '_id').join(', ')}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error durante la importación:', error);
    } finally {
      await connection.close();
      console.log('🔒 Conexión a MongoDB cerrada');
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const seeder = new DataSeeder();
  seeder.seedFromExcel();
}