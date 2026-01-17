import type { Express, Request, Response } from "express";

// Audio AI disabled for local development
export function registerAudioRoutes(app: Express): void {
  app.post("/api/audio/transcribe", (_req: Request, res: Response) => {
    res.status(503).json({
      error: "Audio features are disabled in local development",
    });
  });
}
