import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema, type InsertProject } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateProject } from "@/hooks/use-projects";
import { Plus, Loader2 } from "lucide-react";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const createProject = useCreateProject();

  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      repoUrl: "",
    },
  });

  const onSubmit = async (data: InsertProject) => {
    try {
      await createProject.mutateAsync(data);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-white/10">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input 
              {...form.register("name")} 
              placeholder="My Awesome App" 
              className="bg-background/50 border-white/10 focus:border-primary"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              {...form.register("description")} 
              placeholder="A brief overview..." 
              className="bg-background/50 border-white/10 focus:border-primary h-24"
            />
          </div>

          <div className="space-y-2">
            <Label>GitHub Repository</Label>
            <Input 
              {...form.register("repoUrl")} 
              placeholder="https://github.com/user/repo" 
              className="bg-background/50 border-white/10 focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createProject.isPending} className="bg-primary hover:bg-primary/90">
              {createProject.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
