import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { HomeIcon, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex gap-2">
          <Link href="/">
            <Button variant={location === "/" ? "default" : "ghost"}>
              <HomeIcon className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant={location === "/dashboard" ? "default" : "ghost"}>
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
