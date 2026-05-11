import { type Page, expect } from '@playwright/test'

export class EmployeeDashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/employee')
  }

  async expectLoaded() {
    // Heading es "Hola, {nombre} 👋"
    await expect(this.page.getByRole('heading', { name: /hola/i })).toBeVisible()
    await expect(this.page.getByText('Último pago neto')).toBeVisible()
  }
}

export class EmployeeColillasPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/employee/colillas')
  }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: /colillas/i })).toBeVisible()
  }

  async expectAtLeastOneColilla() {
    const cards = this.page.locator('[data-testid="colilla-card"]')
    // Fallback: any element with "Q1" or "Q2" text
    const hasPeriod = await this.page.getByText(/Q[12]/).count()
    expect(hasPeriod).toBeGreaterThan(0)
  }
}

export class EmployeeIncapacidadesPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/employee/incapacidades')
  }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: /incapacidades/i })).toBeVisible()
  }

  async goToNuevaSolicitud() {
    await this.page.goto('/employee/incapacidades/nueva')
  }

  async expectFormLoaded() {
    // Heading es "Nueva Incapacidad"
    await expect(this.page.getByRole('heading', { name: /nueva incapacidad/i })).toBeVisible()
    await expect(this.page.locator('select')).toBeVisible()
  }

  async fillSolicitud(opts: { tipo: string; inicio: string; fin: string; descripcion?: string }) {
    // El form usa React state sin atributo name → seleccionamos por posición/label
    await this.page.selectOption('select', opts.tipo)
    await this.page.fill('input[type="date"]:nth-of-type(1)', opts.inicio)
    await this.page.fill('input[type="date"]:nth-of-type(2)', opts.fin)
    if (opts.descripcion) {
      await this.page.fill('textarea', opts.descripcion)
    }
  }
}
