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

app.get("/data", (req, res) => {
  const folderPath = "./temp/sortedData";

  GetParameters(folderPath, (err, finalData) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Unable to get data" });
      return;
    }

    res.json(finalData);
  });
});

app.post("/upload", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const uploadedFile = req.files.file;

  // Create a temporary directory to extract the zip contents
  const tempDir = path.join(__dirname, "temp");
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

      // Remove the temporary directory and files
      fs.rmdir(tempDir, { recursive: true }, (err) => {
        if (err) {
          console.error("Error deleting temporary directory:", err);
        }
      });

      res.json(finalData);
    });
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running at port ${PORT}`));
