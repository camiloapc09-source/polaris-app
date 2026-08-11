import { test, expect, devices } from '@playwright/test'

test.use({ ...devices['Pixel 7'], viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true })

const PAGINAS_CLIENTE = [
  ['/client', 'Dashboard'],
  ['/client/empleados', 'Empleados'],
  ['/client/pagos', 'Pagos enviados'],
  ['/client/colillas', 'Colillas y aportes'],
  ['/client/facturas', 'Facturas'],
  ['/client/examenes', 'Exámenes'],
  ['/client/bienestar', 'Bienestar'],
  ['/client/cuenta', 'Mi Cuenta'],
] as const

test.describe('Móvil — Cliente', () => {
  test('el menú abre en celular', async ({ page }) => {
    await page.goto('/client')
    await page.getByRole('button', { name: /abrir menú/i }).click()
    await expect(page.getByRole('link', { name: 'Facturas' })).toBeVisible()
  })

  test('el cliente NO ve nada de desempeño en el menú', async ({ page }) => {
    await page.goto('/client')
    await page.getByRole('button', { name: /abrir menú/i }).click()
    await expect(page.getByRole('link', { name: /desempeño/i })).toHaveCount(0)
    await expect(page.getByRole('link', { name: /plantillas/i })).toHaveCount(0)
  })

  for (const [ruta, nombre] of PAGINAS_CLIENTE) {
    test(`${nombre} no desborda horizontalmente`, async ({ page }) => {
      await page.goto(ruta)
      await page.waitForLoadState('networkidle')

      const overflow = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
      }))

      expect(
        overflow.scrollW,
        `${ruta} desborda: scrollWidth=${overflow.scrollW} vs viewport=${overflow.clientW}`,
      ).toBeLessThanOrEqual(overflow.clientW + 1)
    })
  }
})
