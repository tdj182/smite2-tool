import { useState } from 'react';
import { Link } from 'react-router-dom';
import { itemsData } from '@/lib/items';
import type { ItemCategory } from '@/lib/schemas/items';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ItemsList() {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: (ItemCategory | 'all')[] = ['all', 'item', 'starter', 'relic', 'consumable', 'curio'];
  const tiers: (number | 'all')[] = ['all', 1, 2, 3];

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
      <p className="mb-8 ">
        Browse all {itemsData.items.length} items. Click on an item to view detailed information.
      </p>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap items-center gap-4 rounded-lg bg-muted p-6">
        <div>
          <label className="mb-2 block font-bold">Search:</label>
          <Input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-[200px]"
          />
        </div>

        <div>
          <label className="mb-2 block font-bold">Category:</label>
          <Select value={selectedCategory} onValueChange={v => setSelectedCategory(v as ItemCategory | 'all')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block font-bold">Tier:</label>
          <Select value={String(selectedTier)} onValueChange={v => setSelectedTier(v === 'all' ? 'all' : Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tiers.map(tier => (
                <SelectItem key={tier} value={String(tier)}>
                  {tier === 'all' ? 'All Tiers' : `Tier ${tier}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto">
          <strong>{filteredItems.length}</strong> items found
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
        {filteredItems.map(item => (
          <Link
            key={item.id}
            to={`/items/${item.id}`}
            className="block no-underline"
          >
            <Card className="cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-3 flex gap-4">
                  <img
                    src={import.meta.env.BASE_URL + item.icon.localPath.replace(/^\//, '')}
                    alt={item.icon.alt}
                    className="size-[50px] rounded-lg border-2 border-items object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="flex-1">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="m-0">{item.name}</h3>
                      <Badge className="bg-items text-xs text-white">
                        {item.shop.totalCost ?? item.shop.cost}g
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mb-3 text-sm ">
                  {item.classification.category} • {item.classification.effectType}
                  {item.classification.tier !== null && ` • Tier ${item.classification.tier}`}
                </div>

                {item.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {item.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats Preview */}
                {Object.keys(item.stats).length > 0 && (
                  <div className="text-sm ">
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
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="p-12 text-center ">
          <p>No items found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
