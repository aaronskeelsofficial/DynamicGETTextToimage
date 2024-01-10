const express = require('express')
const app = express()
const { createCanvas } = require('canvas');
const fetch = require('sync-fetch')

let downloaddb = {};

// Route to handle dynamic image generation
app.get('/', (req, res) => {
  res.send("Hello. Params are text, spigotuserid, width, height, and fontsize @ /generate-image. I'm not going out of my way to make this user friendly and documented. Figure it out :P");
});

function updateDownloads(spigotuserid) {
  let settings = { method: "Get" };

  let downloads = 0;
  let json = fetch("https://api.spiget.org/v2/authors/" + spigotuserid + "/resources?size=200&fields=downloads", settings).json();
  for (let object of json) {
    downloads += object.downloads || 0;
  }
  console.log("Updated " + spigotuserid + ": " + downloads);
  downloaddb[spigotuserid] = downloads;
}
function getDownloads(spigotuserid) {
  updateDownloads(spigotuserid);
  return downloaddb[spigotuserid];
}
function formatDownloads(downloadString) {
  return parseInt(downloadString).toLocaleString() + " Downloads";
}

app.get('/generate-image', (req, res) => {
  // This next line is horrible but we won't talk about it this project is really quickly thrown together.
  const text = req.query.text || (req.query.spigotuserid ? (Object.keys(downloaddb).includes(req.query.spigotuserid) ? formatDownloads(downloaddb[req.query.spigotuserid]) : formatDownloads(getDownloads(req.query.spigotuserid))) : 'Default Text');
  const width = req.query.width || 400;
  const height = req.query.height || 200;
  const fontsize = req.query.fontsize || "30";

  // Your code to generate the dynamic image using the `canvas` library
  // (Please ensure you have the `canvas` library installed)
  // Example code to generate a simple text image:
  const canvas = createCanvas(parseInt(width), parseInt(height));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = fontsize + 'px Arial';
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  // Send the canvas as an image
  res.set('Content-Type', 'image/png');
  canvas.createPNGStream().pipe(res);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);

  setInterval(() => {
    updateDownloads("116592");
  }, 1000 * 60 * 5);
  updateDownloads("116592");
});