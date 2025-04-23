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
    // Get all journal entries for user, sorted by date descending
    const entries = await db.collection('journals')
      .find({ userId: session.user.id })
      .sort({ date: -1 })
      .toArray();
    res.status(200).json({ entries });
  } catch (error) {
    console.error('Error fetching all journal entries:', error);
    res.status(500).json({ message: 'Error fetching journal entries' });
  }
}
