import { useParams, Link, useNavigate } from 'react-router-dom';
import { getItemById, getItemsThatBuildInto } from '@/lib/items';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ItemDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const item = itemId ? getItemById(itemId) : undefined;

  if (!item) {
    return (
      <div>
        <h1>Item Not Found</h1>
        <p>The item "{itemId}" could not be found.</p>
        <Link to="/items" className="text-items">
          ← Back to Items List
        </Link>
      </div>
    );
  }

  const upgradesInto = getItemsThatBuildInto(item.id);

  return (
    <div>
      <Button variant="outline" onClick={() => navigate('/items')} className="mb-6">
        ← Back to Items
      </Button>

      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        {/* Left Column - Item Info */}
        <div>
          <div className="mb-6 flex items-center gap-6">
            <img
              src={import.meta.env.BASE_URL + item.icon.localPath.replace(/^\//, '')}
              alt={item.icon.alt}
              className="size-20 rounded-xl border-[3px] border-items object-cover shadow-md"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h1 className="m-0">{item.name}</h1>
          </div>

          <Card className="mb-6 bg-surface">
            <CardContent className="p-6">
              <h3 className="mt-0">Classification</h3>
              <div className="grid gap-3">
                <div><strong>Category:</strong> {item.classification.category}</div>
                <div><strong>Effect Type:</strong> {item.classification.effectType}</div>
                {item.classification.tier !== null && (
                  <div><strong>Tier:</strong> {item.classification.tier}</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 bg-surface">
            <CardContent className="p-6">
              <h3 className="mt-0">Shop</h3>
              <div className="text-2xl font-bold text-items">{item.shop.cost} Gold</div>
            </CardContent>
          </Card>

          {item.tags.length > 0 && (
            <Card className="bg-surface">
              <CardContent className="p-6">
                <h3 className="mt-0">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map(tag => (
                    <Badge key={tag} className="bg-items text-sm font-bold text-white">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Details */}
        <div>
          {/* Stats */}
          {Object.keys(item.stats).length > 0 && (
            <div className="mb-8">
              <h2>Stats</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                {Object.entries(item.stats).map(([stat, value]) => (
                  <div
                    key={stat}
                    className="flex items-center justify-between rounded-lg bg-surface p-4"
                  >
                    <span className="capitalize">{stat}</span>
                    <strong className="text-xl text-items">+{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details */}
          {(item.details.summary || item.details.passive || item.details.active) && (
            <div className="mb-8">
              <h2>Details</h2>

              {item.details.summary && (
                <div className="mb-4">
                  <h3>Summary</h3>
                  <p className="leading-relaxed ">{item.details.summary}</p>
                </div>
              )}

              {item.details.passive && (
                <Card className="mb-4 bg-passive-bg">
                  <CardContent className="p-4">
                    <strong className="text-amber-600">PASSIVE:</strong>
                    <p className="mt-2 mb-0 leading-relaxed ">{item.details.passive}</p>
                  </CardContent>
                </Card>
              )}

              {item.details.active && (
                <Card className="bg-active-bg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <strong className="text-blue-700">ACTIVE:</strong>
                      {item.details.cooldownSeconds !== null && (
                        <span className="text-sm ">
                          Cooldown: {item.details.cooldownSeconds}s
                        </span>
                      )}
                    </div>
                    <p className="mt-2 mb-0 leading-relaxed ">{item.details.active}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Build Path */}
          {(item.relationships.buildsFrom.length > 0 || upgradesInto.length > 0) && (
            <div className="mb-8">
              <h2>Build Path</h2>

              {item.relationships.buildsFrom.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-base ">Builds From</h3>
                  <div className="flex flex-wrap gap-3">
                    {item.relationships.buildsFrom.map(id => {
                      const buildItem = getItemById(id);
                      return buildItem ? (
                        <Button key={id} variant="outline" asChild>
                          <Link to={`/items/${id}`}>{buildItem.name}</Link>
                        </Button>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {upgradesInto.length > 0 && (
                <div>
                  <h3 className="text-base ">Upgrades Into</h3>
                  <div className="flex flex-wrap gap-3">
                    {upgradesInto.map(upgradeItem => (
                      <Button key={upgradeItem.id} variant="outline" asChild>
                        <Link to={`/items/${upgradeItem.id}`}>{upgradeItem.name}</Link>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Restricted to Gods */}
          {item.relationships.restrictedToGodIds.length > 0 && (
            <div className="mb-8">
              <h2>Restrictions</h2>
              <Card className="border-red-400 bg-restriction-bg">
                <CardContent className="p-4">
                  <strong className="text-weakness">God-Specific Item</strong>
                  <p className="mt-2 mb-0 ">
                    Only available to: {item.relationships.restrictedToGodIds.join(', ')}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* History */}
          {item.history.length > 0 && (
            <div>
              <h2>Patch History</h2>
              <div className="grid gap-3">
                {item.history.map((entry, idx) => (
                  <div key={idx} className="border-l-[3px] border-items pl-4">
                    <strong>{entry.patch}</strong>
                    {entry.notes && <p className="mt-1 mb-0 ">{entry.notes}</p>}
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
