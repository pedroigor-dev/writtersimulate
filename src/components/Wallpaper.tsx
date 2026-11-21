import {
  Bookmark,
  Camera,
  Cat,
  Cloud,
  Coffee,
  CreditCard,
  Crown,
  Feather,
  Flame,
  Flower2,
  Ghost,
  Gift,
  Headphones,
  Heart,
  IceCreamCone,
  Laugh,
  MessageCircle,
  Moon,
  Music,
  PartyPopper,
  PenLine,
  Pizza,
  Plane,
  Quote,
  Rocket,
  Send,
  Shell,
  Smile,
  Sparkles,
  Star,
  Sun,
  TreePalm,
  Umbrella,
  Wine,
  Zap,
  type LucideIcon,
} from "lucide-react";

const ICONS: LucideIcon[] = [
  MessageCircle,
  Heart,
  Coffee,
  Sparkles,
  Music,
  Smile,
  CreditCard,
  Sun,
  Quote,
  Cloud,
  Camera,
  Flame,
  PenLine,
  Moon,
  Gift,
  TreePalm,
  Laugh,
  Star,
  Umbrella,
  Send,
  Pizza,
  Feather,
  PartyPopper,
  Headphones,
  Cat,
  Zap,
  IceCreamCone,
  Bookmark,
  Plane,
  Flower2,
  Ghost,
  Crown,
  Wine,
  Rocket,
  Shell,
  Star,
];

const TILE = 336;
const COLS = 6;
const CELL = TILE / COLS;
const SIZE = 17;

function random(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const PLACEMENTS = ICONS.map((Icon, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const offset = row % 2 ? CELL / 2 : 0;
  const x = (col * CELL + offset + (random(i + 1) - 0.5) * 14) % TILE;
  const y = row * CELL + (random(i + 101) - 0.5) * 14;
  const rotate = Math.round((random(i + 201) - 0.5) * 50);
  const scale = 0.85 + random(i + 301) * 0.35;
  return { Icon, x, y, rotate, scale };
});

export default function Wallpaper() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full text-white opacity-[0.07] [mask-image:radial-gradient(ellipse_at_center,black_40%,rgba(0,0,0,0.55)_100%)]"
    >
      <defs>
        <pattern id="wallpaper" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
          {PLACEMENTS.flatMap(({ Icon, x, y, rotate, scale }, i) => {
            const copies = [[0, 0]];
            if (x + SIZE > TILE) copies.push([-TILE, 0]);
            if (y + SIZE > TILE) copies.push([0, -TILE]);
            if (y < 0) copies.push([0, TILE]);
            return copies.map(([dx, dy], c) => (
              <g key={`${i}-${c}`} transform={`translate(${x + dx} ${y + dy}) rotate(${rotate} ${SIZE / 2} ${SIZE / 2}) scale(${scale})`}>
                <Icon width={SIZE} height={SIZE} strokeWidth={1.6} />
              </g>
            ));
          })}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wallpaper)" />
    </svg>
  );
}
