import type { Section } from "@/App";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type PowerBIReport,
  type PythonSnippet,
  type SqlQuery,
  loadPowerBIReports,
  loadPythonSnippets,
  loadSqlQueries,
  savePowerBIReports,
  savePythonSnippets,
  saveSqlQueries,
} from "@/types";
import {
  BarChart2,
  Bookmark,
  Clock,
  Code2,
  Database,
  ExternalLink,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type EditTarget =
  | { type: "sql"; item: SqlQuery }
  | { type: "python"; item: PythonSnippet }
  | { type: "powerbi"; item: PowerBIReport }
  | null;

export default function SavedItems({
  onNavigate,
}: {
  onNavigate: (section: Section) => void;
}) {
  const [sqlQueries, setSqlQueries] = useState<SqlQuery[]>(loadSqlQueries);
  const [pythonSnippets, setPythonSnippets] =
    useState<PythonSnippet[]>(loadPythonSnippets);
  const [powerBIReports, setPowerBIReports] =
    useState<PowerBIReport[]>(loadPowerBIReports);
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [editName, setEditName] = useState("");

  const filterFn = (name: string) =>
    name.toLowerCase().includes(search.toLowerCase());

  const filteredSQL = sqlQueries.filter((q) => filterFn(q.name));
  const filteredPython = pythonSnippets.filter((s) => filterFn(s.name));
  const filteredPowerBI = powerBIReports.filter((r) => filterFn(r.name));

  const handleDeleteSQL = (id: string) => {
    const updated = sqlQueries.filter((q) => q.id !== id);
    setSqlQueries(updated);
    saveSqlQueries(updated);
    toast.success("Query deleted");
  };

  const handleDeletePython = (id: string) => {
    const updated = pythonSnippets.filter((s) => s.id !== id);
    setPythonSnippets(updated);
    savePythonSnippets(updated);
    toast.success("Snippet deleted");
  };

  const handleDeletePowerBI = (id: string) => {
    const updated = powerBIReports.filter((r) => r.id !== id);
    setPowerBIReports(updated);
    savePowerBIReports(updated);
    toast.success("Report deleted");
  };

  const openEdit = (target: EditTarget) => {
    setEditTarget(target);
    setEditName(
      target
        ? target.type === "powerbi"
          ? target.item.name
          : target.item.name
        : "",
    );
  };

  const handleSaveEdit = () => {
    if (!editTarget || !editName.trim()) return;
    if (editTarget.type === "sql") {
      const updated = sqlQueries.map((q) =>
        q.id === editTarget.item.id ? { ...q, name: editName.trim() } : q,
      );
      setSqlQueries(updated);
      saveSqlQueries(updated);
    } else if (editTarget.type === "python") {
      const updated = pythonSnippets.map((s) =>
        s.id === editTarget.item.id ? { ...s, name: editName.trim() } : s,
      );
      setPythonSnippets(updated);
      savePythonSnippets(updated);
    } else if (editTarget.type === "powerbi") {
      const updated = powerBIReports.map((r) =>
        r.id === editTarget.item.id ? { ...r, name: editName.trim() } : r,
      );
      setPowerBIReports(updated);
      savePowerBIReports(updated);
    }
    toast.success("Name updated");
    setEditTarget(null);
  };

  const EmptyCard = ({
    label,
    section,
    ocid,
  }: {
    label: string;
    section: Section;
    ocid: string;
  }) => (
    <div
      data-ocid={ocid}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <Bookmark className="w-10 h-10 text-muted-foreground/30 mb-3" />
      <p className="text-sm font-medium text-foreground mb-1">No {label} yet</p>
      <p className="text-xs text-muted-foreground mb-4">
        Go to the {label.toLowerCase()} panel to save items.
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onNavigate(section)}
        className="text-primary border-primary/40 hover:bg-primary/10"
      >
        <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Open{" "}
        {label.split(" ")[0]}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 md:px-8 py-5 border-b border-border bg-card">
        <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-foreground">
            Saved Items
          </h1>
          <p className="text-xs text-muted-foreground">
            {sqlQueries.length + pythonSnippets.length + powerBIReports.length}{" "}
            total items saved
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              data-ocid="saved.search.input"
              placeholder="Search saved items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 w-48 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <Tabs defaultValue="sql" className="h-full flex flex-col">
          <div className="px-6 md:px-8 pt-4 border-b border-border">
            <TabsList className="h-9">
              <TabsTrigger
                value="sql"
                data-ocid="saved.sql.tab"
                className="text-xs gap-1.5"
              >
                <Database className="w-3.5 h-3.5" />
                SQL ({filteredSQL.length})
              </TabsTrigger>
              <TabsTrigger
                value="python"
                data-ocid="saved.python.tab"
                className="text-xs gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" />
                Python ({filteredPython.length})
              </TabsTrigger>
              <TabsTrigger
                value="powerbi"
                data-ocid="saved.powerbi.tab"
                className="text-xs gap-1.5"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                Power BI ({filteredPowerBI.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* SQL Tab */}
          <TabsContent value="sql" className="flex-1 p-6 md:px-8">
            {filteredSQL.length === 0 ? (
              <EmptyCard
                label="SQL Queries"
                section="sql"
                ocid="saved.sql.empty_state"
              />
            ) : (
              <AnimatePresence>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredSQL.map((query, i) => (
                    <motion.div
                      key={query.id}
                      data-ocid={`saved.item.${i + 1}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card rounded-xl p-5 border border-border hover:border-primary/40 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center">
                            <Database className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <p className="font-semibold text-sm text-foreground truncate">
                            {query.name}
                          </p>
                        </div>
                      </div>
                      <pre className="text-xs text-muted-foreground font-mono bg-muted/30 rounded-lg p-3 overflow-hidden line-clamp-3 whitespace-pre-wrap">
                        {query.code}
                      </pre>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(query.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`saved.edit.button.${i + 1}`}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              openEdit({ type: "sql", item: query })
                            }
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`saved.delete.button.${i + 1}`}
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteSQL(query.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </TabsContent>

          {/* Python Tab */}
          <TabsContent value="python" className="flex-1 p-6 md:px-8">
            {filteredPython.length === 0 ? (
              <EmptyCard
                label="Python Snippets"
                section="python"
                ocid="saved.python.empty_state"
              />
            ) : (
              <AnimatePresence>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredPython.map((snippet, i) => (
                    <motion.div
                      key={snippet.id}
                      data-ocid={`saved.item.${i + 1}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card rounded-xl p-5 border border-border hover:border-green-500/40 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-green-500/15 flex items-center justify-center">
                            <Code2 className="w-3.5 h-3.5 text-green-400" />
                          </div>
                          <p className="font-semibold text-sm text-foreground truncate">
                            {snippet.name}
                          </p>
                        </div>
                      </div>
                      <pre className="text-xs text-muted-foreground font-mono bg-muted/30 rounded-lg p-3 overflow-hidden line-clamp-3 whitespace-pre-wrap">
                        {snippet.code}
                      </pre>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(snippet.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`saved.edit.button.${i + 1}`}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              openEdit({ type: "python", item: snippet })
                            }
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`saved.delete.button.${i + 1}`}
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeletePython(snippet.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </TabsContent>

          {/* Power BI Tab */}
          <TabsContent value="powerbi" className="flex-1 p-6 md:px-8">
            {filteredPowerBI.length === 0 ? (
              <EmptyCard
                label="Power BI Reports"
                section="powerbi"
                ocid="saved.powerbi.empty_state"
              />
            ) : (
              <AnimatePresence>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredPowerBI.map((report, i) => (
                    <motion.div
                      key={report.id}
                      data-ocid={`saved.item.${i + 1}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card rounded-xl p-5 border border-border hover:border-yellow-500/40 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-yellow-500/15 flex items-center justify-center">
                            <BarChart2 className="w-3.5 h-3.5 text-yellow-400" />
                          </div>
                          <p className="font-semibold text-sm text-foreground truncate">
                            {report.name}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono bg-muted/30 rounded-lg p-3 truncate">
                        {report.embedUrl}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`saved.edit.button.${i + 1}`}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              openEdit({ type: "powerbi", item: report })
                            }
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`saved.delete.button.${i + 1}`}
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeletePowerBI(report.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent data-ocid="saved.edit.dialog" className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Item</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label
              htmlFor="edit-name"
              className="text-xs text-muted-foreground mb-1.5 block"
            >
              New Name
            </Label>
            <Input
              id="edit-name"
              data-ocid="saved.edit.input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              data-ocid="saved.edit.cancel.button"
              onClick={() => setEditTarget(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="saved.edit.save.button"
              onClick={handleSaveEdit}
              disabled={!editName.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ScrollArea className="border-t border-border">
        <footer className="px-6 py-3">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </ScrollArea>
    </div>
  );
}
