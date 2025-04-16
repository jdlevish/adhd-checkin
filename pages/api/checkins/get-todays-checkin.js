/**
 * Get Today's Check-in API Endpoint
 * 
 * This API endpoint retrieves the user's check-in for the current day.
 * It validates user authentication and returns the most recent check-in from today.
 * 
 * @module api/checkins/get-todays-checkin
 */

// Authentication imports
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

// Database connection import
import clientPromise from '../../../lib/mongodb';

/**
 * API handler for retrieving today's check-in
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

    // Get today's date range (start of day to end of day)
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Query the database for today's check-in
    const todaysCheckin = await db.collection('checkins')
      .findOne({
        userId: session.user.id,
        date: { $gte: startOfDay, $lte: endOfDay }
      });

    if (!todaysCheckin) {
      return res.status(404).json({ message: 'No check-in found for today' });
    }

    // Return today's check-in
    res.status(200).json(todaysCheckin);
  } catch (error) {
    // Log and handle any errors that occur during the process
    console.error('Error fetching today\'s check-in:', error);
    res.status(500).json({ message: 'Error fetching today\'s check-in' });
  }
}
