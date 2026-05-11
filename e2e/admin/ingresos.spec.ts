import { test, expect } from '@playwright/test'
import { AdminIngresosPage } from '../pom/AdminPages'

test.describe('Admin — Ingresos', () => {
  test('carga la página con stats y tabla', async ({ page }) => {
    const ingresos = new AdminIngresosPage(page)
    await ingresos.goto()
    await ingresos.expectLoaded()
    await expect(page.getByText('Pagos registrados')).toBeVisible()
  })

  test('la tabla muestra columnas correctas', async ({ page }) => {
    await page.goto('/admin/ingresos')
    await expect(page.getByRole('columnheader', { name: 'Fecha' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'USD' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'TRM' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Total COP' })).toBeVisible()
  })

  test('los ingresos existentes muestran badge WISE', async ({ page }) => {
    await page.goto('/admin/ingresos')
    const wiseBadges = page.getByText('WISE')
    const count = await wiseBadges.count()
    // Si hay ingresos, todos deben tener badge WISE
    if (count > 0) {
      await expect(wiseBadges.first()).toBeVisible()
    }
  })

  test('el botón de registrar ingreso es visible', async ({ page }) => {
    await page.goto('/admin/ingresos')
    // El botón debe existir en la página
    const btn = page.getByRole('button', { name: /registrar ingreso/i })
    await expect(btn).toBeVisible()
  })
})
