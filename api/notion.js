import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export default async function handler(req, res) {
  try {
    // Holt alle erreichbaren Seiten (über "search")
    const response = await notion.search({
        filter: {
          object: "page"
        }
      });

    const pages = response.results.map((page) => {
      const titleProp = Object.values(page.properties || {}).find(
        (prop) => prop.type === "title"
      );

      const title = titleProp?.title?.[0]?.plain_text || "Ohne Titel";

      return {
        title,
        id: page.id
      };
    });

    res.status(200).json(pages);
  } catch (error) {
    console.error("Fehler beim Abrufen der Seiten:", error);
    res.status(500).json({ error: error.message });
  }
}
