import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  entries, projects, tags, entryTags, entryProjects,
  type Entry, type InsertEntry, type Project, type InsertProject, type Tag, type InsertTag
} from "@shared/schema";
import { authStorage } from "./replit_integrations/auth";
import { chatStorage } from "./replit_integrations/chat";

export interface IStorage {
  // Entries
  getEntries(userId: string): Promise<(Entry & { tags: string[], projects: Project[] })[]>;
  getEntry(id: number): Promise<(Entry & { tags: string[], projects: Project[] }) | undefined>;
  createEntry(userId: string, entry: InsertEntry, tagNames?: string[], projectIds?: number[]): Promise<Entry>;
  updateEntry(id: number, userId: string, entry: Partial<InsertEntry>, tagNames?: string[], projectIds?: number[]): Promise<Entry>;
  deleteEntry(id: number, userId: string): Promise<void>;

  // Projects
  getProjects(userId: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(userId: string, project: InsertProject): Promise<Project>;

  // Tags
  getTags(): Promise<Tag[]>;
  getOrCreateTags(names: string[]): Promise<Tag[]>;
}

export class DatabaseStorage implements IStorage {
  async getEntries(userId: string): Promise<(Entry & { tags: string[], projects: Project[] })[]> {
    const userEntries = await db.select().from(entries)
      .where(eq(entries.userId, userId))
      .orderBy(desc(entries.date));

    // Enrich with tags and projects (could be optimized with joins, but simple loop is fine for MVP)
    const enrichedEntries = await Promise.all(userEntries.map(async (entry) => {
      const tagsData = await db.select({ name: tags.name })
        .from(entryTags)
        .innerJoin(tags, eq(entryTags.tagId, tags.id))
        .where(eq(entryTags.entryId, entry.id));
      
      const projectsData = await db.select({ project: projects })
        .from(entryProjects)
        .innerJoin(projects, eq(entryProjects.projectId, projects.id))
        .where(eq(entryProjects.entryId, entry.id));
      
      return {
        ...entry,
        tags: tagsData.map(t => t.name),
        projects: projectsData.map(p => p.project),
      };
    }));

    return enrichedEntries;
  }

  async getEntry(id: number): Promise<(Entry & { tags: string[], projects: Project[] }) | undefined> {
    const [entry] = await db.select().from(entries).where(eq(entries.id, id));
    if (!entry) return undefined;

    const tagsData = await db.select({ name: tags.name })
      .from(entryTags)
      .innerJoin(tags, eq(entryTags.tagId, tags.id))
      .where(eq(entryTags.entryId, entry.id));
    
    const projectsData = await db.select({ project: projects })
      .from(entryProjects)
      .innerJoin(projects, eq(entryProjects.projectId, projects.id))
      .where(eq(entryProjects.entryId, entry.id));
    
    return {
      ...entry,
      tags: tagsData.map(t => t.name),
      projects: projectsData.map(p => p.project),
    };
  }

  async createEntry(userId: string, insertEntry: InsertEntry, tagNames: string[] = [], projectIds: number[] = []): Promise<Entry> {
    const [entry] = await db.insert(entries).values({ ...insertEntry, userId }).returning();

    if (tagNames.length > 0) {
      const tagsList = await this.getOrCreateTags(tagNames);
      await Promise.all(tagsList.map(tag => 
        db.insert(entryTags).values({ entryId: entry.id, tagId: tag.id })
      ));
    }

    if (projectIds.length > 0) {
      await Promise.all(projectIds.map(projectId => 
        db.insert(entryProjects).values({ entryId: entry.id, projectId })
      ));
    }

    return entry;
  }

  async updateEntry(id: number, userId: string, updates: Partial<InsertEntry>, tagNames?: string[], projectIds?: number[]): Promise<Entry> {
    const [updatedEntry] = await db.update(entries)
      .set(updates)
      .where(and(eq(entries.id, id), eq(entries.userId, userId)))
      .returning();

    if (tagNames) {
      await db.delete(entryTags).where(eq(entryTags.entryId, id));
      const tagsList = await this.getOrCreateTags(tagNames);
      await Promise.all(tagsList.map(tag => 
        db.insert(entryTags).values({ entryId: id, tagId: tag.id })
      ));
    }

    if (projectIds) {
      await db.delete(entryProjects).where(eq(entryProjects.entryId, id));
      await Promise.all(projectIds.map(projectId => 
        db.insert(entryProjects).values({ entryId: id, projectId })
      ));
    }

    return updatedEntry;
  }

  async deleteEntry(id: number, userId: string): Promise<void> {
    // Delete related records first
    await db.delete(entryTags).where(eq(entryTags.entryId, id));
    await db.delete(entryProjects).where(eq(entryProjects.entryId, id));
    await db.delete(entries).where(and(eq(entries.id, id), eq(entries.userId, userId)));
  }

  async getProjects(userId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(userId: string, project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values({ ...project, userId }).returning();
    return newProject;
  }

  async getTags(): Promise<Tag[]> {
    return db.select().from(tags);
  }

  async getOrCreateTags(names: string[]): Promise<Tag[]> {
    const existingTags = await db.select().from(tags).where(sql`name IN ${names}`);
    const existingNames = new Set(existingTags.map(t => t.name));
    const newNames = names.filter(n => !existingNames.has(n));

    if (newNames.length > 0) {
      const insertedTags = await db.insert(tags)
        .values(newNames.map(name => ({ name })))
        .returning();
      return [...existingTags, ...insertedTags];
    }

    return existingTags;
  }
}

// Import sql for 'IN' clause
import { sql } from "drizzle-orm";

export const storage = new DatabaseStorage();
