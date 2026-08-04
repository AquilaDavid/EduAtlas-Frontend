import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="grid place-items-center py-32 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-mono uppercase tracking-[0.2em] text-muted-foreground">Erro 404</span>
        <h1 className="tracking-tight">Página não encontrada</h1>
        <Link to="/" className="text-sm text-accent hover:underline">Voltar ao Panorama</Link>
      </div>
    </div>
  );
}
