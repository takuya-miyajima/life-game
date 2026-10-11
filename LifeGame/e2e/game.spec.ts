import { expect, test } from '@playwright/test';

test('plays, validates settings, resizes, and updates automatically', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.cell')).toHaveCount(10000);
  await expect(page.getByRole('button', { name: 'Stop', exact: true })).toBeDisabled();

  await page.getByLabel('Width', { exact: true }).fill('10');
  await page.getByLabel('Height', { exact: true }).fill('10');
  await page.getByRole('button', { name: 'Resize', exact: true }).click();
  await expect(page.locator('.cell')).toHaveCount(100);

  for (const x of [2, 3, 4]) {
    await page.getByRole('button', { name: `Cell ${x}, 3`, exact: true }).click();
  }
  await page.getByRole('button', { name: 'Tick', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cell 3, 2', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Cell 2, 3', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.cell.on')).toHaveCount(3);

  await page.getByLabel('Tick period', { exact: true }).fill('99');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.locator('mat-error')).toContainText('at least 100');
  await page.getByLabel('Tick period', { exact: true }).fill('1000');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.locator('mat-error')).toHaveCount(0);

  // Advancing the browser clock checks zoneless rendering without a timing race.
  await page.clock.install();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Clear', exact: true })).toBeDisabled();
  await page.clock.runFor(1000);
  await expect(page.getByRole('button', { name: 'Cell 2, 3', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await page.clock.runFor(2000);
  await expect(page.getByRole('button', { name: 'Cell 2, 3', exact: true })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.locator('.cell.on')).toHaveCount(0);

  await page.getByLabel('Width', { exact: true }).fill('10.5');
  await page.getByRole('button', { name: 'Resize', exact: true }).click();
  await expect(page.locator('.cell')).toHaveCount(100);
  await expect(page.locator('mat-error')).toContainText('integer');
  await page.getByLabel('Width', { exact: true }).fill('12');
  await page.getByRole('button', { name: 'Resize', exact: true }).click();
  await expect(page.locator('.cell')).toHaveCount(120);
  expect(errors).toEqual([]);
});
