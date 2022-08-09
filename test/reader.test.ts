import { expect, test } from "vitest";
import { loadArchive, readFileFromArchive } from "./util";

test("zip", async () => {
	const buffer = await loadArchive("./examples/test.zip");
	const fileData = await readFileFromArchive(buffer, "test.txt");
	expect(fileData, "file data to exist").toBeDefined();
	let text = new TextDecoder().decode(fileData!);
	expect(text, "file data to be correct").toBe("test\n");
}, 60_000);
