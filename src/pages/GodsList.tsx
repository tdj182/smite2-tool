import { useState } from 'react';
import { Link } from 'react-router-dom';
import { godsData, getAllPantheons } from '@/lib/gods';
import type { GodRole, Pantheon } from '@/lib/schemas/gods';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
      <p className="mb-8 ">
        Browse all {godsData.gods.length} gods. Click on a god to view detailed information.
      </p>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap items-center gap-4 rounded-lg bg-muted p-6">
        <div>
          <Input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search gods..."
            className="w-[200px]"
          />
        </div>

        <div>
          <Select value={selectedRole} onValueChange={v => setSelectedRole(v as GodRole | 'all')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map(role => (
                <SelectItem key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={selectedPantheon} onValueChange={v => setSelectedPantheon(v as Pantheon | 'all')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pantheons.map(pantheon => (
                <SelectItem key={pantheon} value={pantheon}>
                  {pantheon === 'all' ? 'All Pantheons' : pantheon}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto">
          <strong>{filteredGods.length}</strong> gods found
        </div>
      </div>

      {/* Gods Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
        {filteredGods.map(god => (
          <Link
            key={god.id}
            to={`/gods/${god.id}`}
            className="block no-underline"
          >
            <Card className="cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-3 flex items-center gap-4">
                  <img
                    src={import.meta.env.BASE_URL + god.icon.localPath.replace(/^\//, '')}
                    alt={god.icon.alt}
                    className="size-[50px] rounded-lg border-2 border-gods object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div>
                    <h3 className="m-0 mb-1">{god.name}</h3>
                    <div className="text-sm ">
                      {god.identity.pantheon || 'Unknown'} • {god.identity.primaryDamageType || 'Unknown'}
                    </div>
                  </div>
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {god.identity.roles.map(role => (
                    <Badge key={role} className="bg-gods text-xs text-white">
                      {role.toUpperCase()}
                    </Badge>
                  ))}
                </div>
                {god.details.summary && (
                  <p className="m-0 mt-2 line-clamp-2 text-sm leading-relaxed ">
                    {god.details.summary}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredGods.length === 0 && (
        <div className="p-12 text-center ">
          <p>No gods found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
