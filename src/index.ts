import express from "express";
import { createServer } from "http";
import route from "./routes";
const app = express();
const server = createServer(app);

app.use(express.static("public"));
app.use(route);
server.listen(3000, () => {
    console.log("Server is running on port 3000");
});