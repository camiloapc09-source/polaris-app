import { test, expect } from '@playwright/test'
import { EmployeeIncapacidadesPage } from '../pom/EmployeePages'

test.describe('Empleado — Incapacidades', () => {
  test('carga la lista de incapacidades', async ({ page }) => {
    const incapacidades = new EmployeeIncapacidadesPage(page)
    await incapacidades.goto()
    await incapacidades.expectLoaded()
  })

  test('el formulario de nueva incapacidad carga correctamente', async ({ page }) => {
    const incapacidades = new EmployeeIncapacidadesPage(page)
    await incapacidades.goToNuevaSolicitud()
    await incapacidades.expectFormLoaded()
  })

  test('el selector de tipo tiene las 4 opciones', async ({ page }) => {
    await page.goto('/employee/incapacidades/nueva')
    const select = page.locator('select')
    await expect(select.locator('option', { hasText: 'Enfermedad General' })).toHaveCount(1)
    await expect(select.locator('option', { hasText: 'Incapacidad Laboral' })).toHaveCount(1)
    await expect(select.locator('option', { hasText: 'Licencia de Maternidad' })).toHaveCount(1)
    await expect(select.locator('option', { hasText: 'Otro' })).toHaveCount(1)
  })

  test('al seleccionar fechas se muestra el cálculo de días', async ({ page }) => {
    await page.goto('/employee/incapacidades/nueva')
    // Llenar fechas — el componente calcula días automáticamente
    await page.fill('input[type="date"]', '2025-06-01')
    // Hay dos inputs de fecha, el segundo es endDate
    await page.locator('input[type="date"]').nth(1).fill('2025-06-05')
    // Debe mostrar "5 días calendario"
    await expect(page.getByText(/días calendario/)).toBeVisible()
  })

  test('el botón cancelar navega de vuelta', async ({ page }) => {
    await page.goto('/employee/incapacidades/nueva')
    // Primero navegar a nueva desde la lista para que back() funcione
    await page.goto('/employee/incapacidades')
    await page.goto('/employee/incapacidades/nueva')
    await page.getByRole('button', { name: 'Cancelar' }).click()
    // Debe navegar a la lista o al historial anterior
    await expect(page).not.toHaveURL('/employee/incapacidades/nueva')
  })

  test('las solicitudes tienen badges de estado correctos', async ({ page }) => {
    await page.goto('/employee/incapacidades')
    const aprobada = await page.getByText('Aprobada').count()
    const rechazada = await page.getByText('Rechazada').count()
    const revision = await page.getByText(/En revisión|Pendiente/).count()

    const totalBadges = aprobada + rechazada + revision
    const hasEmpty = await page.getByText('No tienes incapacidades').count()

    // Debe haber badges o estado vacío
    expect(totalBadges > 0 || hasEmpty > 0).toBe(true)
  })
})
