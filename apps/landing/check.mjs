import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "public/rehearsal-room.png",
  "public/aurelis-home.png",
];

await Promise.all(requiredFiles.map((file) => access(new URL(file, import.meta.url))));

const html = await readFile(new URL("index.html", import.meta.url), "utf8");
const requiredCopy = [
  "El ensayo todavía no empieza.",
  "Pero la música ya dejó de ser lo importante.",
  "La música merece volver a ocupar el centro.",
  "Que tu ensayo empiece haciendo música.",
  "No buscando archivos.",
];

for (const copy of requiredCopy) {
  if (!html.includes(copy)) throw new Error(`Missing required copy: ${copy}`);
}

console.log("Landing Test 01 contract is valid.");
