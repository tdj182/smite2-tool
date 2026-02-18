import { useState } from 'react';
import { Link } from 'react-router-dom';
import { buildsData } from '@/lib/builds';
import { getItemById } from '@/lib/items';
import type { BuildRole } from '@/lib/schemas/builds';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
      <p className="mb-8 text-text-secondary">
        Generic builds for each role. Perfect for beginners who want a solid foundation.
      </p>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap items-center gap-4 rounded-lg bg-surface p-6">
        <div>
          <label className="mb-2 block font-bold">Role:</label>
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value as BuildRole | 'all')}
            className="rounded border border-border-light px-2 py-2"
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role === 'all' ? 'All Roles' : role.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto">
          <strong>{filteredBuilds.length}</strong> builds found
        </div>
      </div>

      {/* Builds Grid */}
      <div className="grid gap-8">
        {filteredBuilds.map(build => (
          <Card key={build.id} className="border-2">
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-4">
                  <h2 className="m-0">{build.name}</h2>
                  <Badge className="bg-builds text-sm font-bold uppercase text-white">
                    {build.role}
                  </Badge>
                </div>
                {build.description && (
                  <p className="mt-2 mb-0 text-text-secondary">{build.description}</p>
                )}
              </div>

              {/* Build Path */}
              <div>
                <h3 className="mb-4 text-base text-text-secondary">Build Order</h3>
                <div className="flex flex-wrap items-start gap-4">
                  {build.itemIds.map((itemId, index) => {
                    const item = getItemById(itemId);
                    const noteKey = `${build.id}-${itemId}`;
                    const isExpanded = expandedNotes.has(noteKey);
                    const hasNote = build.itemNotes && build.itemNotes[itemId];

                    return (
                      <div key={itemId} className="flex items-start gap-2">
                        <div className="flex flex-col gap-2">
                          {item ? (
                            <>
                              <Link
                                to={`/items/${itemId}`}
                                className="block min-w-[120px] rounded-lg border-2 border-items bg-white p-4 text-center no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-active-bg"
                              >
                                <img
                                  src={import.meta.env.BASE_URL + item.icon.localPath.replace(/^\//, '')}
                                  alt={item.icon.alt}
                                  className="mx-auto mb-3 block size-[60px] rounded-lg border-2 border-items object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <div className="mb-1 font-bold">{item.name}</div>
                                <div className="text-xs text-text-secondary">
                                  {item.classification.category}
                                </div>
                                <div className="mt-1 text-sm text-items">
                                  {item.shop.cost}g
                                </div>
                              </Link>

                              {/* Notes Toggle Button */}
                              {hasNote && (
                                <Button
                                  variant={isExpanded ? "default" : "secondary"}
                                  size="sm"
                                  onClick={() => toggleNote(build.id, itemId)}
                                  className={cn(
                                    "text-xs font-bold",
                                    isExpanded ? "bg-items text-white hover:bg-items/90" : ""
                                  )}
                                >
                                  {isExpanded ? '▲ Hide Notes' : '▼ Show Notes'}
                                </Button>
                              )}

                              {/* Expandable Notes */}
                              {hasNote && isExpanded && (
                                <div className="max-w-[280px] rounded-lg border border-items bg-active-bg p-3 text-sm leading-relaxed text-text-primary">
                                  {build.itemNotes![itemId]}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="min-w-[120px] rounded-lg border-2 border-dashed border-border-light bg-surface p-4 text-center text-text-muted">
                              <div className="text-sm">{itemId}</div>
                              <div className="text-xs">(Not found)</div>
                            </div>
                          )}
                        </div>
                        {index < build.itemIds.length - 1 && (
                          <span className="mt-8 text-2xl text-border-light">→</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              {build.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {build.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBuilds.length === 0 && (
        <div className="p-12 text-center text-text-secondary">
          <p>No builds found for this role.</p>
        </div>
      )}
    </div>
  );
}
