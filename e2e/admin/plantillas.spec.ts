import { test, expect } from '@playwright/test'

test.describe('Admin — Plantillas de Tareas', () => {
  test('carga la página con el resumen', async ({ page }) => {
    await page.goto('/admin/plantillas')
    await expect(page.getByRole('heading', { name: 'Plantillas de Tareas' })).toBeVisible()
    await expect(page.getByText('Cargos con plantilla', { exact: true })).toBeVisible()
    await expect(page.getByText('Tareas activas', { exact: true })).toBeVisible()
  })

  test('muestra la plantilla del cargo con sus 6 tareas', async ({ page }) => {
    await page.goto('/admin/plantillas')
    const main = page.getByRole('main')
    await expect(main.getByText('Asistente Administrativa y Financiera').first()).toBeVisible()
    await expect(main.getByText(/Documentación física y digital/)).toBeVisible()
    await expect(main.getByText(/Comunicación oportuna con el jefe inmediato/)).toBeVisible()
  })

  test('el modal de nuevo cargo abre con sus campos', async ({ page }) => {
    await page.goto('/admin/plantillas')
    await page.getByRole('button', { name: /nuevo cargo/i }).click()
    await expect(page.getByRole('heading', { name: /nueva plantilla de cargo/i })).toBeVisible()
    await expect(page.getByText('Cargo', { exact: true })).toBeVisible()
    await expect(page.getByText('Primera tarea')).toBeVisible()
  })

  test('el modal de duplicar plantilla abre', async ({ page }) => {
    await page.goto('/admin/plantillas')
    await page.getByRole('button', { name: /duplicar a otro cargo/i }).first().click()
    await expect(page.getByRole('heading', { name: /duplicar plantilla/i })).toBeVisible()
    await expect(page.getByText('Cargo de destino')).toBeVisible()
  })

  test('el modal de agregar tarea abre', async ({ page }) => {
    await page.goto('/admin/plantillas')
    await page.getByRole('button', { name: /agregar tarea/i }).first().click()
    await expect(page.getByRole('heading', { name: /agregar tarea/i })).toBeVisible()
  })

  test('avisa que editar la plantilla no altera revisiones ya creadas', async ({ page }) => {
    await page.goto('/admin/plantillas')
    await expect(page.getByText(/no altera las revisiones ya creadas/i)).toBeVisible()
  })
})
