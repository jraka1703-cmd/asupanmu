export default async function handler(req, res) {
  const vidaraKey = process.env.VIDARA_API_KEY;
  const vizeyKey = process.env.VIZEY_API_KEY;

  let allVideos = [];

  try {
    // ===== VIDARA =====
    try {
      const r1 = await fetch("https://api.vidara.so/v1/videos");
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

    // ===== VIZEY =====
    if (vizeyKey) {
      try {
        let page = 1;
        let hasMore = true;

        while (hasMore && page <= 5) {
          const r2 = await fetch(
            `https://vizey.net/api/v1/list?apikey=${vizeyKey}&page=${page}`
          );

          const text = await r2.text(); // SAFE
          let d2;

          try {
            d2 = JSON.parse(text);
          } catch {
            console.log("Vizey bukan JSON:", text);
            break;
          }

          if (d2?.success && Array.isArray(d2.data)) {
            allVideos.push(
              ...d2.data.map(v => ({
                title: v.title,
                thumbnail: v.thumbnail,
                link: `https://vizey.net/v/${v.id}`,
                source: "Vizey"
              }))
            );
          }

          hasMore = d2?.pagination?.hasNext;
          page++;
        }
      } catch (e) {
        console.log("Vizey error:", e);
      }
    }

    // ===== HAPUS DUPLIKAT =====
    const unique = [];
    const seen = new Set();

    for (const v of allVideos) {
      if (!seen.has(v.link)) {
        seen.add(v.link);
        unique.push(v);
      }
    }

    res.status(200).json({
      videos: unique
    });

  } catch (err) {
    console.log("FATAL ERROR:", err);

    res.status(200).json({
      videos: [],
      error: "Server crash handled"
    });
  }
}
