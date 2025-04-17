/**
 * Check Imported Goals API Endpoint
 * 
 * This API endpoint checks if goals from a specific check-in have already been imported as todo items.
 * It validates user authentication and returns a boolean indicating if goals have been imported.
 * 
 * @module api/todos/check-imported-goals
 */

// Authentication imports
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

// Database connection import
import clientPromise from '../../../lib/mongodb';

/**
 * API handler for checking if goals from a check-in have been imported as todo items
 * 
 * @param {Object} req - Next.js API request object
 * @param {Object} res - Next.js API response object
 * @returns {Promise<void>}
 */
export default async function handler(req, res) {
  // Only allow GET requests for this endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify user authentication using NextAuth
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Connect to the MongoDB database
    const client = await clientPromise;
    const db = client.db();

    // Extract check-in ID from query parameters
    const { checkinId } = req.query;

    // Validate required fields
    if (!checkinId) {
      return res.status(400).json({ message: 'Check-in ID is required' });
    }

    // Check if any todos exist with the specified check-in ID
    const count = await db.collection('todos').countDocuments({
      userId: session.user.id,
      checkinId: checkinId
    });

    // Return whether goals have been imported (count > 0)
    res.status(200).json({ imported: count > 0 });
  } catch (error) {
    // Log and handle any errors that occur during the process
    console.error('Error checking imported goals:', error);
    res.status(500).json({ message: 'Error checking imported goals' });
  }
}
