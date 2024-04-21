const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

//object to store voltage/current with specific species name
const finalData = {};

// Function to iterate through Excel files in a folder
function GetParameters(folderPath) {
  // Read the contents of the folder

  //          path ,  callback function
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading folder:", err);
      return;
    }

    // Iterate through each file in the folder
    files.forEach((file) => {
      // Check if the file is an Excel file (with .xlsx extension)
      //console.log(file)
      if (path.extname(file).toLowerCase() === ".xlsx") {
        //console.log(path)
        const filePath = path.join(folderPath, file);

        // Read the Excel file
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        jsonData.shift();
        //console.log(jsonData);

        // Find the index of the voltage column
        const voltageColumnIndex = 0;

        // Calculate the index of the next column
        const currentColumnIndexScan1 = voltageColumnIndex + 1;

        const Scan_1 = jsonData.map((row) => {
          return {
            voltage: row[Object.keys(row)[voltageColumnIndex]],
            current: row[Object.keys(row)[currentColumnIndexScan1]],
          };
        });

        //console.log('Scan_1:', Scan_1);

        //index of the voltage column
        const voltageColumnIndexScan2 = 2;

        // Calculate the index of the next column
        const currentColumnIndexScan2 = voltageColumnIndexScan2 + 1;

        const Scan_2 = jsonData.map((row) => {
          return {
            voltage: row[Object.keys(row)[voltageColumnIndexScan2]],
            current: row[Object.keys(row)[currentColumnIndexScan2]],
          };
        });

        //console.log('Scan_2:', Scan_2);

        const finalScan1 = Scan_1.filter((item) => {
          if (item.voltage >= 0.1 && item.voltage <= 0.3) {
            return item;
          }
        });

        //console.log(finalScan1)

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
          if (item.voltage >= 0.1 && item.voltage <= 0.3) {
            return item;
          }
        });

        //console.log(finalScan2)

        let minCurrentForScan2 = 0;
        let corresponsingVoltageToMinCurrentScan2 = null;
        for (let i = 0; i < finalScan2.length; i++) {
          if (finalScan2[i].current < minCurrentForScan2) {
            minCurrentForScan2 = finalScan2[i].current;
            corresponsingVoltageToMinCurrentScan2 = finalScan2[i].voltage;
          }
        }

        // console.log(minCurrentForScan1);
        // console.log(corresponsingVoltageToMinCurrentScan1 );
        // console.log(minCurrentForScan2);
        // console.log(corresponsingVoltageToMinCurrentScan2 );

        let finalOutputCurrent, finalOutputVoltage;

        //comparing both the scan results because we have to concider the larger current values from both the scans
        if (minCurrentForScan1 > minCurrentForScan2) {
          finalOutputCurrent = minCurrentForScan2;
          finalOutputVoltage = corresponsingVoltageToMinCurrentScan2;
        } else {
          finalOutputCurrent = minCurrentForScan1;
          finalOutputVoltage = corresponsingVoltageToMinCurrentScan1;
        }

        const speciesName = path.basename(file, ".xlsx");
        const speciesData = {
          current: finalOutputCurrent,
          voltage: finalOutputVoltage,
        };
        finalData[speciesName] = speciesData;

        //console.log(finalData);
        //console.log("final Current:" + finalOutputCurrent);
        //console.log("final Voltage:" + finalOutputVoltage);
      }
    });

    //Final object with all data
    console.log(finalData);
  });
}

const folderPath = "./sortedData";
GetParameters(folderPath);
//console.log(finalData); getting empty object here because wea re reading file async & code wont wait for object to be updated & its prints the object on console
