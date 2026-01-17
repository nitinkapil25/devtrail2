import { useAuth } from "@/hooks/use-auth";
import { useEntries } from "@/hooks/use-entries";
import { Navigation } from "@/components/Navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Link as LinkIcon, CalendarDays, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { data: entries } = useEntries();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Calculate top skills from tags
  const allTags = entries?.flatMap(e => e.tags || []) || [];
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topSkills = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([tag]) => tag);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />
      
      <main className="flex-1 ml-20 md:ml-64 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-primary/20 via-violet-500/10 to-blue-500/20 rounded-3xl border border-white/5"></div>
            <div className="absolute -bottom-16 left-8 flex items-end gap-6">
              <Avatar className="w-32 h-32 border-4 border-background shadow-2xl">
                {user?.profileImageUrl && <AvatarImage src={user.profileImageUrl} />}
                <AvatarFallback className="text-4xl bg-primary/20 text-primary">
                  {user?.firstName?.[0] || <User />}
                </AvatarFallback>
              </Avatar>
              <div className="mb-4">
                <h1 className="text-3xl font-bold">{user?.firstName} {user?.lastName}</h1>
                <p className="text-muted-foreground">@{user?.email?.split('@')[0]}</p>
              </div>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar Info */}
            <div className="space-y-6">
              <Card className="bg-card/40 border-white/5">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" /> Earth
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <LinkIcon className="w-4 h-4" /> devtrail.app
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CalendarDays className="w-4 h-4" /> Joined {format(new Date(), 'MMMM yyyy')}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-white/5">
                <CardHeader>
                  <CardTitle className="text-lg">Top Skills</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {topSkills.length > 0 ? topSkills.map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-white/5 hover:bg-white/10">
                      {skill}
                    </Badge>
                  )) : (
                    <p className="text-sm text-muted-foreground">No skills tracked yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-card/40 border border-white/5 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Passionate developer tracking my learning journey. Documenting bugs, solutions, and daily wins to become a better engineer.
                </p>
              </div>

              <div className="bg-card/40 border border-white/5 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Activity Heatmap</h2>
                <div className="h-32 flex items-center justify-center text-muted-foreground bg-black/20 rounded-xl border border-white/5 border-dashed">
                  Activity graph placeholder
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
