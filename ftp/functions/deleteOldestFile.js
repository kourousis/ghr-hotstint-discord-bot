const fs = require("fs").promises;
const path = require("path");

async function deleteOldestFile(folderPath, files) {
  try {
    if (files.length === 0) {
      console.log("Folder is empty. No files to delete.");
      return;
    }

    // Sort files alphabetically
    const sortedFiles = files.sort();

    // Delete the file at the top
    const fileToDelete = sortedFiles[0];
    const filePathToDelete = path.join(folderPath, fileToDelete);
    await fs.unlink(filePathToDelete);

    console.log(`DELETED: ${fileToDelete}`);
  } catch (error) {
    console.error("ERROR deleting file:", error.message);
  }
}

module.exports = deleteOldestFile;
