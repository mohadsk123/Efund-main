import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" attribute="class">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);