import { test, expect } from '@playwright/test'

test.describe('Empleado — Mi Desempeño', () => {
  test('carga la página', async ({ page }) => {
    await page.goto('/employee/desempeno')
    await expect(page.getByRole('heading', { name: 'Mi Desempeño' })).toBeVisible()
  })

  test('muestra el estado vacío o el historial, nunca ambos', async ({ page }) => {
    await page.goto('/employee/desempeno')
    const vacio = await page.getByText(/aún no tienes revisiones/i).count()
    const conDatos = await page.getByText('Cumplimiento promedio').count()
    expect(vacio + conDatos).toBeGreaterThan(0)
    expect(vacio === 0 || conDatos === 0).toBe(true)
  })

  test('el empleado no ve las pantallas de admin en su menú', async ({ page }) => {
    await page.goto('/employee')
    await expect(page.getByRole('link', { name: 'Plantillas de Tareas' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Nómina' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Accesos y Usuarios' })).toHaveCount(0)
  })
})
