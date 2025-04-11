import { getServerSession } from 'next-auth';
import clientPromise from '../../../lib/mongodb';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Connect to the database
    const client = await clientPromise;
    const db = client.db();

    // Get all check-ins for the user, sorted by date
    const checkins = await db.collection('checkins')
      .find({ userId: session.user.id })
      .sort({ date: -1 }) // Sort by date, newest first
      .toArray();

    // Calculate total check-ins
    const totalCheckins = checkins.length;

    // Calculate current streak
    let currentStreak = 0;
    
    if (totalCheckins > 0) {
      // Start with today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if there's a check-in for today
      const mostRecentDate = new Date(checkins[0].date);
      mostRecentDate.setHours(0, 0, 0, 0);
      
      // Only count streak if the most recent check-in is from today or yesterday
      const oneDayMs = 24 * 60 * 60 * 1000;
      const daysDifference = Math.round((today - mostRecentDate) / oneDayMs);
      
      if (daysDifference <= 1) { // Today or yesterday
        currentStreak = 1; // Start with 1 for the most recent day
        
        // Check for consecutive days before today
        for (let i = 1; i < checkins.length; i++) {
          const currentDate = new Date(checkins[i].date);
          currentDate.setHours(0, 0, 0, 0);
          
          const prevDate = new Date(checkins[i-1].date);
          prevDate.setHours(0, 0, 0, 0);
          
          // Check if this check-in is exactly 1 day before the previous one
          const daysBetween = Math.round((prevDate - currentDate) / oneDayMs);
          
          if (daysBetween === 1) {
            currentStreak++;
          } else {
            break; // Streak is broken
          }
        }
      }
    }

    // Return the stats
    res.status(200).json({
      totalCheckins,
      currentStreak
    });
  } catch (error) {
    console.error('Error fetching check-in stats:', error);
    res.status(500).json({ message: 'Error fetching check-in stats' });
  }
}
