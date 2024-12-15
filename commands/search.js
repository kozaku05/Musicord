const axios = require("axios");
const cheerio = require("cheerio");
const dotenv = require("dotenv");
const { EmbedBuilder } = require("discord.js");
dotenv.config();

const geniusToken = process.env.GENIUS_TOKEN;

async function searchSong(songName) {
  let response;
  try {
    response = await axios.get(`https://api.genius.com/search?q=${songName}`, {
      headers: {
        Authorization: `Bearer ${geniusToken}`,
      },
    });
    if (response.data.response.hits.length === 0) {
      return null;
    }
  } catch (error) {
    return null;
  }

  const songData = response.data.response.hits[0].result;
  const songTitle = songData.title;
  const songUrl = songData.url;
  try {
    const lyricsPage = await axios.get(songUrl);
    const $ = cheerio.load(lyricsPage.data);
    const lyrics = $(".Lyrics-sc-1bcc94c6-1.bzTABU").text();
    return {
      title: songTitle,
      lyrics: lyrics,
      url: songUrl,
    };
  } catch (error) {
    return null;
  }
}
async function sendDiscord(interaction) {
  const song = interaction.options.getString("song");
  const ephemeral = interaction.options.getBoolean("ephemeral");
  if (ephemeral == true) {
    await interaction.deferReply({ ephemeral: true });
  } else {
    await interaction.deferReply();
  }
  let lyrics = await searchSong(song);
  if (lyrics === null) {
    await interaction.editReply("曲が見つかりませんでした");
    return;
  }
  if (lyrics.lyrics.length > 2000) {
    lyrics.lyrics = lyrics.lyrics.slice(0, 2000) + "...(以下略)";
  }
  const embed = new EmbedBuilder()
    .setTitle(lyrics.title)
    .setURL(lyrics.url)
    .setDescription(lyrics.lyrics)
    .setColor("Blue");
  if (ephemeral === true) {
    await interaction.editReply({ embeds: [embed], ephemeral: true });
  } else {
    await interaction.editReply({ embeds: [embed] });
  }
}
module.exports = sendDiscord;
