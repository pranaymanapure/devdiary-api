import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (process.env.NODE_ENV === "development") {
            cb(null, "./public/temp"); // for development
        } else {
            cb(null, "/tmp"); // vercel production temp location
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});

export const upload = multer({
    storage,
});
