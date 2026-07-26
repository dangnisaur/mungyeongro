"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FeedbackStarsProps {
  visitId: string;
  initialRating: number | null;
}

export default function FeedbackStars({
  visitId,
  initialRating,
}: FeedbackStarsProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(initialRating);
  const [hover, setHover] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (value: number) => {
    setBusy(true);
    setRating(value);
    const res = await fetch(`/api/visits/${visitId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: value }),
    });
    setBusy(false);
    if (!res.ok) {
      setRating(initialRating);
      return;
    }
    router.refresh();
  };

  return (
    <div className="flex items-center gap-0.5" role="radiogroup" aria-label="만족도">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          role="radio"
          aria-checked={rating === v}
          aria-label={`${v}점`}
          disabled={busy}
          onClick={() => submit(v)}
          onMouseEnter={() => setHover(v)}
          onMouseLeave={() => setHover(null)}
          className={cn(
            "text-xl transition disabled:opacity-50",
            (hover ?? rating ?? 0) >= v ? "grayscale-0" : "grayscale opacity-40",
          )}
        >
          ⭐
        </button>
      ))}
      {rating !== null && (
        <span className="ml-1.5 text-xs text-muted">{rating}점</span>
      )}
    </div>
  );
}
