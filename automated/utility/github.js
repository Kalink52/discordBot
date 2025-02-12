const axios = require("axios");
const moment = require("moment");
GITHUB_USERNAME = "Kalink52"

async function getConsecutiveCommitDays() {
  try {
    const today = moment().utc().startOf("day");
    const pastDate = today.clone().subtract(90, "days").toISOString();

    // Get list of repositories
    const reposResponse = await axios.get(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos`,
      {
        // headers: { Authorization: `token ${GITHUB_TOKEN}` }
      }
    );

    const repos = reposResponse.data.map((repo) => repo.name);
    let commitDates = new Set();

    // Fetch commits for each repo
    for (const repo of repos) {
      const commitsResponse = await axios.get(
        `https://api.github.com/repos/${GITHUB_USERNAME}/${repo}/commits`,
        {
          // headers: { Authorization: `token ${GITHUB_TOKEN}` },
          params: { since: pastDate },
        }
      );

      commitsResponse.data.forEach((commit) => {
        const commitDate = moment(commit.commit.author.date)
          .utc()
          .startOf("day")
          .format("YYYY-MM-DD");
        commitDates.add(commitDate);
      });
    }

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

    console.log(`🔥 You have coded for ${streak} days in a row!`);
  } catch (error) {
    console.error(
      "Error fetching data:",
      error.response?.data || error.message
    );
  }
}

getConsecutiveCommitDays();
