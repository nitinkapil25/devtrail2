import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEntrySchema, type InsertEntry } from "@shared/schema";
import { z } from "zod";
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
import { Slider } from "@/components/ui/slider";
import { useCreateEntry, useUpdateEntry } from "@/hooks/use-entries";
import { Plus, Loader2 } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";

const formSchema = insertEntrySchema.extend({
  tags: z.string().optional(), // Comma separated string for input
  projectIds: z.array(z.number()).optional(),
  timeSpent: z.coerce.number(),
  confidence: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateEntryDialogProps {
  existingEntry?: any;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateEntryDialog({ existingEntry, open: controlledOpen, onOpenChange }: CreateEntryDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const createEntry = useCreateEntry();
  const updateEntry = useUpdateEntry();
  const { data: projects } = useProjects();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      bug: "",
      solution: "",
      notes: "",
      timeSpent: 30,
      confidence: 3,
      tags: "",
      projectIds: [],
    },
  });

  useEffect(() => {
    if (existingEntry) {
      form.reset({
        ...existingEntry,
        tags: existingEntry.tags?.join(", ") || "",
        projectIds: existingEntry.projects?.map((p: any) => p.id) || [],
      });
    } else {
      form.reset({
        content: "",
        bug: "",
        solution: "",
        notes: "",
        timeSpent: 30,
        confidence: 3,
        tags: "",
        projectIds: [],
      });
    }
  }, [existingEntry, isOpen, form]);

  const onSubmit = async (data: FormValues) => {
    const tagsArray = data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    
    try {
      if (existingEntry) {
        await updateEntry.mutateAsync({
          id: existingEntry.id,
          ...data,
          tags: tagsArray,
        });
      } else {
        await createEntry.mutateAsync({
          ...data,
          tags: tagsArray,
        });
      }
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  const isPending = createEntry.isPending || updateEntry.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] bg-card border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {existingEntry ? "Edit Journal Entry" : "What did you learn today?"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Core Learning</Label>
              <Textarea 
                {...form.register("content")} 
                placeholder="I learned how to..." 
                className="bg-background/50 border-white/10 focus:border-primary min-h-[100px]"
              />
              {form.formState.errors.content && (
                <p className="text-xs text-destructive">{form.formState.errors.content.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Challenge Faced (Optional)</Label>
                <Textarea 
                  {...form.register("bug")} 
                  placeholder="Encountered an issue with..." 
                  className="bg-background/50 border-white/10 focus:border-primary h-20"
                />
              </div>
              <div className="space-y-2">
                <Label>Solution (Optional)</Label>
                <Textarea 
                  {...form.register("solution")} 
                  placeholder="Fixed it by..." 
                  className="bg-background/50 border-white/10 focus:border-primary h-20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Time Spent</Label>
                  <span className="text-xs text-muted-foreground">{form.watch("timeSpent")} mins</span>
                </div>
                <Slider 
                  min={5} 
                  max={480} 
                  step={5} 
                  value={[form.watch("timeSpent")]}
                  onValueChange={([val]) => form.setValue("timeSpent", val)}
                  className="py-2"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Confidence</Label>
                  <span className="text-xs text-muted-foreground">{form.watch("confidence")}/5</span>
                </div>
                <Slider 
                  min={1} 
                  max={5} 
                  step={1} 
                  value={[form.watch("confidence")]}
                  onValueChange={([val]) => form.setValue("confidence", val)}
                  className="py-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <Input 
                {...form.register("tags")} 
                placeholder="react, typescript, animation (comma separated)"
                className="bg-background/50 border-white/10 focus:border-primary"
              />
            </div>

            {projects && projects.length > 0 && (
              <div className="space-y-2">
                <Label>Project Link</Label>
                <select 
                  className="w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    form.setValue("projectIds", val ? [val] : []);
                  }}
                  defaultValue={form.watch("projectIds")?.[0] || ""}
                >
                  <option value="">No Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                existingEntry ? "Update Entry" : "Save Entry"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
