# FormFlux

**FormFlux** is a powerful, customizable middleware for handling `multipart/form-data` in Node.js, built with TypeScript. It is inspired by [Multer](https://github.com/expressjs/multer) but written from scratch — without using `busboy` under the hood.

FormFlux focuses on giving developers greater control over file validation, parsing, and flexible API.

---

## Features

- ✅ Built from scratch (no `busboy`) in TypeScript
- ✅ Extended features compared to Multer
- ✅ Middleware options: `single`, `fields`, `any`, `bodyParser`
- ✅ Memory and disk storage support
- ✅ Strong validation capabilities (per-file and per-field)
- ✅ Easily integrates with Express or similar frameworks

---

## Setup
1. **Type `CommonJs`**
```js
const FormFlux = require('formflux').default;
```
2. **Type `module`**
```ts
import Formflux from "formflux";
```

## Code Example

```ts
// Step 1: Configure memory storage or disk storage with options
const formFluxConfig = FormFlux.diskStorage({
  attachFileToReqBody: true, // global behavior
  maxFields: 2, // including file fields
  maxFileCount: 3,
  minFileCount: 1,
  maxFileSize: 580 * 1024, // 580KB

  destination: (
    req: Request,
    file: File,
    cb: (err: FormfluxError | null, filePath: string) => void
  ) => {
    cb(null, path.resolve(process.cwd(), "temp"));
  },

  filename: (req, file, cb) => {
    if (file.mimetype === "image/jpg") {
      cb(null, Date.now() + "-" + file.originalname);
    } else {
      cb(null, "low-" + file.originalname);
    }
  },

  fileFilter: (req, file, cb) => {
    // Add your custom logic here
    cb(null, true); // Allow all for now
  },
});

// Step 2: Use in route like multer
app.post(
  "/upload",
  formFluxConfig.fields([
    { name: "avatar", maxFileCount: 2, minFileCount: 1, maxFileSize: 100 * 1024 },
    { name: "gallery", maxFileCount: 3 },
  ]),
  async (req, res) => {
    console.log("Files:", req.files);
    console.log("File",req.file);
    console.log("Body:", req.body);

    res.status(200).json({ message: "Files uploaded successfully" });
  }
);
```

## FormFlux Features

Here are some of the features of FormFlux:

1. **Attach Filenames to `req.body`**
   - FormFlux attaches the uploaded filename to the `req.body` – helpful when saving file metadata to a database.This behavior is enabled when the attachFileToReqBody: true option is set.

2. **File Count Validation**
   - Enforce `minFileCount`, `maxFileCount` and `maxFileSize` of files **per field** and **globally**.

3. **File Filtering**
   - Filter incoming files based on:
     - `mimetype`
     - `fieldname`
     - `filesize`
     - `originalname`

4. **Per-Field Controls**
   - Set validation options individually for each field:
     - `minFileCount`
     - `maxFileCount`
     - `maxFileSize`

5. **Field Limitations**
   - Define how many total fields are allowed in a single request globally.
      - `maxFields`

6. **Flexible Middleware API**
   - Just like Multer:
     - `formflux.single(fieldname)`
     - `formflux.fields([{ name, maxFileCount, minFileCount, maxFileSize }])`
     - `formflux.any()`
     - `new formflux().bodyParser()` – for parsing non-file fields

7. **Storage Options**
   - Supports `memoryStorage` and `diskStorage`, giving you full control over where and how files are saved.

---

8. **Error Handling**
    - Provides error handling through error class FormfluxError which also provides statuscodes. Similar to Multer error class.

## Limitation

Due to its custom implementation (not using `busboy`), the recommended **maximum file size is 200MB**. Going beyond that may lead to performance issues or high memory usage.

---

## Installation

```bash
npm install formflux
