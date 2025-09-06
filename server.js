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

  // AWC dataserver API (完整 METAR 資料)
  const url = `https://aviationweather.gov/adds/dataserver_current/httpparam?` +
              `dataSource=metars&requestType=retrieve&format=JSON&stationString=${icao}&hoursBeforeNow=1`;

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

    // 取出 METAR 陣列
    const metars = data?.response?.data?.METAR || [];

    // 簡化輸出（你可以保留完整 data 也可以精簡）
    const simplified = metars.map(m => ({
      raw_text: m.raw_text,
      station_id: m.station_id,
      observation_time: m.observation_time,
      latitude: m.latitude,
      longitude: m.longitude,
      temp_c: m.temp_c,
      dewpoint_c: m.dewpoint_c,
      wind_dir_degrees: m.wind_dir_degrees,
      wind_speed_kt: m.wind_speed_kt,
      visibility_statute_mi: m.visibility_statute_mi,
      altim_in_hg: m.altim_in_hg,
      flight_category: m.flight_category,
      wx_string: m.wx_string,
      sky_condition: m.sky_condition || []
    }));

    res.json(simplified);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CORS Proxy running on port ${PORT}`);
});
