import React, { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Bot, FileText, TrendingUp, LayoutDashboard, ArrowRight } from "lucide-react";

const tabs = [
  { id: "ai", label: "OneAI", icon: Bot },
  { id: "note", label: "OneNote", icon: FileText },
  { id: "crypto", label: "OneCrypto", icon: TrendingUp },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
] as const;

type TabId = (typeof tabs)[number]["id"];

/* ── AI Chat Demo ── */
function AiChatDemo() {
  const messages = [
    { role: "user", text: "Summarize my notes from last week's sprint." },
    { role: "ai", text: "Here's a summary: You completed 7 tasks, flagged 2 blockers, and made a Decision Log entry about the auth refactor. Energy was ↑ on Tuesday, ↓ on Thursday — consider protecting your deep-work mornings.", delay: 600 },
    { role: "user", text: "Create a follow-up task for the auth refactor." },
    { role: "ai", text: "Done — task created: \"Finalize auth refactor\" tagged #decision #sprint.", delay: 500 },
  ];

  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (shown >= messages.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 400 : (messages[shown]?.delay ?? 600));
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5 h-full">
      <AnimatePresence>
        {messages.slice(0, shown).map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-indigo-500/20 text-white/90 rounded-tr-sm"
                  : "bg-white/5 text-white/70 rounded-tl-sm border border-white/8"
              }`}
            >
              {m.text}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {shown < messages.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-1 px-2"
        >
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              className="w-1.5 h-1.5 rounded-full bg-indigo-400/60 animate-bounce"
              style={{ animationDelay: `${d * 0.15}s` }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

/* ── OneNote Demo ── */
function NoteDemo() {
  const blocks = [
    { type: "h1", content: "Sprint 12 — Decision Log", delay: 0 },
    { type: "decision", content: "✅ Decision: Migrate auth to custom oneapp_users", delay: 200 },
    { type: "text", content: "Rationale: reduces Supabase dependency, enables future SSO.", delay: 400 },
    { type: "idea", content: "💡 Idea: add energy tracking per session to route tasks by mood", delay: 600 },
    { type: "task", content: "☐  Finalize migration plan by Friday", delay: 800 },
  ];

  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= blocks.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), 300 + shown * 120);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <div className="flex flex-col gap-2 p-4 sm:p-5 h-full font-mono">
      <AnimatePresence>
        {blocks.slice(0, shown).map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`text-xs sm:text-sm leading-relaxed ${
              b.type === "h1"
                ? "text-white font-bold text-base sm:text-lg font-sans"
                : b.type === "decision"
                ? "text-emerald-400/80"
                : b.type === "idea"
                ? "text-amber-400/80"
                : b.type === "task"
                ? "text-indigo-300/80"
                : "text-white/50"
            }`}
          >
            {b.content}
          </motion.div>
        ))}
      </AnimatePresence>
      {shown < blocks.length && (
        <span className="w-[2px] h-4 bg-indigo-400 inline-block animate-pulse mt-1" />
      )}
    </div>
  );
}

/* ── OneCrypto Demo ── */
function CryptoDemo() {
  const tickers = [
    { sym: "BTC", price: "67,420", change: "+2.4%", up: true },
    { sym: "ETH", price: "3,812", change: "+1.8%", up: true },
    { sym: "SOL", price: "142", change: "-0.9%", up: false },
    { sym: "BNB", price: "598", change: "+0.5%", up: true },
  ];

  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= tickers.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), 250);
    return () => clearTimeout(t);
  }, [shown]);

  const chartPoints = "M0,60 L20,52 L40,55 L60,40 L80,45 L100,30 L120,35 L140,20 L160,25 L180,15 L200,18";

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5 h-full">
      {/* Mini chart */}
      <div className="relative h-20 sm:h-24">
        <svg viewBox="0 0 200 70" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(99,102,241,0.3)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0)" />
            </linearGradient>
          </defs>
          <motion.path
            d={`${chartPoints} L200,70 L0,70 Z`}
            fill="url(#chartGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <motion.polyline
            points={chartPoints}
            fill="none"
            stroke="rgba(99,102,241,0.8)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute top-1 right-1 text-[10px] text-emerald-400 font-medium">+18.4% this week</span>
      </div>

      {/* Tickers */}
      <div className="space-y-2">
        {tickers.slice(0, shown).map((t, i) => (
          <motion.div
            key={t.sym}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between py-1.5 border-b border-white/5"
          >
            <span className="text-xs font-bold text-white/80 w-10">{t.sym}</span>
            <span className="text-xs text-white/60">${t.price}</span>
            <span className={`text-xs font-medium ${t.up ? "text-emerald-400" : "text-red-400"}`}>
              {t.change}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Dashboard Demo ── */
function DashboardDemo() {
  const widgets = [
    { label: "Tasks Today", value: "7 / 12", w: "col-span-1", color: "indigo" },
    { label: "AI Queries", value: "34", w: "col-span-1", color: "blue" },
    { label: "Note Activity", value: "Active sprint", w: "col-span-2", color: "violet" },
    { label: "Portfolio", value: "+4.2%", w: "col-span-1", color: "emerald" },
    { label: "Uptime", value: "99.9%", w: "col-span-1", color: "sky" },
  ];

  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= widgets.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), 200);
    return () => clearTimeout(t);
  }, [shown]);

  const colorMap: Record<string, string> = {
    indigo: "border-indigo-500/30 bg-indigo-500/5",
    blue: "border-blue-500/30 bg-blue-500/5",
    violet: "border-violet-500/30 bg-violet-500/5",
    emerald: "border-emerald-500/30 bg-emerald-500/5",
    sky: "border-sky-500/30 bg-sky-500/5",
  };

  return (
    <div className="p-4 sm:p-5 h-full">
      <div className="grid grid-cols-2 gap-2 h-full auto-rows-fr">
        {widgets.slice(0, shown).map((w, i) => (
          <motion.div
            key={w.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`${w.w} rounded-lg border p-3 flex flex-col justify-between ${colorMap[w.color]}`}
          >
            <span className="text-[10px] text-white/40 uppercase tracking-wider">{w.label}</span>
            <span className="text-sm sm:text-base font-bold text-white/80">{w.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const demoComponents: Record<TabId, React.ComponentType> = {
  ai: AiChatDemo,
  note: NoteDemo,
  crypto: CryptoDemo,
  dashboard: DashboardDemo,
};

export function FeatureDemoSection() {
  const [activeTab, setActiveTab] = useState<TabId>("ai");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const DemoComponent = demoComponents[activeTab];

  return (
    <section ref={ref} className="relative py-20 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-8 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)" }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10 sm:mb-14"
        >
          <p className="text-indigo-400 text-xs sm:text-sm tracking-[0.2em] uppercase font-medium mb-3">
            See it in action
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Everything you need,{" "}
            <span className="text-gradient-brand">one place</span>
          </h2>
          <p className="text-white/50 text-sm sm:text-base max-w-xl mx-auto">
            Live previews of what's waiting inside.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Tab bar */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6 flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_16px_rgba(99,102,241,0.2)]"
                      : "text-white/40 hover:text-white/70 border border-white/5 hover:border-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Demo window */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden shadow-[0_0_60px_rgba(99,102,241,0.08)]">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
              </div>
              <span className="text-[10px] text-white/20 ml-2 font-mono">
                oneapp.app / {activeTab}
              </span>
            </div>

            {/* Demo content */}
            <div className="min-h-[260px] sm:min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-full"
                >
                  <DemoComponent />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <a
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-[0_0_24px_rgba(99,102,241,0.3)]"
            >
              Try it now
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
