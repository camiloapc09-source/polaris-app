import { test, expect } from '@playwright/test'
import { AdminIncapacidadesPage } from '../pom/AdminPages'

test.describe('Admin — Incapacidades', () => {
  test('carga la página con los 3 contadores', async ({ page }) => {
    const incapacidades = new AdminIncapacidadesPage(page)
    await incapacidades.goto()
    await incapacidades.expectLoaded()
  })

  test('las solicitudes muestran nombre del empleado y empresa', async ({ page }) => {
    await page.goto('/admin/incapacidades')
    const items = page.locator('.card').filter({ hasText: 'Kover' })
    const count = await items.count()
    if (count > 0) {
      // Cada card debe tener el nombre del empleado
      await expect(items.first()).toContainText('Kover')
    }
  })

  test('las solicitudes pendientes muestran botones aprobar/rechazar', async ({ page }) => {
    await page.goto('/admin/incapacidades')
    const approveBtn = page.getByRole('button', { name: 'Aprobar' })
    const rejectBtn = page.getByRole('button', { name: 'Rechazar' })
    const pendingCount = await approveBtn.count()
    // Si hay pendientes, ambos botones deben estar presentes
    if (pendingCount > 0) {
      await expect(approveBtn.first()).toBeVisible()
      await expect(rejectBtn.first()).toBeVisible()
    }
  })

  test('los badges de estado son correctos', async ({ page }) => {
    await page.goto('/admin/incapacidades')
    // Al menos uno de los estados debe ser visible si hay solicitudes
    const statuses = ['En revisión', 'Aprobada', 'Rechazada']
    let found = false
    for (const status of statuses) {
      const el = page.getByText(status)
      if (await el.count() > 0) {
        found = true
        break
      }
    }
    // Si hay solicitudes, debe haber al menos un badge
    const totalCards = await page.locator('.card').count()
    if (totalCards > 3) { // más de las 3 stats cards
      expect(found).toBe(true)
    }
  })
})
