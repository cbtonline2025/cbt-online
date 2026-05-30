import app from "./server-app";
import path from "path";
import { createServer as createViteServer } from "vite";
import express from "express";

const PORT = 3000;

// Vite Middleware & Static Assets Handler
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CBT Server] Berjalan pada port ${PORT}`);
  });
}

bootstrap();
