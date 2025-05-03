export default async function handler(req, res) {
    const username = "marcelzoeller";
    const repo = "wiki-data";
    const branch = "main";
  
    // const token = req.headers.authorization;
    // if (token !== `Bearer ${process.env.API_SECRET}`) {
    //   return res.status(401).send("Nicht autorisiert");
    // }
  
    try {
      const refRes = await fetch(`https://api.github.com/repos/${username}/${repo}/git/ref/heads/${branch}`, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      });
      const refData = await refRes.json();
      const treeSha = refData.object.sha;
  
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
  
      const files = treeData.tree
        .filter(item => item.path.startsWith("wiki/") && item.path.endsWith(".md"))
        .map(item => item.path.replace("wiki/", ""));
  
      res.status(200).json(files);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  