# Document Service API Documentation

**Version:** 1.0.0
**Base URL:** \`http://localhost:5007/api/documents\` (Direct) or \`http://localhost:5000/api/documents\` (Gateway)

## Overview

The Document Service handles file uploads and retrievals.
**Note:** Data is stored locally in the \`uploads/\` folder.

## Endpoints

### 1. Upload File

Upload a PDF or Image.

-   **URL:** \`/api/documents/upload\`
-   **Method:** \`POST\`
-   **Headers:** \`Content-Type: multipart/form-data\`
-   **Form Data:**
    -   \`file\`: (Select File)

-   **Success Response:**
    -   **Code:** 201 Created
    -   **Content:**
        \`\`\`json
        {
          "success": true,
          "message": "File uploaded successfully",
          "data": {
            "filename": "file-1703080000000.pdf",
            "mimetype": "application/pdf",
            "url": "http://localhost:5000/api/documents/file-1703080000000.pdf"
          }
        }
        \`\`\`

### 2. Get/View File

Access an uploaded file.

-   **URL:** \`/api/documents/:filename\`
-   **Method:** \`GET\`
-   **Example:** \`http://localhost:5000/api/documents/file-1703080000000.pdf\`
-   **Response:** Binary File (Image or PDF).
