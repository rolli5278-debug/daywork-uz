import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "./styles.css";
import Index from "@/pages/index";
import Kirish from "@/pages/kirish";
import Rol from "@/pages/rol";
import Feed from "@/pages/zayavkalar";
import NewJob from "@/pages/zayavka-yangi";
import Mine from "@/pages/mening";
import Balance from "@/pages/balans";
import Profil from "@/pages/profil";
import Admin from "@/pages/admin";
import Reyting from "@/pages/reyting";
import PublicProfile from "@/pages/foydalanuvchi";
import Yordam from "@/pages/yordam";
import Murojaat from "@/pages/murojaat";
import { ensureSeedAdmins } from "@/lib/auth";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Go home</Link>
        </div>
      </div>
    </div>
  );
}

// The old prototype kept a password-less profile; accounts now live in mk_users.
try { localStorage.removeItem("mk_profile"); } catch { /* storage unavailable */ }

ensureSeedAdmins().catch(console.error).finally(() => createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/kirish" element={<Kirish />} />
        <Route path="/rol" element={<Rol />} />
        <Route path="/zayavkalar" element={<Feed />} />
        <Route path="/zayavka-yangi" element={<NewJob />} />
        <Route path="/mening" element={<Mine />} />
        <Route path="/balans" element={<Balance />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reyting" element={<Reyting />} />
        <Route path="/u/:id" element={<PublicProfile />} />
        <Route path="/yordam" element={<Yordam />} />
        <Route path="/yordam/:id" element={<Murojaat />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  </StrictMode>,
));
