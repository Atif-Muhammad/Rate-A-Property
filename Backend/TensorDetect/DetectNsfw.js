const nsfw = require("nsfwjs");
const tf = require("@tensorflow/tfjs");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const sharp = require("sharp");
const { exec } = require("child_process");
const mime = require("mime-types");
const FileType = require('file-type')

async function DetectNSFW(file) {
  const type = await FileType.fromBuffer(file);
  const mimeType = type.mime;

  if (mimeType && mimeType.startsWith("image/")) {
    return await detectImageNSFW(file);
  } else if (mimeType && mimeType.startsWith("video/")) {
    return await detectVideoNSFW(file);
  } else {
    throw new Error("Unsupported file type");
  }
}


async function detectImageNSFW(imagePath) {
  const pngBuffer = await sharp(imagePath).png().toBuffer();
  const image = await loadImage(pngBuffer);

  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);

  const imageTensor = tf.browser.fromPixels(canvas);
  const model = await nsfw.load();
  const predictions = await model.classify(imageTensor);
  imageTensor.dispose();

  const isNSFW = predictions.some(
    (p) => ["Porn", "Sexy", "Hentai"].includes(p.className) && p.probability >= 0.5
  );

  return isNSFW;
}


async function detectVideoNSFW(videoPath) {
  const frameDir = path.join(__dirname, "temp_frames");
  fs.mkdirSync(frameDir, { recursive: true });

  // Extract 1 frame per second
  await new Promise((resolve, reject) => {
    exec(
      `ffmpeg -i "${videoPath}" -vf fps=1 "${frameDir}/frame_%03d.png" -hide_banner -loglevel error`,
      (err) => (err ? reject(err) : resolve())
    );
  });

  const frameFiles = fs.readdirSync(frameDir).filter(f => f.endsWith(".png"));
  let isNSFW = false;

  for (const frame of frameFiles) {
    const framePath = path.join(frameDir, frame);
    isNSFW = await detectImageNSFW(framePath);
    if (isNSFW) break;
  }

  // Cleanup
  fs.rmSync(frameDir, { recursive: true, force: true });
  return isNSFW;
}

module.exports = DetectNSFW;
