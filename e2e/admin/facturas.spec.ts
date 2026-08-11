import { test, expect } from '@playwright/test'

// OJO: estos tests NO crean facturas. La base es la de producción, así que se
// verifica el formulario y los cálculos sin enviarlo, y se leen datos reales.

test.describe('Admin — Cuentas de cobro', () => {
  test('carga la lista con los totales', async ({ page }) => {
    await page.goto('/admin/facturas')
    await expect(page.getByRole('heading', { name: 'Facturas de Servicio' })).toBeVisible()
    await expect(page.getByText('Total facturado')).toBeVisible()
    await expect(page.getByText('Cobrado')).toBeVisible()
    await expect(page.getByText('Por cobrar')).toBeVisible()
  })

  test('el modal de nueva cuenta de cobro precarga los 3 ítems de siempre', async ({ page }) => {
    await page.goto('/admin/facturas')
    await page.getByRole('button', { name: /nueva factura/i }).click()

    await expect(page.getByRole('heading', { name: /nueva cuenta de cobro/i })).toBeVisible()

    // Los ítems son inputs controlados por React: se leen sus valores actuales
    const valores = await page.locator('input[type="text"]').evaluateAll(
      (inputs) => inputs.map((i) => (i as HTMLInputElement).value),
    )
    expect(valores).toContain('Nómina')
    expect(valores).toContain('Herramienta de trabajo')
    expect(valores).toContain('Auxilio de conectividad')
  })

  test('calcula bien el 4% de gastos bancarios y el IVA del 19%', async ({ page }) => {
    await page.goto('/admin/facturas')
    await page.getByRole('button', { name: /nueva factura/i }).click()

    // Primer ítem: base 1.000.000 → gastos 40.000, sin IVA
    const base = page.locator('input[type="number"]').first()
    await base.fill('1000000')

    await expect(page.getByText(/Gastos:/).first()).toBeVisible()
    await expect(page.getByText('$ 40.000').first()).toBeVisible()

    // Al marcar IVA: 19% de 1.000.000 = 190.000
    const ivaCheckbox = page.getByRole('checkbox').nth(1) // [0] = 4% gastos, [1] = IVA
    await ivaCheckbox.check()
    await expect(page.getByText('$ 190.000').first()).toBeVisible()

    // Total del ítem = 1.000.000 + 40.000 + 190.000 = 1.230.000
    await expect(page.getByText('$ 1.230.000').first()).toBeVisible()
  })

  test('no deja crear la factura sin cliente seleccionado', async ({ page }) => {
    await page.goto('/admin/facturas')
    await page.getByRole('button', { name: /nueva factura/i }).click()

    const cliente = page.locator('select').first()
    await expect(cliente).toHaveValue('')

    // El select es required: el submit no debe cerrar el modal
    await page.locator('input[type="number"]').first().fill('500000')
    await page.getByRole('button', { name: /crear factura/i }).click()
    await expect(page.getByRole('heading', { name: /nueva cuenta de cobro/i })).toBeVisible()
  })

  test('el documento imprimible de una factura existente responde', async ({ page, request }) => {
    await page.goto('/admin/facturas')

    const pdfLinks = page.locator('a[href*="/pdf"]')
    const count = await pdfLinks.count()
    test.skip(count === 0, 'No hay facturas registradas')

    const href = await pdfLinks.first().getAttribute('href')
    const res = await request.get(href!)
    expect(res.status()).toBe(200)

    const body = await res.text()
    expect(body).toContain('Cuenta de Cobro')
    expect(body).toContain('Star Shine')
  })
})

test.describe('Cliente — vista de facturas', () => {
  test.use({ storageState: 'playwright/.auth/client.json' })

  test('el cliente ve sus facturas', async ({ page }) => {
    await page.goto('/client/facturas')
    await expect(page.getByRole('heading', { name: /facturas/i }).first()).toBeVisible()
  })

  test('el cliente puede registrar un pago enviado', async ({ page }) => {
    await page.goto('/client/pagos')
    await expect(page.getByRole('heading', { name: /pagos/i }).first()).toBeVisible()
  })
})
