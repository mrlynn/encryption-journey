import { test, expect } from '@playwright/test';

test.describe('Encryption Journey Visualizer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Encryption Journey Visualizer/);
    await expect(page.locator('h1')).toContainText('Encryption Journey');
    await expect(page.locator('text=Load Demo Session')).toBeVisible();
  });

  test('should navigate to demo session', async ({ page }) => {
    await page.click('text=Load Demo Session');
    await expect(page).toHaveURL(/\/view\/demo/);
  });

  test('should display all system components', async ({ page }) => {
    await page.goto('/view/demo');
    
    // Wait for the visualizer to load
    await page.waitForSelector('[data-testid="flow-canvas"]', { timeout: 10000 });
    
    // Check that all 4 nodes are present
    await expect(page.locator('[data-testid="client-node"]')).toBeVisible();
    await expect(page.locator('[data-testid="api-node"]')).toBeVisible();
    await expect(page.locator('[data-testid="driver-node"]')).toBeVisible();
    await expect(page.locator('[data-testid="mongo-node"]')).toBeVisible();
  });

  test('should display timeline with events', async ({ page }) => {
    await page.goto('/view/demo');
    
    // Wait for timeline to load
    await page.waitForSelector('[data-testid="timeline"]', { timeout: 10000 });
    
    // Check that timeline has events
    const timelineEvents = page.locator('[data-testid="timeline-event"]');
    await expect(timelineEvents).toHaveCount(12); // Based on our seed data
    
    // Check first event
    await expect(timelineEvents.first()).toContainText('CLIENT_ENCRYPT');
  });

  test('should allow stepping through events', async ({ page }) => {
    await page.goto('/view/demo');
    
    // Wait for visualizer to load
    await page.waitForSelector('[data-testid="flow-canvas"]', { timeout: 10000 });
    
    // Click step forward button
    await page.click('[data-testid="step-forward"]');
    
    // Check that we're on the second event
    const currentEvent = page.locator('[data-testid="current-event"]');
    await expect(currentEvent).toContainText('API_RECEIVE');
  });

  test('should toggle ciphertext view', async ({ page }) => {
    await page.goto('/view/demo');
    
    // Wait for visualizer to load
    await page.waitForSelector('[data-testid="flow-canvas"]', { timeout: 10000 });
    
    // Click show ciphertext toggle
    await page.click('[data-testid="toggle-ciphertext"]');
    
    // Check that ciphertext is shown
    await expect(page.locator('text=🔒 [ENCRYPTED]')).toBeVisible();
  });

  test('should display legend when clicked', async ({ page }) => {
    await page.goto('/view/demo');
    
    // Click legend button
    await page.click('[data-testid="legend-button"]');
    
    // Check that legend panel is visible
    await expect(page.locator('[data-testid="legend-panel"]')).toBeVisible();
    await expect(page.locator('text=System Components')).toBeVisible();
    await expect(page.locator('text=Encryption Modes')).toBeVisible();
  });

  test('should display role lens when clicked', async ({ page }) => {
    await page.goto('/view/demo');
    
    // Click role lens button
    await page.click('[data-testid="role-lens-button"]');
    
    // Check that role lens panel is visible
    await expect(page.locator('[data-testid="role-lens-panel"]')).toBeVisible();
    await expect(page.locator('text=Role-Based Access')).toBeVisible();
  });

  test('should allow role switching', async ({ page }) => {
    await page.goto('/view/demo');
    
    // Open role lens
    await page.click('[data-testid="role-lens-button"]');
    
    // Switch to nurse role
    await page.click('[data-testid="role-nurse"]');
    
    // Check that nurse role is selected
    await expect(page.locator('[data-testid="role-nurse"]')).toHaveClass(/border-primary/);
  });

  test('should display inspector when event is selected', async ({ page }) => {
    await page.goto('/view/demo');
    
    // Wait for visualizer to load
    await page.waitForSelector('[data-testid="flow-canvas"]', { timeout: 10000 });
    
    // Click on first timeline event
    await page.click('[data-testid="timeline-event"]:first-child');
    
    // Check that inspector shows event details
    await expect(page.locator('[data-testid="inspector"]')).toBeVisible();
    await expect(page.locator('text=Event Information')).toBeVisible();
  });

  test('should handle playback controls', async ({ page }) => {
    await page.goto('/view/demo');
    
    // Wait for visualizer to load
    await page.waitForSelector('[data-testid="flow-canvas"]', { timeout: 10000 });
    
    // Click play button
    await page.click('[data-testid="play-button"]');
    
    // Check that pause button is now visible
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();
    
    // Click pause button
    await page.click('[data-testid="pause-button"]');
    
    // Check that play button is visible again
    await expect(page.locator('[data-testid="play-button"]')).toBeVisible();
  });

  test('should change playback speed', async ({ page }) => {
    await page.goto('/view/demo');
    
    // Wait for visualizer to load
    await page.waitForSelector('[data-testid="flow-canvas"]', { timeout: 10000 });
    
    // Change speed to 2x
    await page.selectOption('[data-testid="speed-select"]', '2');
    
    // Check that speed is changed
    await expect(page.locator('[data-testid="speed-select"]')).toHaveValue('2');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/view/demo');
    
    // Wait for visualizer to load
    await page.waitForSelector('[data-testid="flow-canvas"]', { timeout: 10000 });
    
    // Check that all components are still visible
    await expect(page.locator('[data-testid="client-node"]')).toBeVisible();
    await expect(page.locator('[data-testid="timeline"]')).toBeVisible();
  });
});

test.describe('API Health Check', () => {
  test('should return health status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.service).toBe('encryption-journey-visualizer');
  });
});
