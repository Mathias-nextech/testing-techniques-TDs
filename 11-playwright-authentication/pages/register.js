class RegisterPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.registerButton = page.locator('button:has-text("Sign up")');
    this.successMessage = page.locator('.success-message');
    this.errorMessage = page.locator('.error-message');
  }

  async goto() {
    await this.page.goto('/register');
  }

  async register(email, password, confirmPassword) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.registerButton.click();
  }

  async getSuccessMessage() {
    await this.successMessage.waitFor();
    return await this.successMessage.textContent();
  }

  async getErrorMessage() {
    await this.errorMessage.waitFor();
    return await this.errorMessage.textContent();
  }
}

export default RegisterPage;
