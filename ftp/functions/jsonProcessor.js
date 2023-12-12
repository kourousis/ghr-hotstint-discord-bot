const fs = require("fs");
const iconv = require("iconv-lite");

function jsonProcessor(localSaveLocation, encoding) {
  const rawJsonDataBuffer = fs.readFileSync(localSaveLocation);
  const rawData = iconv.decode(rawJsonDataBuffer, encoding);
  const jsonObject = JSON.parse(rawData);

  return jsonObject;
}

module.exports = jsonProcessor;
