export default async function handler(req, res) {
  const vidaraKey = process.env.VIDARA_API_KEY;
  const vizeyKey = process.env.VIZEY_API_KEY;

  const page = Number(req.query.page || 1);

  try {
    // 🔥 Fetch Vidara
    const vidaraRes = await fetch(
      `https://api.vidara.so/v1/video/list?api_key=${vidaraKey}&page=${page}&limit=10`
    );
    const vidaraData = await vidaraRes.json();

    const vidaraVideos = (vidaraData?.result?.videos || []).map(v => ({
      title: v.title,
      thumbnail: v.thumbnail,
      link: `https://vidara.so/v/${v.filecode}`
    }));

    // 🔥 Fetch Vizey
    const vizeyRes = await fetch(
      `https://vizey.co/api/v1/list?apikey=${vizeyKey}&page=${page}`
    );
    const vizeyData = await vizeyRes.json();

    const vizeyVideos = (vizeyData?.data || []).map(v => ({
      title: v.title,
      thumbnail: v.thumbnail,
      link: v.url // direct dari API
    }));

    // 🔥 Gabung + shuffle biar natural
    const allVideos = [...vidaraVideos, ...vizeyVideos]
      .sort(() => Math.random() - 0.5);

    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );

    res.status(200).json({
      videos: allVideos,
      hasMore: true
    });

  } catch (err) {
    res.status(500).json({ error: "Gagal ambil data" });
  }
}
