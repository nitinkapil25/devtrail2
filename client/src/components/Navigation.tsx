import { Link, useLocation } from "wouter";
import { LayoutDashboard, Book, FolderGit2, LogOut, User, Code2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/journal", label: "Journal", icon: Book },
    { href: "/projects", label: "Projects", icon: FolderGit2 },
  ];

  return (
    <nav className="fixed top-0 left-0 h-full w-20 md:w-64 bg-card/30 backdrop-blur-xl border-r border-white/5 flex flex-col z-50 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-lg shadow-primary/25">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl hidden md:block text-gradient-primary">DevTrail</span>
      </div>

      <div className="flex-1 px-3 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-primary/10 text-primary font-medium" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}>
              <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-primary")} />
              <span className="hidden md:block">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5 space-y-4">
        <Link href="/profile" className={cn(
          "flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group",
          location === "/profile" && "bg-white/5"
        )}>
          <Avatar className="w-10 h-10 border border-white/10 group-hover:border-primary/50 transition-colors">
            {user?.profileImageUrl && <AvatarImage src={user.profileImageUrl} />}
            <AvatarFallback className="bg-primary/20 text-primary">
              {user?.firstName?.[0] || <User className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.firstName || "Developer"}</p>
            <p className="text-xs text-muted-foreground truncate">View Profile</p>
          </div>
        </Link>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => logout()}
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 hidden md:flex"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </nav>
  );
}
