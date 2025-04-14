/**
 * Get Check-in Statistics API Endpoint
 * 
 * This API endpoint calculates and returns statistics about a user's check-ins,
 * including total number of check-ins and their current streak.
 * 
 * @module api/checkins/get-stats
 */

// Authentication imports
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

// Database connection import
import clientPromise from '../../../lib/mongodb';

/**
 * API handler for retrieving check-in statistics
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

    // Get all check-ins for the user, sorted by date (newest first)
    // We need all check-ins to calculate streak accurately
    const checkins = await db.collection('checkins')
      .find({ userId: session.user.id })
      .sort({ date: -1 }) // Sort by date, newest first
      .toArray();

    /**
     * Calculate Statistics
     */
    
    // 1. Calculate total number of check-ins
    const totalCheckins = checkins.length;

    // 2. Calculate current streak of consecutive daily check-ins
    let currentStreak = 0;
    
    if (totalCheckins > 0) {
      // Get today's date at midnight (to compare dates without time)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get the most recent check-in date at midnight
      const mostRecentDate = new Date(checkins[0].date);
      mostRecentDate.setHours(0, 0, 0, 0);
      
      // Calculate days between today and most recent check-in
      const oneDayMs = 24 * 60 * 60 * 1000; // Milliseconds in a day
      const daysDifference = Math.round((today - mostRecentDate) / oneDayMs);
      
      // Only count streak if the most recent check-in is from today or yesterday
      // This allows users to maintain their streak if they check in early the next day
      if (daysDifference <= 1) { // Today or yesterday
        currentStreak = 1; // Start with 1 for the most recent day
        
        // Iterate through check-ins to find consecutive days
        for (let i = 1; i < checkins.length; i++) {
          // Get current and previous check-in dates (at midnight)
          const currentDate = new Date(checkins[i].date);
          currentDate.setHours(0, 0, 0, 0);
          
          const prevDate = new Date(checkins[i-1].date);
          prevDate.setHours(0, 0, 0, 0);
          
          // Check if this check-in is exactly 1 day before the previous one
          const daysBetween = Math.round((prevDate - currentDate) / oneDayMs);
          
          if (daysBetween === 1) {
            // If exactly one day apart, increment streak
            currentStreak++;
          } else {
            // If more than one day apart, streak is broken
            break;
          }
        }
      }
    }

    // Return the calculated statistics
    res.status(200).json({
      totalCheckins,   // Total number of check-ins
      currentStreak    // Current streak of consecutive daily check-ins
    });
  } catch (error) {
    // Log and handle any errors that occur during the process
    console.error('Error fetching check-in stats:', error);
    res.status(500).json({ message: 'Error fetching check-in stats' });
  }
}
