import type { Section } from "@/App";
import { Button } from "@/components/ui/button";
import {
  loadPowerBIReports,
  loadPythonSnippets,
  loadSqlQueries,
} from "@/types";
import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { ArrowRight, BarChart2, Bookmark, Code2, Database } from "lucide-react";
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
}[] = [
  {
    id: "powerbi",
    label: "Power BI",
    desc: "Embed dashboards",
    icon: BarChart2,
    color: "text-yellow-400",
  },
  {
    id: "sql",
    label: "SQL Editor",
    desc: "Write & run queries",
    icon: Database,
    color: "text-primary",
  },
  {
    id: "python",
    label: "Python Console",
    desc: "Execute code snippets",
    icon: Code2,
    color: "text-green-400",
  },
  {
    id: "saved",
    label: "Saved Items",
    desc: "Browse your library",
    icon: Bookmark,
    color: "text-purple-400",
  },
];

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
  }[] = [
    {
      label: "Saved Queries",
      value: sqlCount,
      icon: Database,
      color: "text-primary",
    },
    {
      label: "Python Snippets",
      value: pythonCount,
      icon: Code2,
      color: "text-green-400",
    },
    {
      label: "Power BI Reports",
      value: biCount,
      icon: BarChart2,
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero 3D Section */}
      <div className="relative h-[520px] overflow-hidden hero-bg">
        <div className="absolute inset-0 bg-background/60" />
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
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6"
                data-ocid="dashboard.sql.button"
              >
                Open SQL Editor <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate("powerbi")}
                className="border-primary/40 text-primary hover:bg-primary/10 font-semibold px-6"
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="glass-card rounded-xl p-5 flex items-center gap-4 glow-cyan"
            >
              <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0">
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-foreground">
                  {value}
                </p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="font-display text-xl font-bold text-foreground mb-5">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map(({ id, label, desc, icon: Icon, color }, i) => (
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
              >
                <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="font-semibold text-foreground text-sm mb-1">
                  {label}
                </p>
                <p className="text-xs text-muted-foreground">{desc}</p>
                <ArrowRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </motion.button>
            ))}
          </div>
        </motion.div>

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
            },
            {
              title: "SQL Query Editor & Results",
              body: "Write, save, and run SQL queries in a professional code editor. View simulated results in a structured table.",
              badge: "SQL",
              badgeColor: "bg-primary/15 text-primary border-primary/30",
            },
            {
              title: "Python Code Console",
              body: "Write Python snippets, save your library, and simulate execution with formatted console output.",
              badge: "Python",
              badgeColor: "bg-green-500/15 text-green-400 border-green-500/30",
            },
          ].map(({ title, body, badge, badgeColor }) => (
            <div
              key={title}
              className="glass-card rounded-xl p-6 border border-border/60"
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
