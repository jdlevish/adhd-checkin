/**
 * Update Todo API Endpoint
 * 
 * This API endpoint updates a todo item for a user.
 * It validates user authentication and updates the todo in the database.
 * 
 * @module api/todos/update
 */

// Authentication imports
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

// Database connection import
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * API handler for updating a todo item
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

    // Connect to the MongoDB database
    const client = await clientPromise;
    const db = client.db();

    // Extract todo data from request body
    const { todoId, text, completed } = req.body;

    // Validate required fields
    if (!todoId) {
      return res.status(400).json({ message: 'Todo ID is required' });
    }

    // Create update object with only the fields that are provided
    const updateData = {
      updatedAt: new Date()
    };
    
    if (text !== undefined) {
      updateData.text = text;
    }
    
    if (completed !== undefined) {
      updateData.completed = completed;
    }

    // Update todo in database
    const result = await db.collection('todos').updateOne(
      { 
        _id: new ObjectId(todoId),
        userId: session.user.id // Ensure the todo belongs to the current user
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Todo not found or not authorized' });
    }

    // Return success message
    res.status(200).json({ message: 'Todo updated successfully' });
  } catch (error) {
    // Log and handle any errors that occur during the process
    console.error('Error updating todo:', error);
    res.status(500).json({ message: 'Error updating todo' });
  }
}
