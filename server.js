import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/metar", async (req, res) => {
  const { icao } = req.query;
  if (!icao) {
    return res.status(400).json({ error: "Missing ICAO code" });
  }

  const url = `https://aviationweather.gov/api/data/metar?ids=${icao}&format=geojson`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("NOAA request failed");
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CORS Proxy running on port ${PORT}`);
});
