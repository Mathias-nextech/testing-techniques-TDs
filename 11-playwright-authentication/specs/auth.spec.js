import { test, expect } from '@playwright/test';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import DashboardPage from './pages/dashboard';

test.describe('Authentification', () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();

    try {
      await page.evaluate(() => {
        try {
          localStorage.clear();
        } catch (e) {
          console.warn('LocalStorage non accessible');
        }
        try {
          sessionStorage.clear();
        } catch (e) {
          console.warn('SessionStorage non accessible');
        }
      });
    } catch (e) {
      console.warn('Impossible d\'évaluer le script de nettoyage du stockage');
    }

    try {
      await page.request.post('/api/test/reset');
    } catch (e) {
      console.log('Storage clearing failed, continuing…')
    }
  });

  test.describe('Registration', () => {
    test('should allow a User to register', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      const dashboardPage = new DashboardPage(page);
      
      // Générer un email unique pour chaque test
      const email = `test${Date.now()}@example.com`;
      
      await registerPage.goto();
      await registerPage.register(email, 'Password123!', 'Password123!');
      
      // Vérifier la redirection vers le dashboard
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(dashboardPage.welcomeMessage).toBeVisible();
    });

    test('should display an error if passwords don\'t match', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      
      await registerPage.goto();
      await registerPage.register(
        'test@example.com',
        'Password123!',
        'DifferentPassword123!'
      );
      
      const errorMessage = await registerPage.getErrorMessage();
      expect(errorMessage).toContain('Password and Password confirmation don\'t match');
    });

    test('should display an error if email is already in use', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      const email = 'existing@example.com';
      
      // First sign up
      await registerPage.goto();
      await registerPage.register(email, 'Password123!', 'Password123!');

      // Try to register a second time with the same email
      await registerPage.goto();
      await registerPage.register(email, 'Password123!', 'Password123!');
      
      const errorMessage = await registerPage.getErrorMessage();
      expect(errorMessage).toContain('Email already used');
    });

    test('should validate email format', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      
      await registerPage.goto();
      await registerPage.register('invalid-email', 'Password123!', 'Password123!');
      
      // Check HTML5 validity
      const isInvalid = await registerPage.emailInput.evaluate(
        (el) => !el.validity.valid
      );
      expect(isInvalid).toBe(true);
    });

    test('should validate password strength', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      
      await registerPage.goto();
      await registerPage.register('test2@example.com', 'weak', 'weak');
      
      const errorMessage = await registerPage.getErrorMessage();
      expect(errorMessage).toContain('Password is too weak');
    });
  });

  test.describe('Connection', () => {
    test('should allow a User to sign in', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      await registerPage.goto();
      await registerPage.register(
        'test@example.com',
        'Password123!',
        'Password123!'
      )
      
      await loginPage.goto();
      await loginPage.login('test@example.com', 'Password123!');
      
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(dashboardPage.welcomeMessage).toBeVisible();
      
      const welcomeText = await dashboardPage.getWelcomeText();
      expect(welcomeText).toContain('Welcome');
    });

    test('should display an error when credentials are invalid', async ({ page }) => {
      const loginPage = new LoginPage(page);
      
      await loginPage.goto();
      await loginPage.login('wrong@example.com', 'wrongpassword');
      
      await expect(loginPage.errorMessage).toBeVisible();
      const errorText = await loginPage.getErrorMessage();
      expect(errorText).toContain('Invalid credentials');
    });

    test('should remain on the login page in case of an error', async ({ page }) => {
      const loginPage = new LoginPage(page);
      
      await loginPage.goto();
      await loginPage.login('wrong@example.com', 'wrongpassword');
      
      await expect(page).toHaveURL(/.*login/);
    });

    test('should allow User to sign out', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      await registerPage.goto();
      await registerPage.register(
        'test@example.com',
        'Password123!',
        'Password123!'
      );
      
      // Sign in
      await loginPage.goto();
      await loginPage.login('test@example.com', 'Password123!');
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Sign out
      await dashboardPage.logout();
      
      // Check redirection to dashboard page
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe('Protection des routes', () => {
    test('should redirect User to login if unauthentified', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Must be redirected to login
      await expect(page).toHaveURL(/.*login/);
    });

    test('Session should persist after page reload', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);
      
      await registerPage.goto();
      await registerPage.register(
        'test@example.com',
        'Password123!',
        'Password123!'
      );

      // Connection
      await loginPage.goto();
      await loginPage.login('test@example.com', 'Password123!');
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Page reload
      await page.reload();
      
      // Must still be authenticated
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(dashboardPage.welcomeMessage).toBeVisible();
    });
  });
});
