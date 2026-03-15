import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  type PowerBIReport,
  generateId,
  loadPowerBIReports,
  savePowerBIReports,
} from "@/types";
import {
  BarChart2,
  Clock,
  ExternalLink,
  LayoutDashboard,
  Loader2,
  Play,
  Save,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function PowerBIPanel() {
  const [embedUrl, setEmbedUrl] = useState("");
  const [reportName, setReportName] = useState("");
  const [activeUrl, setActiveUrl] = useState("");
  const [reports, setReports] = useState<PowerBIReport[]>(loadPowerBIReports);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [showSlowWarning, setShowSlowWarning] = useState(false);
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
  }, []);

  const handleLoad = () => {
    const url = embedUrl.trim();
    if (!url) {
      toast.error("Please enter a Power BI embed URL");
      return;
    }
    setActiveUrl(url);
    setIframeLoading(true);
    setIframeError(false);
    setShowSlowWarning(false);
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    slowTimerRef.current = setTimeout(() => setShowSlowWarning(true), 10000);
    toast.success("Loading dashboard...");
  };

  const handleIframeLoad = () => {
    setIframeLoading(false);
    setShowSlowWarning(false);
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
  };

  const handleIframeError = () => {
    setIframeLoading(false);
    setIframeError(true);
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
  };

  const handleSave = () => {
    const url = embedUrl.trim();
    const name = reportName.trim();
    if (!name) {
      toast.error("Please enter a report name");
      return;
    }
    if (!url) {
      toast.error("Please enter an embed URL");
      return;
    }
    const newReport: PowerBIReport = {
      id: generateId(),
      name,
      embedUrl: url,
      description: "",
      createdAt: new Date().toISOString(),
    };
    const updated = [newReport, ...reports];
    setReports(updated);
    savePowerBIReports(updated);
    setReportName("");
    toast.success(`"${name}" saved successfully`);
  };

  const handleDelete = (id: string) => {
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    savePowerBIReports(updated);
    toast.success("Report removed");
  };

  const handleLoadSaved = (report: PowerBIReport) => {
    setEmbedUrl(report.embedUrl);
    setActiveUrl(report.embedUrl);
    setIframeLoading(true);
    setIframeError(false);
    setShowSlowWarning(false);
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    slowTimerRef.current = setTimeout(() => setShowSlowWarning(true), 10000);
    toast.success(`"${report.name}" loaded`);
  };

  const handleOpenInTab = () => {
    const url = embedUrl.trim() || activeUrl;
    if (!url) {
      toast.error("Please enter an embed URL first");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 md:px-8 py-5 border-b border-border bg-card">
        <div className="w-9 h-9 rounded-lg bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-foreground">
            Power BI Dashboard
          </h1>
          <p className="text-xs text-muted-foreground">
            Embed and manage your Power BI reports
          </p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0 overflow-auto">
          {/* Controls */}
          <div className="px-6 md:px-8 py-5 border-b border-border bg-card/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="md:col-span-2">
                <Label
                  htmlFor="bi-url"
                  className="text-xs text-muted-foreground mb-1.5 block"
                >
                  Power BI Embed URL
                </Label>
                <Input
                  id="bi-url"
                  data-ocid="powerbi.url.input"
                  placeholder="https://app.powerbi.com/reportEmbed?reportId=..."
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  className="font-mono text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLoad();
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  data-ocid="powerbi.load.button"
                  onClick={handleLoad}
                  className="flex-1 bg-yellow-500/80 hover:bg-yellow-500 text-black font-semibold"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Load Dashboard
                </Button>
                <Button
                  data-ocid="powerbi.open.button"
                  onClick={handleOpenInTab}
                  variant="outline"
                  title="Open in new tab"
                  className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end mt-3">
              <div className="md:col-span-2">
                <Label
                  htmlFor="report-name"
                  className="text-xs text-muted-foreground mb-1.5 block"
                >
                  Save as Report Name
                </Label>
                <Input
                  id="report-name"
                  data-ocid="powerbi.report.name.input"
                  placeholder="e.g. Q4 Sales Dashboard"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>
              <Button
                data-ocid="powerbi.save.button"
                onClick={handleSave}
                variant="outline"
                className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Report
              </Button>
            </div>
            {/* Instructions */}
            <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/50 text-xs text-muted-foreground">
              <strong className="text-foreground">
                How to get a Power BI embed URL:
              </strong>{" "}
              Go to Power BI → your report →{" "}
              <em>File → Embed report → Publish to web</em> → copy the{" "}
              <code className="bg-muted px-1 rounded">iframe src</code> URL from
              the generated code.
            </div>
          </div>

          {/* iFrame / Placeholder */}
          <div className="flex-1 min-h-0 p-6 md:px-8">
            {activeUrl ? (
              <motion.div
                key={activeUrl}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-border glow-cyan"
              >
                {iframeLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Loading dashboard...
                    </p>
                    {showSlowWarning && (
                      <p className="text-xs text-muted-foreground mt-3 max-w-sm text-center px-4">
                        If the dashboard isn't loading, make sure you're using a
                        'Publish to web' embed URL from Power BI, not a regular
                        report URL.
                      </p>
                    )}
                  </div>
                )}
                {iframeError && (
                  <div
                    data-ocid="powerbi.error_state"
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/90 text-center px-8"
                  >
                    <p className="font-semibold text-foreground mb-2">
                      Dashboard failed to load
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Make sure you're using a 'Publish to web' embed URL. Use
                      the{" "}
                      <button
                        type="button"
                        className="text-primary underline"
                        onClick={handleOpenInTab}
                      >
                        Open in new tab
                      </button>{" "}
                      option as a fallback.
                    </p>
                  </div>
                )}
                <iframe
                  src={activeUrl}
                  className="w-full h-full min-h-[400px]"
                  title="Power BI Dashboard"
                  allowFullScreen
                  frameBorder="0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                />
              </motion.div>
            ) : (
              <div
                data-ocid="powerbi.empty_state"
                className="flex flex-col items-center justify-center h-full min-h-[350px] rounded-xl border-2 border-dashed border-border text-center p-10"
              >
                <LayoutDashboard className="w-14 h-14 text-muted-foreground/40 mb-4" />
                <p className="font-display font-semibold text-foreground mb-2">
                  No Dashboard Loaded
                </p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Paste your Power BI embed URL above and click{" "}
                  <strong>Load Dashboard</strong> to view your report here.
                </p>
                <div className="mt-4 p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground font-mono">
                  Example: https://app.powerbi.com/view?r=eyJ...
                </div>
                <p className="mt-3 text-xs text-muted-foreground max-w-sm">
                  <strong className="text-foreground">Tip:</strong> Use{" "}
                  <em>File → Embed report → Publish to web</em> in Power BI to
                  get an embeddable URL.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Saved reports sidebar */}
        <div className="w-72 flex-shrink-0 border-l border-border bg-card hidden lg:flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Saved Reports ({reports.length})
            </p>
          </div>
          <ScrollArea className="flex-1">
            {reports.length === 0 ? (
              <div
                data-ocid="saved.powerbi.empty_state"
                className="flex flex-col items-center justify-center h-40 text-center px-4"
              >
                <p className="text-xs text-muted-foreground">
                  No saved reports yet.
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {reports.map((report, i) => (
                  <div
                    key={report.id}
                    data-ocid={`saved.item.${i + 1}`}
                    className="group rounded-lg border border-border bg-background p-3 hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {report.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {report.embedUrl.slice(0, 40)}...
                        </p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs flex-1 text-primary hover:bg-primary/10"
                        onClick={() => handleLoadSaved(report)}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" /> Load
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-ocid={`saved.delete.button.${i + 1}`}
                        className="h-7 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(report.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      <Separator />
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
    </div>
  );
}
