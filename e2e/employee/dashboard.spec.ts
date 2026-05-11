import { test, expect } from '@playwright/test'
import { EmployeeDashboardPage } from '../pom/EmployeePages'

test.describe('Empleado — Dashboard', () => {
  test('carga el panel con las 3 cards principales', async ({ page }) => {
    const dashboard = new EmployeeDashboardPage(page)
    await dashboard.goto()
    await dashboard.expectLoaded()
    await expect(page.getByText('Salario base')).toBeVisible()
    await expect(page.getByText('Fecha de inicio')).toBeVisible()
  })

  test('muestra el salario correcto de Justine ($1.150.000)', async ({ page }) => {
    await page.goto('/employee')
    await expect(page.getByText('1.150.000')).toBeVisible()
  })

  test('muestra sección de últimas colillas', async ({ page }) => {
    await page.goto('/employee')
    await expect(page.getByText('Últimas Colillas')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ver todas' }).first()).toBeVisible()
  })

  test('muestra sección de mis incapacidades', async ({ page }) => {
    await page.goto('/employee')
    await expect(page.getByText('Mis Incapacidades')).toBeVisible()
  })

  test('el link Ver todas de colillas navega a /employee/colillas', async ({ page }) => {
    await page.goto('/employee')
    await page.getByRole('link', { name: 'Ver todas' }).first().click()
    await expect(page).toHaveURL('/employee/colillas')
  })
})
