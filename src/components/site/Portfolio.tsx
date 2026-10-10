import { useEffect, useRef, useState, type ReactNode, type FormEvent } from "react";
import { ArrowUpRight, Download, Instagram, Link2, Mail, Phone, Play, X } from "lucide-react";
import { profile, reels, thumbnails, randomReels, tools, skills, achievements, stats, process } from "@/data/portfolio";

/* ---------- helpers ---------- */
const FPS = 25;
const TOTAL_SECONDS = 30; // the whole page = a 30s timeline
const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");
export const toTimecode = (frames: number) => {
  const s = frames / FPS;
  return `${pad(s / 3600)}:${pad((s / 60) % 60)}:${pad(s % 60)}:${pad(frames % FPS)}`;
};
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const SECTIONS = [
  { id: "hero", label: "Editor", tag: "V1" },
  { id: "work", label: "Works", tag: "V2" },
  { id: "grade", label: "Poster", tag: "V3" },
  { id: "photos", label: "Contents", tag: "V4" },
  { id: "about", label: "About", tag: "A1" },
  { id: "process", label: "Process", tag: "A2" },
  { id: "contact", label: "Contact", tag: "A3" },
];

function ClipTag({ tag, label }: { tag: string; label: string }) {
  return (
    <span className="clip-tag" data-reveal>
      <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {tag} — {label}
    </span>
  );
}

/** Muted looping video that only plays while it is on screen (keeps the page smooth) */
function LoopVideo({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) v.play().catch(() => {}); else v.pause(); },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" className={className} />;
}

type LightboxItem = { type: "image" | "video"; src: string; alt: string; poster?: string };

/** Animated audio-waveform divider between sections */
function Waveform() {
  const bars = Array.from({ length: 64 }, (_, i) => 0.3 + Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23)));
  return (
    <div aria-hidden className="mx-auto flex h-10 max-w-6xl items-center gap-[3px] px-6 opacity-40">
      {bars.map((h, i) => (
        <span key={i} className="wave-bar w-full rounded-full bg-muted-foreground" style={{ height: `${h * 100}%`, animationDelay: `${(i % 12) * 0.08}s` }} />
      ))}
    </div>
  );
}

