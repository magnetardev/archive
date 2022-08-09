import { expect } from "@playwright/test";
import type { Browser, Page } from "playwright";
import { webkit } from "playwright";
import type { PreviewServer } from "vite";
import { preview } from "vite";
import { afterAll, beforeAll, describe, test } from "vitest";

export interface Result {
	name: string;
	success: boolean;
	error?: string;
}

describe("webkit", async () => {
	let server: PreviewServer;
	let browser: Browser;
	let page: Page;
	let url: string;

	beforeAll(async () => {
		server = await preview({ server: { port: 3000 } });
		url = server.resolvedUrls.local[0] || "http://localhost:3000";
		browser = await webkit.launch();
		page = await browser.newPage();
	});

	afterAll(async () => {
		await browser.close();
		await new Promise<void>((resolve, reject) => {
			server.httpServer.close((error) => (error ? reject(error) : resolve()));
		});
	});

	test("run tests webkit", async () => {
		await page.goto(url);
		// await new Promise((resolve) => setTimeout(resolve, 60_000));
		await page.waitForLoadState();
		const results = await page.evaluate(async () => {
			// @ts-ignore: testingFinished is defined on window by playwright
			return window.waitForTests();
		});
		for (let result of results) {
			expect(result.success, `${result.name}: ${result.error || ""}`).toBe(true);
		}
	}, 60_000);
});
