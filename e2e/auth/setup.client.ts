import { test as setup } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const authFile = path.join('playwright', '.auth', 'client.json')

setup('autenticar cliente', async ({ page }) => {
  fs.mkdirSync(path.join('playwright', '.auth'), { recursive: true })

  await page.goto('/login')
  await page.fill('input[type="email"]', 'admin@koversolutions.com')
  await page.fill('input[type="password"]', 'kover123')
  await page.click('button[type="submit"]')

  await page.waitForURL('/client', { timeout: 15_000 })
  await page.context().storageState({ path: authFile })
})
