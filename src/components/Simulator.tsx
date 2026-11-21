"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import Image from "next/image";
import { archivoNarrow, interTight, robotoCondensed } from "@/lib/fonts";
import { autoTextColor, canvasToBlob, drawQuote, FORMATS, layoutQuote, LINE_FACTOR, TRACKING_EM, type Format } from "@/lib/render";

const BACKGROUNDS = [
  "#FFC8C8",
  "#FFFFFF",
  "#0D0D0D",
  "#FFE58A",
  "#CDEBC5",
  "#BFD9FF",
  "#D9C8FF",
  "#F2E6D8",
  "#FF5A5F",
  "#1F3A2E",
];

const FONTS = [
  { key: "roboto", label: "Condensada", font: robotoCondensed },
  { key: "archivo", label: "Narrow", font: archivoNarrow },
  { key: "inter", label: "Tight", font: interTight },
] as const;

const EXAMPLES = [
  "“sua fatura venceu”\nParabéns pra ela né? Alguém tinha que vencer",
  "minha mãe me deu a luz, e eu tô brilhando até hoje",
  "Preciso passar uma semana na praia ou internado numa clínica psiquiátrica, qualquer um dos dois serve",
];

const CARD_HEIGHT: Record<Format, string> = {
  story: "min(58svh, 720px)",
  feed: "min(50svh, 600px)",
};

type FontKey = (typeof FONTS)[number]["key"];

const subscribeNoop = () => () => {};

