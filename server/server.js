import cors from "cors";
import vision from "@google-cloud/vision";
import fs from "fs";
import path from "path";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());

// CARGAR CREDENCIALES
const keyPath = path.join(process.cwd(), "keys", "vision-key.json");
const credentials = JSON.parse(fs.readFileSync(keyPath));

const client = new vision.ImageAnnotatorClient({
    credentials,
});

// ENDPOINT GOOGLE VISION
app.post("/analyze-image", async (req, res) => {
    try {
        const { imageUrl } = req.body;
        const [result] = await client.annotateImage({
            image: { source: { imageUri: imageUrl } },
            features: [
                { type: "LABEL_DETECTION" },
                { type: "IMAGE_PROPERTIES" }
            ]
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Vision API error" });
    }
});

app.listen(3000, () =>
    console.log("Server running on http://localhost:3000")
);


