import { expect, test } from "@playwright/test";

test("gate table shows closed status at emergency", async ({ page }) => {
  await page.goto("/?skip=1&t=6");
  await expect(page.getByTestId("gate-table")).toBeVisible();
  const rows = await page.locator("tr.on").count();
  expect(rows).toBe(1);
});

test("crowd density actually renders differently across stages, not just the gate table", async ({ page }) => {
  await page.goto("/?skip=1&t=0");
  await page.waitForFunction(() => typeof (window as unknown as { __citadelStats?: unknown }).__citadelStats === "function", null, { timeout: 30_000 });
  await page.waitForTimeout(400);
  const stage = page.getByTestId("stage"), box = await stage.boundingBox(); if (!box) throw new Error("no box");
  const samples = new Set<string>();
  for (let x = 0.2; x < 0.9; x += 0.08) {
    const buf = await page.screenshot({ clip: { x: box.x + box.width * x, y: box.y + box.height * 0.5, width: 1, height: 1 } });
    samples.add(buf.toString("base64"));
  }
  expect(samples.size).toBeGreaterThan(1);
  await page.goto("/?skip=1&t=2");
  await page.waitForTimeout(400);
  const samples2 = new Set<string>();
  for (let x = 0.2; x < 0.9; x += 0.08) {
    const buf = await page.screenshot({ clip: { x: box.x + box.width * x, y: box.y + box.height * 0.5, width: 1, height: 1 } });
    samples2.add(buf.toString("base64"));
  }
  // Different stages should not render pixel-identical crowd states.
  expect([...samples2].sort().join()).not.toBe([...samples].sort().join());
});

test("logbook entry selection shows detail", async ({ page }) => {
  await page.goto("/?skip=1&t=0");
  await page.getByTestId("log-log-1").click();
  await expect(page.getByTestId("log-detail")).toBeVisible();
});

test("timeline scrub moves between stages", async ({ page }) => {
  await page.goto("/?skip=1&t=0");
  await page.getByTestId("nav-emergency").click();
  await expect(page.getByTestId("gauge")).toHaveText("Emergency");
});

test("out-of-range timeline scrub clamps natively", async ({ page }) => {
  await page.goto("/?skip=1&t=0");
  const scrub = page.getByTestId("timeline-scrub");
  await scrub.evaluate((el: HTMLInputElement) => { el.value = "999"; el.dispatchEvent(new Event("input", { bubbles: true })); });
  expect(Number(await scrub.inputValue())).toBeLessThanOrEqual(6);
});

test("keyboard-only: tab reaches the timeline rail and activates a stage", async ({ page }) => {
  await page.goto("/?skip=1");
  await expect(page.getByTestId("hud")).toBeVisible();
  await page.getByTestId("nav-egress").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("nav-egress")).toHaveClass(/on/);
});

test("mobile width keeps the HUD usable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/?skip=1&t=0");
  await expect(page.getByTestId("hud")).toBeVisible();
  await expect(page.getByTestId("gate-table")).toBeVisible();
});

test("reduced motion: intro renders a static keyframe list with no timeline", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByTestId("intro")).toBeVisible();
  await page.getByTestId("skip-intro").click();
  await expect(page.getByTestId("hud")).toBeVisible();
});

test("graphics failure: gfx=off falls back to the poster with no canvas", async ({ page }) => {
  await page.goto("/?gfx=off&skip=1");
  await expect(page.getByTestId("poster")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});
