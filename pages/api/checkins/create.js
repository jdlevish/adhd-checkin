import { getServerSession } from 'next-auth';
import clientPromise from '../../../lib/mongodb';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { goals, intentions, date } = req.body;
    const client = await clientPromise;
    const db = client.db();

    // Create the check-in
    const result = await db.collection('checkins').insertOne({
      userId: session.user.id,
      goals,
      intentions,
      date: new Date(date),
      createdAt: new Date(),
    });

    res.status(201).json({ message: 'Check-in saved successfully' });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Error saving check-in' });
  }
}
