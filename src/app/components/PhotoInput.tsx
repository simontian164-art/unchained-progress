import { useId, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fileToDataUrl } from "../engine/detector";

/**
 * Photo picker. On phones, `capture` opens the camera directly; on desktop it opens the file picker.
 * The image is downscaled on the device before it's stored.
 */
export const PhotoInput = ({
  label,
  hint,
  value,
  onChange,
  required,
  facing = "user",
  aspect = "aspect-[3/4]",
  maxSide,
}: {
  label: string;
  hint: string;
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  required?: boolean;
  facing?: "user" | "environment";
  aspect?: string;
  /** Downscale target (px). Smaller for series that are stored many times. */
  maxSide?: number;
}) => {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await fileToDataUrl(f, maxSide));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't use that photo. Try another.");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          {label} {required ? <span className="text-muted-foreground">(required)</span> : <span className="text-muted-foreground">(optional)</span>}
        </p>
      </div>
      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{hint}</p>
      <input
        ref={ref}
        id={id}
        type="file"
        accept="image/*"
        capture={facing}
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0])}
        aria-label={`${value ? "Replace" : "Add"} ${label.toLowerCase()} photo`}
      />
      {value ? (
        <div className={cn("relative mt-2 overflow-hidden rounded-2xl border border-white/10", aspect)}>
          <img src={value} alt={`${label} photo you added`} className="h-full w-full object-cover" />
          <div className="absolute inset-x-2 bottom-2 flex gap-2">
            <label htmlFor={id} className="btn-secondary btn-sm flex-1 cursor-pointer bg-black/60 backdrop-blur">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Retake
            </label>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="btn-secondary btn-sm bg-black/60 px-3 backdrop-blur"
              aria-label={`Remove ${label.toLowerCase()} photo`}
              title="Remove"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={cn(
            "mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-4 text-center transition-colors hover:border-white/35 hover:bg-white/[0.04] focus-within:ring-2 focus-within:ring-white/40",
            aspect,
          )}
        >
          {busy ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06]">
              {facing === "user" ? <Camera className="h-5 w-5 text-silver-bright" aria-hidden="true" /> : <ImagePlus className="h-5 w-5 text-silver-bright" aria-hidden="true" />}
            </span>
          )}
          <span className="text-sm text-foreground">{busy ? "Preparing photo…" : "Take or upload"}</span>
        </label>
      )}
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};
