const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  const kapitelVerzeichnis = path.join(process.cwd(), 'wiki/Kapitel');

  try {
    const dateien = fs
      .readdirSync(kapitelVerzeichnis)
      .filter((f) => f.endsWith('.md'))
      .sort();

    let gesamterText = '';

    for (const datei of dateien) {
      const inhalt = fs.readFileSync(path.join(kapitelVerzeichnis, datei), 'utf-8');
      gesamterText += `# ${datei.replace(/\.md$/, '').replace(/_/g, ' ')}\n\n`;
      gesamterText += inhalt + '\n\n';
    }

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(gesamterText);
  } catch (err) {
    res.status(500).send('Fehler beim Lesen der Kapitel: ' + err.message);
  }
}
