import { BrowserType, expect } from "@playwright/test";
import type { Browser, Page } from "playwright";
import { chromium, firefox, webkit } from "playwright";
import type { PreviewServer } from "vite";
import { preview } from "vite";
import { afterAll, beforeAll, describe, test } from "vitest";

async function pageTests(engine: BrowserType<{}>) {
	let server: PreviewServer;
	let url: string;
	let browser: Browser;
	let page: Page;

	beforeAll(async () => {
		server = await preview({ server: { port: 3000 } });
		url = server.resolvedUrls.local[0] || "http://localhost:3000";
		browser = await engine.launch();
		page = await browser.newPage();
	});

	afterAll(async () => {
		await browser.close();
		await new Promise<void>((resolve, reject) => {
			server.httpServer.close((error) => (error ? reject(error) : resolve()));
		});
	});

	test("run page tests", async () => {
		await page.goto(url);
		// await new Promise((resolve) => setTimeout(resolve, 60_000));
		await page.waitForLoadState();
		const results = await page.evaluate(async () => {
			// @ts-ignore: waitForTests is defined on window
			return window.waitForTests();
		});
		for (let result of results) {
			expect(result.success, `${result.name}: ${result.error || ""}`).toBe(true);
		}
	}, 60_000);
}

describe("webkit", () => pageTests(webkit));
describe("chromium", () => pageTests(chromium));
describe("firefox", () => pageTests(firefox));
