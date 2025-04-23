import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const client = await clientPromise;
    const db = client.db();
    const today = new Date();
    today.setHours(0,0,0,0);
    const entry = await db.collection('journals').findOne({ userId: session.user.id, date: today });
    if (!entry) {
      return res.status(404).json({ message: 'No journal entry for today' });
    }
    res.status(200).json({ entry });
  } catch (error) {
    console.error('Error fetching today\'s journal entry:', error);
    res.status(500).json({ message: 'Error fetching journal entry' });
  }
}
