/**
 * Create Todo API Endpoint
 * 
 * This API endpoint creates a new todo item for a user.
 * It validates user authentication and stores the todo in the database.
 * 
 * @module api/todos/create
 */

// Authentication imports
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

// Database connection import
import clientPromise from '../../../lib/mongodb';

/**
 * API handler for creating a new todo item
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

    // Connect to the MongoDB database
    const client = await clientPromise;
    const db = client.db();

    // Extract todo data from request body
    const { text, completed = false, checkinId = null, parentId = null } = req.body;

    // Validate required fields
    if (!text) {
      return res.status(400).json({ message: 'Todo text is required' });
    }

    // Create todo object
    const todo = {
      userId: session.user.id,
      text,
      completed,
      checkinId,
      parentId,  // Add parentId field for subtasks
      isSubtask: !!parentId,  // Flag to indicate if this is a subtask
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert todo into database
    const result = await db.collection('todos').insertOne(todo);

    // Return the created todo with its ID
    res.status(201).json({
      ...todo,
      _id: result.insertedId
    });
  } catch (error) {
    // Log and handle any errors that occur during the process
    console.error('Error creating todo:', error);
    res.status(500).json({ message: 'Error creating todo' });
  }
}
