import { google } from "googleapis";

export default async function handler(req, res) {

    const token = req.headers.authorization;
    if (token !== `Bearer ${process.env.API_SECRET}`) {
        return res.status(401).send("Nicht autorisiert");
    }

  const { docId } = req.query;

  if (!docId) {
    return res.status(400).send("docId fehlt");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ["https://www.googleapis.com/auth/documents.readonly"]
  });

  const docs = google.docs({ version: "v1", auth: await auth.getClient() });

  try {
    const doc = await docs.documents.get({ documentId: docId });

    // Extrahiere Text aus dem Google Docs-Inhalt
    const content = doc.data.body.content
      .map(e => e.paragraph?.elements?.[0]?.textRun?.content ?? "")
      .join("");

    res.status(200).send(content.trim());
  } catch (err) {
    console.error("Google Docs Fehler:", err);
    res.status(500).send("Fehler beim Abrufen des Dokuments");
  }
}
