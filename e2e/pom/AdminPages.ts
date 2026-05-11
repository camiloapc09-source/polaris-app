import { type Page, expect } from '@playwright/test'

export class AdminDashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/admin')
  }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(this.page.getByText('Saldo Disponible')).toBeVisible()
    await expect(this.page.getByText('Total Ingresos')).toBeVisible()
    await expect(this.page.getByText('Empleados Activos')).toBeVisible()
  }
}

export class AdminIngresosPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/admin/ingresos')
  }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Ingresos' })).toBeVisible()
    await expect(this.page.getByText('Total recibido (COP)')).toBeVisible()
    await expect(this.page.getByText('Total recibido (USD)')).toBeVisible()
  }

  async openForm() {
    await this.page.getByRole('button', { name: /Registrar ingreso/i }).click()
  }

  async fillIngreso(opts: { usd: string; trm: string; description?: string }) {
    await this.page.fill('input[name="amountUSD"]', opts.usd)
    await this.page.fill('input[name="exchangeRate"]', opts.trm)
    if (opts.description) {
      await this.page.fill('input[name="description"]', opts.description)
    }
  }
}

export class AdminNominaPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/admin/nomina')
  }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Nómina' })).toBeVisible()
    await expect(this.page.getByText('Total Pagado')).toBeVisible()
  }

  async goToNuevoPago() {
    await this.page.goto('/admin/nomina/nuevo')
  }

  async expectNuevoPagoLoaded() {
    await expect(this.page.getByRole('heading', { name: /nuevo pago/i })).toBeVisible()
  }
}

export class AdminIncapacidadesPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/admin/incapacidades')
  }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Incapacidades' })).toBeVisible()
    await expect(this.page.getByText('Total solicitudes')).toBeVisible()
    await expect(this.page.getByText('En revisión')).toBeVisible()
    await expect(this.page.getByText('Aprobadas')).toBeVisible()
  }

  async getPendingCount() {
    const text = await this.page.getByText('En revisión').locator('..').getByRole('paragraph').last().textContent()
    return Number(text?.trim() ?? '0')
  }
}
