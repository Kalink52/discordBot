// Require the necessary discord.js classes
const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token, channelId } = require("./config.json");

const { CronJob } = require("cron");
const getCommitStreak = require("./automated/utility/getCommitStreak");

// dault channel bot posts to
const botChannel = channelId;
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});
client.on("ready", async (client) => {
  const job = new CronJob(
    "0 11 * * *",
    async () => {
      let micahCommits = await getCommitStreak("Kalink52");
      let hannahCommits = await getCommitStreak("Hannah-finch");
      client.channels.cache
        .get(channelId)
        .send(`Micah Coded ${micahCommits} days in a row.`);
      client.channels.cache
        .get(channelId)
        .send(`Hannah Coded ${hannahCommits} days in a row`);
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
  // job.start();
});
module.exports = client;
