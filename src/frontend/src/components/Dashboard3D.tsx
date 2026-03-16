import type { Section } from "@/App";
import { Button } from "@/components/ui/button";
import {
  loadPowerBIReports,
  loadPythonSnippets,
  loadSqlQueries,
} from "@/types";
import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ArrowRight,
  BarChart2,
  Bookmark,
  Clock,
  Code2,
  Database,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { Suspense, useRef } from "react";
import type { Mesh } from "three";

type IconComponent = React.ComponentType<{ className?: string }>;

function TorusKnotShape() {
  const meshRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.3;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });
  return (
    <mesh ref={meshRef} position={[-3, 0.5, -2]}>
      <torusKnotGeometry args={[0.7, 0.22, 100, 16]} />
      <meshStandardMaterial
        color="#00d4ff"
        wireframe={false}
        metalness={0.8}
        roughness={0.15}
        emissive="#003344"
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

function IcosahedronShape() {
  const meshRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.z += delta * 0.35;
    }
  });
  return (
    <mesh ref={meshRef} position={[3.5, -0.5, -1]}>
      <icosahedronGeometry args={[0.9, 0]} />
      <meshStandardMaterial
        color="#7c3aed"
        wireframe={false}
        metalness={0.9}
        roughness={0.1}
        emissive="#1a0040"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

function OctahedronShape() {
  const meshRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x += delta * 0.15;
    }
  });
  return (
    <mesh ref={meshRef} position={[0, -1.5, -3]}>
      <octahedronGeometry args={[0.8, 0]} />
      <meshStandardMaterial
        color="#06b6d4"
        wireframe
        metalness={0.7}
        roughness={0.2}
      />
    </mesh>
  );
}

