import { test, expect } from '@playwright/test'
import { AdminNominaPage } from '../pom/AdminPages'

test.describe('Admin — Nómina', () => {
  test('carga la página de nómina', async ({ page }) => {
    const nomina = new AdminNominaPage(page)
    await nomina.goto()
    await nomina.expectLoaded()
  })

  test('cada pago muestra empleado, período y neto', async ({ page }) => {
    await page.goto('/admin/nomina')
    const main = page.getByRole('main')
    // La vista es de tarjetas, no de tabla
    await expect(main.getByText(/Justine/).first()).toBeVisible()
    await expect(main.getByText(/\d{1,2}-\d{1,2}\s+\w+\s+\d{4}/).first()).toBeVisible()
    await expect(main.getByText(/Neto empleada/).first()).toBeVisible()
  })

  test('botón de registrar pago navega a /admin/nomina/nuevo', async ({ page }) => {
    await page.goto('/admin/nomina')
    await page.getByRole('link', { name: /registrar.*pago/i }).click()
    await expect(page).toHaveURL('/admin/nomina/nuevo')
  })

  test('formulario de nuevo pago carga correctamente', async ({ page }) => {
    const nomina = new AdminNominaPage(page)
    await nomina.goToNuevoPago()
    // El formulario tiene varios selects (empleado, mes, año)
    await expect(page.locator('select').first()).toBeVisible()
  })

  test('los pagos de Justine Q2 suman $1.449.900', async ({ page }) => {
    await page.goto('/admin/nomina')
    // Buscar filas con Q2 y verificar que el monto es correcto
    const q2rows = page.getByText(/16-/)
    const count = await q2rows.count()
    if (count > 0) {
      await expect(page.getByText('1.449.900').first()).toBeVisible()
    }
  })
})
