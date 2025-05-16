const path = require("path");
const { readFile } = require("./ReadFile");
const fs = require("fs").promises;

const folderPath = path.join("file");

const checkFile = async () => {
  try {
    const files = await fs.readdir(folderPath);
    if (files.length > 0) {
      await readFile(files);
    } else {
      console.log(`No files found.`);
    }
  } catch (err) {
    console.error(`Error : ${err.message}`);
  }
};

module.exports = { checkFile };
