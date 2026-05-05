export default async function handler(req, res) {
  const API_KEY = process.env.VIDARA_API_KEY;

  let page = 1;
  let allVideos = [];
  let hasMore = true;

  try {
    while (hasMore && page <= 20) { // batas aman (hindari overload)
      const response = await fetch(
        `https://api.vidara.so/v1/video/list?api_key=${API_KEY}&page=${page}&limit=100`
      );

      const data = await response.json();
      const videos = data?.result?.videos || [];

      allVideos.push(...videos);

      if (videos.length < 100) {
        hasMore = false;
      }

      page++;
    }

    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate");

    res.status(200).json(allVideos);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil data" });
  }
}
