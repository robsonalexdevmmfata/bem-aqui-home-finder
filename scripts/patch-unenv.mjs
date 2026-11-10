import fs from "node:fs";
import path from "node:path";

const utilsSource = `export class createNotImplementedError extends Error {
  constructor(name) {
    super("[unenv] " + name + " is not implemented yet!");
    this.name = "NotImplementedError";
  }
}
export function notImplemented(name) {
  return () => {
    throw new createNotImplementedError(name);
  };
}
export function notImplementedAsync(name) {
  return async () => {
    throw new createNotImplementedError(name);
  };
}
`;

const timersSource = `// Minimal polyfill for Cloudflare/Nitro builds when unenv ship is incomplete.
const g = globalThis;
if (typeof g.setTimeout !== "function") {
  throw new Error("[unenv] setTimeout missing");
}
export const setTimeout = g.setTimeout.bind(g);
export const clearTimeout = g.clearTimeout.bind(g);
export const setInterval = g.setInterval.bind(g);
export const clearInterval = g.clearInterval.bind(g);
export const setImmediate =
  typeof g.setImmediate === "function"
    ? g.setImmediate.bind(g)
    : (fn, ...args) => g.setTimeout(fn, 0, ...args);
export const clearImmediate =
  typeof g.clearImmediate === "function"
    ? g.clearImmediate.bind(g)
    : (id) => g.clearTimeout(id);
export default {
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  setImmediate,
  clearImmediate,
};
`;

const files = [
  ["node_modules/unenv/dist/runtime/_internal/utils.mjs", utilsSource],
  ["node_modules/unenv/dist/_internal/utils.mjs", utilsSource],
  ["node_modules/unenv/dist/runtime/polyfill/timers.mjs", timersSource],
];

for (const [rel, source] of files) {
  const target = path.resolve(rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, source, "utf8");
  console.log("[patch-unenv] wrote", target);
}
