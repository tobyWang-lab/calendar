// Entry point (skeleton). Full implementation follows TDD.

export function init() {
  const weekBtn = document.getElementById('btn-week')
  const monthBtn = document.getElementById('btn-month')
  const todayBtn = document.getElementById('btn-today')
  const themeBtn = document.getElementById('btn-theme')

  weekBtn.addEventListener('click', () => {
    // TODO: dispatch view change to view-controller
    console.log('切換到週視圖')
  })

  monthBtn.addEventListener('click', () => {
    console.log('切換到月視圖')
  })

  todayBtn.addEventListener('click', () => {
    console.log('回到今日')
  })

  themeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light'
    const next = current === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  })
}

// Auto-init when loaded
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
