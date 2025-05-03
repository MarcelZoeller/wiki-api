export default async function handler(req, res) {
    const username = "marcelzoeller";
    const repo = "wiki-data";
    const branch = "main";
  
    // const token = req.headers.authorization;
    // if (token !== `Bearer ${process.env.API_SECRET}`) {
    //   return res.status(401).send("Nicht autorisiert");
    // }
  
    try {
      // Schritt 1: SHA des Branches holen
      const refRes = await fetch(`https://api.github.com/repos/${username}/${repo}/git/ref/heads/${branch}`, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      });
      const refData = await refRes.json();
      const treeSha = refData.object.sha;
  
      // Schritt 2: Baumstruktur holen
      const treeRes = await fetch(
        `https://api.github.com/repos/${username}/${repo}/git/trees/${treeSha}?recursive=1`,
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json",
          },
        }
      );
      const treeData = await treeRes.json();
  
      // Nur .md-Dateien aus /wiki/ filtern
      const mdFiles = treeData.tree
        .filter(item => item.path.startsWith("wiki/") && item.path.endsWith(".md"))
        .map(item => ({
          path: item.path,
          url: `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${item.path}`,
        }))
        .sort((a, b) => a.path.localeCompare(b.path)); // Optional: alphabetisch sortieren
  
      // Schritt 3: Inhalte laden
      const contents = await Promise.all(
        mdFiles.map(async (file) => {
          const resp = await fetch(file.url);
          const text = await resp.text();
          const title = `# ${file.path.replace("wiki/", "").replace(/_/g, " ").replace(".md", "")}`;
          return `${title}\n\n${text}\n\n`;
        })
      );
  
      // Schritt 4: Alles zusammenfügen und zurückgeben
      const fullText = contents.join("");
      res.setHeader("Content-Type", "text/plain");
      res.status(200).send(fullText);
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  