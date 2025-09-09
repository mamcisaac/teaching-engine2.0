import type { Express } from "express";

export function dumpRoutes(app: Express) {
  const rows: Array<{ method: string; path: string }> = [];
  const top = (app as any)?._router?.stack ?? [];
  for (const layer of top) {
    if (layer.route) {
      const path = layer.route.path;
      const methods = Object.keys(layer.route.methods ?? {});
      for (const m of methods) rows.push({ method: m.toUpperCase(), path });
      continue;
    }
    // Mounted router (possibly with a prefix)
    if (layer.name === "router" && layer.handle?.stack) {
      const prefix =
        typeof layer.regexp?.fast_slash !== "undefined" && layer.regexp.fast_slash
          ? "/"
          : layer.regexp?.toString?.() ?? "";
      for (const l of layer.handle.stack) {
        if (!l.route) continue;
        const methods = Object.keys(l.route.methods ?? {});
        for (const m of methods) {
          rows.push({ method: m.toUpperCase(), path: `${prefix} :: ${l.route.path}` });
        }
      }
    }
  }
  return rows;
}