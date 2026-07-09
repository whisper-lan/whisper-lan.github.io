import { parseReleaseAssets, selectRelease } from "./asset-parser";
import type { ReadyReleaseCatalog, Verification } from "./types";

export const RELEASES_API_URL = "https://api.github.com/repos/lawnvi/whisper/releases";
export const RELEASES_URL = "https://github.com/lawnvi/whisper/releases";
export const MAX_RELEASE_PAGES = 5;

const COMMITS_API_URL = "https://api.github.com/repos/lawnvi/whisper/commits";
const DEFAULT_TIMEOUT_MS = 5_000;

export type ReleaseCatalogErrorCode =
  | "upstream"
  | "invalid-response"
  | "no-release";

export class ReleaseCatalogError extends Error {
  readonly code: ReleaseCatalogErrorCode;
  readonly status?: number;

  constructor(code: ReleaseCatalogErrorCode, message: string, status?: number) {
    super(message);
    this.name = "ReleaseCatalogError";
    this.code = code;
    this.status = status;
  }
}

export type ReleaseFetchOptions = {
  token?: string;
  timeoutMs?: number;
};

type JsonResponse = {
  data: unknown;
  headers: Headers;
};

function requestHeaders(token: string | undefined): Headers {
  const headers = new Headers({
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  });
  if (token?.trim()) {
    headers.set("Authorization", `Bearer ${token.trim()}`);
  }
  return headers;
}

async function fetchJson(
  fetcher: typeof fetch,
  url: string,
  options: ReleaseFetchOptions,
  allowNotFound = false,
): Promise<JsonResponse | null> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  try {
    let response: Response;
    try {
      response = await fetcher(url, {
        cache: "no-store",
        headers: requestHeaders(options.token),
        signal: controller.signal,
      });
    } catch {
      throw new ReleaseCatalogError("upstream", "GitHub request failed");
    }

    if (allowNotFound && response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new ReleaseCatalogError(
        "upstream",
        `GitHub request failed with status ${response.status}`,
        response.status,
      );
    }

    try {
      return { data: await response.json(), headers: response.headers };
    } catch {
      throw new ReleaseCatalogError("invalid-response", "GitHub returned malformed JSON");
    }
  } finally {
    clearTimeout(timeout);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nextReleasesUrl(linkHeader: string | null): string | null {
  if (!linkHeader) {
    return null;
  }

  for (const entry of linkHeader.split(",")) {
    const match = entry.trim().match(/^<([^>]+)>\s*;(.*)$/);
    if (!match) {
      continue;
    }
    const relations = match[2]
      .split(";")
      .map((parameter) => parameter.trim())
      .find((parameter) => parameter.startsWith("rel="))
      ?.slice(4)
      .replace(/^"|"$/g, "")
      .split(/\s+/);
    if (!relations?.includes("next")) {
      continue;
    }

    let url: URL;
    try {
      url = new URL(match[1]);
    } catch {
      throw new ReleaseCatalogError("invalid-response", "GitHub returned an invalid next link");
    }
    if (
      url.protocol !== "https:" ||
      url.hostname !== "api.github.com" ||
      url.pathname !== "/repos/lawnvi/whisper/releases" ||
      url.searchParams.get("per_page") !== "100" ||
      !/^\d+$/.test(url.searchParams.get("page") ?? "")
    ) {
      throw new ReleaseCatalogError("invalid-response", "GitHub returned an unsafe next link");
    }
    return url.toString();
  }

  return null;
}

async function fetchReleasePages(
  fetcher: typeof fetch,
  options: ReleaseFetchOptions,
): Promise<unknown[]> {
  const releases: unknown[] = [];
  const visited = new Set<string>();
  let nextUrl: string | null = `${RELEASES_API_URL}?per_page=100&page=1`;

  for (let page = 0; page < MAX_RELEASE_PAGES && nextUrl; page += 1) {
    if (visited.has(nextUrl)) {
      throw new ReleaseCatalogError("invalid-response", "GitHub pagination contains a loop");
    }
    visited.add(nextUrl);

    const response = await fetchJson(fetcher, nextUrl, options);
    if (!response || !Array.isArray(response.data)) {
      throw new ReleaseCatalogError("invalid-response", "GitHub releases must be an array");
    }
    releases.push(...response.data);

    if (selectRelease(releases)?.channel === "stable") {
      break;
    }
    nextUrl = nextReleasesUrl(response.headers.get("Link"));
  }

  return releases;
}

function parseVerification(value: unknown): Verification {
  if (!isRecord(value) || !isRecord(value.commit) || !isRecord(value.commit.verification)) {
    return "unknown";
  }

  const { verified, reason } = value.commit.verification;
  if (verified === true) {
    return "verified";
  }
  if (verified === false && reason === "unsigned") {
    return "unsigned";
  }
  if (verified === false && typeof reason === "string") {
    return "unverified";
  }
  return "unknown";
}

function parseCommit(value: unknown): ReadyReleaseCatalog["commit"] {
  if (
    !isRecord(value) ||
    typeof value.sha !== "string" ||
    !/^[a-f0-9]{40}$/i.test(value.sha) ||
    typeof value.html_url !== "string"
  ) {
    throw new ReleaseCatalogError("invalid-response", "GitHub returned an invalid commit");
  }

  let url: URL;
  try {
    url = new URL(value.html_url);
  } catch {
    throw new ReleaseCatalogError("invalid-response", "GitHub returned an invalid commit URL");
  }
  if (
    url.protocol !== "https:" ||
    url.hostname !== "github.com" ||
    !url.pathname.startsWith("/lawnvi/whisper/commit/")
  ) {
    throw new ReleaseCatalogError("invalid-response", "GitHub returned an invalid commit URL");
  }

  return {
    sha: value.sha,
    url: value.html_url,
    verification: parseVerification(value),
  };
}

export async function fetchReleaseCatalog(
  fetcher: typeof fetch,
  options: ReleaseFetchOptions = {},
): Promise<ReadyReleaseCatalog> {
  const releases = await fetchReleasePages(fetcher, options);
  const selected = selectRelease(releases);
  if (!selected) {
    throw new ReleaseCatalogError("no-release", "No supported Whisper release was found");
  }

  const commitResponse = await fetchJson(
    fetcher,
    `${COMMITS_API_URL}/${encodeURIComponent(selected.tag)}`,
    options,
    true,
  );

  return {
    status: "ready",
    channel: selected.channel,
    tag: selected.tag,
    version: selected.version,
    releaseUrl: selected.releaseUrl,
    publishedAt: selected.publishedAt,
    commit: commitResponse ? parseCommit(commitResponse.data) : null,
    assets: parseReleaseAssets(selected.assets),
  };
}
