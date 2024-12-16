const { REST, Routes } = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();

const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;

const rest = new REST({ version: "10" }).setToken(token);

const commands = [
  {
    name: "lyrics",
    description: "曲の歌詞を検索します",
    options: [
      {
        name: "song",
        description: "検索する曲名",
        type: 3,
        required: true,
      },
      {
        name: "ephemeral",
        description: "メッセージを非表示にするかどうか",
        type: 5,
        required: true,
      },
    ],
  },
  {
    name: "spotify",
    description: "Spotifyの曲を検索します",
    options: [
      {
        name: "song",
        description: "検索する曲名",
        type: 3,
        required: true,
      },
      {
        name: "ephemeral",
        description: "メッセージを非表示にするかどうか",
        type: 5,
        required: true,
      },
    ],
  },
  {
    name: "play",
    description: "曲を再生します",
    options: [
      {
        name: "song",
        description: "再生する曲名",
        type: 3,
        required: true,
      },
    ],
  },
];

rest
  .put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
