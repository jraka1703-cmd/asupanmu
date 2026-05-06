export default async function handler(req, res) {
  try {
    const vidaraKey = process.env.VIDARA_API_KEY;
    const vizeyKey = process.env.VIZEY_API_KEY;

    const headers = {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json"
    };

    let allVideos = [];

    // ================= VIDARA =================
    if (vidaraKey) {
      try {
        const r = await fetch(
          `https://api.vidara.so/v1/videos?apikey=${vidaraKey}`,
          { headers }
        );

        const text = await r.text();

        if (!text.startsWith("{")) {
          console.log("Vidara bukan JSON:", text.slice(0, 100));
        } else {
          const d = JSON.parse(text);

          if (d.result?.videos) {
            allVideos.push(
              ...d.result.videos.map(v => ({
                id: v.filecode,
                title: v.title,
                thumbnail: v.thumbnail,
                link: `https://vidara.so/v/${v.filecode}`,
                source: "vidara"
              }))
            );
          }
        }
      } catch (e) {
        console.log("Vidara error:", e);
      }
    }

    // ================= VIZEY =================
    if (vizeyKey) {
      try {
        let page = 1;

        while (page <= 3) {
          const r = await fetch(
            `https://vizey.net/api/v1/list?apikey=${vizeyKey}&page=${page}`,
            { headers }
          );

          const text = await r.text();

          if (!text.startsWith("{")) {
            console.log("Vizey bukan JSON:", text.slice(0, 100));
            break;
          }

          const d = JSON.parse(text);

          if (d.success && d.data) {
            allVideos.push(
              ...d.data.map(v => ({
                id: v.id,
                title: v.title,
                thumbnail: v.thumbnail,
                link: `https://vizey.net/api/v1/videos?apikey=${vizeyKey}&id=${v.id}`,
                source: "vizey"
              }))
            );

            if (!d.pagination?.hasNext) break;
            page++;
          } else {
            break;
          }
        }
      } catch (e) {
        console.log("Vizey error:", e);
      }
    }

    // ================= REMOVE DUPLICATE =================
    const unique = Array.from(
      new Map(allVideos.map(v => [v.id, v])).values()
    );

    res.status(200).json({ videos: unique });

  } catch (err) {
    console.log("FATAL:", err);
    res.status(500).json({ error: "Server error" });
  }
}
