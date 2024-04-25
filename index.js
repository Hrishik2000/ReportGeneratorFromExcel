const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { GetParameters } = require("./logic");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const app = express();
app.use(cors());
app.use(fileUpload());

const tempDir = path.join(__dirname, "temp");

// Function to delete the temporary folder
const deleteTempFolder = () => {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
    // console.log("Temporary folder deleted.");
  }
};

// Delete the temporary folder when the server starts
//deleteTempFolder();

app.get("/", (req, res) => {
  const folderPath = "./temp/sortedData";

  if (!fs.existsSync(folderPath)) {
    return res.status(404).json({ error: "Sorted data folder not found" });
  }

  GetParameters(folderPath, (err, finalData) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Unable to get data" });
      return;
    }
    res.json(finalData);

    // Delete the temporary folder after sending the response
    deleteTempFolder();

   
  });
});

app.post("/", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const uploadedFile = req.files.file;

  // Create a temporary directory to extract the zip contents
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  // Save the uploaded zip file to the temporary directory
  const zipFilePath = path.join(tempDir, uploadedFile.name);
  uploadedFile.mv(zipFilePath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    // Extract the contents of the zip file
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(tempDir, true);

    // Process the extracted Excel files
    const folderPath = tempDir;
    GetParameters(folderPath, (err, finalData) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Unable to process uploaded files" });
        return;
      }
      res.json(finalData);
    });
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running at port ${PORT}`));
