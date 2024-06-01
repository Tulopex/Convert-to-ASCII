const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

const session = require('express-session');
const MemoryStore = require('memorystore')(session);

const app = express();
const PORT = 3000;

app.use(session({
  cookie: { maxAge: 86400000 }, // 1 день
  store: new MemoryStore({
    checkPeriod: 86400000 // Очищаем устаревшие сессии каждый день
  }),
  secret: 'Tulopex',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const resizedImagePath = 'uploads/resized-' + req.file.filename;

    await sharp(filePath)
      .resize(100, 100, {
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .toFile(resizedImagePath);

    const asciiArt = await imageToAscii(resizedImagePath);

    // Сохраняем имя загруженного файла в сессии
    req.session.uploadedFileName = resizedImagePath;

    res.send(asciiArt);
  } catch (error) {
    res.status(500).send('Ошибка при обработке изображения');
  }
});

app.post('/reset', async (req, res) => {
  try {
    // Получаем имя загруженного файла из сессии
    const uploadedFileName = req.session.uploadedFileName;

    // Удаляем файл, если он был загружен
    if (uploadedFileName) {
      fs.unlinkSync(uploadedFileName);
      delete req.session.uploadedFileName; // Удаляем имя файла из сессии
    }
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send('Ошибка при удалении файла');
  }
});

async function imageToAscii(imagePath) {
  const image = await Jimp.read(imagePath);
  const asciiChars = '&$@%#*+=-:. ';
  let asciiArt = '';

  image.grayscale().resize(50, 50);

  for (let y = 0; y < image.bitmap.height; y++) {
    for (let x = 0; x < image.bitmap.width; x++) {
      const pixelColor = Jimp.intToRGBA(image.getPixelColor(x, y));
      const brightness = (0.299 * pixelColor.r + 0.587 * pixelColor.g + 0.114 * pixelColor.b) / 255;
      const charIndex = Math.floor((1 - brightness) * (asciiChars.length - 1));
      asciiArt += asciiChars[charIndex];
    }
    asciiArt += '\n';
  }

  return asciiArt;
}

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
