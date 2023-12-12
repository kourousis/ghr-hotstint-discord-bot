const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

const exampleEmbed = {
  color: 0x0099ff,
  title: "GHR Hotstint",
  description: "Track - Spa",
  fields: [
    {
      name: "Regular field title",
      value: "Some value here",
    },
    {
      name: "\u200b",
      value: "\u200b",
      inline: false,
    },
    {
      name: "# Gamertag",
      value: "1. Washamga",
      inline: true,
    },
    {
      name: "Car",
      value: "McLaren 720s EVO",
      inline: true,
    },
    {
      name: "Time".padEnd(15) + "Gap",
      value: "2:17.335",
      inline: true,
    },
    {
      name: "",
      value: "2. FlyingJim8",
      inline: true,
    },
    {
      name: "",
      value: "McLaren 720s EVO",
      inline: true,
    },
    {
      name: "",
      value: "2:18.335 | +1.000",
      inline: true,
    },
    {
      name: "",
      value: "3. EpicGT",
      inline: true,
    },
    {
      name: "",
      value: "Ferrari 296 GT3",
      inline: true,
    },
    {
      name: "",
      value: "2:19.835 | +2.500",
      inline: true,
    },
  ],
};

module.exports = {
  category: "utility",
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Posts or edits a simple embed"),
  async execute(interaction) {
    // If a message has already been sent, edit the existing message with a new embed
    await interaction.reply({ embeds: [exampleEmbed] });
  },
};
