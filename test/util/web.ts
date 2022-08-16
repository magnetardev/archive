import { Reader } from "../../src";
import { ReaderEntry } from "../../src/reader";

export async function readFileFromArchive(buffer: ArrayBuffer, fileName: string): Promise<Uint8Array | undefined> {
	const reader = await Reader.init(new Uint8Array(buffer));
	let data: ReaderEntry | undefined = await reader.next();
	let fileData = data?.extract();
	reader.close();
	return fileData;
}

export function loadArchive(file: string): Promise<ArrayBuffer> {
	let url = new URL(file, new URL("../", import.meta.url));
	return fetch(url).then((r) => r.arrayBuffer());
}
