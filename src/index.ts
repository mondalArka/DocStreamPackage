import express from "express";
import { createServer } from "http";
import route from "./routes";
import path from "path";
const app = express();
const server = createServer(app);

app.use(express.static(path.join(__dirname,"public")));
app.use(route);
server.listen(4000, () => {
    console.log("Server is running on port 3000");
});