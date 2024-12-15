const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const { EmbedBuilder } = require("discord.js");
const client_id = process.env.SPOTIFY_ID;
const client_secret = process.env.SPOTIFY_SECRET;
async function getAccessToken() {
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
}
async function searchSong(query) {
  const token = await getAccessToken();
  const response = await axios.get(`https://api.spotify.com/v1/search`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      q: query,
      type: "track",
      limit: 1,
    },
  });
  const track = response?.data?.tracks?.items[0];
  if (track == null) {
    return null;
  }
  try {
    return {
      title: track.name,
      artist: track.artists[0].name,
      url: track.external_urls.spotify,
      thumbnail: track.album.images[0]?.url,
    };
  } catch (error) {
    return null;
  }
}
async function sendDiscord(interaction) {
  const song = interaction.options.getString("song");
  const ephemeral = interaction.options.getBoolean("ephemeral");
  let spotify = await searchSong(song);
  if (spotify == null) {
    if (ephemeral === true) {
      await interaction.reply({
        content: "曲が見つかりませんでした",
        ephemeral: true,
      });
      return;
    } else {
      await interaction.reply("曲が見つかりませんでした");
      return;
    }
  }
  const embed = new EmbedBuilder()
    .setTitle(spotify.title)
    .setURL(spotify.url)
    .addFields(
      {
        name: "アーティスト",
        value: spotify.artist,
      },
      {
        name: "URL",
        value: spotify.url,
      }
    )
    .setColor("Blue");
  if (spotify.thumbnail != null) {
    embed.setThumbnail(spotify.thumbnail);
  }
  if (ephemeral === true) {
    await interaction.reply({ embeds: [embed], ephemeral: true });
  } else {
    await interaction.reply({ embeds: [embed] });
  }
}
module.exports = sendDiscord;
