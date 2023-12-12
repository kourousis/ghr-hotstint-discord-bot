/*
  To Do:
    - Make it work for Qualifying sessions
    - (Optional) Make it work for driver swap events
*/

// NOT CURRENTYLY WORKING FOR QUALIFYING SESSIONS
// ONLY WORKS FOR SINGLE DRIVER RACE SESSIONS

//Import the JSON file from the data folder using relative postion
const jsonProcessor = require("../ftp/functions/jsonProcessor");
const results = "ftp/data/results/231210_202634_R.json";
const jsonDatabaseData = jsonProcessor(results, "utf16le");
//create a variable to be able to access the JSON easier later on
const leaderboard = jsonDatabaseData.sessionResult.leaderBoardLines;

//Create some variables for future use
const lapArray = []; //Stores lap time from all drivers in an array
const totalTimeArray = []; //Stores total time of all drivers in an array
const unsortedLapsArray = []; //Stores laps of all drivers as they are read from the JSON
let raceNum = jsonDatabaseData.sessionIndex;

//Pushes all the best laps of each driver into the unsortedLapsArray and lapArray variable.node
//Basically pushes laps as they appear in the JSOn
let i = 0;
while (i < Object.keys(leaderboard).length) {
  let lapsInRace = leaderboard[i].timing.bestLap;
  lapArray.push(lapsInRace);
  unsortedLapsArray.push(lapsInRace);
  i++;
}

//While loop to push the total time of each driver into the totalTimeArray
i = 0;
while (i < Object.keys(leaderboard).length) {
  let totalTime = leaderboard[i].timing.totalTime;
  totalTimeArray.push(totalTime);
  i++;
}

const fastestLap = lapArray.sort(function (a, b) {
  return a - b;
})[0]; //Finds fastest laptime of the session by sorting all laps in the array
const fastestLapper = unsortedLapsArray.indexOf(fastestLap); //Finds index of the person who completed the fastest lap by looking at the unsorted array
const fastestLapMin = parseInt(
  lapArray.sort(function (a, b) {
    return a - b;
  })[0] /
    1000 /
    60
); //Converts milliseconds to minutes
const fastestLapSec =
  Math.round(
    ((lapArray.sort(function (a, b) {
      return a - b;
    })[0] /
      1000) %
      60) *
      1000
  ) / 1000; //Converts milliseconds to seconds

//Function to retrieve the first name of the driver
function firstNameLeaderboard(position, driver = 0) {
  return jsonDatabaseData.sessionResult.leaderBoardLines[position].car.drivers[
    driver
  ].firstName.trim();
}

//Function to retrieve the last name of the driver
function lastNameLeaderboard(position, driver = 0) {
  //If the driver doesn't have a first name, dont include a space between the first and last name
  if (
    jsonDatabaseData.sessionResult.leaderBoardLines[position].car.drivers[
      driver
    ].firstName.trim() === ""
  ) {
    return jsonDatabaseData.sessionResult.leaderBoardLines[
      position
    ].car.drivers[driver].lastName.trim();
  } else {
    return ` ${jsonDatabaseData.sessionResult.leaderBoardLines[
      position
    ].car.drivers[driver].lastName.trim()}`;
  }
}

//Link R => Race && Q => Qualifying
let session;
switch (jsonDatabaseData.sessionType) {
  case "R":
    session = "Race";
    break;
  case "Q":
    session = "Qualifying";
    break;
  case "P":
    session = "Practise";
}

let finishingLaps = leaderboard[0].timing.lapCount; //person with the most laps in the race
let currentLap; //current lap used to find the lap which a driver has completed while the below for function loops through the results.json file
let newFinishingLap = leaderboard[0].timing.lapCoun;
const currentLapCheck = [];

//Convert total time milliseconds to hours
function totalTimeHours(index = 0) {
  let hrs = parseInt(totalTimeArray[index] / 1000 / 60 / 60);

  //Adding a leading zero
  if (hrs < 1) {
    return "";
  } else if (hrs < 10) {
    return "0" + hrs + ":";
  } else {
    return hrs;
  }
}

//Convert total time milliseconds to minutes
function totalTimeMins(index = 0) {
  let mn = parseInt(totalTimeArray[index] / 1000 / 60);

  //Adding a leading zero, or two zeros depending on the case
  if (mn < 1) {
    return "00";
  } else if (mn < 10) {
    return "0" + mn;
  } else {
    return mn;
  }
}

