import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export default async function handler(req, res) {
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId || !process.env.NOTION_TOKEN) {
    return res.status(500).json({ error: "Missing Notion config" });
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    const titles = response.results.map((page) => {
      const titleProperty = page.properties.Name;
      if (!titleProperty || !titleProperty.title || titleProperty.title.length === 0) {
        return "Unbenannt";
      }
      return titleProperty.title[0].plain_text;
    });

    res.status(200).json(titles);
  } catch (error) {
    console.error("Fehler bei Notion-Abfrage:", error);
    res.status(500).json({ error: error.message || "Unknown error" });
  }
}
