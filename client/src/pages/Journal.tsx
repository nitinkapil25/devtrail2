import { useState } from "react";
import { useEntries, useDeleteEntry } from "@/hooks/use-entries";
import { Navigation } from "@/components/Navigation";
import { CreateEntryDialog } from "@/components/CreateEntryDialog";
import { EntryCard } from "@/components/EntryCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Entry } from "@shared/schema";

export default function Journal() {
  const { data: entries, isLoading } = useEntries();
  const deleteEntry = useDeleteEntry();
  const [search, setSearch] = useState("");
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredEntries = entries?.filter(entry => 
    entry.content.toLowerCase().includes(search.toLowerCase()) || 
    entry.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      await deleteEntry.mutateAsync(id);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setEditingEntry(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />
      
      <main className="flex-1 ml-20 md:ml-64 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Journal</h1>
              <p className="text-muted-foreground mt-1">Document your journey.</p>
            </div>
            <CreateEntryDialog 
              open={isDialogOpen} 
              onOpenChange={handleDialogClose} 
              existingEntry={editingEntry}
            />
          </header>

          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by keyword or tag..." 
              className="pl-10 bg-card/40 border-white/10 rounded-xl h-12 focus:border-primary/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredEntries?.length === 0 ? (
                <div className="text-center py-20 bg-card/20 rounded-2xl border border-white/5 border-dashed">
                  <p className="text-muted-foreground">No entries found. Start writing!</p>
                </div>
              ) : (
                filteredEntries?.map((entry) => (
                  <EntryCard 
                    key={entry.id} 
                    entry={entry} 
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
