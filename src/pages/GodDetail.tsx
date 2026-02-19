import { useParams, Link, useNavigate } from "react-router-dom";
import { getGodById } from "@/lib/gods";
import { getBuildsByGodId } from "@/lib/builds";
import { getItemById } from "@/lib/items";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function GodDetail() {
  const { godId } = useParams<{ godId: string }>();
  const navigate = useNavigate();
  const god = godId ? getGodById(godId) : undefined;

  if (!god) {
    return (
      <div>
        <h1>God Not Found</h1>
        <p>The god "{godId}" could not be found.</p>
        <Link to="/gods" className="text-gods">
          ← Back to Gods List
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Button variant="outline" onClick={() => navigate("/gods")} className="mb-6">
        ← Back to Gods
      </Button>

      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        {/* Left Column - God Info */}
        <div>
          <div className="mb-6 flex items-center gap-6">
            <img
              src={import.meta.env.BASE_URL + god.icon.localPath.replace(/^\//, '')}
              alt={god.icon.alt}
              className="size-[100px] rounded-lg border-[3px] border-gods object-cover shadow-md"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <h1 className="m-0">{god.name}</h1>
          </div>

          <Card className="mb-6 bg-muted">
            <CardContent className="p-6">
              <h3 className="mt-0">Identity</h3>
              <div className="grid gap-3">
                <div><strong>Pantheon:</strong> {god.identity.pantheon || "Unknown"}</div>
                <div><strong>Roles:</strong> {god.identity.roles.map((r) => r.toUpperCase()).join(", ")}</div>
                <div><strong>Damage Type:</strong> {god.identity.primaryDamageType || "Unknown"}</div>
                <div><strong>Scaling:</strong> {god.identity.scalingProfile}</div>
                <div><strong>Attack Type:</strong> {god.identity.basicAttackType || "Unknown"}</div>
                <div><strong>Range:</strong> {god.identity.rangeClass}</div>
              </div>
            </CardContent>
          </Card>

          {/* Base Stats */}
          <Card className="bg-muted">
            <CardContent className="p-6">
              <h3 className="mt-0">Base Stats (Level 1)</h3>
              <div className="grid gap-2 text-sm">
                <div><strong>Health:</strong> {god.baseStats.health.toFixed(1)} (+{god.baseStats.healthPerLevel.toFixed(1)}/level)</div>
                <div><strong>Mana:</strong> {god.baseStats.mana.toFixed(1)} (+{god.baseStats.manaPerLevel.toFixed(1)}/level)</div>
                <div><strong>HP5:</strong> {god.baseStats.healthRegen.toFixed(2)} (+{god.baseStats.healthRegenPerLevel.toFixed(2)}/level)</div>
                <div><strong>MP5:</strong> {god.baseStats.manaRegen.toFixed(2)} (+{god.baseStats.manaRegenPerLevel.toFixed(2)}/level)</div>
                <Separator className="my-2" />
                <div><strong>Physical Protection:</strong> {god.baseStats.physicalProtection.toFixed(2)} (+{god.baseStats.physicalProtectionPerLevel.toFixed(2)}/level)</div>
                <div><strong>Magical Protection:</strong> {god.baseStats.magicalProtection.toFixed(2)} (+{god.baseStats.magicalProtectionPerLevel.toFixed(2)}/level)</div>
                <Separator className="my-2" />
                <div><strong>Attack Speed:</strong> {god.baseStats.attackSpeed.toFixed(2)} (+{god.baseStats.attackSpeedPerLevel.toFixed(2)}%/level)</div>
                <div><strong>Movement Speed:</strong> {god.baseStats.movementSpeed}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div>
          {god.details.summary && (
            <div className="mb-8">
              <h2>Overview</h2>
              <p className="leading-relaxed ">{god.details.summary}</p>
            </div>
          )}

          {god.details.strengths.length > 0 && (
            <div className="mb-8">
              <h3>Strengths</h3>
              <ul className="leading-loose">
                {god.details.strengths.map((strength, idx) => (
                  <li key={idx} className="text-strength">{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {god.details.weaknesses.length > 0 && (
            <div className="mb-8">
              <h3>Weaknesses</h3>
              <ul className="leading-loose">
                {god.details.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="text-weakness">{weakness}</li>
                ))}
              </ul>
            </div>
          )}

          {god.details.beginnerTips.length > 0 && (
            <div className="mb-8">
              <h3>Beginner Tips</h3>
              <ul className="leading-loose">
                {god.details.beginnerTips.map((tip, idx) => (
                  <li key={idx} className="">{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {god.abilities.length > 0 && (
            <div className="mb-8">
              <h3>Abilities</h3>
              <div className="grid gap-4">
                {god.abilities.map((ability, idx) => (
                  <Card
                    key={idx}
                    className={cn(
                      ability.type === "ultimate" ? "bg-chart-4" : "bg-card"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <strong className="text-lg">{ability.name}</strong>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {ability.type.toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-sm ">Key: {ability.key}</span>
                      </div>
                      {ability.description && (
                        <p className="mt-3 leading-relaxed ">{ability.description}</p>
                      )}
                      <div className="mt-3 flex gap-4 text-sm">
                        {ability.cooldownSeconds !== null && (
                          <div><strong>CD:</strong> {ability.cooldownSeconds}s</div>
                        )}
                        {ability.manaCost !== null && (
                          <div><strong>Cost:</strong> {ability.manaCost} mana</div>
                        )}
                        {ability.scalingText && (
                          <div><strong>Scaling:</strong> {ability.scalingText}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {god.aspects.length > 0 && (
            <div className="mb-8">
              <h3>Aspects</h3>
              <div className="grid gap-4">
                {god.aspects.map((aspect) => (
                  <Card key={aspect.id} className="bg-muted">
                    <CardContent className="p-4">
                      <strong className="text-lg">{aspect.name}</strong>
                      {aspect.description && (
                        <p className="mt-2">{aspect.description}</p>
                      )}
                      {aspect.abilities.length > 0 && (
                        <div className="mt-4 grid gap-3">
                          <strong className="text-sm">Enhanced Abilities</strong>
                          {aspect.abilities.map((ability, idx) => (
                            <Card key={idx}>
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <strong>{ability.name}</strong>
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      {ability.type.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <span className="text-sm">Key: {ability.key}</span>
                                </div>
                                {ability.description && (
                                  <p className="mt-2 text-sm leading-relaxed">{ability.description}</p>
                                )}
                                <div className="mt-2 flex gap-4 text-sm">
                                  {ability.cooldownSeconds !== null && (
                                    <div><strong>CD:</strong> {ability.cooldownSeconds}s</div>
                                  )}
                                  {ability.manaCost !== null && (
                                    <div><strong>Cost:</strong> {ability.manaCost} mana</div>
                                  )}
                                  {ability.scalingText && (
                                    <div><strong>Scaling:</strong> {ability.scalingText}</div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {god.history.length > 0 && (
            <div>
              <h3>Patch History</h3>
              <div className="grid gap-3">
                {god.history.map((entry, idx) => (
                  <div key={idx} className="border-l-[3px] border-gods pl-4">
                    <strong>{entry.patch}</strong>
                    {entry.notes && (
                      <p className="mt-1 mb-0 ">{entry.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Builds */}
          {getBuildsByGodId(god.id).length > 0 && (
            <div className="mb-8">
              <h3>Recommended Builds</h3>
              <div className="grid gap-4">
                {getBuildsByGodId(god.id).map(build => (
                  <Card key={build.id} className="border-2 border-builds">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center gap-3">
                        <strong className="text-lg">{build.name}</strong>
                        <Badge className="text-xs font-bold uppercase">
                          {build.role}
                        </Badge>
                      </div>
                      {build.description && (
                        <p className="mb-3 text-sm">{build.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        {build.itemIds.map((itemId, idx) => {
                          const item = getItemById(itemId);
                          if (!item) return null;
                          return (
                            <div key={itemId} className="flex items-center gap-2">
                              <Link to={`/items/${itemId}`} title={item.name}>
                                <img
                                  src={import.meta.env.BASE_URL + item.icon.localPath.replace(/^\//, '')}
                                  alt={item.icon.alt}
                                  className="size-[40px] rounded-lg border-2 border-items object-cover transition-transform hover:scale-110"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </Link>
                              {idx < build.itemIds.length - 1 && (
                                <span className="text-sm text-muted-foreground">→</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
