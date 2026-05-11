import { type Page, expect } from '@playwright/test'

export class ClientDashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/client')
  }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
    await expect(this.page.getByText('Empleados Activos')).toBeVisible()
  }
}
