import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          background: '#1a1a1a',
          color: 'white',
          padding: '1rem 2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              SMITE 2 Tool
            </Link>
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link
              to="/"
              style={{
                color: isActive('/') ? '#4CAF50' : 'white',
                textDecoration: 'none',
                fontWeight: isActive('/') ? 'bold' : 'normal',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                background: isActive('/') ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
              }}
            >
              Home
            </Link>
            <Link
              to="/gods"
              style={{
                color: isActive('/gods') ? '#4CAF50' : 'white',
                textDecoration: 'none',
                fontWeight: isActive('/gods') ? 'bold' : 'normal',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                background: isActive('/gods') ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
              }}
            >
              Gods
            </Link>
            <Link
              to="/items"
              style={{
                color: isActive('/items') ? '#4CAF50' : 'white',
                textDecoration: 'none',
                fontWeight: isActive('/items') ? 'bold' : 'normal',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                background: isActive('/items') ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
              }}
            >
              Items
            </Link>
            <Link
              to="/builds"
              style={{
                color: isActive('/builds') ? '#4CAF50' : 'white',
                textDecoration: 'none',
                fontWeight: isActive('/builds') ? 'bold' : 'normal',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                background: isActive('/builds') ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
              }}
            >
              Builds
            </Link>
          </div>
        </nav>
      </header>

      <main style={{ flex: 1, margin: '0 auto', width: '95%' }}>
        <Outlet />
      </main>

      <footer
        style={{
          background: '#f5f5f5',
          padding: '1rem 2rem',
          textAlign: 'center',
          color: '#666',
          fontSize: '0.875rem',
        }}
      >
        SMITE 2 Tool v1.0 - Built with validated data using Zod
      </footer>
    </div>
  );
}
