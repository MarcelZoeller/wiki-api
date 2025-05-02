export default async function handler(req, res) {
    const file = req.query.file || "index.md";
    const githubUser = "marcelzoeller";
    const repo = "wiki-data";
    const branch = "main";
  
    const url = `https://raw.githubusercontent.com/${githubUser}/${repo}/${branch}/wiki/${file}`;
  
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });
  
    if (!response.ok) {
      return res.status(404).send("Datei nicht gefunden");
    }
  
    const content = await response.text();
    res.status(200).send(content);
  }
