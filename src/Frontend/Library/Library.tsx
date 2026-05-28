import "./Library.css"

import { useState } from "preact/hooks";
import { ChapterReader } from "../Reader/Reader";
import { MangaModel, SavedManga } from "../../Backend/Model/Model";
import { MangaEntry } from "../Common/MangaEntry";
import { loadManga,} from "../../Backend/Api/MangaLoader";
import { MangaSearchBar } from "./Parts/MangaSearchBar";
import { isLibraryLogging } from "../..";

let MANGA_STORAGE_KEY = "manga-library";
let mangas: SavedManga[] = loadMangas();

export function Library() {
    let [message, setMessage] = useState("");
    let [showMessage, setShowMessage] = useState(false);

    let [openReader, setOpenReader] = useState(false);
    let [selectedManga, setSelectedManga] = useState<MangaModel | null>(null);

    async function openReaderFor(id: string) {
        try {
            const manga = await loadManga(id);
            if (manga) {
                updateManga(manga);
                setSelectedManga(manga);
                if (!manga.volumes) {
                    console.error(`[Library] No volumes were loaded for manga: ${manga.title}`);
                    setMessage(`Failed to load volumes for: ${manga.title}`);
                    setShowMessage(true);
                    return;
                }
                setShowMessage(false);
                setOpenReader(true);
            }
            else {
                setMessage("Manga couldn't be loaded");
                setShowMessage(true);
            }
        } catch (error) {
            console.error(`[Library] Failed to load manga: ${error}`);
        }
    }

    if (openReader && selectedManga) {
        return <ChapterReader
            selectedManga={selectedManga}
            onBackClicked={() => setOpenReader(false)}
        ></ChapterReader>
    }
    else {
        let mangaDivs = mangas.map((manga: any) => {
            if (manga.mangaCover) {
                return <MangaEntry title={manga.mangaTitle} picture={manga.mangaCover}
                    onClick={() => openReaderFor(manga.mangaId)}
                    onDeleteClick={() => {
                        setMessage(`Manga deleted: ${manga.mangaTitle}`);
                        deleteManga(manga.mangaId)
                        setShowMessage(true);
                    }}>
                </MangaEntry>
            }
            else {
                return <button onClick={
                    () => openReaderFor(manga.mangaId)}>
                    <span>{manga.mangaTitle}</span>
                </button>
            }
        });
        let messageBox = showMessage ? <div class="MessageBox">
            <span>{message}</span>
            <button onClick={() => setShowMessage(false)}>
                OK
            </button>
        </div> : null;
        return <div class="Library">
            <h1>Library</h1>
            <MangaSearchBar addManga={addManga} setMessage={setMessage} setShowMessage={setShowMessage}/>
            {messageBox}
            <div class="MangaGrid">
                {mangaDivs}
            </div>
        </div>
    }
}

function loadMangas(): SavedManga[] {
    let temp = localStorage.getItem(MANGA_STORAGE_KEY)
    if (temp) {
        return JSON.parse(temp);
    }
    return [
        { mangaId: "418791c0-35cf-4f87-936b-acd9cddf0989", mangaTitle: "The Fragrant Flower Blooms With Dignity", mangaCover: null },
    ];
}

function updateManga(manga: MangaModel) {
    let index = mangas.findIndex(m => m.mangaId === manga.id);
    let mangaToSave = { mangaId: manga.id, mangaTitle: manga.title, mangaCover: manga.cover || null };
    if (index !== -1) {
        if(isLibraryLogging()) console.log(`[Library] Updating manga in library: ${manga.title}`);
        mangas[index] = mangaToSave;
    } else {
        if(isLibraryLogging()) console.log(`[Library] Trying to update, but not in library, so adding manga: ${manga.title}`);
        mangas.push(mangaToSave);
    }
    saveMangas();
}

function addManga(manga: SavedManga): boolean {
    if (!manga) {
        console.error("[Library] Manga is null");
        return false;
    }

    for (let m of mangas) {
        if (m.mangaId === manga.mangaId) {
            if(isLibraryLogging()) console.log(`[Library] Manga already in library, updateing: ${manga.mangaTitle}`);       
            m = manga;
            saveMangas();
            return true;
        }
    }
    if(isLibraryLogging()) console.log(`[Library] Manga added to library: ${manga.mangaTitle}`);
    mangas.push(manga);
    saveMangas();
    return true;
}

function deleteManga(mangaId: string) {
    if(isLibraryLogging()) console.log(`[Library] Deleting manga: ${mangaId}`);
    mangas = mangas.filter(m => m.mangaId !== mangaId);
    saveMangas();
}

function saveMangas() {
    let stored = JSON.stringify(mangas)
    if(isLibraryLogging()) console.log(`[Library] Saving mangas`);
    localStorage.setItem(MANGA_STORAGE_KEY, stored);
}