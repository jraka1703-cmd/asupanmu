export default async function handler(req, res) {
  const API_KEY = process.env.VIDARA_API_KEY;

  try {
    const response = await fetch(
      `https://api.vidara.so/v1/video/list?api_key=${API_KEY}&limit=20`
    );

    const data = await response.json();

    // cache biar ringan
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");

    res.status(200).json(data.result.videos);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil data" });
  }
}
