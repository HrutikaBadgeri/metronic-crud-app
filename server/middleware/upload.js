// // var multer = require("multer");
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.originalname.split(".").slice(0, -1).join(".") +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 25,
  },
  fileFilter(req, file, cb) {
    if (
      !file.originalname.match(
        /\.(pdf|doc|txt|jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/
      )
    ) {
      //upload only in the given format
      return cb(
        new Error(
          "Only pdf|doc|txt|jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF file type  are allowed!"
        ),
        false
      );
    }
    cb(undefined, true);
  },
});
export default upload;
