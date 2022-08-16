import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Reader } from "../../src";
import { ReaderEntry } from "../../src/reader";

async function loadWasm(): Promise<ArrayBuffer> {
	let url = new URL("../../public/archive.wasm", import.meta.url);
	let path = fileURLToPath(url);
	return readFile(path);
}

export async function readFileFromArchive(buffer: ArrayBuffer, fileName: string): Promise<Uint8Array | undefined> {
	const reader = await Reader.init(new Uint8Array(buffer), { loadWasm });
	let data: ReaderEntry | undefined = await reader.next();
	console.log("entry:", data);
	let fileData = data?.extract();
	reader.close();
	return fileData;
}

export function loadArchive(file: string): Promise<ArrayBuffer> {
	let url = new URL(file, new URL("../", import.meta.url));
	let path = fileURLToPath(url);
	return readFile(path);
}
