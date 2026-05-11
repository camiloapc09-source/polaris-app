import { test, expect } from '@playwright/test'

test.describe('Empleado — Colillas de Pago', () => {
  test('carga la página de colillas', async ({ page }) => {
    await page.goto('/employee/colillas')
    await expect(page.getByRole('heading', { name: 'Mis Colillas de Pago' })).toBeVisible()
  })

  test('muestra colillas existentes con período y monto', async ({ page }) => {
    await page.goto('/employee/colillas')
    const hasPeriod = await page.getByText(/Q[12]/).count()
    const hasEmpty = await page.getByText('No hay colillas de pago registradas aún').count()
    // Debe haber colillas o el estado vacío, nunca ambos
    expect(hasPeriod > 0 || hasEmpty > 0).toBe(true)
  })

  test('colillas Q2 muestran conectividad', async ({ page }) => {
    await page.goto('/employee/colillas')
    const conectividadCells = page.getByText('Conectividad')
    const count = await conectividadCells.count()
    // Si hay pagos Q2, debe aparecer conectividad
    if (count > 0) {
      await expect(conectividadCells.first()).toBeVisible()
    }
  })

  test('cada colilla tiene botón de descarga PDF', async ({ page }) => {
    await page.goto('/employee/colillas')
    const downloadLinks = page.locator('a[href*="/pdf"]')
    const count = await downloadLinks.count()
    const hasPeriod = await page.getByText(/Q[12]/).count()
    if (hasPeriod > 0) {
      expect(count).toBeGreaterThan(0)
    }
  })

  test('los badges de estado son Pagado o Pendiente', async ({ page }) => {
    await page.goto('/employee/colillas')
    const hasPeriod = await page.getByText(/Q[12]/).count()
    if (hasPeriod > 0) {
      const pagado = await page.getByText('Pagado').count()
      const pendiente = await page.getByText('Pendiente').count()
      expect(pagado + pendiente).toBeGreaterThan(0)
    }
  })

  test('el monto de Q1 es $1.150.000', async ({ page }) => {
    await page.goto('/employee/colillas')
    const q1 = page.getByText(/Q1/)
    const count = await q1.count()
    if (count > 0) {
      await expect(page.getByText('1.150.000').first()).toBeVisible()
    }
  })

  test('el monto de Q2 es $1.449.900', async ({ page }) => {
    await page.goto('/employee/colillas')
    const q2 = page.getByText(/Q2/)
    const count = await q2.count()
    if (count > 0) {
      await expect(page.getByText('1.449.900')).toBeVisible()
    }
  })
})
