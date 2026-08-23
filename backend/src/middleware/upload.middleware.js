import multer from "multer";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
  },

  fileFilter: (req, file, cb) => {
    const isImg = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");

    if (!isImg && !isVideo) {
      cb(new Error("Only image and video uploads are allowed!"));
      return;
    }

    cb(null, true);
  },
});