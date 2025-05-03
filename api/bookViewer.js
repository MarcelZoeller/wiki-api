export default async function handler(req, res) {
    const username = "marcelzoeller";
    const repo = "wiki-data";
    const branch = "main";
  
    try {
      // 1. Branch-SHA laden
      const refRes = await fetch(`https://api.github.com/repos/${username}/${repo}/git/ref/heads/${branch}`, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      });
      const refData = await refRes.json();
      const treeSha = refData.object.sha;
  
      // 2. Git-Tree laden
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
  
      // 3. Nur Kapitel-Dateien extrahieren
      const kapitelDateien = treeData.tree
        .filter(item => item.path.startsWith("wiki/Kapitel/") && item.path.endsWith(".md"))
        .map(item => ({
          title: item.path.replace("wiki/Kapitel/", "").replace(".md", "").replace(/_/g, " "),
          sha: item.sha,
        }))
        .sort((a, b) => a.title.localeCompare(b.title));
  
      // 4. Inhalte via Blob-SHA laden
      const contents = await Promise.all(
        kapitelDateien.map(async ({ title, sha }) => {
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
          return `# ${title}\n\n${text}`;
        })
      );
  
      // 5. Zusammenfügen und zurückgeben
      const fullText = contents.join("\n\n---\n\n");
      res.setHeader("Content-Type", "text/plain");
      res.status(200).send(fullText);
  
    } catch (error) {
      console.error("API-Fehler:", error);
      res.status(500).send("Fehler beim Laden des Buches: " + error.message);
    }
  }
  