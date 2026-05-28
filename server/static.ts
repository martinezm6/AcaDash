import express, { type Express } from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  app.use(express.static(distPath));

  // CORRECCIÓN PARA EXPRESS 5: Se cambia '*' por '(.*)' 
  // Esto le permite a path-to-regexp procesar la ruta comodín sin colapsar
  app.get("(.*)", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}