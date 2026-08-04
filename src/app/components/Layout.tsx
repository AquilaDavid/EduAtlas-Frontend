import { NavLink, Outlet } from "react-router";
import { GraduationCap, LayoutDashboard, GitCompareArrows, TrendingUp, Trophy } from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/comparacoes", label: "Comparações", icon: GitCompareArrows, end: false },
  { to: "/evolucao", label: "Evolução", icon: TrendingUp, end: false },
  { to: "/ranking", label: "Ranking", icon: Trophy, end: false },
];

export function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center gap-2 sm:gap-8">
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <span className="grid place-items-center size-8 rounded-md bg-primary text-primary-foreground shrink-0">
              <GraduationCap size={18} />
            </span>
            {/* Nome + subtítulo somem em telas bem estreitas para dar espaço ao menu */}
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-sm font-mono uppercase tracking-[0.22em] text-foreground">EduAtlas</span>
              <span className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">Censo Escolar · INEP</span>
            </div>
          </div>

          {/* Sem overflow-x-auto: os rótulos somem em telas pequenas (ícone só) para
              todos os 4 itens caberem sempre numa linha, sem precisar de scroll. */}
          <nav className="flex items-center gap-0.5 sm:gap-1 flex-1 justify-end sm:justify-start">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                title={label}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2.5 sm:px-3 h-9 rounded-md text-sm whitespace-nowrap transition-colors shrink-0 ${
                    isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`
                }
              >
                <Icon size={15} />
                <span className="hidden md:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <span className="ml-auto text-[11px] font-mono uppercase tracking-widest text-muted-foreground hidden lg:block">
            API · localhost:5000
          </span>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 py-5 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}