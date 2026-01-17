import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
// import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat_disabled";
import { registerImageRoutes } from "./replit_integrations/image_disabled";
import { registerAudioRoutes } from "./replit_integrations/audio";
import { api } from "@shared/routes";
import { z } from "zod";


const isAuthenticated = (_req: any, _res: any, next: any) => {
  // fake user for local dev
  _req.user = { claims: { sub: "local-user" } };
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth
 

  // Disabled AI integrations (safe placeholders)
  registerChatRoutes(app);
  registerImageRoutes(app);
  registerAudioRoutes(app);

  /* ---------------- ENTRIES ---------------- */

  app.get(api.entries.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const entries = await storage.getEntries(userId);
    res.json(entries);
  });

  app.post(api.entries.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.entries.create.input.parse(req.body);
      const { tags, projectIds, ...entryData } = input;
      const userId = req.user.claims.sub;
      const entry = await storage.createEntry(userId, entryData, tags, projectIds);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.get(api.entries.get.path, isAuthenticated, async (req: any, res) => {
    const entry = await storage.getEntry(Number(req.params.id));
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    res.json(entry);
  });

  app.put(api.entries.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.entries.update.input.parse(req.body);
      const { tags, projectIds, ...entryData } = input;
      const userId = req.user.claims.sub;
      const entry = await storage.updateEntry(
        Number(req.params.id),
        userId,
        entryData,
        tags,
        projectIds
      );
      res.json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.delete(api.entries.delete.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    await storage.deleteEntry(Number(req.params.id), userId);
    res.status(204).send();
  });

  /* ---------------- PROJECTS ---------------- */

  app.get(api.projects.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const projects = await storage.getProjects(userId);
    res.json(projects);
  });

  app.post(api.projects.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      const project = await storage.createProject(userId, input);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  /* ---------------- TAGS ---------------- */

  app.get(api.tags.list.path, isAuthenticated, async (_req, res) => {
    const tags = await storage.getTags();
    res.json(tags);
  });

  /* ---------------- AI PLACEHOLDERS ---------------- */

  app.post(api.ai.generateSummary.path, isAuthenticated, async (_req, res) => {
    res.json({
      summary: "AI features are disabled in local development.",
      insights: [],
    });
  });

  app.post(api.ai.suggestNextSteps.path, isAuthenticated, async (_req, res) => {
    res.json({
      suggestions: [],
    });
  });

  return httpServer;
}
