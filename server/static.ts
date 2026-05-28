import express, { type Express } from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  // CORRECCIÓN: Salimos de la carpeta 'server' y entramos a 'dist/public'
  // Esto unifica la ruta local y la ruta de compilación de Railway
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(distPath));

  app.get(/^.*$/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}