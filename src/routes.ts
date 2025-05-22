import { Router } from "express";
import stream from "./docStream";
const routes = Router();

routes.get("/doc", stream);
export default routes;