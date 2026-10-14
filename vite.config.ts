import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function extractLockupVideos(data: unknown) {
  const found: Array<{
    videoId: string;
    title: string;
    duration: string;
    views: string;
    publishedAgo: string;
    url: string;
    embedUrl: string;
    thumbnail: string;
  }> = [];
  const seen = new Set<string>();

  function walk(obj: unknown) {
    if (!obj || typeof obj !== 'object') return;
    const record = obj as Record<string, any>;
    if (
      record.lockupViewModel &&
      typeof record.lockupViewModel.contentId === 'string'
    ) {
      const l = record.lockupViewModel;
      const videoId: string = l.contentId;
      if (videoId.length === 11 && !seen.has(videoId)) {
        const title: string =
          l.metadata?.lockupMetadataViewModel?.title?.content || '';
        const rows: any[] =
          l.metadata?.lockupMetadataViewModel?.metadata
            ?.contentMetadataViewModel?.metadataRows || [];
        const metaParts = rows
          .flatMap((r) =>
            (r.metadataParts || []).map((p: any) => p.text?.content)
          )
          .filter(Boolean);
        const duration: string =
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
    for (const key of Object.keys(record)) {
      walk(record[key]);
    }
  }

  walk(data);
  return found;
}

function youtubeLatestDevPlugin(): Plugin {
  return {
    name: 'slashstr1ker-youtube-latest-api',
    configureServer(server) {
      server.middlewares.use('/api/youtube-latest', async (_req, res) => {
        try {
          const upstream = await fetch(
            'https://www.youtube.com/@SlashStr1ker/videos',
            {
              headers: {
                'User-Agent': USER_AGENT,
                'Accept-Language': 'en-US,en;q=0.9',
              },
            }
          );
          const html = await upstream.text();
          const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
          if (!match) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: 'Parse error' }));
            return;
          }
          const data = JSON.parse(match[1]);
          const videos = extractLockupVideos(data).slice(0, 6);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              ok: true,
              channelHandle: '@SlashStr1ker',
              channelId: 'UCNkuaq6HNa8UW4usOvPZtvw',
              fetchedAt: new Date().toISOString(),
              latestVideo: videos[0] || null,
              recentVideos: videos,
            })
          );
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              ok: false,
              error: err instanceof Error ? err.message : 'Unknown error',
            })
          );
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), youtubeLatestDevPlugin()],
  build: {
    // Support older mobile browsers (older iOS Safari / Android WebView):
    // the default target assumes Safari 16+, which can leave old iPhones
    // with a blank page because the bundle fails to parse.
    target: 'es2018',
    cssTarget: 'chrome61',
  },
});
