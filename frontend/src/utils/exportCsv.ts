type Cell = string | number

export function exportCsv(filename: string, headers: string[], rows: Cell[][]) {
  const escape = (v: Cell) => `"${String(v).replace(/"/g, '""')}"`
  const lines  = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))]
  const blob   = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  a.href       = url
  a.download   = filename
  a.click()
  URL.revokeObjectURL(url)
}
