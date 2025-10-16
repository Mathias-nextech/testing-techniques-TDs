class DashboardPage {
  constructor(page) {
    this.page = page;
    this.welcomeMessage = page.locator('.welcome-message');
    this.logoutButton = page.locator('button:has-text("Sign out")');
    this.userMenu = page.locator('.user-menu');
  }

  async isLoaded() {
    await this.welcomeMessage.waitFor();
    return await this.welcomeMessage.isVisible();
  }

  async getWelcomeText() {
    return await this.welcomeMessage.textContent();
  }

  async logout() {
    await this.logoutButton.click();
  }

  async getUserEmail() {
    await this.userMenu.click();
    const email = await this.page.locator('.user-email').textContent();
    return email;
  }
}

export default DashboardPage;
