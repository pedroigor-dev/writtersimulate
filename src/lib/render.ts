export type Format = "story" | "feed";

export const FORMATS: Record<Format, { w: number; h: number; label: string }> = {
  story: { w: 1080, h: 1920, label: "Stories 9:16" },
  feed: { w: 1080, h: 1350, label: "Feed 4:5" },
};

export const LINE_FACTOR = 1.1;
export const TRACKING_EM = -0.012;

export type LayoutOptions = {
  fontFamily: string;
  fontWeight: number;
  format: Format;
  mode: "color" | "image";
};

export type BackgroundImage = { el: HTMLImageElement; fx: number; fy: number };

export type RenderOptions = LayoutOptions & {
  text: string;
  background: string;
  color: string;
  image: BackgroundImage | null;
  dim: number;
};

export const SHADOW = { color: "rgba(0,0,0,0.6)", blurEm: 0.14, offsetEm: 0.035 };

export function coverRect(iw: number, ih: number, w: number, h: number, fx: number, fy: number) {
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  return { x: (w - dw) * fx, y: (h - dh) * fy, w: dw, h: dh };
}

export type Layout = { size: number; lines: string[] };

function setTracking(ctx: CanvasRenderingContext2D, size: number) {
  if ("letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${size * TRACKING_EM}px`;
  }
}

function breakLongWord(ctx: CanvasRenderingContext2D, word: string, maxWidth: number) {
  const parts: string[] = [];
  let current = "";
  for (const char of word) {
    const next = current + char;
    if (ctx.measureText(next).width > maxWidth && current) {
      parts.push(current);
      current = char;
    } else {
      current = next;
    }
  }
  if (current) parts.push(current);
  return parts;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let brokeWord = false;
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const raw of words) {
      const pieces = ctx.measureText(raw).width > maxWidth ? breakLongWord(ctx, raw, maxWidth) : [raw];
      if (pieces.length > 1) brokeWord = true;
      for (const word of pieces) {
        const candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width <= maxWidth || !line) {
          line = candidate;
        } else {
          lines.push(line);
          line = word;
        }
      }
    }
    lines.push(line);
  }
  return { lines, brokeWord };
}

export function layoutQuote(ctx: CanvasRenderingContext2D, text: string, options: LayoutOptions): Layout {
  const { w, h } = FORMATS[options.format];
  const content = text.trim();
  const isImage = options.mode === "image";
  const maxWidth = w * (isImage ? 0.86 : 0.84);
  const maxHeight = h * (isImage ? 0.5 : options.format === "story" ? 0.64 : 0.76);
  const maxSize = Math.round(w * (isImage ? 0.072 : 0.112));
  const minSize = Math.round(w * 0.04);

  let size = maxSize;
  let lines: string[] = [];
  for (; size >= minSize; size -= 2) {
    ctx.font = `${options.fontWeight} ${size}px ${options.fontFamily}`;
    setTracking(ctx, size);
    const result = wrap(ctx, content, maxWidth);
    lines = result.lines;
    const fits = lines.length * size * LINE_FACTOR <= maxHeight;
    if (fits && (!result.brokeWord || size <= minSize + 2)) break;
  }
  size = Math.max(size, minSize);
  ctx.font = `${options.fontWeight} ${size}px ${options.fontFamily}`;
  setTracking(ctx, size);
  return { size, lines: wrap(ctx, content, maxWidth).lines };
}

export function relativeLuminance(hex: string) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function autoTextColor(background: string) {
  return relativeLuminance(background) > 0.32 ? "#0d0d0d" : "#f7f7f7";
}

export function drawQuote(canvas: HTMLCanvasElement, options: RenderOptions) {
  const { w, h } = FORMATS[options.format];
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = options.background;
  ctx.fillRect(0, 0, w, h);

  if (options.image) {
    const { el, fx, fy } = options.image;
    const r = coverRect(el.naturalWidth, el.naturalHeight, w, h, fx, fy);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(el, r.x, r.y, r.w, r.h);
    if (options.dim > 0) {
      ctx.fillStyle = `rgba(0,0,0,${options.dim})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  if (!options.text.trim()) return;

  const { size, lines } = layoutQuote(ctx, options.text, options);
  const lineHeight = size * LINE_FACTOR;
  const blockHeight = lines.length * lineHeight;
  const metrics = ctx.measureText("Hg");
  const glyphOffset = (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
  let y = h / 2 - blockHeight / 2 + lineHeight / 2 + glyphOffset;

  ctx.fillStyle = options.color;
  if (options.image) {
    ctx.shadowColor = SHADOW.color;
    ctx.shadowBlur = size * SHADOW.blurEm;
    ctx.shadowOffsetY = size * SHADOW.offsetEm;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  for (const line of lines) {
    ctx.fillText(line, w / 2, y);
    y += lineHeight;
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
}
