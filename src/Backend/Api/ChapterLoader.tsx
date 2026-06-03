import { isApiLogging, isGoThroughProxy, isTryWithOrgAsWell } from "../..";
import { ChapterPagesResponse, ChapterResponse } from "../Model/Api/Chapter";
import { ChapterModel } from "../Model/Model";
import { toChapter } from "../Model/Transformers";

/** 
 * Loads a chapter's data from the MangaDex API based on the provided chapter ID.
 * 
 * @param Id - Chapter's ID
 * 
 * @returns a ChapterModel, or null if failed
 * 
 * @see {@link https://api.mangadex.dev/docs/redoc.html} for API documentation
 **/
export async function loadChapter(Id: string): Promise<ChapterModel | null> {
    const url = `https://api.mangadex.dev/chapter/`;
    const orgUrl = isGoThroughProxy() ? `https://mangareader-proxy.theredbaron.workers.dev/chapter/` : `https://api.mangadex.org/chapter/`;

    let chapter = await fetchChapter(url, Id);
    if (chapter) {
        return chapter;
    }
    else {
        if (!isTryWithOrgAsWell()) {
            return null;
        }
        console.log("[API] Trying with .org endpoint");
        let chapter = await fetchChapter(orgUrl, Id);
        return chapter;
    }
}

async function fetchChapter(url: string, Id: string): Promise<ChapterModel | null> {
    try {
        if (isApiLogging()) console.log(`[API] ${url + Id}`);

        const response = await fetch(url + Id);
        if (!response.ok) {
            console.error(`[API] Failed to fetch chapter (${Id}): ${response.statusText}`);
            return null;
        }

        const data = await response.json() as ChapterResponse;
        return toChapter(data.data);

    }
    catch (error) {
        console.error(`[API] Error loading chapter (${Id}): ${error}`);
        return null;
    }
}

/** 
 * Loads a chapter's pages through the MangaDex API based on the provided chapter ID.
 * 
 * @param Id - Chapter's ID
 * 
 * @returns a ChapterPagesResponse, or null if failed
 * 
 * @see {@link https://api.mangadex.dev/docs/redoc.html} for API documentation
 **/
export async function loadPages(Id: string): Promise<ChapterPagesResponse | null> {
    const url = 'https://api.mangadex.dev/at-home/server/';
    const orgUrl = isGoThroughProxy() ? 'https://mangareader-proxy.theredbaron.workers.dev/at-home/server/' : 'https://api.mangadex.org/at-home/server/';

    let pages = await fetchPages(url, Id);
    if (pages) {
        return pages;
    }
    else {
        if (!isTryWithOrgAsWell()) {
            return null;
        }
        console.log("[API] Trying with .org endpoint");
        let pages = await fetchPages(orgUrl, Id);
        return pages;
    }
}

async function fetchPages(url: string, Id: string): Promise<ChapterPagesResponse | null> {
    try {
        if (isApiLogging()) console.log(`[API] ${url + Id}`);

        const response = await fetch(url + Id);
        if (!response.ok) {
            console.error(`[API] Failed to fetch chapter pages (${Id}): ${response.statusText}`);
            return null;
        }

        const chapter = await response.json() as ChapterPagesResponse;
        return chapter;
    }
    catch (error) {
        console.error(`[API] Error loading chapter pages (${Id}): ${error}`);
        return null;
    }
}