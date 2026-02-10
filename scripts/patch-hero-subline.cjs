const fs = require("fs");

const file = "src/app/page.tsx";
let s = fs.readFileSync(file, "utf8");

// 1) Inject typed hero helper right after the line:
//   const t = isEN ? TEXT.en : TEXT.sv;
const tLineRe = /(\r?\n\s*const\s+t\s*=\s*isEN\s*\?\s*TEXT\.en\s*:\s*TEXT\.sv;\s*\r?\n)/m;

if (!tLineRe.test(s)) {
  console.error("ERROR: could not locate `const t = isEN ? TEXT.en : TEXT.sv;`");
  process.exit(1);
}

// only inject once
if (!s.includes("type HeroCopy")) {
  s = s.replace(tLineRe, (m) => {
    return m +
`  // Typed hero helper (removes any)
  type HeroCopy = (typeof TEXT)["sv"]["hero"] & { subline?: string };
  const hero = t.hero as HeroCopy;
`;
  });
}

// 2) Replace the subline block (no any)
// Matches the exact structure even if whitespace differs
const sublineBlockRe =
/\{\s*"subline"\s*in\s*t\.hero\s*&&\s*\(t\.hero\s+as\s+any\)\.subline\s*\?\s*\(\s*\r?\n\s*<div>\{\(t\.hero\s+as\s+any\)\.subline\}<\/div>\s*\r?\n\s*\)\s*:\s*null\s*\}/m;

if (!sublineBlockRe.test(s)) {
  console.error("ERROR: could not find the subline any-block to replace.");
  process.exit(1);
}

s = s.replace(sublineBlockRe, `{hero.subline ? <div>{hero.subline}</div> : null}`);

fs.writeFileSync(file, s, "utf8");
console.log("OK: removed any by typing hero.subline.");
