const fs = require("fs");

const file = "src/app/page.tsx";
let s = fs.readFileSync(file, "utf8");

// Find the Field image block and only reset its className (keep Stockfish scaled)
const needle = 'src="/fish/field.png"';
const idx = s.indexOf(needle);
if (idx === -1) {
  console.error("ERROR: could not find Field image src.");
  process.exit(1);
}

// Limit replacement to a small window after the field.png src
const start = Math.max(0, idx - 200);
const end = Math.min(s.length, idx + 600);
const window = s.slice(start, end);

// Replace only the className line inside this window
const from = 'className="object-contain p-6 transition-transform duration-300 ease-out scale-[0.72] group-hover:scale-[0.76]"';
const to   = 'className="object-contain p-6 transition-transform duration-300 ease-out group-hover:scale-[1.04]"';

if (!window.includes(from)) {
  console.error("ERROR: expected scaled className not found in Field window (maybe already reverted?).");
  process.exit(1);
}

const newWindow = window.replace(from, to);
s = s.slice(0, start) + newWindow + s.slice(end);

fs.writeFileSync(file, s, "utf8");
console.log("OK: Field image restored to original scale; Stockfish remains scaled.");
