const fs = require("fs");
const path = require("path");

async function uploadImage(base64Image, projectId, host) {
  const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Format base64 invalide");
  }

  const ext = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, "base64");

  const uploadDir = path.join(__dirname, "../public/projectsImages", projectId);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${Date.now()}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  fs.writeFileSync(filepath, buffer);

  const imageUrl = `http://${host}/projectsImages/${projectId}/${filename}`;
  return imageUrl;
}

module.exports = uploadImage;
