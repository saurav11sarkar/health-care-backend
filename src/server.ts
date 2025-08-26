import { Server } from "http";
import app from "./app";
import config from "./config";

const port = config.port;

const main = async () => {
  try {
    const server:Server = app.listen(port, () => {
      console.log(`Server is running on port http://localhost:${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();
