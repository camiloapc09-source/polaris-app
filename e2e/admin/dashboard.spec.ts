import { test, expect } from '@playwright/test'
import { AdminDashboardPage } from '../pom/AdminPages'

test.describe('Admin — Dashboard', () => {
  test('carga el dashboard con todas las métricas', async ({ page }) => {
    const dashboard = new AdminDashboardPage(page)
    await dashboard.goto()
    await dashboard.expectLoaded()
  })

  test('muestra la distribución de egresos', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByText('Distribución de Egresos')).toBeVisible()
    // Egresos = Nómina + Aportes. Las cuentas de cobro al cliente NO son egreso.
    const main = page.getByRole('main')
    await expect(main.getByText('Nómina', { exact: true })).toBeVisible()
    await expect(main.getByText('Aportes Sociales', { exact: true })).toBeVisible()
    await expect(main.getByText('Servicio Star Shine')).toHaveCount(0)
  })

  test('muestra las últimas nóminas', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByText('Últimas Nóminas')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ver todas' })).toBeVisible()
  })

  test('los accesos rápidos navegan correctamente', async ({ page }) => {
    await page.goto('/admin')

    await page.getByRole('link', { name: 'Registrar Pago' }).click()
    await expect(page).toHaveURL('/admin/nomina')

    await page.goto('/admin')
    await page.getByRole('link', { name: 'Nuevo Ingreso' }).click()
    await expect(page).toHaveURL('/admin/ingresos')

    await page.goto('/admin')
    await page.getByRole('link', { name: 'Ver Incapacidades' }).click()
    await expect(page).toHaveURL('/admin/incapacidades')
  })
})
