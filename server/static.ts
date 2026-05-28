import express, { type Express } from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  app.use(express.static(distPath));

  // SOLUCIÓN TOTAL EXPRESS 5: Expresión regular pura para capturar todo
  // Evita que path-to-regexp intente parsear strings con comodines o paréntesis
  app.get(/^.*$/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}