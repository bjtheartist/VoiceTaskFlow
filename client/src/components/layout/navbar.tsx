import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { HomeIcon, LayoutDashboard, Mic } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            VoiceTask AI
          </span>
        </div>

        <div className="flex gap-1">
          <Link href="/">
            <Button 
              variant={location === "/" ? "default" : "ghost"}
              className="relative group"
            >
              <HomeIcon className="h-4 w-4 mr-2" />
              Home
              {location === "/" && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
              )}
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button 
              variant={location === "/dashboard" ? "default" : "ghost"}
              className="relative group"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
              {location === "/dashboard" && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
              )}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}