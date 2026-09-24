// Conservative control-flow planning for straight-line statement lists.
// The planner is intentionally separate from emission so transforms can be tested
// without changing semantics of loops, returns, breaks, or closures.
import crypto from "node:crypto";

function rnd() {
  return crypto.randomBytes(4).readUInt32LE(0) >>> 0;
}

export function makeDispatchPlan(body) {
  if (!Array.isArray(body) || body.length < 2) return null;
  const ids = body.map(() => rnd());
  const order = ids.map((id, index) => ({ id, index }));
  for (let i = order.length - 1; i > 0; i--) {
    const j = rnd() % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.map((entry, position) => ({
    state: entry.id,
    sourceIndex: entry.index,
    next: order[position + 1]?.id ?? 0
  }));
}
