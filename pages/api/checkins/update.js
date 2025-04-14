/**
 * Check-in Update API Endpoint
 * 
 * This API endpoint allows users to update their existing check-ins.
 * It validates user authentication, ensures the user owns the check-in,
 * and updates the check-in data in the database.
 * 
 * @module api/checkins/update
 */

// Authentication imports
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

// Database imports
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * API handler for updating an existing check-in
 * 
 * @param {Object} req - Next.js API request object
 * @param {Object} res - Next.js API response object
 * @returns {Promise<void>}
 */
export default async function handler(req, res) {
  // Only allow PUT requests for this endpoint
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify user authentication using NextAuth
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get check-in ID from query parameters
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'Check-in ID is required' });
    }

    // Extract check-in data from request body
    const { goal1, goal2, goal3, goal4, intentions, date } = req.body;
    
    // Validate required fields
    if (!goal1 || !intentions || !date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Connect to the MongoDB database
    const client = await clientPromise;
    const db = client.db();

    // Find the check-in to verify it exists and belongs to the current user
    // This is an important security check to prevent users from updating other users' check-ins
    const existingCheckIn = await db.collection('checkins').findOne({
      _id: new ObjectId(id),      // Convert string ID to MongoDB ObjectId
      userId: session.user.id     // Ensure check-in belongs to current user
    });

    // If check-in doesn't exist or doesn't belong to the user, return 404
    if (!existingCheckIn) {
      return res.status(404).json({ message: 'Check-in not found or not authorized to update' });
    }

    // Update the check-in document in the database
    const result = await db.collection('checkins').updateOne(
      { _id: new ObjectId(id) },  // Query by document ID
      {
        $set: {                   // Fields to update
          goals: [goal1, goal2, goal3, goal4],  // Store goals as an array
          intentions,
          date: new Date(date),   // Convert date string to Date object
          updatedAt: new Date()   // Add timestamp for when the update occurred
        }
      }
    );

    // Check if the update was successful
    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: 'Failed to update check-in' });
    }

    // Return success response
    res.status(200).json({ message: 'Check-in updated successfully' });
  } catch (error) {
    // Log and handle any errors that occur during the process
    console.error('Error updating check-in:', error);
    res.status(500).json({ message: 'Error updating check-in' });
  }
}
