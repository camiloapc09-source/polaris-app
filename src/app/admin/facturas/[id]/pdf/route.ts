import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const LOGO_B64 = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iQ2FwYV8xIiBkYXRhLW5hbWU9IkNhcGEgMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMTA4MCAyOTkuNDgiPgogIDxkZWZzPgogICAgPHN0eWxlPgogICAgICAuY2xzLTEgewogICAgICAgIGZpbGw6ICNmZmY7CiAgICAgIH0KCiAgICAgIC5jbHMtMiB7CiAgICAgICAgZmlsbDogI2YyNDIxYTsKICAgICAgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJtMTUsMjEyLjRoMTUuNzRjMS41LDAsMy4yOS0uOTYsNS4zNy0yLjg3LDIuMDgtMS45MiwzLjI5LTMuNjIsMy42My01LjEybDkuNDktNTIuNzNjMS44My05Ljk5LDcuMjktMTguNzQsMTYuMzctMjYuMjQsOS4wOC03LjUsMTguNjEtMTEuMjUsMjguNjEtMTEuMjVoMTUuNzR2MzYuOTloLTEzLjk5Yy0yLDAtNC4yMS44Ny02LjYyLDIuNjItMi40MSwxLjc1LTMuNzksMy42Mi00LjEyLDUuNjJsLTkuNSw1My4yMmMtMS4xNyw3LTQuNTksMTMuNS0xMC4yNSwxOS40OS05LjgzLDEwLjY2LTIwLjQxLDE2LjQxLTMxLjczLDE3LjI0LTIsLjE2LTguMjUuMjUtMTguNzQuMjV2LTM3LjIzWiIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0ibTExOC45NSw2Ni45N2gzNi43M3Y0Ni43M2gxNy45OXYzNi45OGgtMTcuOTl2NTUuMjVjMCwxLjE2LjU4LDIuNDEsMS43NSwzLjczLDEuMTYsMS4zMywyLjMzLDEuOTksMy41LDEuOTloMTQuOTl2MzYuOThoLTE3LjQ5Yy0yLjMzLDAtNS4xNy0uNS04LjQ5LTEuNS0xNS4xNi00LjUtMjQuOTktMTQuNDEtMjkuNDktMjkuNzMtMS0zLjUtMS41LTYuNjYtMS41LTkuNVY2Ni45N1oiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Im0yODEuMzcsMjQxLjM5Yy05Ljk5LDQuODMtMjAuMDcsNy4yNS0zMC4yMyw3LjI1LTE4LjMzLDAtMzMuOTktNi41Ni00Ni45OC0xOS42OS0xMi45OS0xMy4xMy0xOS40OS0yOC44OS0xOS40OS00Ny4yOHM2LjU0LTM0LjMyLDE5LjYyLTQ3LjI4YzEzLjA4LTEyLjk2LDI4Ljg2LTE5LjQ0LDQ3LjM1LTE5LjQ0LDEzLjgzLDAsMjYuNTMsNC4wNCwzOC4xMSwxMi4xMiwxMS41OCw4LjA4LDE5LjcsMTguNjEsMjQuMzYsMzEuNjEsMi42Nyw3LjUsNCwxMy43NSw0LDE4Ljc0djcxLjIxaC0zNi43M3YtNy4yNVptLTU5Ljk3LTU5LjcyYzAsOC4xNywyLjk2LDE1LjIsMi44NywyMS4xMWM1LjkxLDUuOTIsMTIuOTUsOC44NywyMS4xMSw4Ljg3czE1LjItMi45NiwyMS4xMS04Ljg3YzUuOTEtNS45MSw4Ljg3LTEyLjk1LDguODctMjEuMTFzLTIuOTItMTQuOTUtOC43NS0yMC44N2MtNS44My01LjkxLTEyLjgzLTguODctMjAuOTktOC44N3MtMTUuMjQsMi44Ny0yMS4yNCw4LjYyYy02LDUuNzUtOSwxMi43OC05LDIxLjExWiIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0ibTM4NC4wNiwxMTQuN3YzNi43M2gtMTMuOTljLTIuMTcsMC0zLjcxLjc5LTQuNjIsMi4zNy0uOTIsMS41OS0xLjM3LDIuNDYtMS4zNywyLjYydjkyLjIxaC0zNi45OXYtOTEuMjFjMC05LjY2LDMuMDQtMTguMzIsOS4xMi0yNS45OSw2LjA4LTcuNjYsMTMuODctMTIuODMsMjMuMzYtMTUuNDksMy0uODMsNS44My0xLjI1LDguNDktMS4yNWgxNS45OVoiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Im00MjUuNDQsMjEyLjRoMTUuNzRjMS41LDAsMy4yOS0uOTYsNS4zNy0yLjg3LDIuMDgtMS45MiwzLjI5LTMuNjIsMy42My01LjEybDkuNDktNTIuNzNjMS44My05Ljk5LDcuMjktMTguNzQsMTYuMzctMjYuMjQsOS4wOC03LjUsMTguNjEtMTEuMjUsMjguNjEtMTEuMjVoMTUuNzR2MzYuOTloLTEzLjk5Yy0yLDAtNC4yMS44Ny02LjYyLDIuNjItMi40MSwxLjc1LTMuNzksMy42Mi00LjEyLDUuNjJsLTkuNSw1My4yMmMtMS4xNyw3LTQuNTksMTMuNS0xMC4yNSwxOS40OS05LjgzLDEwLjY2LTIwLjQxLDE2LjQxLTMxLjczLDE3LjI0LTIsLjE2LTguMjUuMjUtMTguNzQuMjV2LTM3LjIzWiIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0ibTUzMS4zOSwyMTUuNHYtMzkuMjNjMC01LjUuMDgtMjMuNjUuMjUtNTQuNDd2LTU0LjQ3aDM2LjczdjUyLjk3YzIuMzMtLjg3LDUuNjItMiw5Ljg3LTMuNCw0LjI1LTEuNCw5LjQ1LTIuMDksMTUuNjItMi4wOWMyNC45OSwwLDQzLjU2LDExLjEsNTUuNzIsMzMuMyw0LjgzLDguODUsNy4yNSwxNy44Niw3LjI1LDI3LjAzdjczLjZoLTM2Ljczdi03MS43MmMwLS4zMy0uMzMtMi41LTEtNi41LTEuNjYtNS41LTQuODMtOS45OS05LjUtMTMuNDlzLTkuODMtNS4yNS0xNS40OS01LjI1LTExLjA0LDEuNzUtMTUuNjIsNS4yNWMtNC41OSwzLjUtNy43MSw4LjA4LTkuMzcsMTMuNzQtLjE3LjY3LS40MiwxLjkyLS43NSwzLjc1djc0LjIxaC0zNi43M2wtLjI1LTcuNXYtMjUuNzNaIi8+CiAgPHJlY3QgY2xhc3M9ImNscy0xIiB4PSI2NzUuMDciIHk9IjExNC4xOSIgd2lkdGg9IjM2LjczIiBoZWlnaHQ9IjEzNC40NCIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0ibTc5NywxMTQuOTRjMTMuMTYsMCwyNS4xMSwzLjU4LDM1Ljg2LDEwLjczLDEwLjc0LDcuMTYsMTguNywxNi43MSwyMy44NiwyOC42OCwzLjUsOC4xNSw1LjI1LDE1LjIyLDUuMjUsMjEuMnY3My4wOGgtMzYuNzN2LTcxLjAzYzAtMS42Ni0uMzMtMy4xNi0xLTQuNDktMS42Ny02LjE1LTQuOTYtMTEuMjEtOS44Ny0xNS4yLTQuOTEtMy45OS0xMC42Mi01Ljk4LTE3LjExLTUuOThzLTExLjkxLDEuOTEtMTYuNzQsNS43M2MtNC44NCwzLjgyLTguMTcsOC44MS0xMCwxNC45Ni0uMzMsMS4xNi0uNTQsMS43OS0uNjIsMS44Ny0uMDkuMDktLjI5LDEuNTQtLjYyLDQuMzZ2NjkuNzloLTM2Ljczdi03MS44M2MwLTEuODIuMjUtNC4yMy43NS03LjIzLDIuNS0xNS40Niw5Ljg3LTI4LjQzLDIyLjEyLTM4LjkxLDEyLjI0LTEwLjQ3LDI2LjExLTE1LjcxLDQxLjYxLTE1LjcxWiIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0ibTg3MC45NiwxODEuNjZjMC0xOC4zMiw2LjUtMzQuMDYsMTkuNDktNDcuMjMsMTIuOTktMTMuMTYsMjguNjUtMTkuNzQsNDYuOTctMTkuNzQsMjUuMzIsMCw0NC43MywxMS40Nyw1OC4yMiwzNC4zOS42NywxLDEuOTIsMy4yNCwzLjc1LDYuNzMsMi4zMyw0Ljk4LDUsMTAuODksOCwxNy43LDAsLjE2LjA4LjQyLjI1Ljc1di4yNWMwLC4xNy0uMDkuMjUtLjI1LjI1bC04MC43MSwzNC4xNGMyLjMzLDEuNSw1LjkxLDIuMjQsMTAuNzQsMi4yNCw5LjE2LDAsMTcuMjQtMy44MywyNC4yNC0xMS40OWg0MC4yM3YuMjVjLS42NywzLjY3LTIuNDIsOC01LjI1LDEyLjk5LTEzLjQ5LDIzLjQ5LTMzLjQsMzUuMjMtNTkuNzIsMzUuMjMtMTguMTYsMC0zMy43LTYuNTQtNDYuNi0xOS42Mi0xMi45MS0xMy4wOC0xOS4zNy0yOC42OS0xOS4zNy00Ni44NVptNjYuOTctMjkuOTljLTEzLDAtMjIuMDgsNS42Ni0yNy4yNCwxNi45OS0xLjY3LDMuNjctMi41LDYuNDEtMi41LDguMjRoLjI1bDQ2LjQ4LTE5LjQ5Yy0uMTYtLjUtMS4wOC0xLjI1LTIuNzUtMi4yNS00LjUtMi4zMy05LjI0LTMuNS0xNC4yNC0zLjVaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtMTAxNS4wNSwxNTIuODdjLS43NS0xLjc4LTEuNjYtMy41MS0yLjIyLTUuMzUtNS44LTE5LjE1LTE4LjgyLTMxLjE5LTM3LjE0LTM4LjIzLTIuNzQtMS4wNS01LjEtMy4wNy03LjY0LTQuNjUsMi41My0xLjIyLDQuOTgtMi43MSw3LjYxLTMuNjMsMTkuNzYtNi45MiwzMi41OC0yMC4zOSwzOC41OS00MC4zOS4zNi0xLjE5LjYzLTIuNDEsMS4wMi0zLjU5LjE0LS40Mi41LS43NywxLjUxLTIuMjQsNi44MywyNS44OSwyMi4yMyw0Mi4zNCw0OC4yMiw0OS4xMS0yNS44NSw3LjEyLTQxLjg3LDIzLjU0LTQ4LjE5LDQ5LjQ2LS41OS0uMTYtMS4xOC0uMzMtMS43Ny0uNDlaIi8+Cjwvc3ZnPg=='

