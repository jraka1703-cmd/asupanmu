export default async function handler(req, res) {
  const vidaraKey = process.env.VIDARA_API_KEY;
  const vizeyKey = process.env.VIZEY_API_KEY;

  let page = parseInt(req.query.page || "1");
  let allVideos = [];

  try {
    // ================= VIDARA =================
    if (vidaraKey) {
      try {
        const r1 = await fetch(
          `https://api.vidara.so/v1/video/list?api_key=${vidaraKey}&page=${page}&limit=20`
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
          `https://vizey.net/api/v1/list?apikey=${vizeyKey}&page=${page}&limit=20`
        );

        const text = await r2.text();

        let d2;
        try {
          d2 = JSON.parse(text);
        } catch {
          d2 = null;
        }

        if (d2 && d2.success && Array.isArray(d2.data)) {
          allVideos.push(
            ...d2.data.map(v => ({
              title: v.title,
              thumbnail: v.thumbnail,
              link: v.url || v.embed_url || `https://vizey.net/v/${v.id}`
              source: "Vizey"
            }))
          );
        }
      } catch (e) {
        console.log("Vizey error:", e);
      }
    }

    // ================= REMOVE DUPLICATE =================
    const seen = new Set();
    const unique = [];

    for (const v of allVideos) {
      if (!seen.has(v.link)) {
        seen.add(v.link);
        unique.push(v);
      }
    }

    // ================= SHUFFLE =================
    unique.sort(() => 0.5 - Math.random());

    res.setHeader("Cache-Control", "s-maxage=60");

    res.status(200).json({
      videos: unique,
      nextPage: page + 1
    });

  } catch (err) {
    console.log("FATAL:", err);

    res.status(200).json({
      videos: [],
      nextPage: page + 1
    });
  }
}
