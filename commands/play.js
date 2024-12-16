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
      limit: 3,
    },
  });
  if (response.data.tracks.items.length === 0) {
    return null;
  }
  const tracks = response.data.tracks.items.map((track) => ({
    title: track.name,
    artist: track.artists[0].name,
    url: track.external_urls.spotify,
    thumbnail: track.album.images[0].url,
  }));

  return tracks;
}
//３件かから選んで音楽再生させる↓