function BoxShape() {
  const meshRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.25;
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.z += delta * 0.1;
    }
  });
  return (
    <mesh ref={meshRef} position={[1.5, 1.8, -2]}>
      <boxGeometry args={[0.7, 0.7, 0.7]} />
      <meshStandardMaterial
        color="#0ea5e9"
        wireframe
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

function Scene3D() {
  return (
    <>
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#00d4ff" />
      <pointLight position={[-5, -5, -5]} intensity={0.8} color="#7c3aed" />
      <directionalLight position={[0, 10, 0]} intensity={0.5} />
      <TorusKnotShape />
      <IcosahedronShape />
      <OctahedronShape />
      <BoxShape />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.4}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
}

const QUICK_ACTIONS: {
  id: Section;
  label: string;
  desc: string;
  icon: IconComponent;
  color: string;
  glowColor: string;
  gradientFrom: string;
}[] = [
  {
    id: "powerbi",
    label: "Power BI",
    desc: "Embed dashboards",
    icon: BarChart2,
    color: "text-yellow-400",
    glowColor: "rgba(234,179,8,0.3)",
    gradientFrom: "from-yellow-500/20",
  },
  {
    id: "sql",
    label: "SQL Editor",
    desc: "Write & run queries",
    icon: Database,
    color: "text-primary",
    glowColor: "rgba(0,212,255,0.3)",
    gradientFrom: "from-primary/20",
  },
  {
    id: "python",
    label: "Python Console",
    desc: "Execute code snippets",
    icon: Code2,
    color: "text-green-400",
    glowColor: "rgba(74,222,128,0.3)",
    gradientFrom: "from-green-500/20",
  },
  {
    id: "saved",
    label: "Saved Items",
    desc: "Browse your library",
    icon: Bookmark,
    color: "text-purple-400",
    glowColor: "rgba(167,139,250,0.3)",
    gradientFrom: "from-purple-500/20",
  },
];

const SPARKLINE_HEIGHTS = [30, 55, 40, 70, 50, 85, 60];

function MiniSparkline({ color }: { color: string }) {
  return (
    <div className="flex items-end gap-0.5 h-8">
      {SPARKLINE_HEIGHTS.map((h) => (
        <div
          key={h}
          className={`w-1.5 rounded-sm opacity-60 ${color}`}
          style={{ height: `${h}%`, background: "currentColor" }}
        />
      ))}
    </div>
  );
}

export default function Dashboard3D({
  onNavigate,
}: { onNavigate: (section: Section) => void }) {
  const sqlCount = loadSqlQueries().length;
  const pythonCount = loadPythonSnippets().length;
  const biCount = loadPowerBIReports().length;

  const STATS: {
    label: string;
    value: number;
    icon: IconComponent;
    color: string;
    bgGradient: string;
    sparkColor: string;
    maxVal: number;
  }[] = [
    {
      label: "Saved Queries",
      value: sqlCount,
      icon: Database,
      color: "text-primary",
      bgGradient: "from-primary/30 to-primary/10",
      sparkColor: "text-primary",
      maxVal: 20,
    },
    {
      label: "Python Snippets",
      value: pythonCount,
      icon: Code2,
      color: "text-green-400",
      bgGradient: "from-green-500/30 to-green-500/10",
      sparkColor: "text-green-400",
      maxVal: 20,
    },
    {
      label: "Power BI Reports",
      value: biCount,
      icon: BarChart2,
      color: "text-yellow-400",
      bgGradient: "from-yellow-500/30 to-yellow-500/10",
      sparkColor: "text-yellow-400",
      maxVal: 10,
    },
  ];

  const totalItems = sqlCount + pythonCount + biCount;

  return (
    <div className="min-h-screen">
      {/* Hero 3D Section */}
      <div className="relative h-[520px] overflow-hidden hero-bg">
        <div className="absolute inset-0 bg-background/60" />

        {/* Pulsing glow rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="absolute w-[500px] h-[500px] rounded-full animate-pulse"
            style={{
              background:
                "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
              animationDuration: "3s",
            }}
          />
          <div
            className="absolute w-[350px] h-[350px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
              animation: "pulse 4s ease-in-out infinite",
              animationDelay: "1s",
            }}
          />
          <div
            className="absolute w-[220px] h-[220px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 60%)",
              animation: "pulse 5s ease-in-out infinite",
              animationDelay: "2s",
            }}
          />
        </div>

        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 6], fov: 70 }}>
            <Suspense fallback={null}>
              <Scene3D />
            </Suspense>
          </Canvas>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-medium mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Professional Analytics Workspace
            </div>
            <h1
              className="font-display text-5xl md:text-7xl font-extrabold tracking-tight mb-2"
              style={{
                background:
                  "linear-gradient(135deg, #00d4ff 0%, #7c3aed 50%, #0ea5e9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontStyle: "italic",
                letterSpacing: "-0.02em",
                textShadow: "none",
              }}
            >
              Data-Analyst
            </h1>
            <p
              className="text-2xl md:text-3xl font-semibold mb-6 tracking-widest"
              style={{
                background:
                  "linear-gradient(90deg, #94a3b8 0%, #e2e8f0 50%, #94a3b8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontFamily: "'Georgia', serif",
                letterSpacing: "0.15em",
              }}
            >
              Narendra-Singh
            </p>
            <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-8 leading-relaxed">
              Your unified workspace for Power BI, SQL queries, and Python
              analytics — all in one powerful interface.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={() => onNavigate("sql")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 hover:scale-105 transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                data-ocid="dashboard.sql.button"
              >
                Open SQL Editor <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate("powerbi")}
                className="border-primary/40 text-primary hover:bg-primary/10 font-semibold px-6 hover:scale-105 transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:border-primary/70"
                data-ocid="dashboard.powerbi.button"
              >
                Load Power BI
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats + Quick Actions */}
      <div className="px-6 md:px-10 py-8">
        {/* Enhanced Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {STATS.map(
            ({
              label,
              value,
              icon: Icon,
              color,
              bgGradient,
              sparkColor,
              maxVal,
            }) => {
              const pct =
                maxVal > 0 ? Math.min((value / maxVal) * 100, 100) : 0;
              return (
                <div
                  key={label}
                  className="glass-card rounded-xl p-5 glow-cyan group hover:glow-cyan-strong transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bgGradient} border border-border/60 flex items-center justify-center flex-shrink-0 shadow-lg`}
                    >
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-3xl font-display font-bold text-foreground leading-none">
                        {value}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {label}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <MiniSparkline color={sparkColor} />
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +0 this week
                      </span>
                      <span className="text-muted-foreground">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-border/50 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${bgGradient.replace("from-", "from-")}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 1,
                          delay: 0.5,
                          ease: "easeOut",
                        }}
                        style={{ minWidth: pct === 0 ? "0px" : undefined }}
                      />
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </motion.div>

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="font-display text-xl font-bold text-foreground mb-5">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map(
              (
                { id, label, desc, icon: Icon, color, glowColor, gradientFrom },
                i,
              ) => (
                <motion.button
                  key={id}
                  type="button"
                  data-ocid={`dashboard.${id}.button`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate(id)}
                  className="glass-card rounded-xl p-5 text-left group hover:border-primary/40 transition-all duration-300 cursor-pointer"
                  style={
                    {
                      "--glow": glowColor,
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      `0 0 24px ${glowColor}, 0 4px 20px rgba(0,0,0,0.2)`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientFrom} to-transparent border border-border/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className="font-semibold text-foreground text-sm mb-1">
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                  <ArrowRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </motion.button>
              ),
            )}
          </div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10"
          data-ocid="dashboard.activity.section"
        >
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">
              Recent Activity
            </h2>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
              {totalItems} items
            </span>
          </div>

          {totalItems === 0 ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              data-ocid="dashboard.activity.empty_state"
            >
              {["SQL Query", "Python Snippet", "Power BI Report"].map(
                (type, i) => (
                  <div
                    key={type}
                    className="glass-card rounded-xl p-5 space-y-3"
                    data-ocid={`dashboard.activity.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted/30 animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-muted/40 rounded animate-pulse w-3/4" />
                        <div className="h-2.5 bg-muted/30 rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                    <div className="h-2 bg-muted/20 rounded animate-pulse w-full" />
                    <div className="h-2 bg-muted/15 rounded animate-pulse w-2/3" />
                    <p className="text-xs text-muted-foreground/50 pt-1">
                      No recent {type.toLowerCase()} activity
                    </p>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="glass-card rounded-xl divide-y divide-border/50">
              <p className="text-sm text-muted-foreground px-5 py-4">
                {totalItems} saved item{totalItems !== 1 ? "s" : ""} across all
                tools
              </p>
            </div>
          )}
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              title: "Embed Any Power BI Dashboard",
              body: "Paste your Power BI embed URL and instantly view your dashboards in a full-width iframe. Save and manage multiple reports.",
              badge: "Power BI",
              badgeColor:
                "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
              topBorderColor: "border-t-yellow-500/60",
            },
            {
              title: "SQL Query Editor & Results",
              body: "Write, save, and run SQL queries in a professional code editor. View results in a structured table with full SQLite support.",
              badge: "SQL",
              badgeColor: "bg-primary/15 text-primary border-primary/30",
              topBorderColor: "border-t-primary/60",
            },
            {
              title: "Python Code Console",
              body: "Write Python snippets, save your library, and execute code with real Pyodide runtime — full standard library support.",
              badge: "Python",
              badgeColor: "bg-green-500/15 text-green-400 border-green-500/30",
              topBorderColor: "border-t-green-500/60",
            },
          ].map(({ title, body, badge, badgeColor, topBorderColor }) => (
            <div
              key={title}
              className={`glass-card rounded-xl p-6 border border-border/60 border-t-2 ${topBorderColor} hover:glow-cyan transition-all duration-300`}
            >
              <span
                className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border mb-4 ${badgeColor}`}
              >
                {badge}
              </span>
              <h3 className="font-display font-bold text-foreground text-base mb-2">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      <footer className="px-6 md:px-10 py-6 border-t border-border mt-6">
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
