// import the necessary modules
const { test, expect } = require('@playwright/test');
import {
    BatchInfo,
    Configuration,
    EyesRunner,
    ClassicRunner,
    VisualGridRunner,
    BrowserType,
    DeviceName,
    ScreenOrientation,
    Eyes,
    Target
} from '@applitools/eyes-playwright';

// Settings to control how tests are run.
// These could be set by environment variables or other input mechanisms.
// They are hard-coded here to keep the example project simple.

// USE_ULTRAFAST_GRID to true to use the Ultrafast Grid
// Set to false to use the classic runner
export let USE_ULTRAFAST_GRID = true;

// Applitools objects to share for all tests
export let Batch;
export let Config;
export let Runner;
export let eyes;

test.beforeAll(async () => {
    if (USE_ULTRAFAST_GRID) {
        // Create the runner for the Ultrafast Grid.
        // Concurrency refers to the number of visual checkpoints Applitools will perform in parallel.
        // Warning: If you have a free account, then concurrency will be limited to 1.
        Runner = new VisualGridRunner({ testConcurrency: 5 });
    } else {
        // Create the classic runner.
        Runner = new ClassicRunner();
    }

    // Create a new batch for tests.
    // A batch is the collection of visual checkpoints for a test suite.
    // Batches are displayed in the Eyes Test Manager, so use meaningful names.
    let runnerName = USE_ULTRAFAST_GRID ? 'Ultrafast Grid' : 'Classic runner';
    Batch = new BatchInfo({ name: `ToDo - ${runnerName}`, id: `ToDo - ${runnerName}`, notifyOnCompletion: false });

    // Create a configuration for Applitools Eyes.
    Config = new Configuration();

    // Set the batch for the config.
    Config.setBatch(Batch);

    // If running tests on the Ultrafast Grid, configure browsers.
    if (USE_ULTRAFAST_GRID) {
        // Add 3 desktop browsers with different viewports for cross-browser testing in the Ultrafast Grid.
        // Other browsers are also available, like Edge and IE.
        Config.addBrowser(800, 600, BrowserType.CHROME);
        Config.addBrowser(1600, 1200, BrowserType.FIREFOX);
        Config.addBrowser(1024, 768, BrowserType.SAFARI);

        // Add 2 mobile emulation devices with different orientations for cross-browser testing in the Ultrafast Grid.
        // Other mobile devices are available.
        Config.addDeviceEmulation(DeviceName.iPhone_11, ScreenOrientation.PORTRAIT);
        Config.addDeviceEmulation(DeviceName.Nexus_10, ScreenOrientation.LANDSCAPE);
    }
    console.log('beforeAll done');
});

test.beforeEach(async ({ page }) => {
    console.log(`Running test: "${test.info().title}"`);
    // Create a new Applitools Eyes object for each test.
    eyes = new Eyes(Runner);

    // Attach the eyes to the browser.
    eyes.setConfiguration(Config);
    await eyes.open(page, 'ToDo', test.info().title); // Pass the test name as a string
    console.log('beforeEach done');
});


test('has h1 that says Time Blind', async ({ page }) => {
    await eyes.open(page, 'Time Blind', 'has h1 that says Time Blind');
    await page.goto('http://localhost:3000');
    const h1 = page.locator('h1');
    await expect(h1).toHaveText('Time Blind');
    await eyes.checkWindow('Time Blind');
});

test('adds a task', async ({ page }) => {
  try {
    await page.goto('http://localhost:3000');
    await page.fill('input[placeholder="New task"]', 'Test task');
    await page.click('button[type="submit"]');
    await eyes.check('Add Task', Target.window().fully());
  } catch (err) {
    console.error(err);
  } finally {
    await eyes.close();
  }
});

test('adds 3 tasks', async ({ page }) => {
  try {
    await page.goto('http://localhost:3000');
    await page.fill('input[placeholder="New task"]', 'Task 1');
    await page.click('button[type="submit"]');
    await page.fill('input[placeholder="New task"]', 'Task 2');
    await page.click('button[type="submit"]');
    await page.fill('input[placeholder="New task"]', 'Task 3');
    await page.click('button[type="submit"]');
    await eyes.check('Add 3 Tasks', Target.window().fully());
  } catch (err) {
    console.error(err);
  } finally {
    await eyes.close();
  }
});

test('deletes a task', async ({ page }) => {
  try {
    await page.goto('http://localhost:3000');
    await page.fill('input[placeholder="New task"]', 'Task 1');
    await page.click('button[type="submit"]');
    await page.fill('input[placeholder="New task"]', 'Task 2');
    await page.click('button[type="submit"]');
    await page.fill('input[placeholder="New task"]', 'Task 3');
    await page.click('button[type="submit"]');
    await page.click('li:has-text("Task 2") button');
    await eyes.check('Delete Task', Target.window().fully());
  } catch (err) {
    console.error(err);
  } finally {
    await eyes.close();
  }
});


test.afterEach(async () => {
    // Close the eyes for each test.
    await eyes.closeAsync();
    await Runner.getAllTestResults(true); // Make sure to wait for all test results
    console.log(`Test "${test.info().title}" done!`);
});

test.afterAll(async () => {
    // log message when all tests are done
    console.log('All tests done!');
});