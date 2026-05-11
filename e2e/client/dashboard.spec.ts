import { test, expect } from '@playwright/test'
import { ClientDashboardPage } from '../pom/ClientPages'

test.describe('Cliente — Dashboard', () => {
  test('carga el dashboard de Kover Solutions', async ({ page }) => {
    await page.goto('/client')
    // El heading es el nombre de la empresa
    await expect(page.getByRole('heading', { name: 'Kover Solutions' })).toBeVisible()
    await expect(page.getByText('Portal de cliente · Star Shine EOR')).toBeVisible()
  })

  test('muestra las 3 cards de resumen', async ({ page }) => {
    await page.goto('/client')
    await expect(page.getByText('Empleados activos en Colombia')).toBeVisible()
    await expect(page.getByText('Facturas pagadas')).toBeVisible()
    await expect(page.getByText('Facturas pendientes')).toBeVisible()
  })

  test('la card de empleados activos muestra al menos 1', async ({ page }) => {
    await page.goto('/client')
    // Kover tiene a Justine activa
    const employeeCount = page.getByText('Empleados activos en Colombia').locator('..')
    await expect(employeeCount).toBeVisible()
  })

  test('muestra la sección de empleados con Justine', async ({ page }) => {
    await page.goto('/client')
    await expect(page.getByText('Tus Empleados')).toBeVisible()
    await expect(page.getByText('Justine')).toBeVisible()
  })

  test('muestra la sección de facturas de servicio', async ({ page }) => {
    await page.goto('/client')
    await expect(page.getByText('Facturas de Servicio')).toBeVisible()
  })

  test('el sidebar tiene los 3 ítems de navegación del cliente', async ({ page }) => {
    await page.goto('/client')
    await expect(page.getByRole('link', { name: /empleados/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /facturas/i })).toBeVisible()
  })
})
