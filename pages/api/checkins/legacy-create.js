/**
 * Legacy Check-in API Endpoint
 * 
 * This API endpoint creates a new check-in entry.
 * It's a legacy endpoint that should be replaced by the newer create.js endpoint.
 * 
 * @module api/checkins/legacy-create
 */

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
    // Connect to the MongoDB database
    const client = await clientPromise;
    const db = client.db();
    
    // Store the form data in the checkins collection
    const result = await db.collection('checkins').insertOne(req.body);
    
    // Return success response
    res.status(201).json(result);
  } catch (error) {
    // Log and handle any errors that occur during the process
    console.error('Error creating check-in:', error);
    res.status(500).json({ message: 'Error creating check-in' });
  }
}
