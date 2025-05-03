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
  
      // Schritt 2: kompletten Tree holen
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
  
      // Schritt 3: Alle .md-Dateien unter wiki/
      const mdFiles = treeData.tree
        .filter(item => item.path.startsWith("wiki/") && item.path.endsWith(".md"))
        .map(item => ({
          title: item.path.replace("wiki/", "").replace(/_/g, " ").replace(".md", ""),
          path: item.path,
          sha: item.sha,
        }))
        .sort((a, b) => a.path.localeCompare(b.path)); // alphabetisch nach Pfad
  
      // Schritt 4: Inhalte laden
      const contents = await Promise.all(
        mdFiles.map(async ({ title, sha }) => {
          const blobRes = await fetch(
            `https://api.github.com/repos/${username}/${repo}/git/blobs/${sha}`,
            {
              headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3.raw",
              },
            }
          );
          const text = await blobRes.text();
          return `# ${title}\n\n${text}\n\n`;
        })
      );
  
      // Schritt 5: Zusammenfügen und zurückgeben
      const fullText = contents.join("\n\n---\n\n");
      res.setHeader("Content-Type", "text/plain");
      res.status(200).send(fullText);
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  