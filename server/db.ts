import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import path from "path";

// 1. Determinar la ruta de almacenamiento según el entorno de ejecución
// Si Railway nos proporciona un volumen permanente, guardamos ahí para evitar pérdida de datos.
// De lo contrario, se mantiene el comportamiento local estándar en la raíz del proyecto.
const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH 
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, "sqlite.db")
  : "sqlite.db";

// 2. Instanciamos la base de datos con configuraciones de resiliencia
// El timeout de 5000ms evita errores de colisión cuando el sistema procesa peticiones en paralelo
const sqlite = new Database(dbPath, {
  timeout: 5000,
  verbose: process.env.NODE_ENV !== "production" ? console.log : undefined // Logs de querys solo en desarrollo
});

// 3. Activamos el modo WAL (Write-Ahead Logging) para permitir concurrencia de lectura/escritura
// Esto optimiza el Lead Time de respuesta del sistema y evita el error "database is locked" tanto en local como en la nube
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = NORMAL"); // Optimiza la sincronización con el disco sin arriesgar datos

// 4. Inicializamos Drizzle ORM bajo el esquema relacional unificado
export const db = drizzle(sqlite, { schema });