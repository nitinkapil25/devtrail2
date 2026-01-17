import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export * from "./models/auth";
export * from "./models/chat";

import { users } from "./models/auth";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // References users.id (which is varchar from auth schema)
  name: text("name").notNull(),
  description: text("description"),
  repoUrl: text("repo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  content: text("content").notNull(), // What I learned
  bug: text("bug"), // Issue faced
  solution: text("solution"), // How solved
  timeSpent: integer("time_spent").default(0), // Minutes
  confidence: integer("confidence").default(3), // 1-5
  notes: text("notes"), // Free text
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const entryTags = pgTable("entry_tags", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull().references(() => entries.id),
  tagId: integer("tag_id").notNull().references(() => tags.id),
});

export const entryProjects = pgTable("entry_projects", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull().references(() => entries.id),
  projectId: integer("project_id").notNull().references(() => projects.id),
});

// Relations
export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
}));

export const entriesRelations = relations(entries, ({ one, many }) => ({
  user: one(users, {
    fields: [entries.userId],
    references: [users.id],
  }),
  entryTags: many(entryTags),
  entryProjects: many(entryProjects),
}));

export const entryTagsRelations = relations(entryTags, ({ one }) => ({
  entry: one(entries, {
    fields: [entryTags.entryId],
    references: [entries.id],
  }),
  tag: one(tags, {
    fields: [entryTags.tagId],
    references: [tags.id],
  }),
}));

export const entryProjectsRelations = relations(entryProjects, ({ one }) => ({
  entry: one(entries, {
    fields: [entryProjects.entryId],
    references: [entries.id],
  }),
  project: one(projects, {
    fields: [entryProjects.projectId],
    references: [projects.id],
  }),
}));

// Schemas
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, userId: true });
export const insertEntrySchema = createInsertSchema(entries).omit({ id: true, createdAt: true, userId: true });
export const insertTagSchema = createInsertSchema(tags).omit({ id: true });

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Entry = typeof entries.$inferSelect;
export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;
