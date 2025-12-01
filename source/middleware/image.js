// imageMiddleware.js
const fs = require('fs');
const path = require('path');

function imageMiddleware(req, res, next) {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'images', filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({
        error: "Image not found",
        file: filename
      });
    }

    res.sendFile(filePath);
  });
}

module.exports = imageMiddleware;
