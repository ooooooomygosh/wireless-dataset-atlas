import fs from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const data = JSON.parse(read("data/atlas.json"));
for (const t of data.tutorials) t.code = read(t.file);
const payload = JSON.stringify(data).replace(/</g, "\\u003c");
const html = read("src/index.html")
  .replace("/*CSS*/", () => read("src/style.css"))
  .replace("/*DATA*/", () => `const ATLAS=${payload};`)
  .replace("/*APP*/", () =>
    (read("src/selection.js") + "\n" + read("src/production.js") + "\n" + read("src/app.js")).replace(/<\/script/gi, "<\\/script"),
  );
fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist/index.html"), html);
fs.writeFileSync(path.join(root, "index.html"), html);
console.log(
  `Built ${data.resources.length} resources / ${data.sources.length} sources / ${(html.length / 1024).toFixed(0)} KB characters`,
);
