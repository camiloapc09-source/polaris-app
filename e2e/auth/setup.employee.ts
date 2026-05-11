import { test as setup } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const authFile = path.join('playwright', '.auth', 'employee.json')

setup('autenticar empleado', async ({ page }) => {
  fs.mkdirSync(path.join('playwright', '.auth'), { recursive: true })

  await page.goto('/login')
  await page.fill('input[type="email"]', 'justine@koversolutions.com')
  await page.fill('input[type="password"]', 'justine123')
  await page.click('button[type="submit"]')

  await page.waitForURL('/employee', { timeout: 15_000 })
  await page.context().storageState({ path: authFile })
})
