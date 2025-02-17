const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
const moment = require("moment");
const { CronJob } = require('cron');
async function getCommitStreak(username) {
  try {
    const today = moment().utc().startOf("day");

    // Fetch user's public events (includes push events)
    const eventsResponse = await axios.get(
      `https://api.github.com/users/${username}/events/public`
    );
    const events = eventsResponse.data;

    if (!events.length) return -1; // No public events found

    let commitDates = new Set();

    // Filter push events and extract commit dates
    events.forEach((event) => {
      if (event.type === "PushEvent") {
        event.payload.commits.forEach((commit) => {
          const commitDate = moment(event.created_at)
            .utc()
            .startOf("day")
            .format("YYYY-MM-DD");
          commitDates.add(commitDate);
        });
      }
    });

    if (commitDates.size === 0) return -1; // No commits found

    // Convert to sorted array of unique commit days
    const commitDays = [...commitDates].sort().reverse();

    // Count consecutive commit streak
    let streak = 0;
    for (let i = 0; i < commitDays.length; i++) {
      if (
        moment(commitDays[i]).diff(
          today.clone().subtract(i, "days"),
          "days"
        ) === 0
      ) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error(
      "Error fetching data:",
      error.response?.data || error.message
    );
    return -3; // Error case
  }
}


const dailyCheck = new CronJob('32 11 * * *', async () => {
    console.log('🔍 Running daily GitHub streak check...');

    const username = 'your-github-username'; // Replace dynamically if needed
    const streak = await getCommitStreak(Kalink52);

    if (streak > 0) {
        console.log(`🔥 ${username} has coded for ${streak} days in a row!`);
    } else {
        console.log(`❌ No commits found for ${username}.`);
    }
});

// Start the cron job
dailyCheck.start();