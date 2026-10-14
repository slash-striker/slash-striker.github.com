const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function extractLockupVideos(data) {
  const found = [];
  const seen = new Set();

  function walk(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (obj.lockupViewModel && typeof obj.lockupViewModel.contentId === 'string') {
      const l = obj.lockupViewModel;
      const videoId = l.contentId;
      if (videoId.length === 11 && !seen.has(videoId)) {
        const title =
          l.metadata?.lockupMetadataViewModel?.title?.content || '';
        const rows =
          l.metadata?.lockupMetadataViewModel?.metadata
            ?.contentMetadataViewModel?.metadataRows || [];
        const metaParts = rows
          .flatMap((r) => (r.metadataParts || []).map((p) => p.text?.content))
          .filter(Boolean);
        const duration =
          l.contentImage?.thumbnailViewModel?.overlays?.[0]
            ?.thumbnailBottomOverlayViewModel?.badges?.[0]
            ?.thumbnailBadgeViewModel?.text || '';

        if (title) {
          seen.add(videoId);
          found.push({
            videoId,
            title,
            duration,
            views: metaParts[0] ? `${metaParts[0]} views` : '',
            publishedAgo: metaParts[1] || '',
            url: `https://www.youtube.com/watch?v=${videoId}`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hq720.jpg`,
          });
        }
      }
    }
    for (const key of Object.keys(obj)) {
      walk(obj[key]);
    }
  }

  walk(data);
  return found;
}

export default async () => {
  try {
    const res = await fetch('https://www.youtube.com/@SlashStr1ker/videos', {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ ok: false, error: `Upstream HTTP ${res.status}` }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const html = await res.text();
    const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
    if (!match) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Unable to parse channel payload' }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const data = JSON.parse(match[1]);
    const videos = extractLockupVideos(data).slice(0, 6);

    return new Response(
      JSON.stringify({
        ok: true,
        channelHandle: '@SlashStr1ker',
        channelId: 'UCNkuaq6HNa8UW4usOvPZtvw',
        fetchedAt: new Date().toISOString(),
        latestVideo: videos[0] || null,
        recentVideos: videos,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, s-maxage=600',
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
