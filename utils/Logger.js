const fs = require("fs");
const path = require("path");
const moment = require("moment");

class Logger {
  saveJSON(data, filename, folderPath) {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid data: must be a JSON object.");
    }

    if (!filename) {
      throw new Error("Filename is required.");
    }

    if (!folderPath) {
      throw new Error("Folder path is required.");
    }

    const fullDirPath = path.isAbsolute(folderPath)
      ? folderPath
      : path.join(__dirname, "..", folderPath);

    if (!fs.existsSync(fullDirPath)) {
      fs.mkdirSync(fullDirPath, { recursive: true });
    }

    const safeFilename = `${filename}.json`;
    const fullFilePath = path.join(fullDirPath, safeFilename);

    fs.writeFileSync(fullFilePath, JSON.stringify(data, null, 2), "utf8");

    return fullFilePath;
  }
}

module.exports = Logger;
