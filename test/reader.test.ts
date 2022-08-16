import { expect, test } from "vitest";
import { getUtil } from "./util";

let util = await getUtil();

test("zip", async () => {
	const buffer = await util.loadArchive("./data/test.zip");
	const fileData = await util.readFileFromArchive(buffer, "test.txt");
	expect(fileData, "file data to exist").toBeDefined();
	let text = new TextDecoder().decode(fileData!);
	expect(text, "file data to be correct").toBe("test\n");
}, 2_000);
