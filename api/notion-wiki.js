import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

export default async function handler(req, res) {
  const { pageId } = req.query;

  try {
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const md = n2m.toMarkdownString(mdBlocks);
    res.status(200).json({ markdown: md.parent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
