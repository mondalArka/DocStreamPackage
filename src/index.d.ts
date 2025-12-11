export {};

import type { File } from "./FormFlux.Types";

declare module "express-serve-static-core" {
  interface Request {
    file?: File;
    files?: File[] | { [fieldname: string]: File[] };
  }
}