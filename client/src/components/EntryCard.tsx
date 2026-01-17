import { format } from "date-fns";
import { Clock, Code, Bug, Lightbulb, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Entry, Project } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface EntryCardProps {
  entry: Entry & { tags?: string[]; projects?: Project[] };
  onEdit: (entry: Entry) => void;
  onDelete: (id: number) => void;
}

export function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  return (
    <div className="group relative bg-card/40 hover:bg-card/60 border border-white/5 hover:border-primary/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-lg text-foreground">{format(new Date(entry.date), "MMMM d, yyyy")}</h3>
            {entry.confidence && (
              <Badge variant="outline" className={
                entry.confidence >= 4 ? "border-green-500/50 text-green-400 bg-green-500/10" :
                entry.confidence === 3 ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10" :
                "border-red-500/50 text-red-400 bg-red-500/10"
              }>
                Level {entry.confidence}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{entry.timeSpent} mins</span>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(entry)}>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(entry.id)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
            <Lightbulb className="w-4 h-4" />
            Learned
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{entry.content}</p>
        </div>

        {entry.bug && (
          <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-destructive mb-1 uppercase tracking-wider">
              <Bug className="w-3 h-3" />
              Challenge
            </div>
            <p className="text-sm text-foreground/80">{entry.bug}</p>
            {entry.solution && (
              <div className="mt-2 pt-2 border-t border-destructive/10">
                <span className="text-xs font-semibold text-green-400">Solution: </span>
                <span className="text-sm text-foreground/80">{entry.solution}</span>
              </div>
            )}
          </div>
        )}

        {(entry.tags?.length || entry.projects?.length) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {entry.projects?.map(p => (
              <Badge key={p.id} variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Code className="w-3 h-3 mr-1" />
                {p.name}
              </Badge>
            ))}
            {entry.tags?.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs text-muted-foreground border-white/10">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
