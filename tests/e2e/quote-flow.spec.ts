import { test, expect } from '@playwright/test';

test('visitor can complete the two-step quote form', async ({ page }) => {
  await page.route('**/api/quote', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
  );

  await page.goto('/quote');
  await page.selectOption('#q-mode', 'Ocean LCL');
  await page.fill('#q-origin', 'Ningbo, China');
  await page.fill('#q-destination', 'Chicago, IL');
  await page.fill('#q-cargo', '12 CBM, 3200 kg');
  await page.click('[data-next]');

  await page.fill('#q-name', 'Jane Doe');
  await page.fill('#q-company', 'Doe Imports');
  await page.fill('#q-email', 'jane@doeimports.com');
  await page.fill('#q-phone', '312-555-0100');
  await page.click('button[type="submit"]');

  await expect(page.getByText('Request received')).toBeVisible();
});

test('a delivery failure shows an honest error, never a fake success', async ({ page }) => {
  await page.route('**/api/quote', (route) =>
    route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: false,
        message: 'could not send',
        fallback: { email: 'Op01@global-gate.us', phone: '631-596-5591' },
      }),
    })
  );

  await page.goto('/quote');
  await page.selectOption('#q-mode', 'Air Freight');
  await page.fill('#q-origin', 'Shanghai');
  await page.fill('#q-destination', 'Newark, NJ');
  await page.fill('#q-cargo', '300 kg');
  await page.click('[data-next]');
  await page.fill('#q-name', 'Jane Doe');
  await page.fill('#q-company', 'Doe Imports');
  await page.fill('#q-email', 'jane@doeimports.com');
  await page.fill('#q-phone', '312-555-0100');
  await page.click('button[type="submit"]');

  // The component renders a typographic apostrophe ("couldn’t"), not a
  // straight one, so match with a wildcard for that single character instead
  // of hardcoding either quote style.
  await expect(page.getByText(/We couldn.t send that automatically\./)).toBeVisible();
  await expect(page.getByText('Request received')).toBeHidden();
});

test('mobile visitors get a tap-to-call bar on every page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/services/ocean-freight', '/contact']) {
    await page.goto(path);
    // Several tel: links exist per page (desktop header, footer, mobile sticky
    // bar); the header's is `hidden sm:flex`, so at this viewport only the
    // mobile sticky bar's link is actually visible. :visible filters to it.
    await expect(page.locator('a[href^="tel:"]:visible').first()).toBeVisible();
  }
});
