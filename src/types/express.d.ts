import { Request } from "express";
declare module 'express-serve-static-core' {
  interface Request {
    file?: any[]; // Or replace with a specific type, e.g., File[]
  }
}