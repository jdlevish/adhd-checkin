import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const { entry } = req.body;
    if (!entry) {
      return res.status(400).json({ message: 'Entry required' });
    }
    const client = await clientPromise;
    const db = client.db();
    const today = new Date();
    today.setHours(0,0,0,0);
    // Upsert so user can only have one entry per day
    await db.collection('journals').updateOne(
      { userId: session.user.id, date: today },
      { $set: { entry, date: today, userId: session.user.id, updatedAt: new Date() } },
      { upsert: true }
    );
    res.status(201).json({ message: 'Journal entry saved' });
  } catch (error) {
    console.error('Journal entry error:', error);
    res.status(500).json({ message: 'Error saving journal entry' });
  }
}
