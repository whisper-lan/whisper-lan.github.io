import "server-only";

import { unstable_cache } from "next/cache";

import { RELEASES_URL, fetchReleaseCatalog } from "./github-core";
import type { ReadyReleaseCatalog, ReleaseCatalog } from "./types";

const getCachedReleaseCatalog = unstable_cache(
  async (): Promise<ReadyReleaseCatalog> =>
    fetchReleaseCatalog(fetch, { token: process.env.GITHUB_TOKEN }),
  ["whisper-release-catalog-v1"],
  { revalidate: 3600, tags: ["whisper-release"] },
);

export async function getReleaseCatalog(): Promise<ReleaseCatalog> {
  try {
    return await getCachedReleaseCatalog();
  } catch {
    return { status: "unavailable", releasesUrl: RELEASES_URL };
  }
}
