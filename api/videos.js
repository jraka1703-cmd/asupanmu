export default async function handler(req, res) {
  const vidaraKey = process.env.VIDARA_API_KEY;
  const vizeyKey = process.env.VIZEY_API_KEY;

  let allVideos = [];

  try {
    // ================= VIDARA =================
    if (vidaraKey) {
      try {
        const r1 = await fetch(
          `https://api.vidara.so/v1/video/list?api_key=${vidaraKey}&page=1&limit=20`
        );
        const d1 = await r1.json();

        const vids1 = d1?.result?.videos || [];

        allVideos.push(
          ...vids1.map(v => ({
            title: v.title,
            thumbnail: v.thumbnail,
            link: `https://vidara.so/v/${v.filecode}`,
            source: "Vidara"
          }))
        );
      } catch (e) {
        console.log("Vidara error:", e);
      }
    }

    // ================= VIZEY =================
    if (vizeyKey) {
      try {
        const r2 = await fetch(
          `https://vizey.co/api/v1/list?apikey=${vizeyKey}&page=1&limit=20`
        );

        const text = await r2.text(); // 🔥 SAFE PARSE

        let d2;
        try {
          d2 = JSON.parse(text);
        } catch {
          console.log("Vizey bukan JSON:", text);
          d2 = null;
        }

        if (d2 && d2.success && Array.isArray(d2.data)) {
          allVideos.push(
            ...d2.data.map(v => ({
              title: v.title,
              thumbnail: v.thumbnail,
              link: v.url || v.embed_url,
              source: "Vizey"
            }))
          );
        }
      } catch (e) {
        console.log("Vizey error:", e);
      }
    }

    // ================= FALLBACK =================
    if (allVideos.length === 0) {
      return res.status(200).json({
        videos: [],
        error: "No data from APIs"
      });
    }

    // shuffle biar campur
    allVideos.sort(() => Math.random() - 0.5);

    res.setHeader("Cache-Control", "s-maxage=60");
    res.status(200).json({
      videos: allVideos
    });

  } catch (err) {
    console.log("FATAL ERROR:", err);

    res.status(200).json({
      videos: [],
      error: "Server error but handled"
    });
  }
}
