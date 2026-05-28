import { render } from 'preact';

import './index.css';
import { Library } from './Frontend/Library/Library';

const apiLogging = true;
export function isApiLogging() {
    return apiLogging;
}

//For you sanity, this should stay false xD
const readerLogging = false;
export function isReaderLogging() {
    return readerLogging;
}

//For you sanity, this as well
const libraryLogging = false;
export function isLibraryLogging() {
    return libraryLogging;
}


const dataSaver = true;
export function isDataSaver() {
    return dataSaver;
}

const tryWithOrgAsWell = true;
export function isTryWithOrgAsWell() {
    return tryWithOrgAsWell;
}

export function App() {
	return Library();
}

render(<App />, document.getElementById('app'));
