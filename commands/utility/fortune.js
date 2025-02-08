const { SlashCommandBuilder } = require("discord.js");
const { fortunes } = require("../../json/fortunes.json")
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fortune")
    .setDescription("Let me tell you your future... with cookies of fortune"),
  async execute(interaction) {
    await interaction.reply(fortunes[getRandomInt(fortunes.length - 1)].fortune);
  },
};
