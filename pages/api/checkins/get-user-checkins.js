import { getServerSession } from 'next-auth';
import clientPromise from '../../../lib/mongodb';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Connect to the database
    const client = await clientPromise;
    const db = client.db();

    // Get query parameters for pagination (optional)
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Query the database for the user's check-ins
    const checkins = await db.collection('checkins')
      .find({ userId: session.user.id })
      .sort({ date: -1 }) // Sort by date, newest first
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const total = await db.collection('checkins')
      .countDocuments({ userId: session.user.id });

    // Return the check-ins with pagination metadata
    res.status(200).json({
      checkins,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    res.status(500).json({ message: 'Error fetching check-ins' });
  }
}
