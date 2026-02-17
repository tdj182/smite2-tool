import { useState } from 'react';
import { Link } from 'react-router-dom';
import { itemsData } from '@/lib/items';
import type { ItemCategory } from '@/lib/schemas/items';

export default function ItemsList() {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: (ItemCategory | 'all')[] = ['all', 'item', 'starter', 'relic', 'consumable', 'curio', 'mod'];
  const tiers: (number | 'all')[] = ['all', 1, 2, 3, 4, 5];

  const filteredItems = itemsData.items.filter(item => {
    if (selectedCategory !== 'all' && item.classification.category !== selectedCategory) {
      return false;
    }
    if (selectedTier !== 'all' && item.classification.tier !== selectedTier) {
      return false;
    }
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <h1>Items</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Browse all {itemsData.items.length} items. Click on an item to view detailed information.
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
            placeholder="Search items..."
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Category:</label>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as ItemCategory | 'all')}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tier:</label>
          <select
            value={selectedTier}
            onChange={e => setSelectedTier(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {tiers.map(tier => (
              <option key={tier} value={tier}>
                {tier === 'all' ? 'All Tiers' : `Tier ${tier}`}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <strong>{filteredItems.length}</strong> items found
        </div>
      </div>

      {/* Items Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filteredItems.map(item => (
          <Link
            key={item.id}
            to={`/items/${item.id}`}
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
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
              <img
                src={import.meta.env.BASE_URL + item.icon.localPath.replace(/^\//, '')}
                alt={item.icon.alt}
                style={{
                  width: '50px',
                  height: '50px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '2px solid #2196F3',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0 }}>{item.name}</h3>
                  <span
                    style={{
                      background: '#2196F3',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {item.shop.cost}g
                  </span>
                </div>
              </div>
            </div>

            <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              {item.classification.category} • {item.classification.effectType}
              {item.classification.tier !== null && ` • Tier ${item.classification.tier}`}
            </div>

            {item.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {item.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    style={{
                      background: '#eee',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                    }}
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span
                    style={{
                      background: '#eee',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                    }}
                  >
                    +{item.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Stats Preview */}
            {Object.keys(item.stats).length > 0 && (
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                {Object.entries(item.stats)
                  .slice(0, 2)
                  .map(([stat, value]) => (
                    <div key={stat}>
                      +{value} {stat}
                    </div>
                  ))}
                {Object.keys(item.stats).length > 2 && <div>+{Object.keys(item.stats).length - 2} more...</div>}
              </div>
            )}
          </Link>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p>No items found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
