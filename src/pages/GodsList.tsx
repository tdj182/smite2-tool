import { useState } from 'react';
import { Link } from 'react-router-dom';
import { godsData, getAllPantheons } from '@/lib/gods';
import type { GodRole, Pantheon } from '@/lib/schemas/gods';

export default function GodsList() {
  const [selectedRole, setSelectedRole] = useState<GodRole | 'all'>('all');
  const [selectedPantheon, setSelectedPantheon] = useState<Pantheon | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const roles: (GodRole | 'all')[] = ['all', 'solo', 'jungle', 'middle', 'carry', 'support'];
  const pantheons: (Pantheon | 'all')[] = ['all', ...getAllPantheons()];

  const filteredGods = godsData.gods.filter(god => {
    if (selectedRole !== 'all' && !god.identity.roles.includes(selectedRole as GodRole)) {
      return false;
    }
    if (selectedPantheon !== 'all' && god.identity.pantheon !== selectedPantheon) {
      return false;
    }
    if (searchQuery && !god.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <h1>Gods</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Browse all {godsData.gods.length} gods. Click on a god to view detailed information.
      </p>

      {/* Filters */}
      <div
        style={{
          background: '#f5f5f5',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Search:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search gods..."
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Role:</label>
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value as GodRole | 'all')}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Pantheon:</label>
          <select
            value={selectedPantheon}
            onChange={e => setSelectedPantheon(e.target.value as Pantheon | 'all')}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {pantheons.map(pantheon => (
              <option key={pantheon} value={pantheon}>
                {pantheon === 'all' ? 'All Pantheons' : pantheon}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <strong>{filteredGods.length}</strong> gods found
        </div>
      </div>

      {/* Gods Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filteredGods.map(god => (
          <Link
            key={god.id}
            to={`/gods/${god.id}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1.5rem',
              background: 'white',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <img
                src={import.meta.env.BASE_URL + god.icon.localPath.replace(/^\//, '')}
                alt={god.icon.alt}
                style={{
                  width: '50px',
                  height: '50px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '2px solid #4CAF50',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0' }}>{god.name}</h3>
                <div style={{ color: '#666', fontSize: '0.875rem' }}>
                  {god.identity.pantheon || 'Unknown'} • {god.identity.primaryDamageType || 'Unknown'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {god.identity.roles.map(role => (
                <span
                  key={role}
                  style={{
                    background: '#4CAF50',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {role.toUpperCase()}
                </span>
              ))}
            </div>
            {god.details.summary && (
              <p style={{ fontSize: '0.875rem', color: '#666', margin: '0.5rem 0 0 0', lineHeight: '1.4' }}>
                {god.details.summary.slice(0, 100)}
                {god.details.summary.length > 100 ? '...' : ''}
              </p>
            )}
          </Link>
        ))}
      </div>

      {filteredGods.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p>No gods found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
