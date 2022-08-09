import { expect, test } from "vitest";
import { createReader, createWriter } from "../src";

test("Math.sqrt()", () => {
	expect(Math.sqrt(4)).toBe(2);
});
