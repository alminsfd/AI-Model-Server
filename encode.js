const fs = require("fs");
const key = fs.readFileSync("./ai-model-inventory-manager-85-firebase-adminsdk.json", "utf8");
const base64 = Buffer.from(key).toString("base64");
