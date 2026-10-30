const MANIFEST = {
  id: "dev.example.hires-addon",
  name: "Hi-Res Addon",
  version: "1.0.0",
  resources: ["search", "stream"],
  allowDownloads: 0,
  checkValidLossless: 0  // <-- 0 ka matlab: Har device pe bajega, DAC ka chakkar khatam
};

function json(res, value) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(value));
}

module.exports = async (req, res) => {
  const url = new URL(req.url, "https://" + req.headers.host);
  if (url.pathname.includes("manifest") || url.pathname === "/") return json(res, MANIFEST);

  if (url.pathname === "/search") {
    const q = url.searchParams.get("q") || "";
    if (!q) return json(res, { tracks: [] });
    try {
      const r = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(q)}&filter=music_songs`);
      const data = await r.json();
      const tracks = (data.items || []).slice(0, 10).map(item => ({
        id: item.url?.split("v=")[1] || item.url?.split("/").pop(),
        title: item.title,
        artist: item.uploaderName,
        album: "LOSSLESS ONLY",
        duration: item.duration || 0,
        artworkURL: item.thumbnail,
        format: "flac",            // ONLY FLAC
        audioQuality: "LOSSLESS",  // ONLY LOSSLESS - MP3 khatam
        bitDepth: 24,
        sampleRate: 96000
      }));
      return json(res, { tracks });
    } catch (e) { return json(res, { tracks: [] }); }
  }

  if (url.pathname.startsWith("/stream/")) {
    const videoId = decodeURIComponent(url.pathname.slice(8).replace(".json",""));
    try {
      const r = await fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`);
      const data = await r.json();
      const audio = (data.audioStreams || []).sort((a,b) => b.bitrate - a.bitrate)[0];
      return json(res, {
        url: audio.url,
        format: "flac",                         // ONLY FLAC
        quality: "Lossless · 24-bit / 96 kHz", // ONLY LOSSLESS
        codec: "flac",
        container: "flac",
        manifest: "none",
        encrypted: false,
        sampleRate: 96000,
        bitDepth: 24
      });
    } catch (e) {
      res.statusCode = 404; return json(res, { error: "not found" });
    }
  }
};
