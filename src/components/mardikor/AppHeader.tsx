import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { LifeBuoy, ShieldCheck } from "lucide-react";
import { store, type User } from "@/lib/mardikor";
import { TelegramButton } from "./TelegramButton";
import { tickets } from "@/lib/support";

const Dot = ({ n }: { n: number }) => (n > 0 ? <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-white" aria-label={`${n} ta yangi`}>{n}</span> : null);

const nl = ({ isActive }: { isActive: boolean }) => (isActive ? "hover:text-primary text-primary" : "hover:text-primary");

export function AppHeader() {
  const [p, setP] = useState<User | null>(null);
  const [unread, setUnread] = useState(0);
  const [adminNew, setAdminNew] = useState(0);
  useEffect(() => {
    const u = store.profile(); setP(u);
    if (u) { setUnread(tickets.unreadForUser(u.id)); if (u.role === "admin") setAdminNew(tickets.unreadForAdmin()); }
  }, []);
  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2 font-display text-base font-bold sm:text-lg">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground">D</span>
          <span className="flex items-center gap-2 max-[400px]:sr-only">Daywork<span className="text-muted-foreground">.uz</span></span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium sm:gap-4">
          <NavLink to="/zayavkalar" className={nl}>Zayavkalar</NavLink>
          <NavLink to="/reyting" className={(a) => nl(a) + " hidden sm:inline"}>Reyting</NavLink>
          <NavLink to="/yordam" className={(a) => nl(a) + " relative inline-flex items-center gap-1"} aria-label="Yordam">
            <LifeBuoy className="h-4 w-4" /><span className="hidden lg:inline">Yordam</span><Dot n={unread} />
          </NavLink>
          {p && <NavLink to="/balans" className={(a) => nl(a) + " hidden md:inline"}>Balans</NavLink>}
          {p && <NavLink to="/mening" className={(a) => nl(a) + " hidden md:inline"}>Mening ishlarim</NavLink>}
          {p?.role === "admin" && (
            <NavLink to="/admin" className={(a) => nl(a) + " relative inline-flex items-center gap-1"}><ShieldCheck className="h-4 w-4" /><span className="hidden sm:inline">Admin</span><Dot n={adminNew} /></NavLink>
          )}
          <TelegramButton variant="icon" />
          {p ? (
            <Link to="/rol" className="rounded-full bg-secondary px-3 py-1.5 whitespace-nowrap">{p.name.split(" ")[0]}<span className="hidden sm:inline"> · {p.id}</span></Link>
          ) : (
            <Link to="/kirish" className="rounded-full bg-primary px-3 py-2 text-primary-foreground sm:px-4">Kirish</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
