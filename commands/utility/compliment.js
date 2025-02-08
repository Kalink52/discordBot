const { SlashCommandBuilder } = require("discord.js");
const { compliments } = require("../../json/compliments.json")
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

module.exports = {
  data: new SlashCommandBuilder()
    .setName("compliment")
    .setDescription("Pulls from a list of compliments"),
  async execute(interaction) {
    await interaction.reply(compliments[getRandomInt(compliments.length - 1)]);
  },
};
