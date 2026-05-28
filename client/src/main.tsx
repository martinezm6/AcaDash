import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply saved theme before first render to avoid flash
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
}

// Apply saved color palette
const savedPalette = localStorage.getItem("colorPalette");
if (savedPalette && savedPalette !== "indigo") {
  document.documentElement.setAttribute("data-palette", savedPalette);
}

// Apply saved font size
const savedFontSize = localStorage.getItem("fontSize");
if (savedFontSize === "large") document.documentElement.classList.add("font-large");
else if (savedFontSize === "xl") document.documentElement.classList.add("font-xl");

createRoot(document.getElementById("root")!).render(<App />);
