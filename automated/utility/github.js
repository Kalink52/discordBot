const { CronJob } = require("cron");
const { channelId } = require("../../config.json");
const axios = require("axios");
const moment = require("moment");
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

function github(client) {
  const job = new CronJob(
    "0 11 * * *",
    async () => {
      let micahCommits = await getCommitStreak("Kalink52");
      let hannahCommits = await getCommitStreak("Hannah-finch");
      client.channels.cache
        .get(channelId)
        .send(`Micah coded ${micahCommits} days in a row.`);
      client.channels.cache
        .get(channelId)
        .send(`Hannah coded ${hannahCommits} days in a row`);
      let message =
        "Both are equal so Micah is winning because he coded the bot";
      if (micahCommits > hannahCommits) {
        message = "Micah is winning";
      }
      if (hannahCommits > micahCommits) {
        message = "Hannah is winning";
      }
      client.channels.cache.get(channelId).send(message);
    },
    null,
    true,
    "America/New_York"
  );
}
module.exports = github;
