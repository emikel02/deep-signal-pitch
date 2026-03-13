import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────
const C = {
  bg: "#050a14",
  bgAlt: "#080e1c",
  card: "#0a1628",
  border: "#1a2d4d",
  blue: "#3b82f6",
  blueGlow: "#2563eb",
  cyan: "#06b6d4",
  gold: "#f59e0b",
  goldGlow: "#d97706",
  green: "#10b981",
  greenGlow: "#059669",
  purple: "#8b5cf6",
  red: "#ef4444",
  white: "#f8fafc",
  gray: "#94a3b8",
  grayDim: "#475569",
  grayDark: "#1e293b",
};

// ─── UTILITIES ───────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function AnimNum({ target, prefix = "", suffix = "", duration = 2200, delay = 0, decimals = 0 }) {
  const [val, setVal] = useState(0);
  const [ref, inView] = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    let rafId;
    const t = setTimeout(() => {
      const start = Date.now();
      const step = () => {
        const p = Math.min((Date.now() - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        setVal(parseFloat((target * ease).toFixed(decimals)));
        if (p < 1) rafId = requestAnimationFrame(step);
      };
      step();
    }, delay);
    return () => { clearTimeout(t); if (rafId) cancelAnimationFrame(rafId); };
  }, [inView, target, duration, delay, decimals]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ─── REUSABLE COMPONENTS ─────────────────────────────────────
function GlowOrb({ color, size, top, left, opacity = 0.1 }) {
  return (
    <div style={{
      position: "absolute", top, left, width: size, height: size,
      borderRadius: "50%", background: color, filter: `blur(${parseInt(size) / 2}px)`,
      opacity, pointerEvents: "none", zIndex: 0,
    }} />
  );
}

function Section({ children, style, delay = 0 }) {
  const [ref, vis] = useInView(0.08);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(50px)",
      transition: `all 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      ...style,
    }}>{children}</div>
  );
}

function Pill({ text, color = C.blue, large = false }) {
  return (
    <span style={{
      display: "inline-block",
      padding: large ? "6px 20px" : "4px 14px",
      borderRadius: 24,
      background: color + "18",
      border: `1px solid ${color}50`,
      color,
      fontSize: large ? 14 : 12,
      fontWeight: 700,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    }}>{text}</span>
  );
}

function SectionHeader({ pill, pillColor, title, subtitle }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 48 }}>
      <Pill text={pill} color={pillColor} />
      <h2 style={{
        fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, marginTop: 16,
        letterSpacing: -1.5, lineHeight: 1.15, color: C.white,
      }}>{title}</h2>
      {subtitle && (
        <p style={{
          fontSize: "clamp(15px, 1.8vw, 18px)", color: C.gray, maxWidth: 640,
          margin: "16px auto 0", lineHeight: 1.65,
        }}>{subtitle}</p>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color = C.blue, icon }) {
  return (
    <div style={{
      background: `linear-gradient(145deg, ${C.card}, ${color}06)`,
      border: `1px solid ${color}30`,
      borderRadius: 20, padding: "32px 24px", textAlign: "center",
      position: "relative", overflow: "hidden", flex: "1 1 200px", minWidth: 185,
      transition: "transform 0.3s, box-shadow 0.3s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${color}15`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{
        position: "absolute", top: -40, right: -40, width: 100, height: 100,
        borderRadius: "50%", background: color, opacity: 0.05, filter: "blur(25px)",
      }} />
      {icon && <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.9 }}>{icon}</div>}
      <div style={{
        fontSize: 11, color: C.gray, fontWeight: 600, letterSpacing: 1.2,
        marginBottom: 10, textTransform: "uppercase",
      }}>{label}</div>
      <div style={{
        fontSize: "clamp(32px, 4vw, 42px)", fontWeight: 900, color: C.white,
        letterSpacing: -1.5, lineHeight: 1, marginBottom: 8,
      }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

// ─── PARTICLE BACKGROUND ─────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        color: [C.blue, C.cyan, C.gold, C.purple, C.green][Math.floor(Math.random() * 5)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + "40";
        ctx.fill();
      });
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = C.blue + Math.floor((1 - dist / 120) * 20).toString(16).padStart(2, "0");
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0, opacity: 0.6,
    }} />
  );
}

