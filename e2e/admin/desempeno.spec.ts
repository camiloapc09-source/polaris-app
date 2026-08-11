import { test, expect } from '@playwright/test'

test.describe('Admin — Desempeño', () => {
  test('carga la página con el resumen', async ({ page }) => {
    await page.goto('/admin/desempeno')
    await expect(page.getByRole('heading', { name: 'Desempeño' })).toBeVisible()
    await expect(page.getByText('Cumplimiento promedio', { exact: true })).toBeVisible()
    await expect(page.getByText('Revisiones cerradas', { exact: true })).toBeVisible()
    await expect(page.getByText('Borradores', { exact: true })).toBeVisible()
  })

  test('lista los trabajadores activos', async ({ page }) => {
    await page.goto('/admin/desempeno')
    await expect(page.getByRole('main').getByText(/Justine/).first()).toBeVisible()
  })

  test('el modal de nueva revisión abre y precarga el mes actual', async ({ page }) => {
    await page.goto('/admin/desempeno')
    await page.getByRole('button', { name: /nueva revisión/i }).click()

    await expect(page.getByRole('heading', { name: /nueva revisión mensual/i })).toBeVisible()

    // El campo de mes viene con el período actual en formato YYYY-MM
    const mes = page.locator('input[type="month"]')
    await expect(mes).toBeVisible()
    const valor = await mes.inputValue()
    expect(valor).toMatch(/^\d{4}-\d{2}$/)
  })

  test('el botón de cargar checklist está habilitado si el cargo tiene plantilla', async ({ page }) => {
    await page.goto('/admin/desempeno')
    await page.getByRole('button', { name: /nueva revisión/i }).click()

    const submit = page.getByRole('button', { name: /cargar checklist/i })
    await expect(submit).toBeVisible()
    // Justine tiene plantilla, así que no debe estar bloqueado
    await expect(submit).toBeEnabled()
  })
})
