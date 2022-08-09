import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { createReader } from "../src";

function loadArchive(file: string): Promise<ArrayBuffer> {
	let url = new URL(file, import.meta.url);
	let path = fileURLToPath(url);
	return readFile(path);
}

test("zip", async () => {
	const buffer = await loadArchive("./examples/test.zip");
	const reader = await createReader(buffer);
	let fileData: Uint8Array | undefined;
	for (const file of reader) {
		fileData = file.extract();
	}
	reader.close();
	expect(fileData, "file data to exist").toBeDefined();
	let text = new TextDecoder().decode(fileData!);
	expect(text, "file data to be correct").toBe("test\n");
}, 60_000);
