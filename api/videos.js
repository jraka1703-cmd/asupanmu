
export default async function handler(req, res) {
  const vidaraKey = process.env.VIDARA_API_KEY;
  const vizeyKey = process.env.VIZEY_API_KEY;

  const page = Number(req.query.page || 1);

  try {
    let allVideos = [];

    // ================= VIDARA =================
    try {
      const r = await fetch(
        `https://api.vidara.so/v1/video/list?api_key=${vidaraKey}&page=${page}&limit=10`
      );
      const d = await r.json();

      const vids = (d?.result?.videos || []).map(v => ({
        title: v.title,
        thumbnail: v.thumbnail,
        link: `https://vidara.so/v/${v.filecode}`,
        source: "Vidara"
      }));

      allVideos.push(...vids);
    } catch (e) {
      console.log("Vidara error");
    }

    // ================= VIZEY =================
try {
  const r = await fetch(
    `https://vizey.co/api/v1/list?apikey=${vizeyKey}&page=${page}&limit=10`
  );

  const d = await r.json();

  console.log("VIZEY RAW:", JSON.stringify(d));

  if (!vizeyKey) {
  console.log("❌ VIZEY API KEY TIDAK ADA");
} else {
  try {
    const r = await fetch(
      `https://vizey.co/api/v1/list?apikey=${vizeyKey}&page=${page}&limit=10`
    );

    const d = await r.json();

    console.log("✅ VIZEY RESPONSE:", d?.data?.length);

    if (d && d.success && Array.isArray(d.data)) {
      const vids = d.data.map(v => ({
        title: v.title,
        thumbnail: v.thumbnail,
        link: v.url || v.embed_url,
        source: "Vizey"
      }));

      allVideos.push(...vids);
    }

  } catch (e) {
    console.log("Vizey fetch error:", e);
  }
  }
