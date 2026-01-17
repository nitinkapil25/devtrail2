import { db } from "./db";
import { tags } from "@shared/schema";

async function seed() {
  console.log("Seeding tags...");
  const defaultTags = ["React", "Node.js", "TypeScript", "Python", "Docker", "AWS", "SQL", "Next.js", "TailwindCSS"];
  
  for (const name of defaultTags) {
    await db.insert(tags).values({ name }).onConflictDoNothing();
  }
  console.log("Tags seeded!");
  process.exit(0);
}

seed().catch(console.error);