function fmt(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)
}

function formatDateES(d: Date) {
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  const user = session?.user as any
  if (!user) return new Response('Unauthorized', { status: 401 })

  const invoice = await prisma.serviceInvoice.findUnique({
    where: { id },
    include: { company: true },
  })

  if (!invoice) return new Response('Not found', { status: 404 })

  const isAdmin = user.role === 'ADMIN'
  const isClientOwner = user.role === 'CLIENT' && invoice.companyId === user.companyId
  if (!isAdmin && !isClientOwner) return new Response('Forbidden', { status: 403 })

  interface LineItem {
    description: string
    subtitle: string
    period: string
    baseAmount: number
    hasIVA: boolean
    gastosAmount: number
    ivaAmount: number
    total: number
  }

  let items: LineItem[] = []
  try {
    const raw = invoice.lineItemsJson
    if (Array.isArray(raw)) items = raw as unknown as LineItem[]
  } catch {}

  const invoiceDate = invoice.invoiceDate ?? invoice.createdAt
  const invNum = invoice.invoiceNumber ?? '—'
  const DOT_COLORS = ['#4329A6', '#F2421A']

  const tableRows = items.map((item, idx) => {
    const dot = DOT_COLORS[idx % 2]
    const ivaCell = item.ivaAmount > 0 ? fmt(item.ivaAmount) : '&mdash;'
    const totalClass = idx % 2 === 0 ? 'total-purple' : 'total-orange'
    return `
      <tr>
        <td class="desc">
          <div class="desc-wrap">
            <span class="dot" style="background:${dot}"></span>
            <span>
              <span class="desc-title">${item.description}</span>
              ${item.subtitle ? `<span class="desc-sub">${item.subtitle}</span>` : ''}
            </span>
          </div>
        </td>
        <td>${item.period || '&mdash;'}</td>
        <td>${fmt(item.baseAmount)}</td>
        <td>${fmt(item.gastosAmount)}</td>
        <td>${ivaCell}</td>
        <td class="${totalClass}">${fmt(item.total)}</td>
      </tr>`
  }).join('')

  const summaryRows = items.map(item => `
    <div class="sub-row">
      <span>${item.description}${item.subtitle ? ` &mdash; ${item.subtitle}` : ''}</span>
      <span class="sub-val">${fmt(item.total)}</span>
    </div>`
  ).join('')

  const company = invoice.company

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="color-scheme" content="light">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cuenta de Cobro No. ${invNum} — Star Shine Productions S.A.S.</title>
<style>
  :root {
    color-scheme: light;
    --dark:   #0D0D1A;
    --purple: #4329A6;
    --orange: #F2421A;
    --cream:  #F8F6F2;
    --alt:    #EAE6F8;
    --border: #DDD8CE;
    --sub:    #C8BEF0;
    --gray:   #777777;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #c9c9c9; }
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    display: flex; justify-content: center;
    padding: 30px 16px;
    -webkit-font-smoothing: antialiased;
  }
  .invoice {
    width: 850px; min-height: 1100px;
    background: var(--cream);
    box-shadow: 0 6px 30px rgba(0,0,0,.25);
    position: relative; display: flex; flex-direction: column;
  }
  .header {
    background: var(--purple); height: 165px; padding: 0 30px;
    display: flex; flex-direction: column; justify-content: center; position: relative;
  }
  .header-inner { display: flex; align-items: center; justify-content: space-between; }
  .logo { height: 95px; width: auto; display: block; }
  .header-sub { position: absolute; left: 30px; bottom: 18px; font-size: 10px; color: var(--sub); letter-spacing: .3px; }
  .badge { background: var(--orange); border-radius: 9px; width: 248px; padding: 14px 0; text-align: center; }
  .badge-label  { font-size: 10px; font-weight: 700; color: #fff; letter-spacing: 1.4px; text-transform: uppercase; display: block; }
  .badge-number { font-size: 34px; font-weight: 800; color: #fff; display: block; line-height: 1.15; }
  .badge-date   { font-size: 10px; color: #fff; display: block; }
  .header-stripe { height: 6px; background: var(--orange); }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 22px 30px 18px; }
  .party-box { background: #fff; border: 1px solid var(--border); border-radius: 7px; padding: 16px 18px 16px 22px; position: relative; overflow: hidden; min-height: 120px; }
  .party-box::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 6px; }
  .party-box.emisor::before   { background: var(--purple); }
  .party-box.receptor::before { background: var(--orange); }
  .party-tag { font-size: 8.5px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; margin-bottom: 9px; }
  .emisor   .party-tag { color: var(--purple); }
  .receptor .party-tag { color: var(--orange); }
  .party-name { font-size: 12px; font-weight: 700; color: #111; margin-bottom: 7px; }
  .party-line { font-size: 10px; color: #333; line-height: 1.9; }
  .party-line strong { font-weight: 700; color: #111; }
  .table-wrap { padding: 0 30px; }
  table { width: 100%; border-collapse: collapse; border: 1px solid var(--border); }
  thead tr { background: var(--purple); }
  thead th { font-size: 9px; font-weight: 700; color: #fff; padding: 11px 8px; text-align: center; white-space: nowrap; }
  thead th:first-child { text-align: left; padding-left: 34px; }
  tbody tr:nth-child(odd)  { background: #fff; }
  tbody tr:nth-child(even) { background: var(--alt); }
  tbody td { font-size: 10px; color: #222; padding: 14px 8px; text-align: center; vertical-align: middle; border-bottom: 1px solid var(--border); }
  td.desc { text-align: left; padding-left: 14px; }
  .desc-wrap { display: flex; align-items: center; gap: 11px; }
  .dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; display: inline-block; }
  .desc-title { font-size: 10.5px; font-weight: 700; color: #111; display: block; }
  .desc-sub   { font-size: 8.5px; color: var(--gray); display: block; margin-top: 2px; }
  td.total-purple { color: var(--purple); font-weight: 700; }
  td.total-orange { color: var(--orange); font-weight: 700; }
  .bottom-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 24px 30px 0; }
  .panel { background: #fff; border: 1px solid var(--border); border-radius: 7px; overflow: hidden; }
  .panel-header { padding: 10px 16px; }
  .panel-header.purple { background: var(--purple); }
  .panel-header.orange  { background: var(--orange); }
  .panel-header span { font-size: 9px; font-weight: 700; color: #fff; letter-spacing: 1.1px; text-transform: uppercase; }
  .panel-body { padding: 16px 16px; }
  .pago-row { display: flex; font-size: 10px; margin-bottom: 11px; line-height: 1.4; }
  .pago-label { font-weight: 700; color: #111; min-width: 78px; flex-shrink: 0; }
  .pago-val   { color: #333; }
  .sub-row { display: flex; justify-content: space-between; font-size: 10px; color: #333; margin-bottom: 11px; }
  .sub-row .sub-val { font-weight: 700; color: #111; }
  .total-row { background: var(--purple); border-radius: 6px; display: flex; justify-content: space-between; align-items: center; padding: 13px 16px; margin-top: 6px; }
  .total-label { font-size: 14px; font-weight: 800; color: #fff; }
  .total-val   { font-size: 15px; font-weight: 800; color: var(--orange); }
  .footer { background: var(--dark); border-top: 4px solid var(--purple); display: flex; justify-content: space-between; align-items: center; padding: 16px 30px; margin-top: auto; }
  .f-name  { font-size: 10px; font-weight: 700; color: #fff; margin-bottom: 4px; letter-spacing: .3px; }
  .f-line  { font-size: 9px; color: var(--sub); line-height: 1.7; }
  .footer-right { text-align: right; }
  @media print {
    body { background: none; padding: 0; }
    .invoice { box-shadow: none; width: 100%; min-height: 100vh; }
    @page { margin: 0; size: letter; }
  }
</style>
</head>
<body>
<div class="invoice">
  <div class="header">
    <div class="header-inner">
      <img class="logo" src="${LOGO_B64}" alt="Star Shine Productions">
      <div class="badge">
        <span class="badge-label">Cuenta de Cobro</span>
        <span class="badge-number">No. ${invNum}</span>
        <span class="badge-date">${formatDateES(invoiceDate)}</span>
      </div>
    </div>
    <p class="header-sub">
      NIT 901.623.011-3 &nbsp;&middot;&nbsp; Barranquilla, Atl&aacute;ntico &nbsp;&middot;&nbsp; starshineproductionssas@gmail.com
    </p>
  </div>
  <div class="header-stripe"></div>

  <div class="parties">
    <div class="party-box emisor">
      <p class="party-tag">Emisor</p>
      <p class="party-name">STAR SHINE PRODUCTIONS S.A.S.</p>
      <p class="party-line">NIT: 901.623.011-3</p>
      <p class="party-line">Rep. Legal: Camilo Andr&eacute;s Pont&oacute;n Camargo</p>
      <p class="party-line">CC: 1.048.327.793</p>
      <p class="party-line">starshineproductionssas@gmail.com</p>
      <p class="party-line">Barranquilla, Atl&aacute;ntico, Colombia</p>
    </div>
    <div class="party-box receptor">
      <p class="party-tag">Receptor</p>
      <p class="party-name">${company.name.toUpperCase()}</p>
      ${company.country === 'US' ? '<p class="party-line">Empresa constituida bajo las leyes de EE.UU.</p>' : `<p class="party-line">${company.country}</p>`}
      ${company.contactName ? `<p class="party-line">Responsables:</p><p class="party-line"><strong>${company.contactName}</strong></p>` : ''}
      ${company.contactEmail ? `<p class="party-line">${company.contactEmail}</p>` : ''}
    </div>
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th style="width:33%;text-align:left;padding-left:34px">Descripci&oacute;n y concepto</th>
          <th style="width:14%">Per&iacute;odo</th>
          <th style="width:13%">Valor base</th>
          <th style="width:17%">Imp. y gastos bancarios</th>
          <th style="width:10%">IVA (19%)</th>
          <th style="width:13%">Total</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  </div>

  <div class="bottom-panels">
    <div class="panel">
      <div class="panel-header purple"><span>Datos de Pago</span></div>
      <div class="panel-body">
        <div class="pago-row"><span class="pago-label">Titular:</span><span class="pago-val">Mar&iacute;a Camila Pont&oacute;n Camargo</span></div>
        <div class="pago-row"><span class="pago-label">CC:</span><span class="pago-val">1.002.153.088</span></div>
        <div class="pago-row"><span class="pago-label">Banco:</span><span class="pago-val">Bancolombia</span></div>
        <div class="pago-row"><span class="pago-label">Tipo:</span><span class="pago-val">Ahorros / A la mano</span></div>
        <div class="pago-row"><span class="pago-label">N&uacute;mero:</span><span class="pago-val">91276281564</span></div>
        <div class="pago-row"><span class="pago-label">Concepto:</span><span class="pago-val">Cuenta de Cobro No. ${invNum} &mdash; KOVER</span></div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header orange"><span>Resumen de Totales</span></div>
      <div class="panel-body">
        ${summaryRows}
        <div class="total-row">
          <span class="total-label">TOTAL</span>
          <span class="total-val">${fmt(invoice.total)}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-left">
      <p class="f-name">CAMILO ANDR&Eacute;S PONT&Oacute;N CAMARGO</p>
      <p class="f-line">CC: 1.048.327.793 &nbsp;&middot;&nbsp; Representante Legal</p>
      <p class="f-line">STAR SHINE PRODUCTIONS S.A.S. &nbsp;&middot;&nbsp; NIT: 901.623.011-3</p>
    </div>
    <div class="footer-right">
      <p class="f-line">CC No. ${invNum} &nbsp;&middot;&nbsp; ${formatDateES(invoiceDate)}</p>
      <p class="f-line">Doc. v&aacute;lido Art. 2 Decreto 522/2003</p>
    </div>
  </div>
</div>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
