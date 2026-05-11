import { type Page, expect } from '@playwright/test'

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.page.fill('input[type="email"]', email)
    await this.page.fill('input[type="password"]', password)
    await this.page.click('button[type="submit"]')
  }

  async loginAsAdmin() {
    await this.login('admin@starshine.co', 'admin123')
    await this.page.waitForURL('/admin', { timeout: 15_000 })
  }

  async loginAsClient() {
    await this.login('admin@koversolutions.com', 'kover123')
    await this.page.waitForURL('/client', { timeout: 15_000 })
  }

  async loginAsEmployee() {
    await this.login('justine@koversolutions.com', 'justine123')
    await this.page.waitForURL('/employee', { timeout: 15_000 })
  }

  async expectError() {
    await expect(
      this.page.getByText('Correo o contraseña incorrectos')
    ).toBeVisible()
  }

  async expectOnLoginPage() {
    await expect(this.page).toHaveURL('/login')
    await expect(this.page.getByRole('heading', { name: 'Bienvenido' })).toBeVisible()
  }
}
