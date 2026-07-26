// 멍경로 공용 UI — "옛길 이정표" 디자인 시스템
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-pine text-white shadow-[0_2px_8px_rgba(31,74,51,0.28)] hover:bg-pine-deep hover:shadow-[0_4px_14px_rgba(31,74,51,0.32)]",
        outline:
          "border-[1.5px] border-pine/30 bg-card text-pine hover:border-pine hover:bg-pine-soft/60",
        ghost: "text-muted hover:bg-pine-soft/70 hover:text-pine",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "h-8 px-3.5 text-xs",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-card p-5 shadow-[0_1px_2px_rgba(24,36,32,0.04),0_8px_24px_-12px_rgba(24,36,32,0.10)]",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "brand" | "green" | "red" | "gold";
}) {
  const tones = {
    default: "bg-pine-soft text-pine",
    brand: "bg-pine text-white",
    green: "bg-pine-soft text-pine",
    gold: "bg-sunbeam/15 text-[#8a5a12]",
    red: "bg-red-50 text-red-700",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

/** 이정표 번호 배지 — 코스 순서·단계 표기에 일관 사용 */
export function Waymark({
  n,
  className,
}: {
  n: number | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-pine font-display text-sm text-white shadow-[0_0_0_3px_rgba(31,74,51,0.15)]",
        className,
      )}
    >
      {n}
    </span>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-line bg-card px-3 text-sm outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-xl border border-line bg-card px-3 text-sm outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-line bg-card px-3 py-2 text-sm outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15",
        className,
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-semibold text-ink", className)}
      {...props}
    />
  );
}
