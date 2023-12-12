const jsonProcessor = require("../functions/jsonProcessor");
const deleteOldestFile = require("../functions/deleteOldestFile");
const ftp = require("basic-ftp");
const fs = require("fs");
const path = require("path");

const RESULT_DIRECTORY = "ftp/data/results";
const MAX_FILES_TO_KEEP = 50;
const LOGS_DIRECTORY = "storageLogs"; // Add this constant for the logs directory
const DOWNLOADED_FILES_PATH = path.join(
  __dirname,
  LOGS_DIRECTORY,
  "downloadedFiles.json"
);

const ftpInfoRead = fs.readFileSync("config.json");
const ftpServerInfo = JSON.parse(ftpInfoRead);

let downloadedFiles = [];

try {
  const downloadedFilesData = fs.readFileSync(DOWNLOADED_FILES_PATH, "utf-8");
  downloadedFiles = JSON.parse(downloadedFilesData);
} catch (err) {
  // Ignore errors (file may not exist or be corrupted)
}

async function downloadAndReadSessionResultsJson() {
  let startTime = new Date();

  const client = new ftp.Client();

  try {
    // Connect to FTP server
    await client.access({
      host: ftpServerInfo.host,
      user: ftpServerInfo.user,
      password: ftpServerInfo.password,
      secure: ftpServerInfo.secure,
      port: ftpServerInfo.port,
    });

    const remoteDirectory = "/results";
    const filesOnServer = await client.list(remoteDirectory);

    // Sort files based on their order in the directory listing in descending order
    const sortedFiles = filesOnServer
      .filter((file) => file.name.endsWith(".json"))
      .sort((a, b) => b.name.localeCompare(a.name));

    // Download only new files from the FTP server
    for (const file of sortedFiles.slice(0, MAX_FILES_TO_KEEP)) {
      const localSaveLocation = path.join(RESULT_DIRECTORY, file.name);

      // Check if the file is already downloaded or missing locally
      try {
        await fs.promises.access(localSaveLocation);
        continue; // Skip this file
      } catch (error) {
        // File doesn't exist locally, proceed with downloading
      }

      try {
        await downloadFile(
          client,
          remoteDirectory,
          file.name,
          localSaveLocation
        );
        console.log(`Downloaded: ${file.name}`);
        downloadedFiles.push(file.name);

        // Process the downloaded JSON file
        jsonProcessor(localSaveLocation, "utf16le");
      } catch (downloadError) {
        console.error(`Error downloading or processing file: ${file.name}`);
        console.error(downloadError);
      }
    }

    // Save the updated list of downloaded files
    fs.writeFileSync(DOWNLOADED_FILES_PATH, JSON.stringify(downloadedFiles));

    // Ensure only the latest 50 files are kept
    let files = await fs.promises.readdir(RESULT_DIRECTORY);
    let fileCount = files.length;

    while (fileCount > MAX_FILES_TO_KEEP) {
      await deleteOldestFile(RESULT_DIRECTORY, files);
      // Update fileCount after deletion
      files = await fs.promises.readdir(RESULT_DIRECTORY);
      fileCount = files.length;
    }

    // Close the FTP connection
    await client.close();

    let endTime = new Date();
    let timeElapsed = endTime - startTime;
    if (timeElapsed < 1000) timeElapsed = endTime - startTime + " ms";
    if (timeElapsed > 999) timeElapsed = (endTime - startTime) / 1000 + " s";

    console.log(`✅ Results - latest ${fileCount} ` + `[${timeElapsed}]`);
  } catch (err) {
    console.log(
      "❌ Error connecting to FTP server or processing session JSON files"
    );
    console.error(err);
  }
}

async function downloadFile(
  client,
  remoteDirectory,
  fileName,
  localSaveLocation
) {
  const remoteFilePath = remoteDirectory + "/" + fileName; // Corrected construction
  try {
    await client.downloadTo(
      fs.createWriteStream(localSaveLocation),
      remoteFilePath
    );
  } catch (error) {
    console.error(`Error downloading file: ${remoteFilePath}`);
    throw error;
  }
}

module.exports = downloadAndReadSessionResultsJson;
