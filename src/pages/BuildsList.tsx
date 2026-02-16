import { useState } from 'react';
import { Link } from 'react-router-dom';
import { buildsData } from '@/lib/builds';
import { getItemById } from '@/lib/items';
import type { BuildRole } from '@/lib/schemas/builds';

export default function BuildsList() {
  const [selectedRole, setSelectedRole] = useState<BuildRole | 'all'>('all');
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const roles: (BuildRole | 'all')[] = ['all', 'adc', 'mid', 'jungle', 'solo', 'support'];

  const toggleNote = (buildId: string, itemId: string) => {
    const key = `${buildId}-${itemId}`;
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const filteredBuilds = buildsData.builds.filter(build => {
    if (selectedRole !== 'all' && build.role !== selectedRole) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <h1>Builds</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Generic builds for each role. Perfect for beginners who want a solid foundation.
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Role:</label>
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value as BuildRole | 'all')}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role === 'all' ? 'All Roles' : role.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <strong>{filteredBuilds.length}</strong> builds found
        </div>
      </div>

      {/* Builds Grid */}
      <div style={{ display: 'grid', gap: '2rem' }}>
        {filteredBuilds.map(build => (
          <div
            key={build.id}
            style={{
              border: '2px solid #ddd',
              borderRadius: '12px',
              padding: '2rem',
              background: 'white',
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <h2 style={{ margin: 0 }}>{build.name}</h2>
                <span
                  style={{
                    background: '#FF9800',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '16px',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                >
                  {build.role}
                </span>
              </div>
              {build.description && (
                <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>{build.description}</p>
              )}
            </div>

            {/* Build Path */}
            <div>
              <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem' }}>Build Order</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {build.itemIds.map((itemId, index) => {
                  const item = getItemById(itemId);
                  const noteKey = `${build.id}-${itemId}`;
                  const isExpanded = expandedNotes.has(noteKey);
                  const hasNote = build.itemNotes && build.itemNotes[itemId];

                  return (
                    <div key={itemId} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {item ? (
                          <>
                            <Link
                              to={`/items/${itemId}`}
                              style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                border: '2px solid #2196F3',
                                padding: '1rem',
                                borderRadius: '8px',
                                background: 'white',
                                minWidth: '120px',
                                textAlign: 'center',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#E3F2FD';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <img
                                src={item.icon.localPath}
                                alt={item.icon.alt}
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  margin: '0 auto 0.75rem auto',
                                  display: 'block',
                                  border: '2px solid #2196F3',
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{item.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                {item.classification.category}
                              </div>
                              <div style={{ fontSize: '0.875rem', color: '#2196F3', marginTop: '0.25rem' }}>
                                {item.shop.cost}g
                              </div>
                            </Link>

                            {/* Notes Toggle Button */}
                            {hasNote && (
                              <button
                                onClick={() => toggleNote(build.id, itemId)}
                                style={{
                                  background: isExpanded ? '#2196F3' : '#f5f5f5',
                                  color: isExpanded ? 'white' : '#666',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  padding: '0.5rem',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  fontWeight: 'bold',
                                }}
                                onMouseEnter={e => {
                                  if (!isExpanded) {
                                    e.currentTarget.style.background = '#e0e0e0';
                                  }
                                }}
                                onMouseLeave={e => {
                                  if (!isExpanded) {
                                    e.currentTarget.style.background = '#f5f5f5';
                                  }
                                }}
                              >
                                {isExpanded ? '▲ Hide Notes' : '▼ Show Notes'}
                              </button>
                            )}

                            {/* Expandable Notes */}
                            {hasNote && isExpanded && (
                              <div
                                style={{
                                  background: '#E3F2FD',
                                  border: '1px solid #2196F3',
                                  borderRadius: '8px',
                                  padding: '0.75rem',
                                  fontSize: '0.875rem',
                                  color: '#333',
                                  maxWidth: '280px',
                                  lineHeight: '1.4',
                                }}
                              >
                                {build.itemNotes![itemId]}
                              </div>
                            )}
                          </>
                        ) : (
                          <div
                            style={{
                              border: '2px dashed #ccc',
                              padding: '1rem',
                              borderRadius: '8px',
                              background: '#f5f5f5',
                              minWidth: '120px',
                              textAlign: 'center',
                              color: '#999',
                            }}
                          >
                            <div style={{ fontSize: '0.875rem' }}>{itemId}</div>
                            <div style={{ fontSize: '0.75rem' }}>(Not found)</div>
                          </div>
                        )}
                      </div>
                      {index < build.itemIds.length - 1 && (
                        <span style={{ color: '#ccc', fontSize: '1.5rem', marginTop: '2rem' }}>→</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            {build.tags.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {build.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        background: '#eee',
                        padding: '0.5rem 1rem',
                        borderRadius: '16px',
                        fontSize: '0.75rem',
                        color: '#666',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredBuilds.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p>No builds found for this role.</p>
        </div>
      )}
    </div>
  );
}