function supportsFileShare() {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;
  try {
    const probe = new File([new Blob([""], { type: "image/png" })], "probe.png", { type: "image/png" });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

function useGhostTyping(active: boolean) {
  const [ghost, setGhost] = useState("");

  useEffect(() => {
    if (!active) return;
    let phrase = 0;
    let index = 0;
    let deleting = false;
    let timer = 0;

    const tick = () => {
      const target = EXAMPLES[phrase];
      if (!deleting) {
        index += 1;
        setGhost(target.slice(0, index));
        if (index >= target.length) {
          deleting = true;
          timer = window.setTimeout(tick, 1900);
          return;
        }
        timer = window.setTimeout(tick, 38 + Math.random() * 55);
      } else {
        index = Math.max(0, index - 3);
        setGhost(target.slice(0, index));
        if (index === 0) {
          deleting = false;
          phrase = (phrase + 1) % EXAMPLES.length;
          timer = window.setTimeout(tick, 450);
          return;
        }
        timer = window.setTimeout(tick, 18);
      }
    };

    timer = window.setTimeout(tick, 700);
    return () => window.clearTimeout(timer);
  }, [active]);

  return active ? ghost : "";
}

export default function Simulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobRef = useRef<Blob | null>(null);
  const renderId = useRef(0);

  const [text, setText] = useState("");
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [textColor, setTextColor] = useState<string | null>(null);
  const [format, setFormat] = useState<Format>("story");
  const [fontKey, setFontKey] = useState<FontKey>("roboto");
  const [weight, setWeight] = useState(400);
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const canShare = useSyncExternalStore(subscribeNoop, supportsFileShare, () => false);
  const isEmpty = !text.trim();
  const ghost = useGhostTyping(isEmpty && !focused);

  const color = textColor ?? autoTextColor(background);
  const font = FONTS.find((f) => f.key === fontKey)!.font;
  const fontFamily = font.style.fontFamily;

  useEffect(() => {
    const loads = FONTS.flatMap((f) => [400, 500].map((wgt) => document.fonts.load(`${wgt} 64px ${f.font.style.fontFamily}`, "aé“")));
    let alive = true;
    Promise.allSettled(loads).then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const measure = useMemo(() => (fontsReady ? document.createElement("canvas").getContext("2d") : null), [fontsReady]);

  const display = isEmpty ? ghost : text;
  const layout = useMemo(
    () => (measure ? layoutQuote(measure, display, { fontFamily, fontWeight: weight, format }) : null),
    [measure, display, fontFamily, weight, format],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fontsReady) return;
    const id = ++renderId.current;
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      drawQuote(canvas, { text, background, color, fontFamily, fontWeight: weight, format });
      const blob = await canvasToBlob(canvas);
      if (cancelled || id !== renderId.current) return;
      blobRef.current = blob;
      setReady(Boolean(blob) && Boolean(text.trim()));
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [text, background, color, fontFamily, weight, format, fontsReady]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const fileName = `frase-${format}.png`;
  const canExport = ready && !isEmpty;

  const download = useCallback(() => {
    const blob = blobRef.current;
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast("Imagem salva");
  }, [fileName]);

  const share = useCallback(() => {
    const blob = blobRef.current;
    if (!blob) return;
    const file = new File([blob], fileName, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      navigator
        .share({ files: [file] })
        .then(() => setToast("Pronto!"))
        .catch((err: DOMException) => {
          if (err?.name !== "AbortError") download();
        });
    } else {
      download();
    }
  }, [fileName, download]);

  const counterTone = text.length > 260 ? "text-rose-300" : text.length > 220 ? "text-amber-200/80" : "text-white/35";

  return (
    <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-32 pt-5 md:flex-row md:items-start md:gap-14 md:px-8 md:pb-12 md:pt-12">
      <section className="flex flex-col items-center md:sticky md:top-12 md:flex-1">
        <div className="rise mb-4 flex w-full items-center justify-between md:hidden">
          <Logo />
          <Segmented
            options={[
              { value: "story", label: "Stories" },
              { value: "feed", label: "Feed" },
            ]}
            value={format}
            onChange={setFormat}
            className="w-44"
            itemClassName="h-8 text-sm"
          />
        </div>

        <Preview
          format={format}
          background={background}
          color={color}
          fontClass={font.className}
          weight={weight}
          layout={layout}
          ghost={isEmpty}
          caret={focused}
        />
        <canvas ref={canvasRef} className="hidden" />
      </section>

      <section className="flex flex-col gap-7 md:w-[380px]">
        <div className="rise hidden items-center justify-between md:flex">
          <Logo />
          <Segmented
            options={[
              { value: "story", label: "Stories" },
              { value: "feed", label: "Feed" },
            ]}
            value={format}
            onChange={setFormat}
            className="w-44"
            itemClassName="h-8 text-sm"
          />
        </div>

        <Field label="Frase" delay={60}>
          <div className="group relative">
            <div className="pointer-events-none absolute -inset-px rounded-[14px] bg-gradient-to-br from-white/40 via-white/5 to-white/30 opacity-0 transition-opacity duration-500 group-focus-within:opacity-100" />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Escreve aqui o que tá entalado…"
              rows={3}
              maxLength={280}
              className="relative block min-h-[104px] w-full resize-none rounded-[13px] bg-[#181818] px-4 py-3.5 text-base leading-snug text-white outline-none ring-1 ring-white/10 transition duration-300 placeholder:text-white/25 hover:ring-white/20 focus:ring-transparent"
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/30">Enter quebra a linha</span>
            <span className={`tabular-nums transition-colors duration-300 ${counterTone}`}>{text.length}/280</span>
          </div>
        </Field>

        <Field label="Fundo" delay={120}>
          <div className="flex flex-wrap gap-2.5">
            {BACKGROUNDS.map((c) => (
              <Swatch key={c} color={c} active={background.toLowerCase() === c.toLowerCase()} onClick={() => setBackground(c)} />
            ))}
            <ColorPicker value={background} onChange={setBackground} active={!BACKGROUNDS.some((c) => c.toLowerCase() === background.toLowerCase())} />
          </div>
        </Field>

        <Field label="Texto" delay={180}>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setTextColor(null)}
              className={`h-9 rounded-full px-4 text-sm transition-all duration-300 ease-[var(--ease-out-expo)] active:scale-95 ${textColor === null ? "bg-white text-black" : "bg-white/[0.06] text-white/70 ring-1 ring-white/10 hover:bg-white/[0.1] hover:text-white"}`}
            >
              Auto
            </button>
            <Swatch color="#0D0D0D" active={textColor === "#0D0D0D"} onClick={() => setTextColor("#0D0D0D")} />
            <Swatch color="#F7F7F7" active={textColor === "#F7F7F7"} onClick={() => setTextColor("#F7F7F7")} />
            <ColorPicker value={color} onChange={setTextColor} active={textColor !== null && textColor !== "#0D0D0D" && textColor !== "#F7F7F7"} />
          </div>
        </Field>

        <Field label="Fonte" delay={240}>
          <Segmented
            options={FONTS.map((f) => ({ value: f.key, label: <span className={f.font.className}>{f.label}</span> }))}
            value={fontKey}
            onChange={setFontKey}
            itemClassName="h-11 text-[17px]"
          />
          <Segmented
            options={[
              { value: 400, label: "Regular" },
              { value: 500, label: "Médio" },
            ]}
            value={weight}
            onChange={setWeight}
            itemClassName="h-10 text-sm"
          />
        </Field>

        <a
          href="https://www.instagram.com/_pedroigorc/"
          target="_blank"
          rel="noopener noreferrer"
          className="rise group flex self-center md:fixed md:bottom-5 md:right-6 md:z-10 items-center gap-1.5 rounded-full bg-[#0e0e0e]/70 px-3 py-1.5 text-xs text-white/45 ring-1 ring-white/10 backdrop-blur-md transition-all duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:text-white hover:ring-white/25"
          style={{ animationDelay: "500ms" }}
        >
          <span className="text-white/30 transition-colors duration-500 group-hover:text-white/60">Design &amp; Dev ·</span>
          <span className="relative">
            @devpedro
            <span className="absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-[#FFC8C8] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
          </span>
        </a>

        <div
          className="rise fixed inset-x-0 bottom-0 z-10 flex gap-2 border-t border-white/10 bg-[#0e0e0e]/80 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none"
          style={{ animationDelay: "300ms" }}
        >
          <button
            onClick={share}
            disabled={!canExport}
            className={`group relative h-13 flex-1 overflow-hidden rounded-2xl bg-white text-base font-semibold text-black transition-all duration-500 ease-[var(--ease-out-expo)] enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_12px_40px_-8px_rgba(255,255,255,0.45)] enabled:active:translate-y-0 enabled:active:scale-[0.98] disabled:opacity-25 ${canExport ? "shine" : ""}`}
          >
            <span className="relative flex items-center justify-center gap-2">
              {canShare ? "Compartilhar" : "Baixar imagem"}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5">
                {canShare ? <path d="M12 15V3m0 0L7 8m5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /> : <path d="M12 4v12m0 0-5-5m5 5 5-5M5 20h14" />}
              </svg>
            </span>
          </button>
          {canShare && (
            <button
              onClick={download}
              disabled={!canExport}
              aria-label="Baixar imagem"
              className="grid h-13 w-13 place-items-center rounded-2xl bg-white/[0.07] ring-1 ring-white/10 transition-all duration-500 ease-[var(--ease-out-expo)] enabled:hover:-translate-y-0.5 enabled:hover:bg-white/[0.12] enabled:active:scale-95 disabled:opacity-25"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v12m0 0-5-5m5 5 5-5M5 20h14" />
              </svg>
            </button>
          )}
        </div>
      </section>

      <div
        className={`pointer-events-none fixed left-1/2 top-5 z-20 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black shadow-lg transition-all duration-500 ease-[var(--ease-spring)] ${toast ? "translate-y-0 scale-100 opacity-100" : "-translate-y-4 scale-90 opacity-0"}`}
      >
        {toast}
      </div>
    </main>
  );
}

function Logo() {
  return (
    <h1 className="group flex cursor-default items-center gap-2.5 text-2xl font-semibold tracking-tight">
      <Image
        src="/logo.svg"
        unoptimized
        priority
        alt=""
        width={32}
        height={32}
        className="rgb-logo h-8 w-8 rounded-[9px] transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-6 group-hover:scale-110"
      />
      YourWritter
      <span className="ml-0.5 inline-block h-[0.85em] w-[2px] translate-y-[0.1em] rounded-full bg-white/80 [animation:caret_1.05s_ease-in-out_infinite]" />
    </h1>
  );
}

function Field({ label, delay, children }: { label: string; delay: number; children: ReactNode }) {
  return (
    <div className="rise flex flex-col gap-3" style={{ animationDelay: `${delay}ms` }}>
      <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">{label}</span>
      {children}
    </div>
  );
}

function Preview({
  format,
  background,
  color,
  fontClass,
  weight,
  layout,
  ghost,
  caret,
}: {
  format: Format;
  background: string;
  color: string;
  fontClass: string;
  weight: number;
  layout: { size: number; lines: string[] } | null;
  ghost: boolean;
  caret: boolean;
}) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const prevKey = useRef(`${background}|${format}`);
  const { w, h } = FORMATS[format];

  useEffect(() => {
    const key = `${background}|${format}`;
    if (prevKey.current === key) return;
    prevKey.current = key;
    cardRef.current?.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }],
      { duration: 480, easing: "cubic-bezier(0.34, 1.36, 0.5, 1)" },
    );
  }, [background, format]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !tiltRef.current) return;
    const rect = tiltRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const el = tiltRef.current;
    el.style.setProperty("--rx", `${(0.5 - y) * 9}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 11}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };

  const onLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const children: ReactNode[] = [];
  if (layout) {
    let k = 0;
    layout.lines.forEach((line, li) => {
      if (li > 0) children.push(<br key={`b${li}`} />);
      for (const ch of Array.from(line)) {
        children.push(
          <span key={`c${k}`} className="ink">
            {ch}
          </span>,
        );
        k += 1;
      }
    });
  }

  const textStyle: CSSProperties = {
    fontSize: layout ? `${(layout.size / w) * 100}cqw` : undefined,
    lineHeight: LINE_FACTOR,
    letterSpacing: `${TRACKING_EM}em`,
    fontWeight: weight,
    color,
    opacity: ghost && !caret ? 0.38 : 1,
  };

  return (
    <div className="rise relative" style={{ animationDelay: "40ms" }}>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[130%] w-[190%] -translate-x-1/2 -translate-y-1/2 opacity-25 transition-colors duration-700 [mask-image:radial-gradient(closest-side,black,transparent)]"
        style={{ backgroundColor: background }}
      />
      <div
        ref={tiltRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="group [perspective:1100px]"
        style={{ "--rx": "0deg", "--ry": "0deg", "--mx": "50%", "--my": "50%" } as CSSProperties}
      >
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-[22px] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10 transition-[width,height,transform,background-color] duration-[600ms,600ms,350ms,600ms] ease-[var(--ease-out-expo)] [container-type:size] [transform:rotateX(var(--rx))_rotateY(var(--ry))]"
          style={{
            backgroundColor: background,
            height: CARD_HEIGHT[format],
            width: `calc(${CARD_HEIGHT[format]} * ${w / h})`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <p
              className={`${fontClass} w-full text-center transition-[font-size,color,opacity] duration-500 ease-[var(--ease-out-expo)]`}
              style={textStyle}
            >
              {children}
              {caret && <span className="caret" />}
            </p>
          </div>
          <div
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: "radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,0.7), transparent 55%)" }}
          />
        </div>
      </div>
    </div>
  );
}

type Option<T> = { value: T; label: ReactNode };

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  className = "",
  itemClassName = "",
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  itemClassName?: string;
}) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div className={`relative grid rounded-2xl bg-white/[0.05] p-1 ring-1 ring-white/10 ${className}`} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      <div
        className="absolute bottom-1 left-1 top-1 rounded-xl bg-white shadow-[0_4px_20px_-6px_rgba(255,255,255,0.5)] transition-transform duration-500 ease-[var(--ease-spring)]"
        style={{ width: `calc((100% - 8px) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={`relative z-10 rounded-xl transition-colors duration-300 active:scale-[0.97] ${o.value === value ? "text-black" : "text-white/60 hover:text-white"} ${itemClassName}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Swatch({ color, active, onClick }: { color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={color}
      className={`h-9 w-9 rounded-full ring-1 ring-inset ring-white/15 transition-all duration-500 ease-[var(--ease-spring)] hover:scale-110 active:scale-90 ${active ? "scale-110 shadow-[0_0_0_2px_#0e0e0e,0_0_0_4px_#fff]" : "shadow-[0_0_0_0_#0e0e0e,0_0_0_0_#fff]"}`}
      style={{ background: color }}
    />
  );
}

function ColorPicker({ value, onChange, active }: { value: string; onChange: (c: string) => void; active: boolean }) {
  return (
    <label
      className={`relative grid h-9 w-9 cursor-pointer place-items-center overflow-hidden rounded-full transition-all duration-500 ease-[var(--ease-spring)] hover:rotate-90 hover:scale-110 active:scale-90 ${active ? "scale-110 shadow-[0_0_0_2px_#0e0e0e,0_0_0_4px_#fff]" : ""}`}
      style={{ background: "conic-gradient(#ff5a5f, #ffe58a, #cdebc5, #bfd9ff, #d9c8ff, #ff5a5f)" }}
      aria-label="Cor personalizada"
    >
      <input type="color" value={value.toLowerCase()} onChange={(e) => onChange(e.target.value.toUpperCase())} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
    </label>
  );
}
