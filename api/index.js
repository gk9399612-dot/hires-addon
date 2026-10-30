const { addonBuilder, getRouter } = require("stremio-addon-sdk");

const builder = new addonBuilder({
  id: "dev.example.hires-addon",
  version: "1.0.0",
  name: "Hi-Res Addon",
  resources: ["search","stream"],
  types: ["music"],
  idPrefixes: ["track_","dolby_"],
  catalogs: [],
  allowDownloads: 0,
  checkValidLossless: 1
});

builder.defineSearchHandler(async (args) => {
  const q = (args.extra.search || "").toLowerCase();
  if (!q.includes("midnight")) return { metas: [] };
  return {
    metas: [
      { id: "track_8f31", type: "music", name: "Midnight Signal", poster: "https://via.placeholder.com/300" },
      { id: "dolby_8f31", type: "music", name: "Midnight Signal [ATMOS]", poster: "https://via.placeholder.com/300" }
    ]
  };
});

builder.defineStreamHandler(async (args) => {
  if (args.id === "track_8f31") {
    return { streams: [{ title: "FLAC 24/96", url: "https://audio.example/media/track_8f31.flac", behaviorHints: { notWebReady: true } }] };
  }
  if (args.id === "dolby_8f31") {
    return { streams: [{ title: "Dolby Atmos DASH", url: "https://audio.example/media/dolby_8f31", behaviorHints: { notWebReady: true } }] };
  }
  return { streams: [] };
});

const router = getRouter(builder.getInterface());

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  router(req, res, () => {
    res.statusCode = 404;
    res.end();
  });
};
