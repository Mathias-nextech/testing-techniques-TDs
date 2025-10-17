// e2e/accessibility.spec.js
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Accessibility', () => {
  
  test('Homepage should respect WCAG standards', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('doit être navigable au clavier', async ({ page }) => {
    await page.goto('/');
    
    // Tabulate through interactive elements
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    await page.keyboard.press('Tab');
    focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test navigation with return key
    await page.keyboard.press('Enter');
    // Check if action is executaded (e.g., navigation or button click)
  });

  test('should have proper label tags in forms', async ({ page }) => {
    await page.goto('/register');

    // Check if each input has a label associated
    const inputs = await page.locator('input').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const hasLabel = await page.locator(`label[for="${id}"]`).count() > 0;

      expect(hasLabel || ariaLabel).toBeTruthy();
    }
  });

  test('should have sufficient contrast', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();
    
    const contrastIssues = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );
    
    expect(contrastIssues).toHaveLength(0);
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/products');
    
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const role = await img.getAttribute('role');
      
      // Image should have alt attribute or be decorative (role="presentation")
      expect(alt !== null || role === 'presentation' || ariaLabel !== null).toBeTruthy();
    }
  });
});
