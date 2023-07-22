import type { NextApiRequest, NextApiResponse } from 'next';

const YT_API_URL = `https://www.googleapis.com/youtube/v3/playlistItems`;
const Q = {
  Playlist: `playlistId=${process.env.PLAYLIST_ID}`,
  ApiKey: `key=${process.env.MODNAO_GAPI_KEY}`
};

export interface YTPlaylistItem {
  contentDetails: {
    videoId: string;
    videoPublishedAt: string;
  };
  snippet: {
    title: string;
    description: string;
    tags: string;
    publishedAt: string;
    thumbnails: {
      standard: {
        url: string;
      };
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const URL = `${YT_API_URL}?${Q.Playlist}&${Q.ApiKey}&maxResults=50&part=snippet,contentDetails`;
  const response = await (await fetch(URL)).json();
  if (Array.isArray(response.items)) {
    res.status(200).json(
      response.items
        .reverse()
        .map((i: YTPlaylistItem) => {
          const { title: sourceTitle } = i.snippet;
          const results = sourceTitle.match(/ModNao #(\d{0,3})\s?:\s?/);
          if (!results || (results?.length && results.length < 2)) {
            return false;
          }

          const [preTitle, vlogNumber] = results as RegExpMatchArray;
          const title = sourceTitle.substring(preTitle.length);

          return {
            id: i.contentDetails.videoId,
            vlogNumber: Number(vlogNumber),
            videoTitle: i.snippet.title,
            title,
            description: i.snippet.description,
            thumbnailUrl: i.snippet.thumbnails.standard.url,
            publishedAt: i.snippet.publishedAt,
            source: i
          };
        })
        .filter(Boolean)
    );
  } else {
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
}
