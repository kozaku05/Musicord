const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Collection,
  Guild,
} = require("discord.js");
const axios = require("axios");
const sendDiscord = require("./commands/search");
const spotify = require("./commands/searchSpotify");
const dotenv = require("dotenv");
const ytSerch = require("yt-search");
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.queue = new Collection();
const client_id = process.env.SPOTIFY_ID;
const client_secret = process.env.SPOTIFY_SECRET;
async function getAccessToken() {
  try {
    const authResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "client_credentials",
      }).toString(),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(client_id + ":" + client_secret).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return authResponse.data.access_token;
  } catch (error) {
    console.log("エラー");
  }
}

async function searchYoutube(query) {
  try {
    const response = await ytSerch.search(query);
    if (response.videos.length === 0) {
      return null;
    }
    return response.videos;
  } catch (error) {
    console.log("エラー");
    return null;
  }
}

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.commandName === "play") {
      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) {
        return await interaction.reply({
          content: "ボイスチャンネルに参加してください",
          ephemeral: true,
        });
      }
      const query = interaction.options.getString("song");
      const songs = await searchYoutube(query);

      if (!songs) {
        return await interaction.reply({
          content: "曲の検索に失敗しました。",
          ephemeral: true,
        });
      }

      const selectmenu = new StringSelectMenuBuilder()
        .setCustomId("song")
        .setPlaceholder("ここから選択してください")
        .addOptions(
          songs.slice(0, 3).map((song) => ({
            label: song.title,
            value: song.url,
            description: song.author.name,
          }))
        );

      const row = new ActionRowBuilder().addComponents(selectmenu);
      const Embed = new EmbedBuilder()
        .setTitle("曲を選択してください")
        .setImage(songs[0].image);
      await interaction.reply({
        embeds: [Embed],
        components: [row],
        ephemeral: true,
      });
    }

    if (interaction.isStringSelectMenu()) {
      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) {
        return await interaction.reply({
          content: "ボイスチャンネルに参加してください",
          ephemeral: true,
        });
      }

      const url = interaction.values[0];
      function getVideoIdFromUrl(url) {
        const regex =
          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]*\/\S*\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
      }
      const videoId = getVideoIdFromUrl(url);
      if (!videoId) return;
      const video = await ytSerch({ videoId });
      if (!video) return;

      const embed = new EmbedBuilder()
        .setTitle("キューに追加しました")
        .setURL(video.url)
        .setDescription(video.title)
        .setImage(video.image)
        .setColor("Blue")
        .setFooter({
          text: `追加した人: ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });
      await interaction.reply({
        embeds: [embed],
      });

      let queue = [];
      if (!client.queue.has(interaction.guild.id)) {
        client.queue.set(interaction.guild.id, [url]);
      } else {
        queue = client.queue.get(interaction.guild.id);
        queue.push(url);
        client.queue.set(interaction.guild.id, queue);
      }
      console.log(client.queue.get(interaction.guild.id));
    }

    if (!interaction.isCommand()) return;
    if (interaction.commandName === "lyrics") {
      sendDiscord(interaction);
    }
    if (interaction.commandName === "spotify") {
      spotify(interaction);
    }
  } catch (error) {
    console.log("エラー");
  }
});

client.login(process.env.TOKEN);
