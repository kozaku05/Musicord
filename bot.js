const { Client, GatewayIntentBits } = require("discord.js");
const sendDiscord = require("./commands/search");
const spotify = require("./commands/searchSpotify");
const dotenv = require("dotenv");
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "lyrics") {
    sendDiscord(interaction);
  }
  if (interaction.commandName === "spotify") {
    spotify(interaction);
  }
});

client.login(process.env.TOKEN);
