import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";

// Spinner discreto para carregamentos pontuais.
export function Spinner({ className = "" }: { className?: string }) {
  return <Loader2 className={`animate-spin text-accent ${className}`} />;
}

// Estado de erro amigável com opção de tentar novamente.
export function ErrorState({
  message = "Não foi possível conectar ao servidor.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/25 bg-destructive/5 py-16 px-6 text-center"
    >
      <span className="grid place-items-center size-11 rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle size={20} />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">Erro de conexão</p>
        <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
        <RefreshCw size={14} /> Tentar novamente
      </Button>
    </motion.div>
  );
}

// Banner sutil indicando modo demonstração (backend indisponível).
export function DemoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
    >
      <AlertTriangle size={13} className="shrink-0" />
      Sem conexão com <code className="font-mono">localhost:5000</code> — exibindo dados de demonstração.
    </motion.div>
  );
}

// ── Skeletons ────────────────────────────────────────────────────────────────
export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-md border border-border bg-card p-4 flex flex-col gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-7 w-24" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 380 }: { height?: number }) {
  return (
    <div className="flex flex-col gap-3" style={{ height }}>
      <div className="flex-1 flex items-end gap-3 px-2">
        {[0.5, 0.75, 0.4, 0.9, 0.65, 0.8, 0.55].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-md" style={{ height: `${h * 100}%` }} />
        ))}
      </div>
      <Skeleton className="h-3 w-40 mx-auto" />
    </div>
  );
}

export function SkeletonTable({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-9 w-full rounded-md" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-8" />
          ))}
        </div>
      ))}
    </div>
  );
}
