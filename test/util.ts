import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createReader } from "../src";

export async function readFileFromArchive(buffer: ArrayBuffer, fileName: string): Promise<Uint8Array | undefined> {
	const reader = await createReader(buffer);
	let fileData: Uint8Array | undefined;
	for (const file of reader) {
		if (fileName !== file.path) continue;
		fileData = file.extract();
	}
	reader.close();
	return fileData;
}

export function loadArchive(file: string): Promise<ArrayBuffer> {
	let url = new URL(file, new URL("../public/", import.meta.url));
	let path = fileURLToPath(url);
	return readFile(path);
}
