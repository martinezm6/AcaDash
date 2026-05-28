import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply saved theme and palette before first render to avoid flash
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
}
const savedPalette = localStorage.getItem("colorPalette");
if (savedPalette && savedPalette !== "indigo") {
  document.documentElement.setAttribute("data-palette", savedPalette);
}

// ======= CORRECCIÓN DE CACHÉ PARA SAFARI EN IPAD =======
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});
// =======================================================

createRoot(document.getElementById("root")!).render(<App />);