import express, { type Express } from "express";
import path from "path";
import { fileURLToPath } from "url";

// Alternativa moderna estándar para emular __dirname en módulos ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  // Resuelve la ruta hacia la carpeta pública del frontend compilado
  const distPath = path.resolve(__dirname, "public");

  // Sirve los archivos estáticos
  app.use(express.static(distPath));

  // Envía el index.html para cualquier ruta que no sea de la API (para SPA con Wouter)
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}