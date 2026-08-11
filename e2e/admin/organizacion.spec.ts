import { test, expect } from '@playwright/test'

test.describe('Admin — Alta de clientes', () => {
  test('la página de clientes tiene el botón de nuevo cliente', async ({ page }) => {
    await page.goto('/admin/clientes')
    await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible()
    await expect(page.getByRole('button', { name: /nuevo cliente/i })).toBeVisible()
  })

  test('el modal de nuevo cliente abre con sus campos', async ({ page }) => {
    await page.goto('/admin/clientes')
    await page.getByRole('button', { name: /nuevo cliente/i }).click()
    await expect(page.getByRole('heading', { name: 'Nuevo cliente' })).toBeVisible()
    await expect(page.locator('label').filter({ hasText: 'Nombre de la empresa' })).toBeVisible()
    await expect(page.locator('label').filter({ hasText: /^País$/ })).toBeVisible()
    await expect(page.locator('label').filter({ hasText: /^Moneda$/ })).toBeVisible()
  })

  test('rechaza un cliente con nombre duplicado', async ({ page }) => {
    await page.goto('/admin/clientes')
    await page.getByRole('button', { name: /nuevo cliente/i }).click()

    // "Kover Solutions" ya existe; se prueba en minúsculas para validar
    // que el chequeo de duplicados ignora mayúsculas
    await page.locator('input').first().fill('kover solutions')
    await page.getByRole('button', { name: /crear cliente/i }).click()

    await expect(page.getByText(/ya existe un cliente/i)).toBeVisible()
  })
})

test.describe('Admin — Alta de usuarios', () => {
  test('la página de accesos tiene el botón de nuevo usuario', async ({ page }) => {
    await page.goto('/admin/accesos')
    await expect(page.getByRole('heading', { name: 'Accesos y Usuarios' })).toBeVisible()
    await expect(page.getByRole('button', { name: /nuevo usuario/i })).toBeVisible()
  })

  test('el formulario cambia los campos según el rol', async ({ page }) => {
    await page.goto('/admin/accesos')
    await page.getByRole('button', { name: /nuevo usuario/i }).click()
    await expect(page.getByRole('heading', { name: 'Nuevo usuario' })).toBeVisible()

    const rol = page.locator('select').first()

    const labelTrabajador = page.locator('label').filter({ hasText: /^Trabajador$/ })
    const labelEmpresa = page.locator('label').filter({ hasText: /^Empresa$/ })

    // Empleado → pide trabajador
    await rol.selectOption('EMPLOYEE')
    await expect(labelTrabajador).toBeVisible()
    await expect(labelEmpresa).toHaveCount(0)

    // Cliente → pide empresa
    await rol.selectOption('CLIENT')
    await expect(labelEmpresa).toBeVisible()
    await expect(labelTrabajador).toHaveCount(0)

    // Admin → no pide ninguno de los dos
    await rol.selectOption('ADMIN')
    await expect(labelTrabajador).toHaveCount(0)
    await expect(labelEmpresa).toHaveCount(0)
  })

  test('no ofrece trabajadores que ya tienen usuario', async ({ page }) => {
    await page.goto('/admin/accesos')
    await page.getByRole('button', { name: /nuevo usuario/i }).click()
    await page.locator('select').first().selectOption('EMPLOYEE')

    // Justine ya tiene usuario: o no hay selector de trabajador, o no la lista
    const aviso = await page.getByText(/no hay trabajadores sin usuario/i).count()
    if (aviso === 0) {
      const opciones = await page.locator('select').nth(1).locator('option').allTextContents()
      expect(opciones.some((o) => /justine/i.test(o))).toBe(false)
    } else {
      expect(aviso).toBe(1)
    }
  })

  test('rechaza un correo que ya existe', async ({ page }) => {
    await page.goto('/admin/accesos')
    await page.getByRole('button', { name: /nuevo usuario/i }).click()
    await page.locator('select').first().selectOption('ADMIN')

    await page.getByRole('textbox').nth(0).fill('Prueba Duplicado')
    await page.getByRole('textbox').nth(1).fill('admin@starshine.co')
    await page.getByRole('textbox').nth(2).fill('claveprueba123')
    await page.getByRole('button', { name: /crear usuario/i }).click()

    await expect(page.getByText(/ya hay un usuario con el correo/i)).toBeVisible()
  })
})
