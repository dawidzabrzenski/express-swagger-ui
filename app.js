const express = require("express");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { exec } = require("child_process"); // Import exec from child_process

const app = express();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("################ SWAGGER-UI ################");

const swaggerDocumentPath = path.join(process.cwd(), "openapi.json");

let swaggerDocument;

const loadSwaggerDocument = () => {
  try {
    swaggerDocument = JSON.parse(fs.readFileSync(swaggerDocumentPath, "utf8"));
    return true;
  } catch (error) {
    console.error("ERROR! No openapi.json file found at:", swaggerDocumentPath);
    return false;
  }
};

const startServer = (port) => {
  app.listen(port, () => {
    console.log(`Swagger UI running at: http://localhost:${port}/openapi`);
    // Open the Swagger UI in the default browser using exec
    const startBrowser = () => {
      const url = `http://localhost:${port}/openapi`;
      const command =
        process.platform === "win32" ? `start ${url}` : `open ${url}`;
      exec(command);
    };
    startBrowser();
  });
};

app.use(
  "/swagger-ui",
  express.static(path.join(__dirname, "node_modules/swagger-ui-dist"))
);

app.get("/openapi.json", (req, res) => {
  res.sendFile(swaggerDocumentPath);
});

app.use(
  "/openapi",
  swaggerUi.serve,
  swaggerUi.setup(null, { swaggerUrl: "/openapi.json" })
);

const askPort = () => {
  rl.question("Run at port (default 3000): ", (input) => {
    const port = parseInt(input, 10) || 3000;

    if (port >= 1 && port <= 65535) {
      console.clear();
      console.log("################ SWAGGER-UI ################");
      startServer(port);
      rl.close();
    } else {
      console.log("Invalid port. Please give a number from 1 to 65535 range.");
      askPort();
    }
  });
};

const initializeApp = () => {
  if (loadSwaggerDocument()) {
    askPort();
  } else {
    rl.question("\nPress Enter to exit the application...", () => {
      rl.close();
    });
  }
};

initializeApp();
