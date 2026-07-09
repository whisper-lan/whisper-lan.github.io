import { afterEach, describe, expect, it, vi } from "vitest";

import {
  MAX_RELEASE_PAGES,
  RELEASES_API_URL,
  RELEASES_URL,
  ReleaseCatalogError,
  fetchReleaseCatalog,
} from "../../lib/release/github-core";
import commitFixture from "../fixtures/github-commit-dev-v0.0.42.json";
import releaseFixture from "../fixtures/github-release-dev-v0.0.42.json";

type RecordedRequest = {
  url: string;
  init?: RequestInit;
};

function jsonResponse(value: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(value), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

function sequentialFetcher(responses: Response[]): {
  fetcher: typeof fetch;
  requests: RecordedRequest[];
} {
  const requests: RecordedRequest[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    requests.push({ url: String(input), init });
    const response = responses.shift();
    if (!response) {
      throw new Error("Unexpected fetch");
    }
    return response;
  };
  return { fetcher, requests };
}

describe("fetchReleaseCatalog", () => {
  it("builds a ready catalog from the real release and tag commit", async () => {
    const { fetcher, requests } = sequentialFetcher([
      jsonResponse([releaseFixture]),
      jsonResponse(commitFixture),
    ]);

    const catalog = await fetchReleaseCatalog(fetcher, { token: "test-token" });

    expect(catalog).toEqual(
      expect.objectContaining({
        status: "ready",
        channel: "preview",
        tag: "dev-v0.0.42",
        version: "0.0.42",
        releaseUrl: releaseFixture.html_url,
        publishedAt: releaseFixture.published_at,
        commit: {
          sha: "5432c2e0f53ae0dc28bf969f96d37f29341dd9be",
          url: commitFixture.html_url,
          verification: "unsigned",
        },
      }),
    );
    expect(catalog.assets).toHaveLength(10);
    expect(requests.map(({ url }) => url)).toEqual([
      `${RELEASES_API_URL}?per_page=100&page=1`,
      "https://api.github.com/repos/lawnvi/whisper/commits/dev-v0.0.42",
    ]);
    expect(requests[1].url).not.toContain(releaseFixture.target_commitish);
    expect(requests[0].init).toMatchObject({ cache: "no-store" });
    expect(new Headers(requests[0].init?.headers).get("Accept")).toBe(
      "application/vnd.github+json",
    );
    expect(new Headers(requests[0].init?.headers).get("X-GitHub-Api-Version")).toBe(
      "2022-11-28",
    );
    expect(new Headers(requests[0].init?.headers).get("Authorization")).toBe(
      "Bearer test-token",
    );
    expect(requests[0].init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("uses the encoded selected tag for the commit endpoint", async () => {
    const taggedRelease = {
      ...releaseFixture,
      tag_name: "dev-v0.0.42+build.1",
      html_url: "https://github.com/lawnvi/whisper/releases/tag/dev-v0.0.42%2Bbuild.1",
    };
    const { fetcher, requests } = sequentialFetcher([
      jsonResponse([taggedRelease]),
      jsonResponse(commitFixture),
    ]);

    await fetchReleaseCatalog(fetcher);

    expect(requests[1].url).toBe(
      "https://api.github.com/repos/lawnvi/whisper/commits/dev-v0.0.42%2Bbuild.1",
    );
  });

  it("keeps a ready catalog when the tag commit is not found", async () => {
    const { fetcher } = sequentialFetcher([
      jsonResponse([releaseFixture]),
      jsonResponse({ message: "Not Found" }, { status: 404 }),
    ]);

    await expect(fetchReleaseCatalog(fetcher)).resolves.toEqual(
      expect.objectContaining({ status: "ready", commit: null }),
    );
  });

  it("throws typed errors for upstream failures, malformed JSON, and no valid tag", async () => {
    const forbidden = sequentialFetcher([
      jsonResponse({ message: "rate limited" }, { status: 403 }),
    ]);
    const malformed = sequentialFetcher([
      new Response("{", { status: 200, headers: { "Content-Type": "application/json" } }),
    ]);
    const noRelease = sequentialFetcher([jsonResponse([{ ...releaseFixture, tag_name: "main" }])]);

    await expect(fetchReleaseCatalog(forbidden.fetcher)).rejects.toMatchObject({
      name: "ReleaseCatalogError",
      code: "upstream",
      status: 403,
    });
    await expect(fetchReleaseCatalog(malformed.fetcher)).rejects.toMatchObject({
      name: "ReleaseCatalogError",
      code: "invalid-response",
    });
    await expect(fetchReleaseCatalog(noRelease.fetcher)).rejects.toBeInstanceOf(
      ReleaseCatalogError,
    );
    await expect(fetchReleaseCatalog(sequentialFetcher([jsonResponse({})]).fetcher)).rejects
      .toMatchObject({ code: "invalid-response" });
  });

  it("follows Link pagination until it finds a stable release", async () => {
    const pageTwo = `${RELEASES_API_URL}?per_page=100&page=2`;
    const stableRelease = {
      ...releaseFixture,
      tag_name: "release-v0.0.40",
      html_url: "https://github.com/lawnvi/whisper/releases/tag/release-v0.0.40",
      published_at: "2026-07-01T00:00:00Z",
      assets: [],
    };
    const { fetcher, requests } = sequentialFetcher([
      jsonResponse([releaseFixture], { headers: { Link: `<${pageTwo}>; rel="next"` } }),
      jsonResponse([stableRelease]),
      jsonResponse(commitFixture),
    ]);

    const catalog = await fetchReleaseCatalog(fetcher);

    expect(catalog).toEqual(
      expect.objectContaining({ status: "ready", channel: "stable", version: "0.0.40" }),
    );
    expect(requests.map(({ url }) => url)).toEqual([
      `${RELEASES_API_URL}?per_page=100&page=1`,
      pageTwo,
      "https://api.github.com/repos/lawnvi/whisper/commits/release-v0.0.40",
    ]);
  });

  it("stops at the page limit and falls back to the preview it has already validated", async () => {
    const requests: RecordedRequest[] = [];
    const fetcher: typeof fetch = async (input, init) => {
      const url = String(input);
      requests.push({ url, init });
      if (url.includes("/commits/")) {
        return jsonResponse(commitFixture);
      }
      const currentPage = requests.filter(({ url: requestUrl }) => requestUrl.includes("/releases?"))
        .length;
      const nextPage = `${RELEASES_API_URL}?per_page=100&page=${currentPage + 1}`;
      return jsonResponse(currentPage === 1 ? [releaseFixture] : [], {
        headers: { Link: `<${nextPage}>; rel="next"` },
      });
    };

    const catalog = await fetchReleaseCatalog(fetcher);

    expect(catalog).toEqual(expect.objectContaining({ channel: "preview" }));
    expect(requests.filter(({ url }) => url.includes("/releases?")).length).toBe(
      MAX_RELEASE_PAGES,
    );
  });
});

describe("server release adapter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("maps a cold upstream failure to an honest unavailable catalog", async () => {
    vi.doMock("server-only", () => ({}));
    vi.doMock("next/cache", () => ({
      unstable_cache: (
        callback: () => Promise<unknown>,
        _keyParts: string[],
        options: { revalidate: number; tags: string[] },
      ) => {
        expect(options).toEqual({ revalidate: 3600, tags: ["whisper-release"] });
        return callback;
      },
    }));
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, { status: 403 })),
    );

    const { getReleaseCatalog } = await import("../../lib/release/github");

    await expect(getReleaseCatalog()).resolves.toEqual({
      status: "unavailable",
      releasesUrl: RELEASES_URL,
    });
  });
});
