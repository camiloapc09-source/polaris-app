import { test, expect, devices } from '@playwright/test'

test.use({ ...devices['Pixel 7'], viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true })

const PAGINAS_EMPLEADO = [
  ['/employee', 'Mi Panel'],
  ['/employee/colillas', 'Colillas'],
  ['/employee/incapacidades', 'Incapacidades'],
  ['/employee/incapacidades/nueva', 'Nueva incapacidad'],
  ['/employee/certificados', 'Certificados'],
  ['/employee/examenes', 'Exámenes'],
  ['/employee/desempeno', 'Mi Desempeño'],
  ['/employee/bienestar', 'Bienestar'],
  ['/employee/cuenta', 'Mi Cuenta'],
] as const

test.describe('Móvil — Empleado', () => {
  test('el menú abre y navega a Mi Desempeño', async ({ page }) => {
    await page.goto('/employee')
    await page.getByRole('button', { name: /abrir menú/i }).click()

    const link = page.getByRole('link', { name: 'Mi Desempeño' })
    await expect(link).toBeVisible()
    await link.click()
    await expect(page).toHaveURL('/employee/desempeno')
  })

  for (const [ruta, nombre] of PAGINAS_EMPLEADO) {
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
