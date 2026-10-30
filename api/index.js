const MANIFEST = {
  id: "dev.example.hires-addon",
  name: "Hi-Res Addon",
  version: "1.0.0",
  resources: ["search", "stream"],
  allowDownloads: 0,
  checkValidLossless: 0
};

function json(res, value) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(value));
}

module.exports = async (req, res) => {
  const url = new URL(req.url, "https://" + req.headers.host);

  if (url.pathname === "/manifest.json" || url.pathname === "/" || url.pathname === "/api") {
    return json(res, MANIFEST);
  }

  // SEARCH - YouTube se search karega
  if (url.pathname === "/search") {
    const q = url.searchParams.get("q") || "";
    if (!q) return json(res, { tracks: [] });

    try {
      // Piped API se YouTube search
      const r = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(q)}&filter=music_songs`);
      const data = await r.json();
      
      const tracks = (data.items || []).slice(0, 10).map(item => ({
        id: item.url?.split("v=")[1] || item.url?.split("/").pop(),
        title: item.title,
        artist: item.uploaderName || "YouTube",
        album: "YouTube",
        duration: item.duration || 0,
        artworkURL: item.thumbnail || `https://i.ytimg.com/vi/${item.url?.split("v=")[1]}/hqdefault.jpg`,
        format: "mp3",
        audioQuality: "HIGH"
      }));
      
      return json(res, { tracks });
    } catch (e) {
      return json(res, { tracks: [] });
    }
  }

  // STREAM - YouTube ka audio bajayega
  if (url.pathname.startsWith("/stream/")) {
    const videoId = decodeURIComponent(url.pathname.slice(8).replace(".json",""));
    
    try {
      const r = await fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`);
      const data = await r.json();
      
      // Sabse acchi audio quality nikalo
      const audio = (data.audioStreams || []).sort((a,b) => b.bitrate - a.bitrate)[0];
      
      if (!audio) throw new Error("no audio");
      
      return json(res, {
        url: audio.url,
        format: "mp3",
        quality: `${audio.quality || '128kbps'}`,
        codec: "mp3",
        container: "mp3",
        manifest: "none",
        encrypted: false
      });
    } catch (e) {
      res.statusCode = 404;
      return json(res, { error: "not found" });
    }
  }

  res.statusCode = 404;
  return json(res, { error: "not found" });
};
