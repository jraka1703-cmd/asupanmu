export default async function handler(req, res) {
  const vidaraKey = process.env.VIDARA_API_KEY;
  const vizeyKey = process.env.VIZEY_API_KEY;

  const page = Number(req.query.page || 1);

  try {
    let vidaraVideos = [];
    let vizeyVideos = [];

    // ================= VIDARA =================
    try {
      const vidaraRes = await fetch(
        `https://api.vidara.so/v1/video/list?api_key=${vidaraKey}&page=${page}&limit=10`
      );
      const vidaraData = await vidaraRes.json();

      vidaraVideos = (vidaraData?.result?.videos || []).map(v => ({
        title: v.title || "No title",
        thumbnail: v.thumbnail,
        link: `https://vidara.so/v/${v.filecode}`,
        source: "Vidara"
      }));

    } catch (e) {
      console.log("Vidara error:", e);
    }

    // ================= VIZEY =================
    try {
      const vizeyRes = await fetch(
        `https://vizey.co/api/v1/list?apikey=${vizeyKey}&page=${page}`
      );
      const vizeyData = await vizeyRes.json();

      vizeyVideos = (vizeyData?.data || []).map(v => ({
        title: v.title || "No title",
        thumbnail: v.thumbnail,
        link: v.url || "#",
        source: "Vizey"
      }));

    } catch (e) {
      console.log("Vizey error:", e);
    }

    // 🔥 fallback kalau salah satu kosong
    const allVideos = [...vidaraVideos, ...vizeyVideos];

    console.log("TOTAL VIDEO:", allVideos.length);

    res.status(200).json({
      videos: allVideos,
      hasMore: allVideos.length > 0
    });

  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: "Gagal ambil data" });
  }
}