// ─── LIVE HIRING DEMO ────────────────────────────────────────
function LiveHiringDemo() {
  const [step, setStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => setStep(s => (s + 1) % 6), 3500);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const steps = [
    {
      title: "Choose a Role",
      desc: "Sarah picks 'Sales Coordinator' from 500+ templates",
      visual: (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {["Executive Assistant", "Sales Coordinator", "Billing Admin", "Customer Service", "Ops Manager", "Marketing"].map((r, i) => (
            <div key={i} style={{
              padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: i === 1 ? C.blue + "25" : C.grayDark,
              border: `1px solid ${i === 1 ? C.blue : C.border}`,
              color: i === 1 ? C.blue : C.gray,
              transform: i === 1 ? "scale(1.08)" : "scale(1)",
              transition: "all 0.4s",
              boxShadow: i === 1 ? `0 0 20px ${C.blue}30` : "none",
            }}>{r}</div>
          ))}
        </div>
      ),
    },
    {
      title: "Connect Tools",
      desc: "Standard OAuth — same logins the team already uses",
      visual: (
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { name: "Gmail", icon: "📧", connected: true },
            { name: "Slack", icon: "💬", connected: true },
            { name: "HubSpot", icon: "📊", connected: true },
            { name: "Calendar", icon: "📅", connected: false },
            { name: "Drive", icon: "📁", connected: false },
          ].map((t, i) => (
            <div key={i} style={{
              width: 80, padding: "14px 8px", borderRadius: 14, textAlign: "center",
              background: t.connected ? C.green + "12" : C.grayDark,
              border: `1px solid ${t.connected ? C.green + "50" : C.border}`,
              transition: "all 0.4s",
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{t.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.connected ? C.green : C.gray }}>{t.name}</div>
              {t.connected && <div style={{ fontSize: 10, color: C.green, marginTop: 4 }}>Connected</div>}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Set Permissions",
      desc: "Like hiring a junior vs. senior — you decide the authority level",
      visual: (
        <div style={{ maxWidth: 340, margin: "0 auto" }}>
          {[
            { label: "Email", level: "Send on behalf", pct: 100 },
            { label: "Calendar", level: "Schedule events", pct: 66 },
            { label: "Spending", level: "Flag for review", pct: 33 },
          ].map((p, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{p.label}</span>
                <span style={{ fontSize: 12, color: C.cyan, fontWeight: 600 }}>{p.level}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: C.grayDark }}>
                <div style={{
                  height: "100%", borderRadius: 3, width: `${p.pct}%`,
                  background: `linear-gradient(90deg, ${C.blue}, ${C.cyan})`,
                  transition: "width 0.8s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Define Daily Tasks",
      desc: "Pre-populated from battle-tested playbooks, fully customizable",
      visual: (
        <div style={{ maxWidth: 380, margin: "0 auto" }}>
          {[
            { task: "Check email & draft responses", checked: true },
            { task: "Qualify new inbound leads", checked: true },
            { task: "Update CRM with latest info", checked: true },
            { task: "Send daily briefing at 8am", checked: true },
            { task: "Follow up on outstanding items", checked: false },
          ].map((t, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              borderRadius: 10, marginBottom: 6,
              background: t.checked ? C.blue + "08" : "transparent",
              border: `1px solid ${t.checked ? C.blue + "20" : "transparent"}`,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                background: t.checked ? C.blue : "transparent",
                border: `2px solid ${t.checked ? C.blue : C.grayDim}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: C.white,
              }}>{t.checked ? "✓" : ""}</div>
              <span style={{ fontSize: 13, color: t.checked ? C.white : C.gray }}>{t.task}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Deploy",
      desc: "Your AI employee starts working within minutes",
      visual: (
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 16,
            padding: "20px 32px", borderRadius: 20,
            background: `linear-gradient(135deg, ${C.green}15, ${C.cyan}10)`,
            border: `1px solid ${C.green}40`,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.green}, ${C.cyan})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, boxShadow: `0 0 30px ${C.green}40`,
            }}>✓</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.white }}>Sales Coordinator</div>
              <div style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>Deployed & Working</div>
              <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>$499/mo — starts immediately</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Results Dashboard",
      desc: "Real-time visibility into what your AI employee is doing",
      visual: (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { label: "Emails Handled", val: "147", color: C.blue },
            { label: "Leads Qualified", val: "23", color: C.cyan },
            { label: "Meetings Booked", val: "8", color: C.gold },
            { label: "Hours Saved", val: "87", color: C.green },
          ].map((m, i) => (
            <div key={i} style={{
              padding: "16px 20px", borderRadius: 14, textAlign: "center",
              background: m.color + "08", border: `1px solid ${m.color}25`, minWidth: 100,
            }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: m.color }}>{m.val}</div>
              <div style={{ fontSize: 11, color: C.gray, fontWeight: 500, marginTop: 4 }}>{m.label}</div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div style={{
      background: C.card, borderRadius: 24, overflow: "hidden",
      border: `1px solid ${C.border}`, position: "relative",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "16px 24px", borderBottom: `1px solid ${C.border}`,
        background: C.bgAlt,
      }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: C.red, opacity: 0.8 }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: C.gold, opacity: 0.8 }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: C.green, opacity: 0.8 }} />
        <div style={{
          flex: 1, textAlign: "center", fontSize: 12, color: C.grayDim, fontWeight: 500,
        }}>app.deepsignal.ai/hire</div>
      </div>

      {/* Step indicators */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 6, padding: "20px 24px 0",
      }}>
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => { setStep(i); setAutoPlay(false); }}
            style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
              border: `1px solid ${i === step ? C.blue : C.border}`,
              background: i === step ? C.blue + "20" : "transparent",
              color: i === step ? C.blue : C.grayDim,
              cursor: "pointer", transition: "all 0.3s",
              letterSpacing: 0.5,
            }}
          >
            {`0${i + 1}`}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div style={{ padding: "28px 32px 36px", minHeight: 280 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: C.white, marginBottom: 6 }}>
            {steps[step].title}
          </h3>
          <p style={{ fontSize: 14, color: C.gray }}>{steps[step].desc}</p>
        </div>
        <div style={{ transition: "opacity 0.4s", opacity: 1 }}>
          {steps[step].visual}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: C.grayDark }}>
        <div style={{
          height: "100%", width: `${((step + 1) / steps.length) * 100}%`,
          background: `linear-gradient(90deg, ${C.blue}, ${C.cyan}, ${C.gold})`,
          transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );
}

// ─── BEFORE / AFTER COMPARISON ───────────────────────────────
function BeforeAfter() {
  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
      {/* Before */}
      <div style={{
        flex: "1 1 300px", maxWidth: 440, borderRadius: 20, overflow: "hidden",
        border: `1px solid ${C.red}30`, background: C.card,
      }}>
        <div style={{
          padding: "16px 24px", background: C.red + "12",
          borderBottom: `1px solid ${C.red}20`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: C.red, textTransform: "uppercase" }}>
            Without Deep Signal
          </div>
        </div>
        <div style={{ padding: "24px" }}>
          {[
            { text: "Post job listing, wait 2-4 weeks", icon: "⏳" },
            { text: "Screen 50+ resumes", icon: "📄" },
            { text: "Interview 5-8 candidates", icon: "🗣️" },
            { text: "Hire, train for 2-4 weeks", icon: "📚" },
            { text: "Pay $45-65K/yr + benefits", icon: "💸" },
            { text: "Employee quits after 8 months", icon: "🚪" },
            { text: "Start over", icon: "🔄" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
              borderBottom: i < 6 ? `1px solid ${C.border}` : "none",
            }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 14, color: C.gray, lineHeight: 1.4 }}>{item.text}</span>
            </div>
          ))}
          <div style={{
            marginTop: 20, padding: "14px 18px", borderRadius: 12,
            background: C.red + "10", border: `1px solid ${C.red}20`,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 11, color: C.red, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Total Cost</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.red }}>$65,000+/yr</div>
            <div style={{ fontSize: 12, color: C.gray }}>+ 6-8 weeks to get started</div>
          </div>
        </div>
      </div>

      {/* After */}
      <div style={{
        flex: "1 1 300px", maxWidth: 440, borderRadius: 20, overflow: "hidden",
        border: `1px solid ${C.green}30`, background: C.card,
      }}>
        <div style={{
          padding: "16px 24px", background: C.green + "12",
          borderBottom: `1px solid ${C.green}20`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: C.green, textTransform: "uppercase" }}>
            With Deep Signal
          </div>
        </div>
        <div style={{ padding: "24px" }}>
          {[
            { text: "Pick a role from proven templates", icon: "✅", time: "2 min" },
            { text: "Connect your existing tools", icon: "🔗", time: "5 min" },
            { text: "Set permissions & tasks", icon: "⚙️", time: "10 min" },
            { text: "Deploy — AI starts working", icon: "🚀", time: "Instant" },
            { text: "Works 24/7, never calls in sick", icon: "💪", time: "Always" },
            { text: "Gets smarter every single day", icon: "🧠", time: "Forever" },
            { text: "Add more AI employees anytime", icon: "📈", time: "Minutes" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
              borderBottom: i < 6 ? `1px solid ${C.border}` : "none",
            }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 14, color: C.white, lineHeight: 1.4, flex: 1 }}>{item.text}</span>
              <span style={{ fontSize: 11, color: C.green, fontWeight: 700, whiteSpace: "nowrap" }}>{item.time}</span>
            </div>
          ))}
          <div style={{
            marginTop: 20, padding: "14px 18px", borderRadius: 12,
            background: C.green + "10", border: `1px solid ${C.green}20`,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 11, color: C.green, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Total Cost</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.green }}>$3,600–12,000/yr</div>
            <div style={{ fontSize: 12, color: C.gray }}>Working in under 30 minutes</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TRACTION PROOF ──────────────────────────────────────────
function TractionCards() {
  const clients = [
    {
      name: "PayDiverse",
      industry: "High-Risk Payments",
      contract: "$90–100K",
      result: "Compressed 11-step pre-vet process to 3 steps",
      detail: "15+ disconnected tools unified. Multi-agent AI workforce managing merchant onboarding, compliance, vendor communication.",
      color: C.blue,
      monthly: "$3–4.5K/mo ongoing",
    },
    {
      name: "FHIA",
      industry: "Insurance",
      contract: "$30K",
      result: "Built AI proposal system in 2 weeks vs. 6-12 months",
      detail: "AI-powered proposal management + outbound infrastructure. Expanding to full operations management.",
      color: C.cyan,
      monthly: "+ expansion add-ons",
    },
  ];

  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
      {clients.map((c, i) => (
        <div key={i} style={{
          flex: "1 1 340px", maxWidth: 480, borderRadius: 20, overflow: "hidden",
          background: C.card, border: `1px solid ${c.color}25`,
          position: "relative",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, transparent, ${c.color}, transparent)`,
          }} />
          <div style={{ padding: "28px 28px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.white }}>{c.name}</div>
                <div style={{ fontSize: 12, color: c.color, fontWeight: 600, marginTop: 2 }}>{c.industry}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: c.color }}>{c.contract}</div>
                <div style={{ fontSize: 11, color: C.gray }}>{c.monthly}</div>
              </div>
            </div>
            <div style={{
              padding: "14px 16px", borderRadius: 12, marginBottom: 14,
              background: c.color + "08", border: `1px solid ${c.color}15`,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.white, lineHeight: 1.5 }}>{c.result}</div>
            </div>
            <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.65 }}>{c.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── COMPARABLE COMPANIES ────────────────────────────────────
function CompTable() {
  const comps = [
    { name: "Rippling", desc: "HR + IT for human employees", val: "$13.5B", gap: "Can't deploy AI employees", color: C.blue },
    { name: "Shopify", desc: "Anyone can open a store", val: "$100B+", gap: "Commerce only, no operations AI", color: C.green },
    { name: "Deel", desc: "Self-serve global hiring", val: "$12B", gap: "Humans only, no AI workforce", color: C.purple },
    { name: "Cursor", desc: "AI layer on open-source", val: "$10B+", gap: "Developers only, not business ops", color: C.cyan },
    { name: "Zapier", desc: "No-code automations", val: "$5B", gap: "Workflows, not intelligent agents", color: C.gold },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
        {comps.map((c, i) => (
          <div key={i} style={{
            flex: "1 1 160px", maxWidth: 200, padding: "22px 16px",
            borderRadius: 16, background: C.card, border: `1px solid ${c.color}20`,
            textAlign: "center", transition: "transform 0.3s",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: 24, fontWeight: 900, color: c.color, marginBottom: 4 }}>{c.val}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.white, marginBottom: 4 }}>{c.name}</div>
            <div style={{ fontSize: 11, color: C.gray, lineHeight: 1.4, marginBottom: 6 }}>{c.desc}</div>
            <div style={{ fontSize: 10, color: C.red, fontWeight: 600, opacity: 0.8 }}>{c.gap}</div>
          </div>
        ))}
      </div>

      {/* Gumloop comparison — the closest analog */}
      <div style={{
        padding: "28px 32px", borderRadius: 20, marginBottom: 24,
        background: `linear-gradient(135deg, ${C.purple}0a, ${C.cyan}06)`,
        border: `1px solid ${C.purple}25`, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${C.purple}, ${C.cyan})`,
        }} />
        <div style={{ fontSize: 11, fontWeight: 800, color: C.purple, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>
          Closest Analog: Gumloop — $50M from Benchmark (March 2025)
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {/* Gumloop side */}
          <div style={{
            flex: "1 1 260px", padding: "20px", borderRadius: 16,
            background: C.card, border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.gray, marginBottom: 12 }}>Gumloop</div>
            {[
              { label: "Model", val: "Builder tool — you build your own agents", color: C.grayDim },
              { label: "Audience", val: "Enterprise technical teams", color: C.grayDim },
              { label: "Network Effects", val: "None — single-tenant, no data flywheel", color: C.red },
              { label: "Moat", val: "Features only — can be cloned", color: C.red },
            ].map((r, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.grayDim, letterSpacing: 1, textTransform: "uppercase" }}>{r.label}</div>
                <div style={{ fontSize: 13, color: r.color, fontWeight: 600, lineHeight: 1.4 }}>{r.val}</div>
              </div>
            ))}
          </div>
          {/* Deep Signal side */}
          <div style={{
            flex: "1 1 260px", padding: "20px", borderRadius: 16,
            background: `linear-gradient(145deg, ${C.card}, ${C.gold}06)`,
            border: `1px solid ${C.gold}30`,
          }}>
            <div style={{
              fontSize: 16, fontWeight: 800, marginBottom: 12,
              background: `linear-gradient(135deg, ${C.gold}, ${C.white})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Deep Signal</div>
            {[
              { label: "Model", val: "Marketplace — hire pre-built AI employees", color: C.white },
              { label: "Audience", val: "33M SMBs, any skill level", color: C.white },
              { label: "Network Effects", val: "Every deployment improves all templates", color: C.green },
              { label: "Moat", val: "Data + playbooks + marketplace supply", color: C.green },
            ].map((r, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: 1, textTransform: "uppercase" }}>{r.label}</div>
                <div style={{ fontSize: 13, color: r.color, fontWeight: 600, lineHeight: 1.4 }}>{r.val}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          marginTop: 16, padding: "12px 20px", borderRadius: 12,
          background: C.gold + "08", border: `1px solid ${C.gold}15`, textAlign: "center",
        }}>
          <span style={{ fontSize: 13, color: C.gray }}>
            Benchmark valued the <span style={{ color: C.white, fontWeight: 700 }}>builder tool</span> at $50M+.{" "}
            The <span style={{ color: C.gold, fontWeight: 700 }}>marketplace with network effects</span> is a fundamentally bigger business.
          </span>
        </div>
      </div>

      {/* The punchline */}
      <div style={{
        padding: "32px 36px", borderRadius: 20, textAlign: "center",
        background: `linear-gradient(135deg, ${C.gold}0a, ${C.blue}08)`,
        border: `1px solid ${C.gold}30`, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${C.blue}, ${C.gold})`,
        }} />
        <div style={{ fontSize: 14, color: C.gray, marginBottom: 6 }}>
          They built platforms for <span style={{ color: C.white, fontWeight: 700 }}>human work</span> or <span style={{ color: C.white, fontWeight: 700 }}>technical users</span>
        </div>
        <div style={{
          fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 900, lineHeight: 1.3, marginBottom: 12,
          background: `linear-gradient(135deg, ${C.gold}, ${C.white})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          We're building the first marketplace where anyone hires AI.
        </div>
        <div style={{ fontSize: 13, color: C.gray, maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>
          Gumloop lets engineers build agents. We let a dentist's office, a law firm, or an insurance company
          hire an AI employee in 30 minutes — no technical skill required. <span style={{ color: C.gold, fontWeight: 700 }}>That's the gap nobody else is filling.</span>
        </div>
      </div>
    </div>
  );
}

// ─── FLYWHEEL VISUAL ─────────────────────────────────────────
function FlywheelRing() {
  const nodes = [
    { label: "More Businesses", icon: "🏢", color: C.blue },
    { label: "More Data", icon: "📊", color: C.cyan },
    { label: "Better Templates", icon: "⚡", color: C.gold },
    { label: "More Builders", icon: "🔨", color: C.purple },
    { label: "More Integrations", icon: "🔗", color: C.green },
    { label: "Lower CAC", icon: "📉", color: C.blue },
  ];

  const radius = 130;

  return (
    <div style={{ position: "relative", width: 320, height: 320, margin: "0 auto" }}>
      {/* Center */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: 90, height: 90, borderRadius: "50%",
        background: `linear-gradient(135deg, ${C.blue}25, ${C.gold}25)`,
        border: `2px solid ${C.blue}40`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", zIndex: 2,
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: C.gold, letterSpacing: 1, textTransform: "uppercase" }}>THE</div>
        <div style={{ fontSize: 12, fontWeight: 900, color: C.white }}>MOAT</div>
      </div>

      {/* Spinning ring — uses CSS animation, no re-renders */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
        animation: "spin 120s linear infinite",
      }}>
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          <circle cx="160" cy="160" r={radius} fill="none" stroke={C.blue + "20"} strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* Nodes (counter-rotate so text stays readable) */}
      {nodes.map((n, i) => {
        const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
        const x = 160 + Math.cos(angle) * radius;
        const y = 160 + Math.sin(angle) * radius;
        return (
          <div key={i} style={{
            position: "absolute", left: x - 36, top: y - 30,
            width: 72, textAlign: "center", zIndex: 1,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", margin: "0 auto 4px",
              background: n.color + "20", border: `2px solid ${n.color}50`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, boxShadow: `0 0 15px ${n.color}20`,
            }}>{n.icon}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: n.color, lineHeight: 1.2 }}>{n.label}</div>
          </div>
        );
      })}

      {/* Arrow ring animation overlay */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: radius * 2 + 20, height: radius * 2 + 20,
        borderRadius: "50%",
        border: `2px dashed ${C.gold}15`,
        animation: "spin 60s linear infinite",
      }} />
    </div>
  );
}

// ─── THREE LAYERS VISUAL ─────────────────────────────────────
function ThreeLayers() {
  const [active, setActive] = useState(1);
  const layers = [
    {
      id: 0, tag: "LAYER 1", label: "Self-Serve Hosting", status: "Live Now",
      price: "$19–99/mo", role: "Top of Funnel",
      desc: "Managed AI agent instances. Sign up, get a working AI agent in minutes. Zero infrastructure, zero ops pain.",
      color: C.blue, target: "Solopreneurs & experimenters",
    },
    {
      id: 1, tag: "LAYER 2", label: "Hire an AI Employee", status: "Building Now",
      price: "$299–1,000/mo", role: "The Scale Play",
      desc: "Self-serve platform. Pick a role, connect tools, set permissions, deploy. TurboTax vs. CPA — same power, no consultant.",
      color: C.cyan, target: "Any business with operational roles",
    },
    {
      id: 2, tag: "LAYER 3", label: "Managed AI Workforce", status: "Live · Revenue",
      price: "$5–15K/mo", role: "Revenue Engine",
      desc: "Full-service. We audit operations, deploy multi-agent workforces, manage ongoing. Each engagement builds the playbook library.",
      color: C.gold, target: "$10–100M revenue companies",
    },
  ];

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
        {layers.map(l => (
          <button key={l.id} onClick={() => setActive(l.id)} style={{
            padding: "10px 24px", borderRadius: 14, fontSize: 13, fontWeight: 700,
            background: active === l.id ? l.color + "20" : C.grayDark,
            border: `1px solid ${active === l.id ? l.color + "60" : C.border}`,
            color: active === l.id ? l.color : C.grayDim,
            cursor: "pointer", transition: "all 0.3s",
          }}>
            {l.tag}
          </button>
        ))}
      </div>

      {/* Active layer card */}
      {layers.filter(l => l.id === active).map(l => (
        <div key={l.id} style={{
          borderRadius: 24, padding: "36px 32px",
          background: `linear-gradient(145deg, ${C.card}, ${l.color}08)`,
          border: `1px solid ${l.color}30`, position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, transparent, ${l.color}, transparent)`,
          }} />
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                <Pill text={l.status} color={l.color} />
                <span style={{
                  fontSize: 10, fontWeight: 800, color: l.color, letterSpacing: 1.5,
                  textTransform: "uppercase", background: l.color + "12",
                  padding: "4px 12px", borderRadius: 8,
                }}>{l.role}</span>
              </div>
              <h3 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 900, color: C.white, marginBottom: 8 }}>{l.label}</h3>
              <div style={{ fontSize: 20, fontWeight: 800, color: l.color, marginBottom: 16 }}>{l.price}</div>
              <p style={{ fontSize: 15, color: C.gray, lineHeight: 1.7, marginBottom: 16 }}>{l.desc}</p>
              <div style={{ fontSize: 13, color: C.grayDim }}>
                Target: <span style={{ color: C.white, fontWeight: 600 }}>{l.target}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Connection callout */}
      <div style={{
        marginTop: 20, textAlign: "center", padding: "16px 24px",
        borderRadius: 12, background: `linear-gradient(90deg, ${C.blue}08, ${C.cyan}08, ${C.gold}08)`,
        border: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: 14, color: C.gray }}>
          <span style={{ color: C.gold, fontWeight: 700 }}>Layer 3</span> builds playbooks →
          <span style={{ color: C.cyan, fontWeight: 700 }}> Layer 2</span> scales them →
          <span style={{ color: C.blue, fontWeight: 700 }}> Layer 1</span> acquires users →
          <span style={{ color: C.gold, fontWeight: 700 }}> Repeat</span>
        </span>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ─────────────────────────────────────────
// ═════════════════════════════════════════════════════════════
export default function DeepSignalPitchDeck() {
  return (
    <div style={{
      background: C.bg, color: C.white, minHeight: "100vh",
      fontFamily: "'Plus Jakarta Sans', -apple-system, 'Segoe UI', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, 'Segoe UI', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        ::selection { background: ${C.blue}40; color: ${C.white}; }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        button:focus-visible { box-shadow: 0 0 0 2px ${C.blue}60; outline: none; }
      `}</style>

      {/* Background particles */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}>
        <ParticleField />
      </div>

      {/* Ambient glow orbs */}
      <GlowOrb color={C.blueGlow} size="700px" top="-300px" left="-200px" opacity={0.07} />
      <GlowOrb color={C.purple} size="500px" top="20%" left="75%" opacity={0.04} />
      <GlowOrb color={C.goldGlow} size="500px" top="45%" left="-15%" opacity={0.04} />
      <GlowOrb color={C.cyan} size="600px" top="65%" left="60%" opacity={0.03} />
      <GlowOrb color={C.greenGlow} size="400px" top="85%" left="20%" opacity={0.04} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", position: "relative", zIndex: 1 }}>

        {/* ════════════════ HERO ════════════════ */}
        <Section style={{ paddingTop: 90, paddingBottom: 70, textAlign: "center" }}>
          <div style={{ marginBottom: 24 }}>
            <Pill text="Deep Signal" color={C.cyan} large />
          </div>
          <h1 style={{
            fontSize: "clamp(38px, 6vw, 72px)", fontWeight: 900, lineHeight: 1.02,
            letterSpacing: -3, maxWidth: 950, margin: "0 auto 28px",
            background: `linear-gradient(135deg, ${C.white}, ${C.blue}, ${C.cyan}, ${C.white})`,
            backgroundSize: "300% 300%",
            animation: "gradientShift 8s ease infinite",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            The First Marketplace Where Businesses Hire AI
          </h1>
          <p style={{
            fontSize: "clamp(17px, 2.2vw, 22px)", color: C.gray, maxWidth: 750,
            margin: "0 auto 40px", lineHeight: 1.65, fontWeight: 400,
          }}>
            OpenAI builds the brains. Businesses need the hands.
            We bridge the gap — the first platform where any company deploys AI employees
            that handle the busywork so your team can focus on what actually matters.{" "}
            <span style={{ color: C.gold, fontWeight: 700 }}>Replace roles or supercharge the ones you have.</span>
          </p>

          {/* Key stats row */}
          <div style={{
            display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap",
            marginBottom: 36,
          }}>
            {[
              { val: "$120K+", label: "Revenue Signed", color: C.green },
              { val: "90%", label: "Cost Reduction vs. Human Hire", color: C.cyan },
              { val: "<30 min", label: "From Sign-Up to AI Working", color: C.blue },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 900, color: s.color, letterSpacing: -1 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: C.gray, fontWeight: 600, letterSpacing: 0.5, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Pill row */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { t: "First to Market", c: C.blue },
              { t: "Revenue Generating", c: C.green },
              { t: "No Direct Competitor", c: C.gold },
              { t: "33M Businesses Waiting", c: C.cyan },
            ].map((p, i) => (
              <Pill key={i} text={p.t} color={p.c} />
            ))}
          </div>
        </Section>

        {/* ════════════════ THE PROBLEM ════════════════ */}
        <Section style={{ paddingBottom: 80 }}>
          <SectionHeader
            pill="The Problem"
            pillColor={C.red}
            title={<>The Deployment Gap Is a <span style={{ color: C.gold }}>$500 Billion</span> Problem</>}
            subtitle="AI can do the work today. But 87% of AI projects fail (McKinsey, 2024) — not because the technology doesn't work, but because nobody bridges the gap between AI capability and real-world business deployment."
          />
          <div style={{
            display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 32,
          }}>
            {[
              { stat: "33M", label: "US businesses need operational help", color: C.blue },
              { stat: "87%", label: "of AI implementations fail to launch", color: C.red },
              { stat: "$100-300K", label: "avg SMB back-office spend per year", color: C.gold },
              { stat: "0", label: "self-serve AI hiring marketplaces exist", color: C.cyan },
            ].map((s, i) => (
              <div key={i} style={{
                flex: "1 1 200px", maxWidth: 240, textAlign: "center",
                padding: "28px 20px", borderRadius: 20,
                background: C.card, border: `1px solid ${s.color}20`,
              }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: s.color, letterSpacing: -1.5, marginBottom: 8 }}>{s.stat}</div>
                <div style={{ fontSize: 13, color: C.gray, lineHeight: 1.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ════════════════ THE BRIDGE ════════════════ */}
        <Section style={{ paddingBottom: 80 }}>
          <SectionHeader
            pill="First to Market"
            pillColor={C.gold}
            title="We Bridge the Gap Nobody Else Is Filling"
            subtitle="OpenAI, Anthropic, and Google build intelligence. 33 million businesses need someone to deploy it. We're the missing layer."
          />

          {/* The Bridge Visual */}
          <div style={{
            position: "relative", padding: "40px 0", overflow: "hidden",
          }}>
            <div style={{ display: "flex", alignItems: "stretch", justifyContent: "center", gap: 0, flexWrap: "wrap" }}>
              {/* Left: AI Giants */}
              <div style={{
                flex: "1 1 240px", maxWidth: 300, padding: "28px 24px",
                borderRadius: 20, marginRight: -12,
                background: `linear-gradient(135deg, ${C.purple}12, ${C.blue}08)`,
                border: `1px solid ${C.purple}30`,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.purple, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>
                  AI Giants Build the Brains
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
                  {["OpenAI", "Anthropic", "Google", "Meta"].map((co, i) => (
                    <span key={i} style={{
                      padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: C.purple + "15", color: C.purple, border: `1px solid ${C.purple}25`,
                    }}>{co}</span>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.5 }}>
                  Brilliant models. Zero deployment infrastructure for SMBs.
                </div>
              </div>

              {/* Center: Deep Signal */}
              <div style={{
                flex: "0 0 auto", padding: "36px 32px", borderRadius: 20,
                background: `linear-gradient(180deg, ${C.gold}18, ${C.blue}12)`,
                border: `2px solid ${C.gold}50`, textAlign: "center",
                zIndex: 2, position: "relative",
                boxShadow: `0 0 60px ${C.gold}15, 0 0 120px ${C.blue}08`,
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 900, color: C.gold, letterSpacing: 2,
                  textTransform: "uppercase", marginBottom: 8,
                }}>The Bridge</div>
                <div style={{
                  fontSize: 24, fontWeight: 900, marginBottom: 8,
                  background: `linear-gradient(135deg, ${C.gold}, ${C.white})`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>Deep Signal</div>
                <div style={{ fontSize: 12, color: C.cyan, fontWeight: 600, marginBottom: 4 }}>
                  First AI Hiring Marketplace
                </div>
                <div style={{ fontSize: 11, color: C.gray }}>Deploy. Manage. Scale.</div>
              </div>

              {/* Right: SMBs */}
              <div style={{
                flex: "1 1 240px", maxWidth: 300, padding: "28px 24px",
                borderRadius: 20, marginLeft: -12,
                background: `linear-gradient(135deg, ${C.green}08, ${C.cyan}12)`,
                border: `1px solid ${C.green}30`,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.green, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>
                  33M Businesses Need the Hands
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
                  {["Law Firms", "Insurance", "Real Estate", "E-Commerce", "Healthcare", "Finance"].map((ind, i) => (
                    <span key={i} style={{
                      padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: C.green + "15", color: C.green, border: `1px solid ${C.green}25`,
                    }}>{ind}</span>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.5 }}>
                  Spending $500B+/yr on operations. Can't adopt AI alone.
                </div>
              </div>
            </div>
          </div>

          {/* Why Now callouts */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14, marginTop: 8,
          }}>
            {[
              { title: "LLM Costs Drop 10x/Year", desc: "What cost $50/day in 2024 costs $5 today and $0.50 next year. The economics are about to explode.", color: C.green, icon: "📉" },
              { title: "Enterprise Is Adopting", desc: "3M, Walmart, JPMorgan are spending billions. SMBs see it and want in — but have no on-ramp.", color: C.blue, icon: "🏗️" },
              { title: "Nobody Owns This Layer", desc: "Salesforce adds AI features. Zapier does automations. Gumloop lets engineers build agents. Nobody lets a business owner hire one. Different category entirely.", color: C.gold, icon: "🏆" },
              { title: "40% of Apps by 2027", desc: "Gartner says 40% of enterprise apps will have AI agents by end of 2026. The wave is here. We ride it first.", color: C.cyan, icon: "🌊" },
            ].map((w, i) => (
              <div key={i} style={{
                padding: "22px 18px", borderRadius: 16,
                background: C.card, border: `1px solid ${w.color}18`,
              }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{w.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: w.color, marginBottom: 6 }}>{w.title}</div>
                <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.55 }}>{w.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ════════════════ BEFORE / AFTER ════════════════ */}
        <Section style={{ paddingBottom: 80 }}>
          <SectionHeader
            pill="The Future Is Obvious"
            pillColor={C.green}
            title={<>Hire AI or <span style={{ color: C.cyan }}>Amplify Your Team</span> — Either Way, You Win</>}
            subtitle="Replace a $65K role entirely — or give your existing team AI-powered support that eliminates busywork and lets them focus on high-value decisions. Most clients do both."
          />
          <BeforeAfter />

          {/* Amplify callout */}
          <div style={{
            marginTop: 32, padding: "28px 32px", borderRadius: 20,
            background: `linear-gradient(135deg, ${C.cyan}0a, ${C.purple}08)`,
            border: `1px solid ${C.cyan}25`, position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, ${C.cyan}, ${C.purple})`,
            }} />
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
              <div style={{ flex: "1 1 300px", maxWidth: 480 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.cyan, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
                  It's Not Just Replacement
                </div>
                <div style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 900, color: C.white, lineHeight: 1.3, marginBottom: 12 }}>
                  Your best people are drowning in tasks beneath their talent.
                </div>
                <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.7 }}>
                  Your $85K operations manager spends 60% of their day on data entry, email triage, and scheduling.
                  Deep Signal handles that — so they can spend 100% of their time on strategy, relationships, and growth.
                  <span style={{ color: C.cyan, fontWeight: 700 }}> Same headcount. 3x the output.</span>
                </p>
              </div>
              <div style={{ flex: "0 0 auto", display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
                {[
                  { role: "Sales Rep", before: "40% selling", after: "90% selling", color: C.blue },
                  { role: "Ops Manager", before: "30% strategy", after: "85% strategy", color: C.gold },
                  { role: "Office Admin", before: "Overwhelmed", after: "Runs 3x more", color: C.green },
                ].map((r, i) => (
                  <div key={i} style={{
                    padding: "16px 18px", borderRadius: 14, width: 150, textAlign: "center",
                    background: C.card, border: `1px solid ${r.color}25`,
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: r.color, marginBottom: 8 }}>{r.role}</div>
                    <div style={{ fontSize: 11, color: C.red, marginBottom: 4, textDecoration: "line-through", opacity: 0.7 }}>{r.before}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{r.after}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ════════════════ LIVE DEMO ════════════════ */}
        <Section style={{ paddingBottom: 80 }}>
          <SectionHeader
            pill="The Product"
            pillColor={C.blue}
            title="See It In Action"
            subtitle="A business owner goes from 'I need help' to 'AI is working' in under 30 minutes."
          />
          <LiveHiringDemo />
        </Section>

        {/* ════════════════ THREE LAYERS ════════════════ */}
        <Section style={{ paddingBottom: 80 }}>
          <SectionHeader
            pill="Business Model"
            pillColor={C.gold}
            title="Three Layers, One Flywheel"
            subtitle="Each layer feeds the next. Managed services build the playbooks. The platform scales them. The marketplace creates the moat."
          />
          <ThreeLayers />
        </Section>

        {/* ════════════════ TRACTION ════════════════ */}
        <Section style={{ paddingBottom: 80 }}>
          <SectionHeader
            pill="Traction"
            pillColor={C.green}
            title="Real Revenue. Real Clients. Real Results."
          />
          <TractionCards />
          <div style={{
            textAlign: "center", marginTop: 28, padding: "16px 24px",
            borderRadius: 14, background: C.green + "08",
            border: `1px solid ${C.green}20`,
          }}>
            <span style={{ fontSize: 14, color: C.gray }}>
              Pipeline: <span style={{ color: C.green, fontWeight: 700 }}>$120K+ signed</span> —
              each client teaches us a vertical and produces a reusable playbook
            </span>
          </div>
        </Section>

        {/* ════════════════ FLYWHEEL ════════════════ */}
        <Section style={{ paddingBottom: 80 }}>
          <SectionHeader
            pill="First-Mover Moat"
            pillColor={C.green}
            title="The Earlier You Start, The Harder You Are to Catch"
            subtitle="Every deployment generates data no competitor has. Every playbook widens the lead. Every month of head start compounds into a moat that gets deeper, not shallower."
          />
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
            <FlywheelRing />
            <div style={{ flex: "1 1 300px", maxWidth: 420 }}>
              {[
                { title: "Deployment Data Moat", desc: "Every managed client generates role configuration data no competitor has.", color: C.blue },
                { title: "Integration Lock-In", desc: "5 tools connected + 3 AI employees running = massive switching cost.", color: C.cyan },
                { title: "Marketplace Supply Side", desc: "500 role builders won't rebuild on a competitor. Builders follow businesses.", color: C.gold },
                { title: "Institutional Knowledge", desc: "After 12 months, an AI employee knows the business better than any new hire.", color: C.green },
              ].map((d, i) => (
                <div key={i} style={{
                  display: "flex", gap: 14, marginBottom: 20, alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", background: d.color,
                    marginTop: 7, flexShrink: 0, boxShadow: `0 0 10px ${d.color}60`,
                  }} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.white, marginBottom: 4 }}>{d.title}</div>
                    <div style={{ fontSize: 13, color: C.gray, lineHeight: 1.55 }}>{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ════════════════ COMPARABLES ════════════════ */}
        <Section style={{ paddingBottom: 80 }}>
          <SectionHeader
            pill="The Landscape"
            pillColor={C.cyan}
            title={<>$150B+ in Platforms for Human Work.<br /><span style={{ color: C.gold }}>No Marketplace for AI Work. Until Now.</span></>}
            subtitle="Others build tools for human employees, human workflows, or technical teams. Nobody built a self-serve marketplace where any business hires AI. That's the gap we own."
          />
          <CompTable />
        </Section>

        {/* ════════════════ CLOSING ════════════════ */}
        <Section style={{ paddingBottom: 120, textAlign: "center" }}>
          <div style={{
            padding: "56px 40px", borderRadius: 28, position: "relative", overflow: "hidden",
            background: `linear-gradient(145deg, ${C.card}, ${C.blue}0a)`,
            border: `1px solid ${C.blue}25`,
          }}>
            {/* Top gradient line */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(90deg, ${C.blue}, ${C.cyan}, ${C.gold}, ${C.green}, ${C.purple})`,
            }} />
            <GlowOrb color={C.blueGlow} size="400px" top="-150px" left="50%" opacity={0.06} />

            <div style={{ position: "relative" }}>
              <h2 style={{
                fontSize: "clamp(26px, 4vw, 46px)", fontWeight: 900, lineHeight: 1.15,
                letterSpacing: -1.5, maxWidth: 800, margin: "0 auto 28px",
              }}>
                This is happening with or without us.<br />
                <span style={{ color: C.gold }}>We intend to be first.</span>
              </h2>

              <div style={{
                width: 80, height: 2, margin: "0 auto 28px",
                background: `linear-gradient(90deg, ${C.blue}, ${C.gold})`,
              }} />

              <div style={{ maxWidth: 660, margin: "0 auto 20px" }}>
                <p style={{ fontSize: 17, color: C.gray, lineHeight: 1.75, marginBottom: 16 }}>
                  Every business in the world will hire AI employees — not just to replace roles,
                  but to <em style={{ color: C.cyan }}>amplify the people they already have</em>.
                  The question isn't <em style={{ color: C.white }}>if</em> — it's <em style={{ color: C.white }}>where</em>.
                </p>
                <p style={{ fontSize: 17, lineHeight: 1.75, marginBottom: 24 }}>
                  <span style={{ color: C.cyan, fontWeight: 600 }}>The first 20 clients build the playbooks.</span><br />
                  <span style={{ color: C.gold, fontWeight: 600 }}>The playbooks power the platform.</span><br />
                  <span style={{ color: C.green, fontWeight: 600 }}>The platform becomes the marketplace.</span><br />
                  <span style={{ color: C.white, fontWeight: 700 }}>The marketplace becomes inevitable.</span>
                </p>
              </div>

              {/* The thesis */}
              <div style={{
                maxWidth: 580, margin: "0 auto 32px", padding: "20px 28px",
                borderRadius: 16, background: C.gold + "08", border: `1px solid ${C.gold}20`,
              }}>
                <div style={{ fontSize: 14, color: C.gray, lineHeight: 1.7, textAlign: "left" }}>
                  <span style={{ color: C.gold, fontWeight: 800 }}>The thesis is simple:</span> OpenAI and Anthropic
                  are spending billions to make AI smarter. Enterprise giants like 3M and JPMorgan are spending billions
                  to adopt it. But <span style={{ color: C.white, fontWeight: 700 }}>33 million small and medium businesses</span> — the
                  backbone of the US economy — have no way in. We are the on-ramp. Not just replacing roles — giving every
                  existing employee an AI-powered force multiplier so they can focus on what actually moves the needle.
                  First to market. First to own the playbooks. That head start compounds into a moat nobody can cross.
                </div>
              </div>

              {/* CTA Block */}
              <div style={{
                display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 16,
                padding: "28px 48px", borderRadius: 24,
                background: `linear-gradient(145deg, ${C.blue}12, ${C.gold}08)`,
                border: `1px solid ${C.blue}30`,
              }}>
                <div style={{
                  fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 900,
                  background: `linear-gradient(135deg, ${C.blue}, ${C.cyan})`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  letterSpacing: 1,
                }}>
                  DEEP SIGNAL
                </div>
                <div style={{ fontSize: 13, color: C.gray, fontWeight: 500 }}>
                  The First AI Hiring Marketplace
                </div>
                <div style={{
                  display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center",
                }}>
                  <Pill text="First to Market" color={C.blue} />
                  <Pill text="Revenue Generating" color={C.green} />
                  <Pill text="The Future of Work" color={C.gold} />
                </div>
              </div>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}
