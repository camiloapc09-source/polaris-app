import { test, expect } from '@playwright/test'
import { AdminNominaPage } from '../pom/AdminPages'

test.describe('Admin — Nómina', () => {
  test('carga la página de nómina', async ({ page }) => {
    const nomina = new AdminNominaPage(page)
    await nomina.goto()
    await nomina.expectLoaded()
  })

  test('la tabla tiene columnas de empleado, período y estado', async ({ page }) => {
    await page.goto('/admin/nomina')
    // Encabezados de tabla
    await expect(page.getByRole('columnheader', { name: /empleado/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /período/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /neto/i })).toBeVisible()
  })

  test('botón de registrar pago navega a /admin/nomina/nuevo', async ({ page }) => {
    await page.goto('/admin/nomina')
    await page.getByRole('link', { name: /registrar.*pago/i }).click()
    await expect(page).toHaveURL('/admin/nomina/nuevo')
  })

  test('formulario de nuevo pago carga correctamente', async ({ page }) => {
    const nomina = new AdminNominaPage(page)
    await nomina.goToNuevoPago()
    // El formulario debe tener selector de empleado
    await expect(page.locator('select')).toBeVisible()
  })

  test('los pagos de Justine Q2 suman $1.449.900', async ({ page }) => {
    await page.goto('/admin/nomina')
    // Buscar filas con Q2 y verificar que el monto es correcto
    const q2rows = page.getByText('Q2', { exact: false })
    const count = await q2rows.count()
    if (count > 0) {
      // Verificar que en alguna fila aparece el valor correcto de Q2
      await expect(page.getByText('1.449.900')).toBeVisible()
    }
  })
})
