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

  // AWC API endpoint (GeoJSON)
  const url = `https://aviationweather.gov/api/data/metar?ids=${icao}&format=geojson`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "GeoFS-Addon-Proxy/1.0 (your-email@example.com)"
      }
    });

    if (!response.ok) {
      throw new Error(`AWC request failed: ${response.status}`);
    }

    const data = await response.json();

    // 簡化資料，只輸出常用欄位
    const features = data.features || [];
    const simplified = features.map(f => {
      const props = f.properties;
      return {
        raw_text: props.rawOb,
        station_id: props.stationId,
        obsTime: props.obsTime,
        temp_c: props.temp,
        dewpoint_c: props.dewp,
        wind_dir_degrees: props.wdir,
        wind_speed_kt: props.wspd,
        altim_hpa: props.altim
      };
    });

    res.json(simplified);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CORS Proxy running on port ${PORT}`);
});
