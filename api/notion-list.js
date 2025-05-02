import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export default async function handler(req, res) {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;

    const response = await notion.databases.query({
      database_id: databaseId
    });

    const titles = response.results.map((page) => {
      const titleProp = page.properties.Name?.title;
      const title = titleProp?.[0]?.plain_text ?? "Ohne Titel";
      return title;
    });

    res.status(200).json(titles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
