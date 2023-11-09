// URL: https://my-domain.com/api/new-meetup
// API 라우트: Server Side Code (Client에게 노출 X)

import { MongoClient } from "mongodb";

// POST /api/new-meetup
async function handler(req, res) {
  if (req.method === "POST") {
    const data = req.body;
    // data 에는 title, image, address, description이 포함되어 있음

    // mongoDB 연결 -  https://www.mongodb.com/atlas
    // 절대 client에서 실행되면 안됩니다. Credential이 노출되기 때문에
    const client = await MongoClient.connect(process.env.DATABASE_URL);

    const db = client.db();

    const meetupsCollection = db.collection("meetups");

    const result = await meetupsCollection.insertOne(data);

    console.log(result);

    client.close();

    res.status(201).json({ message: "Meetup inserted!" });
  }
}

export default handler;