/* ---------- Loader ---------- */
function Loader({ onDone }: { onDone: () => void }) {
  const done = useRef(onDone);
  done.current = onDone;
  const [frame, setFrame] = useState(0);
  const [out, setOut] = useState(false);
  useEffect(() => {
    const end = 3 * FPS;
    const dur = reducedMotion() ? 300 : 1800;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      setFrame(Math.round(p * end));
      if (p < 1) raf = requestAnimationFrame(tick);
      else { setOut(true); setTimeout(() => done.current(), 500); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const pct = (frame / (3 * FPS)) * 100;
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${out ? "opacity-0" : "opacity-100"}`}>
      <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground">RENDERING SEQUENCE…</p>
      <p className="mt-4 font-mono text-3xl tabular-nums text-foreground md:text-5xl">{toTimecode(frame)}</p>
      <div className="mt-6 h-[2px] w-64 bg-track">
        <div className="h-full bg-primary glow-primary" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-3 font-mono text-[10px] text-muted-foreground">{Math.round(pct)}% · H.264 · 1080×1920</p>
    </div>
  );
}

/* ---------- Custom cursor ---------- */
function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.body.classList.add("has-cursor");
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
    const move = (e: MouseEvent) => {
      x = e.clientX; y = e.clientY;
      setPlay(!!(e.target as HTMLElement).closest("[data-cursor='play']"));
    };
    const loop = () => {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      if (ref.current) ref.current.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move);
    loop();
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); document.body.classList.remove("has-cursor"); };
  }, []);
  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90] hidden md:block">
      <div className={`flex items-center justify-center rounded-full transition-all duration-300 ${play ? "h-20 w-20 bg-primary text-primary-foreground" : "h-3 w-3 bg-foreground"}`}>
        {play && <span className="font-mono text-[10px] font-bold tracking-widest">PLAY</span>}
      </div>
    </div>
  );
}

/* ---------- Playhead + ruler ---------- */
function Playhead() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? window.scrollY / max : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const frames = Math.round(p * TOTAL_SECONDS * FPS);
  return (
    <>
      {/* Desktop: vertical ruler on the right */}
      <div aria-hidden className="fixed right-0 top-0 z-40 hidden h-screen w-14 border-l border-border bg-background/40 md:block">
        <div className="absolute inset-y-16 left-0 right-0">
          {Array.from({ length: 61 }).map((_, i) => (
            <span key={i} className="absolute left-0 h-px bg-muted-foreground/40" style={{ top: `${(i / 60) * 100}%`, width: i % 10 === 0 ? 18 : i % 5 === 0 ? 11 : 6 }} />
          ))}
          <div className="absolute left-0 right-0" style={{ top: `${p * 100}%` }}>
            <div className="h-[2px] w-full bg-primary glow-primary" />
            <span className="absolute -left-[118px] -top-3 bg-primary px-2 py-1 font-mono text-[10px] tabular-nums text-primary-foreground">{toTimecode(frames)}</span>
          </div>
        </div>
      </div>
      {/* Mobile: simple bottom scrub bar */}
      <div aria-hidden className="fixed inset-x-0 bottom-0 z-40 h-[3px] bg-track md:hidden">
        <div className="h-full bg-primary glow-primary" style={{ width: `${p * 100}%` }} />
      </div>
    </>
  );
}

/* ---------- Nav ---------- */
function Nav({ active }: { active: string }) {
  return (
    <header className="glass fixed inset-x-0 top-0 z-50 border-b border-border md:right-14">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
        <a href="#hero" className="flex items-center gap-2 font-mono text-xs tracking-widest">
          <span className="animate-blink h-2 w-2 rounded-full bg-primary" /> AJAY.EFX
        </a>
        <ul className="hidden gap-1 md:flex">
          {SECTIONS.slice(1).map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className={`rounded px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors ${active === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <a href="#contact" className="font-mono text-[11px] uppercase tracking-widest text-gold md:hidden">Contact</a>
      </nav>
    </header>
  );
}

function Magnetic({ children, className, href, download }: { children: ReactNode; className: string; href: string; download?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <a
      ref={ref}
      href={href}
      download={download}
      className={className}
      onMouseMove={(e) => {
        const el = ref.current!; const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.4}px)`;
      }}
      onMouseLeave={() => { if (ref.current) ref.current.style.transform = ""; }}
      style={{ transition: "transform .4s cubic-bezier(.16,1,.3,1)" }}
    >
      {children}
    </a>
  );
}

const btnPrimary = "inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-mono text-xs uppercase tracking-widest text-primary-foreground hover:glow-primary";
const btnGhost = "inline-flex items-center gap-2 rounded-full border border-foreground/30 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-gold hover:text-gold transition-colors";

/* ---------- Main ---------- */
export function Portfolio() {
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState("hero");
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);
  const [heroFrame, setHeroFrame] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const workTrack = useRef<HTMLDivElement>(null);
  const workWrap = useRef<HTMLDivElement>(null);

  // live hero timecode
  useEffect(() => {
    const id = setInterval(() => setHeroFrame((f) => f + 1), 1000 / FPS);
    return () => clearInterval(id);
  }, []);

  // active section highlight
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  // Lenis + GSAP (loaded client-side only)
  useEffect(() => {
    if (!loaded) return;
    let cleanup = () => {};
    (async () => {
      const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"), import("gsap/ScrollTrigger"), import("lenis"),
      ]);
      gsap.registerPlugin(ScrollTrigger);
      const reduce = reducedMotion();
      let lenis: InstanceType<typeof Lenis> | null = null;
      const raf = (t: number) => lenis?.raf(t * 1000);
      if (!reduce) {
        lenis = new Lenis({ lerp: 0.1 });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
        // smooth anchor links
        document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
          a.addEventListener("click", (e) => { e.preventDefault(); lenis?.scrollTo(a.getAttribute("href")!, { offset: -40 }); }),
        );
      }
      const ctx = gsap.context(() => {
        // letterbox bars open
        gsap.to("[data-letterbox='top']", { yPercent: -100, duration: 1.2, ease: "expo.inOut", delay: 0.1 });
        gsap.to("[data-letterbox='bottom']", { yPercent: 100, duration: 1.2, ease: "expo.inOut", delay: 0.1 });
        // hero mask reveal
        gsap.from(".hero-line", { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.12, delay: 0.5 });
        gsap.from(".hero-fade", { opacity: 0, y: 20, duration: 1, ease: "power3.out", stagger: 0.1, delay: 1 });

        if (reduce) {
          gsap.utils.toArray<HTMLElement>("[data-reveal],[data-wipe]").forEach((el) =>
            gsap.from(el, { opacity: 0, duration: 0.6, scrollTrigger: { trigger: el, start: "top 90%" } }));
        } else {
          gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) =>
            gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
          gsap.utils.toArray<HTMLElement>("[data-wipe]").forEach((el) =>
            gsap.fromTo(el, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } }));
          gsap.utils.toArray<HTMLElement>("[data-mask]").forEach((el) =>
            gsap.from(el, { yPercent: 110, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el.parentElement!, start: "top 88%" } }));
          gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) =>
            gsap.fromTo(el, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: el.parentElement!, scrub: true } }));
          // zoom-through transition into sections
          gsap.utils.toArray<HTMLElement>("[data-zoom]").forEach((el) =>
            gsap.from(el, { scale: 0.92, opacity: 0.4, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top 40%", scrub: true } }));

          // pinned horizontal Work gallery (desktop only)
          ScrollTrigger.matchMedia({
            "(min-width: 768px)": () => {
              const track = workTrack.current!;
              const dist = () => track.scrollWidth - window.innerWidth + 120;
              gsap.to(track, {
                x: () => -dist(), ease: "none",
                scrollTrigger: { trigger: workWrap.current, pin: true, scrub: 1, end: () => `+=${dist()}`, invalidateOnRefresh: true },
              });
            },
          });
        }

        // process clips fill as you scroll
        gsap.utils.toArray<HTMLElement>("[data-fill]").forEach((el, i) =>
          gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: "#process-track", start: `top+=${i * 60} 75%`, end: `top+=${i * 60 + 200} 40%`, scrub: true } }));

        // count-up stats
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const target = parseFloat(el.dataset['count']!); const dec = parseInt(el.dataset['dec'] || "0");
          const o = { v: 0 };
          gsap.to(o, { v: target, duration: reduce ? 0.01 : 1.6, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" },
            onUpdate: () => { el.textContent = o.v.toFixed(dec); } });
        });
      }, root);
      cleanup = () => { ctx.revert(); gsap.ticker.remove(raf); lenis?.destroy(); };
    })();
    return () => cleanup();
  }, [loaded]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = `${f.get("message")}\n\n— ${f.get("name")} (${f.get("from")})`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent("Project enquiry")}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div ref={root} className="grain relative overflow-x-clip">
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      <Cursor />
      <Playhead />
      <Nav active={active} />

      {/* Letterbox bars */}
      <div data-letterbox="top" aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[14vh] bg-background" />
      <div data-letterbox="bottom" aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] h-[14vh] bg-background" />

      <main className="md:pr-14">
        {/* V1 — HERO */}
        <section id="hero" className="relative flex min-h-screen items-end overflow-hidden pb-16 pt-24">
          {/* TODO: replace with <video autoPlay muted loop playsInline poster={...} src="/showreel.mp4" /> */}
          <img src={profile.heroImage} alt="" width={1920} height={1080} className="animate-kenburns absolute inset-0 h-full w-full object-cover" />
          <div className="hero-fade absolute inset-0" />
          <div className="vignette absolute inset-0" />
          <div className="relative mx-auto w-full max-w-7xl px-5">
            <div className="hero-fade mb-6 flex flex-wrap items-center gap-4 font-mono text-xs tracking-widest text-foreground/80">
              <span className="flex items-center gap-2"><span className="animate-blink h-2.5 w-2.5 rounded-full bg-primary" /> REC</span>
              <span className="tabular-nums">{toTimecode(heroFrame)}</span>
              <span className="clip-tag">V1 — EDITOR</span>
            </div>
            <h1 className="font-display text-[22vw] leading-[0.85] md:text-[15vw]">
              {profile.name.map((l, i) => (
                <span key={l} className="mask-line"><span className={`hero-line block ${i === 1 ? "text-primary" : ""}`}>{l}</span></span>
              ))}
            </h1>
            <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="hero-fade max-w-md">
                <p className="font-mono text-xs uppercase tracking-widest text-gold">{profile.headline}</p>
                <p className="mt-3 text-xl text-foreground/90 md:text-2xl">{profile.tagline}</p>
              </div>
              <div className="hero-fade flex gap-3">
                <a href="#work" className={btnPrimary}><Play className="h-3.5 w-3.5" /> View Work</a>
                <a href="#contact" className={btnGhost}>Contact</a>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <div className="overflow-hidden border-y border-border bg-primary py-4 text-primary-foreground">
          <div className="animate-marquee flex w-max whitespace-nowrap font-display text-3xl md:text-5xl">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k} className="flex">
                {["Editor", "Colorist", "Beat Sync", "Storyteller", "Editor", "Colorist", "Beat Sync", "Storyteller"].map((w, i) => (
                  <span key={i} className="px-6">{w} <span className="text-accent">•</span></span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* V2 — WORK */}
        <section id="work" className="pt-24">
          <div ref={workWrap} className="flex min-h-screen flex-col justify-center overflow-hidden">
            <div className="mx-auto mb-10 w-full max-w-7xl px-5">
              <ClipTag tag="V2" label="Selected Work" />
              <h2 className="mt-4 font-display text-6xl md:text-8xl"><span className="mask-line"><span data-mask className="block">Reels that <span className="text-primary">hit</span></span></span></h2>
            </div>
            <div ref={workTrack} className="flex gap-5 overflow-x-auto px-5 pb-6 md:overflow-visible md:pl-[max(1.25rem,calc((100vw-80rem)/2+1.25rem))]">
              {reels.map((r, i) => (
                <a key={r.title} href={r.url} target="_blank" rel="noreferrer" data-cursor="play"
                  className="group relative aspect-[9/16] w-[68vw] shrink-0 overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:glow-primary sm:w-[44vw] md:w-[22vw] md:min-w-[260px]">
                  <LoopVideo src={r.video} poster={r.poster} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
                  <div className="absolute left-3 top-3 font-mono text-[10px] tracking-widest text-foreground/80">CLIP {pad(i + 1)} · {r.tag.toUpperCase()}</div>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="font-mono text-xs text-gold">{r.views} views</p>
                    <h3 className="mt-1 font-display text-2xl leading-none">{r.title}</h3>
                    <span className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-foreground">Watch on Instagram <ArrowUpRight className="h-3 w-3" /></span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-primary transition-transform duration-700 group-hover:scale-x-100" />
                </a>
              ))}
            </div>
          </div>
        </section>

        <Waveform />

        {/* V3 — VISUAL HOOK (thumbnails) */}
        <section id="grade" className="mx-auto max-w-7xl px-5 py-24" data-zoom>
          <ClipTag tag="V3" label="Visual Hook" />
          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h2 className="font-display text-6xl md:text-8xl"><span className="mask-line"><span data-mask className="block"><span className="text-gold">Thumbnail</span></span></span></h2>
            <p className="max-w-sm text-muted-foreground">Thumbnail designs made to stop the scroll and get the click.</p>
          </div>
          {[true, false].map((wide) => (
            <div key={String(wide)} className={`grid gap-4 ${wide ? "mt-12 sm:grid-cols-3" : "mt-4 grid-cols-3"}`}>
              {thumbnails.map((t, i) => t.wide === wide && (
                <button key={t.alt} onClick={() => setLightbox({ type: "image", src: t.src, alt: t.alt })} data-wipe
                  className={`group relative block w-full overflow-hidden rounded-lg border border-border transition-shadow hover:glow-primary ${wide ? "aspect-video" : "aspect-[4/5]"}`}>
                  <img src={t.src} alt={t.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute left-3 top-3 clip-tag">THUMB {pad(i + 1)}</span>
                </button>
              ))}
            </div>
          ))}
        </section>

        <Waveform />

        {/* V4 — CONTENTS (random reels) */}
        <section id="photos" className="mx-auto max-w-7xl px-5 py-24">
          <ClipTag tag="V4" label="Contents" />
          <h2 className="mt-4 font-display text-6xl md:text-8xl"><span className="mask-line"><span data-mask className="block"><span className="text-primary">Edits</span></span></span></h2>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {randomReels.map((r) => (
              <button key={r.video} onClick={() => setLightbox({ type: "video", src: r.video, alt: r.alt, poster: r.poster })} data-cursor="play" data-wipe
                className="aspect-[4/5] w-[calc(50%-0.5rem)] overflow-hidden rounded-lg border border-border md:w-[calc(33.333%-0.7rem)]">
                <LoopVideo src={r.video} poster={r.poster} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
              </button>
            ))}
          </div>
        </section>

        {lightbox && (
          <div className="fixed inset-0 z-[95] flex items-center justify-center bg-background/95 p-6 animate-in fade-in" onClick={() => setLightbox(null)}>
            <button aria-label="Close" className="absolute right-6 top-6 text-foreground"><X /></button>
            {lightbox.type === "video" ? (
              <video src={lightbox.src} poster={lightbox.poster} autoPlay controls loop playsInline onClick={(e) => e.stopPropagation()} className="max-h-[85vh] max-w-full rounded-lg" />
            ) : (
              <img src={lightbox.src} alt={lightbox.alt} className="max-h-[85vh] max-w-full rounded-lg object-contain" />
            )}
            <p className="absolute bottom-6 font-mono text-xs text-muted-foreground">{lightbox.alt}</p>
          </div>
        )}

        <Waveform />

        {/* A1 — ABOUT */}
        <section id="about" className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-[5fr_7fr]">
          <div className="relative overflow-hidden rounded-lg border border-border" data-wipe>
            <img src={profile.portrait} alt="Ajith Kanna" loading="lazy" width={896} height={1152} className="h-full w-full object-cover" />
            <span className="absolute bottom-3 left-3 clip-tag">{profile.location}</span>
          </div>
          <div>
            <ClipTag tag="A1" label="About" />
            <h2 className="mt-4 font-display text-5xl leading-none md:text-7xl"><span className="mask-line"><span data-mask className="block">Editing since <span className="text-gold">2021</span></span></span></h2>
            <p className="mt-6 text-lg text-foreground/85" data-reveal>
              Creative Video Editor passionate about filmmaking and visual storytelling. Experienced in Instagram Reels, short-form content, and social media editing since 2021, focused on creating engaging visuals and creative content.
            </p>
            <p className="mt-3 text-sm text-muted-foreground" data-reveal>Previous operations roles gave me deadline discipline and clear communication.</p>

            <div className="mt-10 grid grid-cols-3 gap-4 border-y border-border py-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-4xl md:text-6xl"><span data-count={s.value} data-dec={s.decimals}>0</span><span className="text-primary">{s.suffix}</span></p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8" data-reveal>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Tools</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tools.map((t) => <span key={t} className="rounded-full border border-border bg-card px-3 py-1 text-sm">{t}</span>)}
              </div>
            </div>
            <div className="mt-6" data-reveal>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Skills</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((t) => <span key={t} className="rounded-full border border-primary/40 px-3 py-1 text-sm text-foreground/90">{t}</span>)}
              </div>
            </div>
            <ul className="mt-8 space-y-2" data-reveal>
              {achievements.map((a) => (
                <li key={a} className="flex items-center gap-3 border-b border-border pb-2"><span className="text-gold">★</span> {a}</li>
              ))}
            </ul>
          </div>
        </section>

        <Waveform />

        {/* A2 — PROCESS */}
        <section id="process" className="mx-auto max-w-7xl px-5 py-24">
          <ClipTag tag="A2" label="Process" />
          <h2 className="mt-4 font-display text-6xl md:text-8xl"><span className="mask-line"><span data-mask className="block">Work <span className="text-primary">Flow</span></span></span></h2>
          <div id="process-track" className="mt-12 space-y-3 rounded-lg border border-border bg-card p-4">
            <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
              {["00:00", "00:06", "00:12", "00:18", "00:24", "00:30"].map((t) => <span key={t}>{t}</span>)}
            </div>
            {process.map((p, i) => (
              <div key={p.step} className="flex items-center gap-3">
                <span className="w-8 font-mono text-[10px] text-muted-foreground">V{i + 1}</span>
                <div className="relative h-12 flex-1 overflow-hidden rounded bg-track">
                  <div data-fill className="absolute inset-y-0 origin-left rounded border-l-4 border-gold bg-primary/80"
                    style={{ left: `${i * 18}%`, width: "28%" }} />
                  <span className="absolute inset-y-0 flex items-center px-3 font-display text-lg" style={{ left: `${i * 18}%` }}>{p.step}</span>
                </div>
                <span className="hidden w-20 text-right font-mono text-[10px] text-muted-foreground sm:block">{p.tc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* A3 — CONTACT */}
        <section id="contact" className="mx-auto max-w-7xl px-5 py-24" data-zoom>
          <ClipTag tag="A3" label="Contact" />
          <h2 className="mt-6 font-display text-[16vw] leading-[0.85] md:text-[9vw]">
            <span className="mask-line"><span data-mask className="block">Let's cut</span></span>
            <span className="mask-line"><span data-mask className="block text-primary">something great.</span></span>
          </h2>
          <div className="mt-14 grid gap-12 md:grid-cols-2">
            <div className="space-y-4" data-reveal>
              {[
                { icon: Mail, label: profile.email, href: `mailto:${profile.email}` },
                { icon: Phone, label: profile.phone, href: `tel:+91${profile.phone}` },
                { icon: Instagram, label: profile.handle, href: profile.instagram },
                { icon: Link2, label: "Linktree", href: profile.linktree },
              ].map(({ icon: I, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="group flex items-center justify-between border-b border-border pb-4 text-lg transition-colors hover:text-gold">
                  <span className="flex items-center gap-3"><I className="h-4 w-4 text-primary" /> {label}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </a>
              ))}
              <div className="pt-6">
                <Magnetic href={profile.resume} download className={btnPrimary}><Download className="h-4 w-4" /> Download Resume</Magnetic>
              </div>
            </div>
            <form onSubmit={onSubmit} className="space-y-4" data-reveal>
              {[{ n: "name", l: "Your name", t: "text" }, { n: "from", l: "Email", t: "email" }].map((f) => (
                <input key={f.n} name={f.n} type={f.t} required maxLength={120} placeholder={f.l}
                  className="w-full border-b border-input bg-transparent py-3 outline-none placeholder:text-muted-foreground focus:border-primary" />
              ))}
              <textarea name="message" required maxLength={1500} rows={4} placeholder="Tell me about the edit…"
                className="w-full resize-none border-b border-input bg-transparent py-3 outline-none placeholder:text-muted-foreground focus:border-primary" />
              <button type="submit" className={btnGhost}>Send brief <ArrowUpRight className="h-3.5 w-3.5" /></button>
            </form>
          </div>
        </section>

        <footer className="border-t border-border px-5 py-8">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground md:flex-row">
            <span>© {new Date().getFullYear()} Ajith Kanna</span>
            <span><span className="text-primary">■</span> End of timeline • 00:00:30:00</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
