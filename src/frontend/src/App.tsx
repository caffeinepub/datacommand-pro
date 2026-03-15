import Dashboard3D from "@/components/Dashboard3D";
import PowerBIPanel from "@/components/PowerBIPanel";
import PythonConsole from "@/components/PythonConsole";
import SQLEditor from "@/components/SQLEditor";
import SavedItems from "@/components/SavedItems";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

export type Section = "dashboard" | "powerbi" | "sql" | "python" | "saved";

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />
        <main className="flex-1 overflow-auto min-w-0">
          {activeSection === "dashboard" && (
            <Dashboard3D onNavigate={setActiveSection} />
          )}
          {activeSection === "powerbi" && <PowerBIPanel />}
          {activeSection === "sql" && <SQLEditor />}
          {activeSection === "python" && <PythonConsole />}
          {activeSection === "saved" && (
            <SavedItems onNavigate={setActiveSection} />
          )}
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
