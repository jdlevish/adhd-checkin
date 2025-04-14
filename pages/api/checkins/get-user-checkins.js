/**
 * Get User Check-ins API Endpoint
 * 
 * This API endpoint retrieves a user's check-ins with pagination support.
 * It validates user authentication and returns the check-ins sorted by date.
 * 
 * @module api/checkins/get-user-checkins
 */

// Authentication imports
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

// Database connection import
import clientPromise from '../../../lib/mongodb';

/**
 * API handler for retrieving a user's check-ins
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

    // Parse pagination parameters from query string
    // These parameters are optional and have default values
    const limit = parseInt(req.query.limit) || 10;  // Number of items per page (default: 10)
    const page = parseInt(req.query.page) || 1;     // Current page number (default: 1)
    const skip = (page - 1) * limit;                // Number of items to skip

    // Query the database for the user's check-ins with pagination
    const checkins = await db.collection('checkins')
      .find({ userId: session.user.id })           // Only get check-ins for the current user
      .sort({ date: -1 })                         // Sort by date, newest first
      .skip(skip)                                 // Skip items for pagination
      .limit(limit)                               // Limit number of items returned
      .toArray();                                 // Convert cursor to array

    // Get total count of user's check-ins for pagination metadata
    const total = await db.collection('checkins')
      .countDocuments({ userId: session.user.id });

    // Return the check-ins with pagination metadata
    res.status(200).json({
      checkins,                                    // Array of check-in documents
      pagination: {                               // Pagination metadata
        total,                                    // Total number of check-ins
        page,                                     // Current page number
        limit,                                    // Items per page
        totalPages: Math.ceil(total / limit)      // Calculate total number of pages
      }
    });
  } catch (error) {
    // Log and handle any errors that occur during the process
    console.error('Error fetching check-ins:', error);
    res.status(500).json({ message: 'Error fetching check-ins' });
  }
}
