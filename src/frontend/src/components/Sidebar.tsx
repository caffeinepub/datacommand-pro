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
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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

function NSBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div
      className={cn(
        "flex-shrink-0 rounded-xl flex items-center justify-center font-bold tracking-tight shadow-lg",
        s,
      )}
      style={{
        background: "linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)",
        boxShadow:
          "0 0 16px rgba(0,212,255,0.4), 0 0 32px rgba(124,58,237,0.2)",
      }}
    >
      <span className="text-white drop-shadow">NS</span>
    </div>
  );
}

function ThemePillToggle({
  collapsed,
  isMobile,
}: { collapsed: boolean; isMobile: boolean }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggle = (
    <button
      type="button"
      data-ocid="nav.theme.toggle"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex items-center transition-all duration-300 rounded-full border",
        collapsed && !isMobile
          ? "w-9 h-9 justify-center border-border/50 hover:border-primary/60 hover:bg-primary/10 px-0"
          : "w-full gap-3 px-3 py-2 border-transparent hover:border-primary/30 hover:bg-sidebar-accent",
      )}
      aria-label="Toggle theme"
    >
      {collapsed && !isMobile ? (
        <div className="relative w-5 h-5 flex items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.25 }}
              >
                <Sun className="w-4 h-4 text-yellow-400" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.25 }}
              >
                <Moon className="w-4 h-4 text-primary" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <>
          {/* Pill track */}
          <div
            className={cn(
              "relative flex-shrink-0 w-11 h-6 rounded-full border transition-all duration-300",
              isDark
                ? "bg-primary/20 border-primary/40"
                : "bg-yellow-400/20 border-yellow-400/40",
            )}
          >
            <motion.div
              className={cn(
                "absolute top-0.5 w-5 h-5 rounded-full shadow-md flex items-center justify-center",
                isDark ? "bg-primary" : "bg-yellow-400",
              )}
              animate={{ left: isDark ? "calc(100% - 22px)" : "2px" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              {isDark ? (
                <Sun className="w-3 h-3 text-primary-foreground" />
              ) : (
                <Moon className="w-3 h-3 text-background" />
              )}
            </motion.div>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
        </>
      )}
    </button>
  );

  if (collapsed && !isMobile) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{toggle}</TooltipTrigger>
        <TooltipContent side="right">Toggle Theme</TooltipContent>
      </Tooltip>
    );
  }
  return toggle;
}

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
          collapsed && !isMobile && "justify-center px-2",
        )}
      >
        <NSBadge />
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
                  "w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                  collapsed && !isMobile ? "justify-center px-2" : "px-3",
                  isActive
                    ? "text-primary bg-gradient-to-r from-primary/15 to-transparent border-l-2 border-primary shadow-[inset_0_0_12px_rgba(0,212,255,0.08)]"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-l-2 border-transparent",
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-primary drop-shadow-[0_0_6px_rgba(0,212,255,0.6)]"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                {(!collapsed || isMobile) && (
                  <span className="truncate">{label}</span>
                )}
                {isActive && (!collapsed || isMobile) && (
                  <motion.span
                    layoutId="nav-dot"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(0,212,255,0.8)]"
                  />
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
          <ThemePillToggle collapsed={collapsed} isMobile={isMobile} />

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