//Convert total time milliseconds to seconds
function totalTimeSecs(index = 0) {
  let sc = Math.round(((totalTimeArray[index] / 1000) % 60) * 1000) / 1000;

  //Add a leadinging zero, or two zeros depending on the case
  if (sc < 1) {
    return "00";
  } else if (sc < 10) {
    return "0" + sc;
  } else {
    return sc;
  }
}

// Finds the gap between drivers, if they are not any laps down, in hours
function diffTotalTimeHours(index) {
  let diffHrs = totalTimeArray[index] - totalTimeArray[0];
  let hours = parseInt(diffHrs / 1000 / 60 / 60);

  //Add leading zero, or leave blank if hours are 0
  if (hours === 0) {
    return "";
  } else if (hours < 10) {
    return `0${hours}:`;
  } else {
    return hours;
  }
}

var mins;

//Finds the gap between drivers, if they are not any laps down, in minutes
function diffTotalTimeMins(index) {
  let diffMin = totalTimeArray[index] - totalTimeArray[0];
  mins = parseInt(diffMin / 1000 / 60);

  //Add leading zero if needed
  if (mins === 0) {
    return ""; //Leave blank if there are 0 mins
  } else {
    if (Math.round(mins) < 10) {
      mins = "0" + mins;
    }
    return `${mins}:`; //No leading zero
  }
}

//Finds the gap between drivers, if they are not any laps down, in minutes
function diffTotalTimeSecs(index) {
  let diffSec = totalTimeArray[index] - totalTimeArray[0];
  let sec = Math.round(((diffSec / 1000) % 60) * 1000) / 1000;

  //Add leading zero if needed
  if (Math.round(sec) < 10 && mins != 0) {
    sec = "0" + sec;
  }
  return `${sec}`;
}

if (jsonDatabaseData.sessionType === "R") {
  //Posts the track name, session and race number (e.g., 1, 2, etc)
  console.log(
    `${jsonDatabaseData.trackName}`.replace(/_|-|\./g, " ").toUpperCase() +
      ` - ${session} ${raceNum}`.toUpperCase()
  ); //genExp removes the "_" in the track name
  console.log(
    `Fastest Lap: ${fastestLapMin}:${fastestLapSec} by ${firstNameLeaderboard(
      fastestLapper
    )}${lastNameLeaderboard(fastestLapper)}\n`
  ); //Posts the fastest lapper

  i = 0;
  for (entry of leaderboard) {
    currentLap = leaderboard[i].timing.lapCount;

    while (currentLap < newFinishingLap) {
      newFinishingLap = currentLap;

      while (currentLap === newFinishingLap) {
        if (i < currentLapCheck.length - 1) {
          currentLapCheck.push(currentLap);
          i++;
          currentLap = leaderboard[i].timing.lapCount;
        }
        break;
      }
    }
    // MAIN BODY OF FOR LOOP
    if (i === 0) {
      console.log(
        `${i + 1}. ${firstNameLeaderboard(i)}${lastNameLeaderboard(i)}`.padEnd(
          30,
          "."
        ) +
          `${totalTimeHours()}${totalTimeMins()}:${totalTimeSecs()} (${finishingLaps} laps)`
      );
    } else if (currentLap === finishingLaps) {
      console.log(
        `${i + 1}. ${firstNameLeaderboard(i)}${lastNameLeaderboard(i)}`.padEnd(
          30,
          "."
        ) +
          `+${diffTotalTimeHours(i)}${diffTotalTimeMins(i)}${diffTotalTimeSecs(
            i
          )}`
      );
    } else {
      if (Math.floor(currentLap < finishingLaps * 0.85)) {
        console.log(
          `${i + 1}. ${firstNameLeaderboard(i)}${lastNameLeaderboard(
            i
          )}`.padEnd(30, ".") + `+${finishingLaps - currentLap} laps (DNF)`
        );
      } else {
        if (finishingLaps - currentLap === 1) {
          console.log(
            `${i + 1}. ${firstNameLeaderboard(i)}${lastNameLeaderboard(
              i
            )}`.padEnd(30, ".") + `+${finishingLaps - currentLap} lap`
          );
        } else {
          console.log(
            `${i + 1}. ${firstNameLeaderboard(i)}${lastNameLeaderboard(
              i
            )}`.padEnd(30, ".") + `+${finishingLaps - currentLap} laps`
          );
        }
      }
    }
    currentLapCheck.push(currentLap);
    i++;
  }
} else if (jsonDatabaseData.sessionType === "Q") {
  console.log(`${session} sessions are not supported yet`);
  //Code to support Qualifying sessions
} else if (jsonDatabaseData.sessionType === "P") {
  console.log(`${session} sessions are not supported yet`);
  //Code to support Practise sessions
}
