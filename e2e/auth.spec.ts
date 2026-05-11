import { test, expect } from '@playwright/test'
import { LoginPage } from './pom/LoginPage'

// Todas estas pruebas corren SIN sesión activa

test.describe('Protección de rutas', () => {
  test('redirige a /login si no hay sesión', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL('/login')
  })

  test('ruta de cliente protegida', async ({ page }) => {
    await page.goto('/client')
    await expect(page).toHaveURL('/login')
  })

  test('ruta de empleado protegida', async ({ page }) => {
    await page.goto('/employee')
    await expect(page).toHaveURL('/login')
  })

  test('ruta de nómina protegida', async ({ page }) => {
    await page.goto('/admin/nomina')
    await expect(page).toHaveURL('/login')
  })

  test('ruta de ingresos protegida', async ({ page }) => {
    await page.goto('/admin/ingresos')
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Login', () => {
  test('muestra la página de login correctamente', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.expectOnLoginPage()
    await expect(page.getByPlaceholder('Correo electrónico')).toBeVisible()
    await expect(page.getByPlaceholder('Contraseña')).toBeVisible()
  })

  test('muestra error con credenciales incorrectas', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('noexiste@test.com', 'wrongpass')
    await loginPage.expectError()
  })

  test('admin entra y llega a /admin', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.loginAsAdmin()
    await expect(page).toHaveURL('/admin')
  })

  test('cliente entra y llega a /client', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.loginAsClient()
    await expect(page).toHaveURL('/client')
  })

  test('empleado entra y llega a /employee', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.loginAsEmployee()
    await expect(page).toHaveURL('/employee')
  })

  test('usuario logueado en /login es redirigido a su dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.loginAsAdmin()

    // Intentar ir a /login estando logueado → redirige a /admin
    await page.goto('/login')
    await expect(page).toHaveURL('/admin')
  })
})
