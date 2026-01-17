import type { Express, Request, Response } from "express";

// Image AI routes disabled for local development
export function registerImageRoutes(app: Express): void {
  app.post("/api/images/generate", (_req: Request, res: Response) => {
    res.status(503).json({
      error: "Image generation is disabled in local development",
    });
  });
}
