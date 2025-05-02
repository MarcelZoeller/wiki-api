import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export default async function handler(req, res) {
  const { pageId } = req.query;

  try {
    const page = await notion.blocks.children.list({ block_id: pageId });
    res.status(200).json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
