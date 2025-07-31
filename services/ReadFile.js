const path = require("path");
const fs = require("fs").promises;
const { labResult } = require("./LabResult");
const FileMover = require("../utils/FileMover");

const readFile = async (fileNames) => {
  try {
    for (const fileName of fileNames) {
      const filePath = path.join(__dirname, "../file", fileName);

      const stat = await fs.stat(filePath);
      if (!stat.isFile()) {
        continue;
      }

      try {
        console.log(`Processing file: ${fileName}`);
        const text = await fs.readFile(filePath, "utf-8");
        const jsonData = JSON.parse(text);
        for (const rows of jsonData) {
          await labResult(rows);
        }
        const backupFolder = path.join(__dirname, "../file/Backup");
        const newPath = path.join(backupFolder, fileName);

        await fs.mkdir(backupFolder, { recursive: true });

        await FileMover.move(filePath, newPath);
      } catch (parseErr) {
        console.error(`Invalid JSON in ${fileName}: ${parseErr.message}`);
      }
    }
  } catch (err) {
    console.error(`Error ReadFile: ${err.message}`);
  }
};

module.exports = { readFile };
