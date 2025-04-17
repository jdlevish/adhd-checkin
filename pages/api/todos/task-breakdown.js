/**
 * Get User Todos API Endpoint
 * 
 * This API endpoint retrieves a user's todo items with pagination support.
 * It validates user authentication and returns the todos sorted by creation date.
 * 
 * @module api/todos/get-user-todos
 */

// Authentication imports
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

// Database connection import
import clientPromise from '../../../lib/mongodb';

/**
 * API handler for retrieving a user's todo items
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
    const limit = parseInt(req.query.limit) || 50;  // Number of items per page (default: 50)
    const page = parseInt(req.query.page) || 1;     // Current page number (default: 1)
    const skip = (page - 1) * limit;                // Number of items to skip

    // Query the database for the user's todos with pagination
    const todos = await db.collection('todos')
      .find({ userId: session.user.id })           // Only get todos for the current user
      .sort({ createdAt: -1 })                     // Sort by creation date, newest first
      .skip(skip)                                  // Skip items for pagination
      .limit(limit)                                // Limit number of items returned
      .toArray();                                  // Convert cursor to array

    // Get total count of user's todos for pagination metadata
    const total = await db.collection('todos')
      .countDocuments({ userId: session.user.id });

    // Return the todos with pagination metadata
    res.status(200).json({
      todos,                                       // Array of todo documents
      pagination: {                                // Pagination metadata
        total,                                     // Total number of todos
        page,                                      // Current page number
        limit,                                     // Items per page
        totalPages: Math.ceil(total / limit)       // Calculate total number of pages
      }
    });
  } catch (error) {
    // Log and handle any errors that occur during the process
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Error fetching todos' });
  }
}