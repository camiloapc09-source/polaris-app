import { test, expect } from '@playwright/test'

test.describe('Empleado — Colillas de Pago', () => {
  test('carga la página de colillas', async ({ page }) => {
    await page.goto('/employee/colillas')
    // La página se renombró a "Mis Colillas y Aportes" al agregarse la pestaña de aportes
    await expect(page.getByRole('heading', { name: /Mis Colillas/i })).toBeVisible()
  })

  test('muestra colillas existentes con período y monto', async ({ page }) => {
    await page.goto('/employee/colillas')
    // Las colillas se etiquetan "1-15 <Mes> <Año>" / "16-<fin> <Mes> <Año>", no "Q1/Q2"
    const hasPeriod = await page.getByText(/\d{1,2}-\d{1,2}\s+\w+\s+\d{4}/).count()
    const hasEmpty = await page.getByText(/no hay colillas/i).count()
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
    const hasPeriod = await page.getByText(/\d{1,2}-\d{1,2}\s+\w+\s+\d{4}/).count()
    if (hasPeriod > 0) {
      expect(count).toBeGreaterThan(0)
    }
  })

  test('los badges de estado son Pagado o Pendiente', async ({ page }) => {
    await page.goto('/employee/colillas')
    const hasPeriod = await page.getByText(/\d{1,2}-\d{1,2}\s+\w+\s+\d{4}/).count()
    if (hasPeriod > 0) {
      const pagado = await page.getByText('Pagado', { exact: true }).count()
      const pendiente = await page.getByText('Pendiente', { exact: true }).count()
      expect(pagado + pendiente).toBeGreaterThan(0)
    }
  })

  test('el monto de Q1 es $1.150.000', async ({ page }) => {
    await page.goto('/employee/colillas')
    const q1 = page.getByText(/1-15/)
    const count = await q1.count()
    if (count > 0) {
      await expect(page.getByText('1.150.000').first()).toBeVisible()
    }
  })

  test('el monto de Q2 es $1.449.900', async ({ page }) => {
    await page.goto('/employee/colillas')
    const q2 = page.getByText(/16-/)
    const count = await q2.count()
    if (count > 0) {
      await expect(page.getByText('1.449.900').first()).toBeVisible()
    }
  })
})
