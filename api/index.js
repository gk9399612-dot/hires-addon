const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
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
builder.defineSearchHandler(async (a) => {
  if (!a.extra.search?.toLowerCase().includes("midnight")) return {metas:[]};
  return {metas:[
    {id:"track_8f31", type:"music", name:"Midnight Signal"},
    {id:"dolby_8f31", type:"music", name:"Midnight Signal [ATMOS]"}
  ]};
});
builder.defineStreamHandler(async (a) => {
  if(a.id==="track_8f31") return {streams:[{title:"FLAC 24/96", url:"https://audio.example/media/track_8f31.flac"}]};
  if(a.id==="dolby_8f31") return {streams:[{title:"Dolby Atmos DASH", url:"https://audio.example/media/dolby_8f31"}]};
  return {streams:[]};
});
module.exports = (req,res) => serveHTTP(builder.getInterface())(req,res);
