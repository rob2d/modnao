import type { NextApiRequest, NextApiResponse } from 'next';

const YT_API_URL = `https://www.googleapis.com/youtube/v3/playlistItems`;
const Q = {
  Playlist: `playlistId=${process.env.PLAYLIST_ID}`,
  ApiKey: `key=${process.env.MODNAO_GAPI_KEY}`
};

interface YTPlaylistItem {
  contentDetails: {
    videoId: string;
    videoPublishedAt: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const URL = `${YT_API_URL}?${Q.Playlist}&${Q.ApiKey}&maxResults=50&part=contentDetails`;
  const response = await (await fetch(URL)).json();
  if (Array.isArray(response.items)) {
    res
      .status(200)
      .json(response.items.map((i: YTPlaylistItem) => i.contentDetails));
  } else {
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
}
