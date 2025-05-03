export default async function handler(req, res) {
    const username = "marcelzoeller";
    const repo = "wiki-data";
    const branch = "main"; // oder master

    const token = req.headers.authorization;
    if (token !== `Bearer ${process.env.API_SECRET}`) {
        return res.status(401).send("Nicht autorisiert");
    }

    const apiUrl = `https://api.github.com/repos/${username}/${repo}/git/trees/${branch}?recursive=1`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
                Accept: "application/vnd.github+json"
            },
        });

        const data = await response.json();

        // Filtere nur .md-Dateien aus /wiki
        const files = data.tree
            .filter(item => item.path.startsWith("/") && item.path.endsWith(".md"))
            .map(item => item.path.replace("/", ""));

        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
