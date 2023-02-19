const multer = require("multer");

const fileFilter = (req, file, cb) => {
  // 확장자 필터링
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true); // 해당 mimetype만 받겠다는 의미
  } else {
    // 다른 mimetype은 저장되지 않음
    req.fileValidationError = "jpg,jpeg,png,gif,webp 파일만 업로드 가능합니다.";
    cb(null, false);
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
  fileFilter: fileFilter,
});

module.exports = { upload };
//
