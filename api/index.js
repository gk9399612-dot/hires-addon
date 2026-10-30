const MANIFEST = { id: "dev.example.hires-addon", name: "Hi-Res Addon", version: "1.0.0", resources: ["search", "stream"], allowDownloads: 0, checkValidLossless: 0 };

function json(res, value) { res.setHeader("Content-Type", "application/json"); res.setHeader("Access-Control-Allow-Origin", "*"); res.end(JSON.stringify(value)); }

module.exports = async (req, res) => {
  const url = new URL(req.url, "https://" + req.headers.host);
  if (url.pathname.includes("manifest") || url.pathname === "/") return json(res, MANIFEST);
  if (url.pathname === "/search") {
    return json(res, { tracks: [{ id: "track_8f31", title: "Midnight Signal", artist: "Example Artist", album: "Night Drive", duration: 242, artworkURL: "https://via.placeholder.com/300", format: "flac", audioQuality: "LOSSLESS" }] });
  }
  if (url.pathname.startsWith("/stream/")) {
    return json(res, { url: "https://filesamples.com/samples/audio/flac/sample3.flac", format: "flac", quality: "Lossless · 24-bit / 96 kHz", codec: "flac", container: "flac", manifest: "none", encrypted: false, sampleRate: 96000, bitDepth: 24 });
  }
  return json(res, { error: "not found" });
};
