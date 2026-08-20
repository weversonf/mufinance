"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeftRight,
  BarChart3,
  ChevronRight,
  CircleHelp,
  CreditCard,
  FileUp,
  FolderKanban,
  LayoutDashboard,
  Landmark,
  LogOut,
  Menu,
  Moon,
  MoreHorizontal,
  Search,
  Settings2,
  Sun,
  Target,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = { label: string; href: string; icon: LucideIcon };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  { label: "Dia a dia", items: [{ label: "Visão geral", href: "/", icon: LayoutDashboard }, { label: "Contas", href: "/planning", icon: Wallet }, { label: "Lançamentos", href: "/reports", icon: ArrowLeftRight }, { label: "Cartões", href: "/planning#cartoes", icon: CreditCard }] },
  { label: "Dinheiro", items: [{ label: "Transferências", href: "/planning", icon: ArrowLeftRight }, { label: "Importar dados", href: "/import", icon: Upload }] },
  { label: "Insights", items: [{ label: "Relatórios", href: "/reports", icon: BarChart3 }, { label: "Planejamento", href: "/planning", icon: Target }] },
];

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "M";
}

export function ReferencePageShell({ children, pageLabel, pageKicker, actions }: { children: React.ReactNode; pageLabel: string; pageKicker?: string; actions?: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const name = user?.displayName?.trim() || user?.email?.split("@")[0] || "Usuário";

  return (
    <div className={`reference-dashboard ${theme === "dark" ? "is-dark" : "is-light"} ${collapsed ? "is-sidebar-collapsed" : ""}`}>
      <div className={`rf-mobile-scrim ${mobileOpen ? "is-visible" : ""}`} onClick={() => setMobileOpen(false)} aria-hidden="true" />
      <aside className={`rf-sidebar ${mobileOpen ? "is-mobile-open" : ""}`}>
        <div className="rf-sidebar-brand"><a href="/" className="rf-brand"><span className="rf-brand-icon"><Landmark size={17} /></span><span><strong>MuFinance</strong><small>FINANÇAS PESSOAIS</small></span></a><button type="button" className="rf-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"><X size={18} /></button></div>
        <div className="rf-sidebar-caption">MuFinance</div>
        <nav className="rf-sidebar-nav" aria-label="Navegação principal">{groups.map((group) => <div className="rf-nav-group" key={group.label}><span className="rf-nav-group-label">{group.label}</span>{group.items.map(({ label, href, icon: Icon }) => { const basePath = href.split("#")[0]; const active = basePath === "/" ? pathname === "/" : pathname.startsWith(basePath); return <a key={`${group.label}-${label}`} href={href} className={`rf-nav-item ${active ? "is-active" : ""}`} onClick={() => setMobileOpen(false)}><Icon size={16} /><span>{label}</span>{label === "Relatórios" && <em>Live</em>}</a>; })}</div>)}</nav>
        <div className="rf-sidebar-spacer" />
        <div className="rf-sidebar-bottom"><button type="button" className="rf-nav-item" onClick={toggleTheme}><span className="rf-nav-theme-icon">{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</span><span>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span></button><a href="/categories" className={`rf-nav-item ${pathname.startsWith("/categories") ? "is-active" : ""}`}><Settings2 size={16} /><span>Configurações</span></a><button type="button" className="rf-nav-item" onClick={() => void logout()}><LogOut size={16} /><span>Sair da conta</span></button></div>
        <div className="rf-sidebar-user"><span className="rf-user-avatar">{initials(name)}</span><div><strong>{name}</strong><small>{user?.email || "Conta pessoal"}</small></div><MoreHorizontal size={15} /></div>
      </aside>
      <main className="rf-main"><header className="rf-topbar"><button type="button" className="rf-sidebar-toggle rf-desktop-toggle" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}><Menu size={17} /></button><button type="button" className="rf-sidebar-toggle rf-mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu size={18} /></button><div className="rf-topbar-search"><Search size={14} /><span>Pesquisar no MuFinance</span><kbd>⌘ K</kbd></div><div className="rf-topbar-actions"><a href="/import" className="rf-topbar-action rf-import-action"><FileUp size={15} /><span>Importar</span></a><button type="button" className="rf-topbar-action" aria-label="Ajuda"><CircleHelp size={16} /></button><button type="button" className="rf-topbar-theme" onClick={toggleTheme} aria-label="Alternar tema">{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}</button><span className="rf-topbar-avatar">{initials(name)}</span></div></header><div className="rf-content rf-internal-content"><div className="rf-breadcrumb"><span>MuFinance</span><ChevronRight size={13} /><strong>{pageLabel}</strong></div><div className="rf-internal-heading"><div><span className="rf-eyebrow">{pageKicker || "SEU ESPAÇO FINANCEIRO"}</span><h1>{pageLabel}</h1></div>{actions}</div>{children}</div></main>
    </div>
  );
}
