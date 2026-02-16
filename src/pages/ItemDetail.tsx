import { useParams, Link, useNavigate } from 'react-router-dom';
import { getItemById, getItemsThatBuildInto } from '@/lib/items';

export default function ItemDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const item = itemId ? getItemById(itemId) : undefined;

  if (!item) {
    return (
      <div>
        <h1>Item Not Found</h1>
        <p>The item "{itemId}" could not be found.</p>
        <Link to="/items" style={{ color: '#2196F3' }}>
          ← Back to Items List
        </Link>
      </div>
    );
  }

  const upgradesInto = getItemsThatBuildInto(item.id);

  return (
    <div>
      <button
        onClick={() => navigate('/items')}
        style={{
          background: 'transparent',
          border: '1px solid #ccc',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '1.5rem',
        }}
      >
        ← Back to Items
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Left Column - Item Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <img
              src={item.icon.localPath}
              alt={item.icon.alt}
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '3px solid #2196F3',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h1 style={{ margin: 0 }}>{item.name}</h1>
          </div>

          <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: 0 }}>Classification</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <strong>Category:</strong> {item.classification.category}
              </div>
              <div>
                <strong>Effect Type:</strong> {item.classification.effectType}
              </div>
              {item.classification.tier !== null && (
                <div>
                  <strong>Tier:</strong> {item.classification.tier}
                </div>
              )}
            </div>
          </div>

          <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: 0 }}>Shop</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196F3' }}>{item.shop.cost} Gold</div>
          </div>

          {item.tags.length > 0 && (
            <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0 }}>Tags</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {item.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      background: '#2196F3',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div>
          {/* Stats */}
          {Object.keys(item.stats).length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2>Stats</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                {Object.entries(item.stats).map(([stat, value]) => (
                  <div
                    key={stat}
                    style={{
                      background: '#f5f5f5',
                      padding: '1rem',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ textTransform: 'capitalize' }}>{stat}</span>
                    <strong style={{ fontSize: '1.25rem', color: '#2196F3' }}>+{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details */}
          {(item.details.summary || item.details.passive || item.details.active) && (
            <div style={{ marginBottom: '2rem' }}>
              <h2>Details</h2>

              {item.details.summary && (
                <div style={{ marginBottom: '1rem' }}>
                  <h3>Summary</h3>
                  <p style={{ lineHeight: '1.6', color: '#666' }}>{item.details.summary}</p>
                </div>
              )}

              {item.details.passive && (
                <div
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    background: '#FFFDE7',
                  }}
                >
                  <strong style={{ color: '#F57C00' }}>PASSIVE:</strong>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#666', lineHeight: '1.6' }}>{item.details.passive}</p>
                </div>
              )}

              {item.details.active && (
                <div
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '1rem',
                    background: '#E3F2FD',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#1976D2' }}>ACTIVE:</strong>
                    {item.details.cooldownSeconds !== null && (
                      <span style={{ fontSize: '0.875rem', color: '#666' }}>
                        Cooldown: {item.details.cooldownSeconds}s
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#666', lineHeight: '1.6' }}>{item.details.active}</p>
                </div>
              )}
            </div>
          )}

          {/* Build Path */}
          {(item.relationships.buildsFrom.length > 0 || upgradesInto.length > 0) && (
            <div style={{ marginBottom: '2rem' }}>
              <h2>Build Path</h2>

              {item.relationships.buildsFrom.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', color: '#666' }}>Builds From</h3>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {item.relationships.buildsFrom.map(id => {
                      const buildItem = getItemById(id);
                      return buildItem ? (
                        <Link
                          key={id}
                          to={`/items/${id}`}
                          style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            border: '1px solid #ddd',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            background: 'white',
                          }}
                        >
                          {buildItem.name}
                        </Link>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {upgradesInto.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1rem', color: '#666' }}>Upgrades Into</h3>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {upgradesInto.map(upgradeItem => (
                      <Link
                        key={upgradeItem.id}
                        to={`/items/${upgradeItem.id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          border: '1px solid #ddd',
                          padding: '0.75rem',
                          borderRadius: '6px',
                          background: 'white',
                        }}
                      >
                        {upgradeItem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Restricted to Gods */}
          {item.relationships.restrictedToGodIds.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2>Restrictions</h2>
              <div
                style={{
                  background: '#FFEBEE',
                  border: '1px solid #EF5350',
                  padding: '1rem',
                  borderRadius: '8px',
                }}
              >
                <strong style={{ color: '#C62828' }}>God-Specific Item</strong>
                <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                  Only available to: {item.relationships.restrictedToGodIds.join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* History */}
          {item.history.length > 0 && (
            <div>
              <h2>Patch History</h2>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {item.history.map((entry, idx) => (
                  <div key={idx} style={{ borderLeft: '3px solid #2196F3', paddingLeft: '1rem' }}>
                    <strong>{entry.patch}</strong>
                    {entry.notes && <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>{entry.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
