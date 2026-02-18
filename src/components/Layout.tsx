import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { Moon, Sun } from '@/components/Icons';

export default function Layout() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/gods', label: 'Gods' },
    { to: '/items', label: 'Items' },
    { to: '/builds', label: 'Builds' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-header px-8 py-4 text-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
        <nav className="flex items-center gap-8">
          <h1 className="m-0 text-2xl">
            <Link to="/" className="text-white no-underline">
              SMITE 2 Tool
            </Link>
          </h1>
          <div className="flex gap-4">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'rounded px-4 py-2 no-underline transition-colors',
                  isActive(to)
                    ? 'bg-gods-light font-bold text-gods'
                    : 'text-white hover:text-gods'
                )}
              >
                {label}
              </Link>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="ml-auto text-white hover:bg-white/10 hover:text-white"
          >
            {theme === 'dark' ? <Sun /> : <Moon /> }
          </Button>
        </nav>
      </header>

      <main className="mx-auto w-[95%] flex-1">
        <Outlet />
      </main>

      <footer className="bg-muted px-8 py-4 text-center text-sm ">
        SMITE 2 Tool v1.0 - Built with validated data using Zod
      </footer>
    </div>
  );
}
