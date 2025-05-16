const fs = require("fs").promises;
const path = require("path");

class FileMover {
  static async move(oldPath, newPath) {
    try {
      await fs.rename(oldPath, newPath);
      // console.log(`Moved file from ${oldPath} to ${newPath}`);
    } catch (err) {
      console.error(`Failed to move file ${oldPath}: ${err.message}`);
    }
  }
}

module.exports = FileMover;
