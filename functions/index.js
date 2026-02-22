const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const admin = require("firebase-admin");

admin.initializeApp();
const db = getFirestore();

// Fetch notes for a URL (GET)
exports.fetchNotes = onRequest(async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing URL");

  try {
    const snapshot = await db.collection("notes").where("url", "==", url).get();
    const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Create a note (POST)
exports.createNote = onRequest(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
  const { url, note } = req.body;
  if (!url || !note || !note.text || note.x == null || note.y == null) return res.status(400).send("Missing fields");

  try {
    const docRef = await db.collection("notes").add({ url, ...note, timestamp: Date.now() });
    res.status(200).json({ success: true, data: { webnotes_annotationid: docRef.id } });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
