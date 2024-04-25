const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

// Function to iterate through Excel files in a folder
function GetParameters(folderPath, callback) {
  //object to store voltage/current with specific species name
  const finalData = {};

  // Read the contents of the folder
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading folder:", err);
      return callback(err);
    }

    // Iterate through each file in the folder
    files.forEach((file, index) => {
      // Check if the file is an Excel file (with .xlsx extension)
      if (path.extname(file).toLowerCase() === ".xlsx") {
        const filePath = path.join(folderPath, file);

        // Read the Excel file
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        jsonData.shift();

// Index of the voltage column
const voltageColumnIndex = 0;

// Index of the next column
const currentColumnIndexScan1 = voltageColumnIndex + 1;


//sorting first scan columns
const Scan_1 = jsonData.map((row) => {
  return {
    voltage: row[Object.keys(row)[voltageColumnIndex]],
    current: row[Object.keys(row)[currentColumnIndexScan1]],
  };
});

//index of the voltage column
const voltageColumnIndexScan2 = 2;

// Calculate the index of the next column
const currentColumnIndexScan2 = voltageColumnIndexScan2 + 1;
//sorting second scan columns
const Scan_2 = jsonData.map((row) => {
  return {
    voltage: row[Object.keys(row)[voltageColumnIndexScan2]],
    current: row[Object.keys(row)[currentColumnIndexScan2]],
  };
});


//filtering out on specific condition
const finalScan1 = Scan_1.filter((item) => {
  if (item.voltage >= 0.15 && item.voltage <= 0.3) {
    return item;
  }
});

//console.log(finalScan1);

let minCurrentForScan1 = 0;
let corresponsingVoltageToMinCurrentScan1 = null;
for (let i = 0; i < finalScan1.length; i++) {
  if (finalScan1[i].current < minCurrentForScan1) {
    minCurrentForScan1 = finalScan1[i].current;
    corresponsingVoltageToMinCurrentScan1 = finalScan1[i].voltage;
  }
}

//for Scan 2
const finalScan2 = Scan_2.filter((item) => {
  if (item.voltage >= 0.15 && item.voltage <= 0.3) {
    return item;
  }
});

let minCurrentForScan2 = 0;
let corresponsingVoltageToMinCurrentScan2 = null;
for (let i = 0; i < finalScan2.length; i++) {
  if (finalScan2[i].current < minCurrentForScan2) {
    minCurrentForScan2 = finalScan2[i].current;
    corresponsingVoltageToMinCurrentScan2 = finalScan2[i].voltage;
  }
}

let finalOutputCurrent, finalOutputVoltage;

//comparing both the scan results because we have to concider the larger current values from both the scans
if (minCurrentForScan1 > minCurrentForScan2) {
  finalOutputCurrent = minCurrentForScan2;
  finalOutputVoltage = corresponsingVoltageToMinCurrentScan2;
} else {
  finalOutputCurrent = minCurrentForScan1;
  finalOutputVoltage = corresponsingVoltageToMinCurrentScan1;
}

let result = "";
if(finalOutputCurrent > -12 ){
  result= 'Negative';
}else if( finalOutputCurrent > -15 && finalOutputCurrent <= -12){
  result= 'W-Positive';
}else{
  result= 'Positive';
}

const speciesName = path.basename(file, ".xlsx");
const speciesData = {
  current: finalOutputCurrent,
  voltage: finalOutputVoltage,
  status : result
};

//console.log(speciesData);
finalData[speciesName] = speciesData;

        // Once all files are processed, invoke the callback with finalData
        if (index === files.length - 1) {
          callback(null, finalData);
        }
      }
    });
  });
}
module.exports = { GetParameters };