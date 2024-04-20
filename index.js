const XLSX = require("xlsx");

const workbook = XLSX.readFile("./sortedData/C albicans.xlsx");
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const jsonData = XLSX.utils.sheet_to_json(worksheet);

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

console.log("final Current:" + finalOutputCurrent);
console.log("final Voltage:" + finalOutputVoltage);
