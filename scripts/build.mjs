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
    (read("src/selection.js") + "\n" + read("src/production.js") + "\n" + read("src/research.js") + "\n" + read("src/app.js")).replace(/<\/script/gi, "<\\/script"),
  );
fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist/index.html"), html);
fs.writeFileSync(path.join(root, "index.html"), html);
fs.writeFileSync(path.join(root, "data/references.bib"), data.sources.map(s =>
  `@misc{${s.id},\n title={${s.title.replace(/[{}]/g, "")}},\n url={${s.url}},\n note={Accessed ${s.checkedAt}; reading scope recorded in atlas.json}\n}\n`
).join("\n"));
if(data.officialMaterials?.length) {
  fs.mkdirSync(path.join(root,"materials"),{recursive:true});
  fs.writeFileSync(path.join(root,"materials/README.md"),
    `# 官方材料与阅读入口\n\n[在线论文与材料库](https://wireless-dataset-atlas.vercel.app/#library) · [全部来源索引](../data/atlas.json)\n\n这里收录 ${data.officialMaterials.length} 份可再分发的官方原文件，按资源分类。每份文件保留上游版本、许可、署名与原始地址。原文件中的相对图片和附属链接可在对应上游页面查看。\n\n| 文件 | 上游版本 | 许可 | 原始来源 |\n| --- | --- | --- | --- |\n`+
    data.officialMaterials.map(m=>`| [${m.title}](${m.filePath.replace(/^materials\//,"")}) | ${m.upstreamRef}（核验 ${m.checkedAt}） | ${m.license} | [官方原件](${m.sourceUrl}) |`).join("\n")+
    `\n\n原始数据和模型权重通过各资源官方入口获取。其他论文与手册见网站中的原文链接。文件内容与许可记录由 [data/atlas.json](../data/atlas.json) 统一索引；实际阅读范围也保存在该文件中。\n\n## 许可与归属\n\n`+
    data.officialMaterials.map(m=>`### ${m.title}\n\n${m.attribution}\n\n许可：[${m.license}](${m.licenseUrl})。本仓库许可文件：${m.licenseFiles.map(f=>`[${f.split("/").pop()}](${f.replace(/^materials\//,"")})`).join("、")}。\n`).join("\n")
  );
  fs.writeFileSync(path.join(root,"THIRD_PARTY_NOTICES.md"),
    `# Third-party materials\n\nThe Atlas code and original content use the repository's MIT license. Files under \`materials/official/\` retain their individual upstream licenses and attribution. They are distributed unchanged. See [the material index](materials/README.md) for original URLs, versions and complete license files.\n\n`+
    data.officialMaterials.map(m=>`- **${m.title}** — ${m.license}. ${m.attribution} [Original](${m.sourceUrl}); ${m.licenseFiles.map(f=>`[license](${f})`).join(", ")}.`).join("\n")+"\n"
  );
}
console.log(
  `Built ${data.resources.length} resources / ${data.sources.length} sources / ${(html.length / 1024).toFixed(0)} KB characters`,
);
