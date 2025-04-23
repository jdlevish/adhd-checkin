/**
 * Check-in Creation API Endpoint
 * 
 * This API endpoint allows users to create new check-ins.
 * It validates user authentication and stores the check-in data in the database.
 * 
 * @module api/checkins/create
 */

// Authentication imports
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

// Database connection import
import clientPromise from '../../../lib/mongodb';

/**
 * API handler for creating a new check-in
 * 
 * @param {Object} req - Next.js API request object
 * @param {Object} res - Next.js API response object
 * @returns {Promise<void>}
 */
export default async function handler(req, res) {
  // Only allow POST requests for this endpoint
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify user authentication using NextAuth
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Extract check-in data from request body
    let { goals, intentions, date } = req.body;
    // Accept both string and array (for backward compatibility)
    if (!Array.isArray(goals)) {
      if (typeof goals === 'string') {
        goals = [goals];
      } else {
        goals = [];
      }
    }
    // Filter out empty goals
    goals = goals.map(g => (g || '').trim()).filter(Boolean);
    // Validate required fields
    if (goals.length < 1 || !intentions || !date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Connect to the MongoDB database
    const client = await clientPromise;
    const db = client.db();
    // Insert the new check-in document into the database
    const result = await db.collection('checkins').insertOne({
      userId: session.user.id,       // Associate check-in with current user
      goals: [goal1, goal2, goal3, goal4],  // Store goals as an array
      intentions,                    // Store intentions
      date: new Date(date),          // Convert date string to Date object
      createdAt: new Date(),         // Add creation timestamp
    });

    // Return success response with 201 Created status
    res.status(201).json({ 
      message: 'Check-in saved successfully',
      checkInId: result.insertedId   // Return the ID of the new check-in
    });
  } catch (error) {
    // Log and handle any errors that occur during the process
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Error saving check-in' });
  }
}
