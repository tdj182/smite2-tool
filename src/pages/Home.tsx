import { Link } from 'react-router-dom';
import { godsData } from '@/lib/gods';
import { itemsData } from '@/lib/items';

export default function Home() {
  return (
    <div>
      <h1>Welcome to SMITE 2 Tool</h1>
      <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '2rem' }}>
        A comprehensive database for SMITE 2 gods and items with validated data.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div
          style={{
            border: '2px solid #4CAF50',
            borderRadius: '8px',
            padding: '2rem',
            background: 'rgba(76, 175, 80, 0.05)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Gods Database</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Browse {godsData.gods.length} gods with detailed information about roles, abilities, and strategies.
          </p>
          <Link
            to="/gods"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#4CAF50',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            View Gods
          </Link>
        </div>

        <div
          style={{
            border: '2px solid #2196F3',
            borderRadius: '8px',
            padding: '2rem',
            background: 'rgba(33, 150, 243, 0.05)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Items Database</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Explore {itemsData.items.length} items with stats, build paths, and tier information.
          </p>
          <Link
            to="/items"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#2196F3',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            View Items
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Data Information</h3>
        <ul style={{ color: '#666' }}>
          <li>Patch: {godsData.meta.patch}</li>
          <li>Data Version: {godsData.meta.dataVersion}</li>
          <li>Last Updated: {new Date(godsData.meta.lastUpdatedUtc).toLocaleDateString()}</li>
          <li>All data is validated with Zod schemas for type safety</li>
        </ul>
      </div>
    </div>
  );
}
