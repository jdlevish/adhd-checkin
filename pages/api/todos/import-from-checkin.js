/**
 * Import Goals from Check-in API Endpoint
 * 
 * This API endpoint imports goals from a check-in as todo items.
 * It validates user authentication and creates todo items for each goal.
 * 
 * @module api/todos/import-from-checkin
 */

// Authentication imports
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

// Database connection import
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * API handler for importing goals from a check-in as todo items
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

    // Extract check-in ID from request body
    const { checkinId } = req.body;

    // Validate required fields
    if (!checkinId) {
      return res.status(400).json({ message: 'Check-in ID is required' });
    }

    // Fetch the check-in from the database
    const checkin = await db.collection('checkins').findOne({
      _id: new ObjectId(checkinId),
      userId: session.user.id
    });

    if (!checkin) {
      return res.status(404).json({ message: 'Check-in not found' });
    }

    // Extract goals from the check-in
    // Handle both array format and individual goal fields
    let goals = [];
    if (Array.isArray(checkin.goals)) {
      // New format: goals stored as an array
      goals = checkin.goals.filter(goal => goal && goal.trim() !== '');
    } else {
      // Older format: individual goal fields
      const goalFields = ['goal1', 'goal2', 'goal3', 'goal4'];
      goals = goalFields
        .map(field => checkin[field])
        .filter(goal => goal && goal.trim() !== '');
    }

    if (goals.length === 0) {
      return res.status(400).json({ message: 'No goals found in the check-in' });
    }

    // Create todo items for each goal
    const todos = goals.map(goalText => ({
      userId: session.user.id,
      text: goalText,
      completed: false,
      checkinId: checkin._id.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Insert todos into database
    const result = await db.collection('todos').insertMany(todos);

    // Return the created todos with their IDs
    const createdTodos = todos.map((todo, index) => ({
      ...todo,
      _id: result.insertedIds[index]
    }));

    res.status(201).json({
      message: `Successfully imported ${createdTodos.length} goals as todo items`,
      todos: createdTodos
    });
  } catch (error) {
    // Log and handle any errors that occur during the process
    console.error('Error importing goals from check-in:', error);
    res.status(500).json({ message: 'Error importing goals from check-in' });
  }
}
