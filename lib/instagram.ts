import fs from "fs";

// Latest reels from the shop's Instagram professional account, via the
// Instagram API with Instagram Login (graph.instagram.com).
//
// The long-lived access token is read at request time from
// INSTAGRAM_TOKEN_FILE (refreshed monthly by deploy/refresh-instagram-token.sh)
// or, failing that, from INSTAGRAM_ACCESS_TOKEN.

const GRAPH = "https://graph.instagram.com/v21.0";

export type InstagramReel = {
  id: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  permalink: string;
  caption: string;
};

export type InstagramFeed = {
  username: string | null;
  followers: number | null;
  reels: InstagramReel[];
};

function readToken(): string | null {
  const file = process.env.INSTAGRAM_TOKEN_FILE;
  if (file) {
    try {
      const token = fs.readFileSync(file, "utf8").trim();
      if (token) return token;
    } catch {
      // fall through to the env var
    }
  }
  return process.env.INSTAGRAM_ACCESS_TOKEN?.trim() || null;
}

async function graph<T>(path: string, token: string): Promise<T | null> {
  try {
    const sep = path.includes("?") ? "&" : "?";
    const res = await fetch(`${GRAPH}${path}${sep}access_token=${encodeURIComponent(token)}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error(`Instagram API ${path.split("?")[0]} failed: ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("Instagram API request failed:", err);
    return null;
  }
}

export async function getInstagramFeed(limit = 6): Promise<InstagramFeed> {
  const token = readToken();
  if (!token) return { username: null, followers: null, reels: [] };

  type Profile = { username?: string; followers_count?: number };
  type Media = {
    data?: {
      id: string;
      media_type?: string;
      media_product_type?: string;
      media_url?: string;
      thumbnail_url?: string;
      permalink?: string;
      caption?: string;
    }[];
  };

  const [profile, media] = await Promise.all([
    graph<Profile>("/me?fields=username,followers_count", token),
    graph<Media>(
      "/me/media?fields=id,media_type,media_product_type,media_url,thumbnail_url,permalink,caption,timestamp&limit=30",
      token
    ),
  ]);

  const reels = (media?.data ?? [])
    .filter((m) => m.media_type === "VIDEO" && m.media_url && m.permalink)
    .slice(0, limit)
    .map((m) => ({
      id: m.id,
      videoUrl: m.media_url as string,
      thumbnailUrl: m.thumbnail_url ?? null,
      permalink: m.permalink as string,
      caption: (m.caption ?? "").split("\n")[0].slice(0, 90),
    }));

  return {
    username: profile?.username ?? null,
    followers: profile?.followers_count ?? null,
    reels,
  };
}
