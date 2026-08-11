import { test, expect, devices } from '@playwright/test'

// Verificación en pantalla de celular. Lo crítico: que el menú lateral funcione
// como drawer y que ninguna página desborde horizontalmente (scroll lateral).

test.use({ ...devices['Pixel 7'], viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true })

const PAGINAS_ADMIN = [
  ['/admin', 'Dashboard'],
  ['/admin/clientes', 'Clientes'],
  ['/admin/empleados', 'Empleados'],
  ['/admin/nomina', 'Nómina'],
  ['/admin/aportes', 'Aportes'],
  ['/admin/ingresos', 'Ingresos'],
  ['/admin/facturas', 'Facturas'],
  ['/admin/incapacidades', 'Incapacidades'],
  ['/admin/desempeno', 'Desempeño'],
  ['/admin/plantillas', 'Plantillas'],
  ['/admin/certificados', 'Certificados'],
  ['/admin/examenes', 'Exámenes'],
  ['/admin/bienestar', 'Bienestar'],
  ['/admin/accesos', 'Accesos'],
  ['/admin/cuenta', 'Mi Cuenta'],
] as const

test.describe('Móvil — Admin', () => {
  test('la barra superior con el botón de menú es visible', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('button', { name: /abrir menú/i })).toBeVisible()
  })

  test('el menú abre, navega y se cierra', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('button', { name: /abrir menú/i }).click()

    const link = page.getByRole('link', { name: 'Desempeño', exact: true })
    await expect(link).toBeVisible()
    await link.click()

    await expect(page).toHaveURL('/admin/desempeno')
    // Al navegar el drawer debe cerrarse solo
    await expect(page.getByRole('button', { name: /abrir menú/i })).toBeVisible()
  })

  for (const [ruta, nombre] of PAGINAS_ADMIN) {
    test(`${nombre} no desborda horizontalmente`, async ({ page }) => {
      await page.goto(ruta)
      await page.waitForLoadState('networkidle')

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement
        return { scrollW: doc.scrollWidth, clientW: doc.clientWidth }
      })

      // Se tolera 1px por redondeo de subpíxel
      expect(
        overflow.scrollW,
        `${ruta} desborda: scrollWidth=${overflow.scrollW} vs viewport=${overflow.clientW}`,
      ).toBeLessThanOrEqual(overflow.clientW + 1)
    })
  }

  test('los modales caben en pantalla de celular', async ({ page }) => {
    await page.goto('/admin/facturas')
    await page.getByRole('button', { name: /nueva factura/i }).click()
    await expect(page.getByRole('heading', { name: /nueva cuenta de cobro/i })).toBeVisible()

    const overflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }))
    expect(overflow.scrollW).toBeLessThanOrEqual(overflow.clientW + 1)
  })

  test('el modal de nueva revisión de desempeño cabe en celular', async ({ page }) => {
    await page.goto('/admin/desempeno')
    await page.getByRole('button', { name: /nueva revisión/i }).click()
    await expect(page.getByRole('heading', { name: /nueva revisión mensual/i })).toBeVisible()

    const overflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }))
    expect(overflow.scrollW).toBeLessThanOrEqual(overflow.clientW + 1)
  })
})
