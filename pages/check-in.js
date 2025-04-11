import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async (req, res) => {
  if (req.method === "POST") {
    try {
      await client.connect();
      const database = client.db("adhd");
      const checkIns = database.collection("checkIns");
      
      // Store the form data
      const result = await checkIns.insertOne(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ error: "Failed to save data" });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ message: "Only POST requests are allowed" });
  }
};
