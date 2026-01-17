import { useProjects } from "@/hooks/use-projects";
import { Navigation } from "@/components/Navigation";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FolderGit2, Github, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Projects() {
  const { data: projects, isLoading } = useProjects();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />
      
      <main className="flex-1 ml-20 md:ml-64 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="text-muted-foreground mt-1">Connect your learning to real work.</p>
            </div>
            <CreateProjectDialog />
          </header>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in">
              {projects?.map((project) => (
                <Card key={project.id} className="bg-card/40 border-white/5 hover:border-primary/30 transition-all hover:shadow-lg group">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <FolderGit2 className="w-5 h-5 text-primary" />
                        {project.name}
                      </CardTitle>
                      {project.repoUrl && (
                        <a 
                          href={project.repoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {project.description || "No description provided."}
                    </p>
                    <Button variant="outline" size="sm" className="w-full border-white/10 hover:bg-white/5 group-hover:border-primary/30">
                      View Details <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              {projects?.length === 0 && (
                <div className="col-span-full text-center py-20 bg-card/20 rounded-2xl border border-white/5 border-dashed">
                  <p className="text-muted-foreground">No projects yet. Add one to start linking entries!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
