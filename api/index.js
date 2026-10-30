const tracks = [
  {
    id: "track_8f31",
    title: "Midnight Signal",
    artist: "Example Artist",
    album: "Night Drive",
    duration: 242,
    artworkURL: "https://via.placeholder.com/300",
    format: "flac",
    audioQuality: "LOSSLESS"
  },
  {
    id: "dolby_8f31",
    title: "Midnight Signal",
    artist: "Example Artist",
    album: "Night Drive",
    duration: 242,
    artworkURL: "https://via.placeholder.com/300",
    format: "dash",
    audioQuality: "HIGH",
    audioModes: ["DOLBY_ATMOS"],
    atmos: true
  }
];

const MANIFEST = {
  id: "dev.example.hires-addon",
  name: "Hi-Res Addon",
  version: "1.0.0",
  resources: ["search", "stream"],
  allowDownloads: 0,
  checkValidLossless: 1
};

function json(res, value) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(value));
}

module.exports = async (req, res) => {
  const url = new URL(req.url, "https://" + req.headers.host);

  if (url.pathname === "/manifest.json" || url.pathname === "/" || url.pathname === "/api" || url.pathname === "/api/index.js") {
    return json(res, MANIFEST);
  }

  if (url.pathname === "/search") {
    const q = (url.searchParams.get("q") || "").toLowerCase();
    const filtered = tracks.filter(t => 
      [t.title, t.artist, t.album].join(" ").toLowerCase().includes(q)
    );
    return json(res, { tracks: filtered });
  }

  if (url.pathname.startsWith("/stream/")) {
    const id = decodeURIComponent(url.pathname.slice(8).replace(".json",""));
    
    if (id === "track_8f31") {
      return json(res, {
        url: "https://audio.example/media/track_8f31.flac",
        format: "flac",
        quality: "Lossless · 24-bit / 96 kHz",
        codec: "flac",
        container: "flac",
        manifest: "none",
        encrypted: false,
        sampleRate: 96000,
        bitDepth: 24
      });
    }
    if (id === "dolby_8f31") {
      return json(res, {
        url: "https://audio.example/media/dolby_8f31",
        format: "dash",
        quality: "Dolby Atmos",
        codec: "eac3-joc",
        container: "mp4",
        manifest: "dash",
        sampleRate: 48000,
        audioMode: "DOLBY_ATMOS",
        encrypted: false
      });
    }
    res.statusCode = 404;
    return json(res, { error: "not found" });
  }

  res.statusCode = 404;
  return json(res, { error: "not found" });
};
