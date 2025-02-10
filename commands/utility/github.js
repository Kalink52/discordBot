const { REST, Routes, SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("github")
    .setDescription("Check a GitHub user’s coding streak.")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("GitHub username to check")
        .setRequired(true)
    ),
  async execute(interaction) {
    const username = interaction.options.getString("username");
    // GitHub API endpoint for checking streak
    // console.log(`Check ${username}`);
    const response = await fetch(
      `https://api.github.com/users/${username}/events`
    );
    const events = await response.json();
    const streak = events.filter((event) => event.type === "PushEvent").length;
    interaction.reply(
      `Your GitHub streak for ${username} is ${streak} commits.`
    );
  },
};
// const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// (async () => {
//     try {
//         console.log('⏳ Registering slash commands...');
//         await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
//         console.log('✅ Slash commands registered successfully!');
//     } catch (error) {
//         console.error('❌ Error registering commands:', error);
//     }
// })();
