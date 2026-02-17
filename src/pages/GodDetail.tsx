import { useParams, Link, useNavigate } from "react-router-dom";
import { getGodById } from "@/lib/gods";

export default function GodDetail() {
  const { godId } = useParams<{ godId: string }>();
  const navigate = useNavigate();
  const god = godId ? getGodById(godId) : undefined;

  if (!god) {
    return (
      <div>
        <h1>God Not Found</h1>
        <p>The god "{godId}" could not be found.</p>
        <Link to="/gods" style={{ color: "#4CAF50" }}>
          ← Back to Gods List
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate("/gods")}
        style={{
          background: "transparent",
          border: "1px solid #ccc",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "1.5rem",
        }}
      >
        ← Back to Gods
      </button>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}
      >
        {/* Left Column - God Info */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <img
              src={import.meta.env.BASE_URL + god.icon.localPath.replace(/^\//, '')}
              alt={god.icon.alt}
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "3px solid #4CAF50",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <h1 style={{ margin: 0 }}>{god.name}</h1>
          </div>

          <div
            style={{
              background: "#f5f5f5",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Identity</h3>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <div>
                <strong>Pantheon:</strong> {god.identity.pantheon || "Unknown"}
              </div>
              <div>
                <strong>Roles:</strong>{" "}
                {god.identity.roles.map((r) => r.toUpperCase()).join(", ")}
              </div>
              <div>
                <strong>Damage Type:</strong>{" "}
                {god.identity.primaryDamageType || "Unknown"}
              </div>
              <div>
                <strong>Scaling:</strong> {god.identity.scalingProfile}
              </div>
              <div>
                <strong>Attack Type:</strong>{" "}
                {god.identity.basicAttackType || "Unknown"}
              </div>
              <div>
                <strong>Range:</strong> {god.identity.rangeClass}
              </div>
            </div>
          </div>

          {god.unlock && (
            <div
              style={{
                background: "#f5f5f5",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Unlock</h3>
              {god.unlock.costDiamonds !== null && (
                <div>
                  <strong>Diamonds:</strong> {god.unlock.costDiamonds}
                </div>
              )}
              {god.unlock.costGodTokens !== null && (
                <div>
                  <strong>God Tokens:</strong> {god.unlock.costGodTokens}
                </div>
              )}
              {god.unlock.isInRotation !== null && (
                <div>
                  <strong>In Rotation:</strong>{" "}
                  {god.unlock.isInRotation ? "Yes" : "No"}
                </div>
              )}
            </div>
          )}

          {/* Base Stats */}
          <div
            style={{
              background: "#f5f5f5",
              padding: "1.5rem",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Base Stats (Level 1)</h3>
            <div
              style={{ display: "grid", gap: "0.5rem", fontSize: "0.875rem" }}
            >
              <div>
                <strong>Health:</strong> {god.baseStats.health.toFixed(1)} (+
                {god.baseStats.healthPerLevel.toFixed(1)}/level)
              </div>
              <div>
                <strong>Mana:</strong> {god.baseStats.mana.toFixed(1)} (+
                {god.baseStats.manaPerLevel.toFixed(1)}/level)
              </div>
              <div>
                <strong>HP5:</strong> {god.baseStats.healthRegen.toFixed(2)} (+
                {god.baseStats.healthRegenPerLevel.toFixed(2)}/level)
              </div>
              <div>
                <strong>MP5:</strong> {god.baseStats.manaRegen.toFixed(2)} (+
                {god.baseStats.manaRegenPerLevel.toFixed(2)}/level)
              </div>
              <div
                style={{
                  marginTop: "0.5rem",
                  paddingTop: "0.5rem",
                  borderTop: "1px solid #ddd",
                }}
              >
                <strong>Physical Protection:</strong>{" "}
                {god.baseStats.physicalProtection.toFixed(2)} (+
                {god.baseStats.physicalProtectionPerLevel.toFixed(2)}/level)
              </div>
              <div>
                <strong>Magical Protection:</strong>{" "}
                {god.baseStats.magicalProtection.toFixed(2)} (+
                {god.baseStats.magicalProtectionPerLevel.toFixed(2)}/level)
              </div>
              <div
                style={{
                  marginTop: "0.5rem",
                  paddingTop: "0.5rem",
                  borderTop: "1px solid #ddd",
                }}
              >
                <strong>Attack Speed:</strong>{" "}
                {god.baseStats.attackSpeed.toFixed(2)} (+
                {god.baseStats.attackSpeedPerLevel.toFixed(2)}%/level)
              </div>
              <div>
                <strong>Movement Speed:</strong> {god.baseStats.movementSpeed}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div>
          {god.details.summary && (
            <div style={{ marginBottom: "2rem" }}>
              <h2>Overview</h2>
              <p style={{ lineHeight: "1.6", color: "#666" }}>
                {god.details.summary}
              </p>
            </div>
          )}

          {god.details.strengths.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h3>Strengths</h3>
              <ul style={{ lineHeight: "1.8" }}>
                {god.details.strengths.map((strength, idx) => (
                  <li key={idx} style={{ color: "#2E7D32" }}>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {god.details.weaknesses.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h3>Weaknesses</h3>
              <ul style={{ lineHeight: "1.8" }}>
                {god.details.weaknesses.map((weakness, idx) => (
                  <li key={idx} style={{ color: "#C62828" }}>
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {god.details.beginnerTips.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h3>Beginner Tips</h3>
              <ul style={{ lineHeight: "1.8" }}>
                {god.details.beginnerTips.map((tip, idx) => (
                  <li key={idx} style={{ color: "#666" }}>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {god.abilities.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h3>Abilities</h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                {god.abilities.map((ability, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "1rem",
                      background:
                        ability.type === "ultimate" ? "#FFF3E0" : "white",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "1.125rem" }}>
                          {ability.name}
                        </strong>
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            background: "#eee",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                          }}
                        >
                          {ability.type.toUpperCase()}
                        </span>
                      </div>
                      <span style={{ color: "#666", fontSize: "0.875rem" }}>
                        Key: {ability.key}
                      </span>
                    </div>
                    {ability.description && (
                      <p
                        style={{
                          marginTop: "0.75rem",
                          color: "#666",
                          lineHeight: "1.6",
                        }}
                      >
                        {ability.description}
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        marginTop: "0.75rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      {ability.cooldownSeconds !== null && (
                        <div>
                          <strong>CD:</strong> {ability.cooldownSeconds}s
                        </div>
                      )}
                      {ability.manaCost !== null && (
                        <div>
                          <strong>Cost:</strong> {ability.manaCost} mana
                        </div>
                      )}
                      {ability.scalingText && (
                        <div>
                          <strong>Scaling:</strong> {ability.scalingText}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {god.aspects.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h3>Aspects</h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                {god.aspects.map((aspect) => (
                  <div
                    key={aspect.id}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "1rem",
                    }}
                  >
                    <strong style={{ fontSize: "1.125rem" }}>
                      {aspect.name}
                    </strong>
                    {aspect.summary && (
                      <p style={{ marginTop: "0.5rem", color: "#666" }}>
                        {aspect.summary}
                      </p>
                    )}
                    {aspect.tradeoff && (
                      <p
                        style={{
                          marginTop: "0.5rem",
                          color: "#999",
                          fontSize: "0.875rem",
                          fontStyle: "italic",
                        }}
                      >
                        Tradeoff: {aspect.tradeoff}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {god.history.length > 0 && (
            <div>
              <h3>Patch History</h3>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {god.history.map((entry, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderLeft: "3px solid #4CAF50",
                      paddingLeft: "1rem",
                    }}
                  >
                    <strong>{entry.patch}</strong>
                    {entry.notes && (
                      <p style={{ margin: "0.25rem 0 0 0", color: "#666" }}>
                        {entry.notes}
                      </p>
                    )}
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
