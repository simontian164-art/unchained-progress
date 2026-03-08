import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface ModulePageLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const ModulePageLayout = ({ title, subtitle, children }: ModulePageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />

      <header className="relative z-10 border-b border-border sticky top-0 bg-background/60 backdrop-blur-xl">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/hub"
              className="p-2 rounded-lg glass-card text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-display font-bold text-foreground tracking-tight">{title}</h1>
              <p className="text-muted-foreground text-xs">{subtitle}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container py-8 md:py-12">
        {children}
      </main>
    </div>
  );
};

export default ModulePageLayout;
