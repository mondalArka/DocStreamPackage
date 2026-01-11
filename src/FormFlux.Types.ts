import { Request } from "express";
import FormfluxError from "./FormFluxError";

export interface reqObj {
    "originalReq": string;
    "modifiedReq": Buffer;
    "data": Array<string>;
    "content": Array<Buffer>;
    "contentBody": Array<string>;
    "metaData": Array<string>;
    "mimeType": Array<string>;
    "fieldNameBody": Array<string>;
    "fileName": Array<string>;
    "modifiedFileName": Array<string>;
    "fieldNameFile": Array<string>;
    "filePath": Array<string>;
    "filesize": Array<number>;
    "streams": Array<any>;
}

// compression presets

interface CompressionPreset {
    level: number;
    memLevel: number;
    description: string;
}

export type CompressionPresetName =
    | 'fast'
    | 'balanced'
    | 'strong'
    | 'max'

export const COMPRESSION_PRESETS = {
    fast: {
        level: 3,
        memLevel: 4,
        description: 'Very fast compression with low CPU and memory usage — good compromise when you need some size reduction but want to keep response time minimal'
    },
    balanced: {
        level: 6,
        memLevel: 8,
        description: 'Recommended default — excellent balance between compression ratio, speed and resource usage (very close to zlib\'s internal default behavior)'
    },
    strong: {
        level: 8,
        memLevel: 9,
        description: 'Significantly better compression than balanced (~4–10% smaller files) at the cost of noticeably higher CPU time and memory usage'
    },
    max: {
        level: 9,
        memLevel: 9,
        description: 'Maximum compression'
    }
} as const satisfies Record<CompressionPresetName, CompressionPreset>;

export interface File {
    mimetype: string;
    originalname: string;
    filesize: number;
    fieldname: string;
}

export interface options {
    attachFileToReqBody?: boolean;
    maxFileCount?: number;
    maxFileSize?: number;
    maxFields?: number;
    minFileCount?: number;
    filename: (
        req: Request,
        file: File,
        cb: (error: FormfluxError | null, filename: string) => void
    ) => void;
    destination: (
        req: Request,
        file: File,
        cb: (error: FormfluxError | null, filepath: string) => void
    ) => void;
    fileFilter?: (
        req: Request,
        file: File,
        cb: (error: Error | null, bool: boolean) => void
    ) => void;
}

export interface optionSingle {
    attachFileToReqBody?: boolean;
    maxFileCount?: number;
    maxFileSize?: number;
    maxFields?: number;
    minFileCount?: number;
    filename: (
        req: Request,
        file: File,
        cb: (error: FormfluxError | null, filename: string) => void
    ) => void;
    fileFilter?: (
        req: Request,
        file: File,
        cb: (error: Error | null, bool: boolean) => void
    ) => void;
}

interface fieldObject {
    name: string;
    maxFileCount?: number;
    maxFileSize?: number;
    minFileCount?: number;
}

export interface configOptions {
    compression?: CompressionPresetName;
}

export type optionFields = [fieldObject, ...fieldObject[]];