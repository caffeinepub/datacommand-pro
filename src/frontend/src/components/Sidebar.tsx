import type { Section } from "@/App";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Code2,
  Database,
  LayoutDashboard,
  Menu,
  Moon,
  Sun,
  X,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

type IconComponent = React.ComponentType<{ className?: string }>;

interface SidebarProps {
  activeSection: Section;
  onNavigate: (section: Section) => void;
}

const NAV_ITEMS: { id: Section; label: string; icon: IconComponent }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "powerbi", label: "Power BI", icon: BarChart2 },
  { id: "sql", label: "SQL Editor", icon: Database },
  { id: "python", label: "Python Console", icon: Code2 },
  { id: "saved", label: "Saved Items", icon: Bookmark },
];

const OCID_MAP: Record<Section, string> = {
  dashboard: "nav.dashboard.link",
  powerbi: "nav.powerbi.link",
  sql: "nav.sql.link",
  python: "nav.python.link",
  saved: "nav.saved.link",
};

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
          collapsed && !isMobile && "justify-center px-2",
        )}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center glow-cyan">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="min-w-0">
            <p className="font-display font-bold text-sm text-primary truncate leading-tight tracking-wide italic">
              Data-Analyst
            </p>
            <p className="text-xs text-muted-foreground truncate font-medium">
              Narendra-Singh
            </p>
          </div>
        )}
        {isMobile && (
          <button
            type="button"
            className="ml-auto text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        <TooltipProvider delayDuration={0}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            const btn = (
              <button
                key={id}
                type="button"
                data-ocid={OCID_MAP[id]}
                onClick={() => {
                  onNavigate(id);
                  setMobileOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  collapsed && !isMobile ? "justify-center px-2" : "",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                {(!collapsed || isMobile) && (
                  <span className="truncate">{label}</span>
                )}
                {isActive && (!collapsed || isMobile) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            );

            if (collapsed && !isMobile) {
              return (
                <Tooltip key={id}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              );
            }
            return btn;
          })}
        </TooltipProvider>
      </nav>

      {/* Bottom controls */}
      <div className="px-2 pb-4 space-y-1 border-t border-sidebar-border pt-3">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-ocid="nav.theme.toggle"
                onClick={toggleTheme}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-all",
                  collapsed && !isMobile ? "justify-center px-2" : "",
                )}
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <Moon className="w-4 h-4 flex-shrink-0" />
                )}
                {(!collapsed || isMobile) && (
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                )}
              </button>
            </TooltipTrigger>
            {collapsed && !isMobile && (
              <TooltipContent side="right">Toggle Theme</TooltipContent>
            )}
          </Tooltip>

          {!isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  data-ocid="nav.sidebar.toggle"
                  onClick={() => setCollapsed((c) => !c)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-all",
                    collapsed ? "justify-center px-2" : "",
                  )}
                >
                  {collapsed ? (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                  )}
                  {!collapsed && <span>Collapse</span>}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">Expand</TooltipContent>
              )}
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex-shrink-0",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <SidebarContent />
      </aside>

      <Button
        variant="ghost"
        size="icon"
        data-ocid="nav.sidebar.toggle"
        className="md:hidden fixed top-3 left-3 z-50 bg-card border border-border shadow-lg h-9 w-9"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-4 h-4" />
      </Button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col shadow-2xl">
            <SidebarContent isMobile />
          </div>
          <button
            type="button"
            aria-label="Close sidebar"
            className="flex-1 bg-black/60 backdrop-blur-sm border-0 cursor-default"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}
