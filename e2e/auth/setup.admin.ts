import { test as setup } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const authFile = path.join('playwright', '.auth', 'admin.json')

setup('autenticar admin', async ({ page }) => {
  fs.mkdirSync(path.join('playwright', '.auth'), { recursive: true })

  await page.goto('/login')
  await page.fill('input[type="email"]', 'admin@starshine.co')
  await page.fill('input[type="password"]', 'admin123')
  await page.click('button[type="submit"]')

  await page.waitForURL('/admin', { timeout: 15_000 })
  await page.context().storageState({ path: authFile })
})
