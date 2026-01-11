import { startOfMonth as dfStartOfMonth, addDays as dfAddDays, startOfWeek as dfStartOfWeek, format as dfFormat, parseISO as dfParseISO } from 'date-fns'

function toLocalYMD(d){
  const date = typeof d === 'string' ? dfParseISO(d) : d
  return dfFormat(date, 'yyyy-MM-dd')
} 

export function renderMonth(container, monthDate, events = [], lunarData = {}){
  container.innerHTML = ''
  const root = document.createElement('div')
  root.className = 'month-view-root'

  const grid = document.createElement('div')
  grid.className = 'month-grid'

  // compute first day to render: start of week of start of month
  const start = dfStartOfWeek(dfStartOfMonth(monthDate), { weekStartsOn: 1 })

  const dayCells = []
  // counter to assign month-relative index (1-based) to same-month cells
  let monthCounter = 0
  for(let i=0;i<42;i++){
    const d = dfAddDays(start, i)
    const iso = toLocalYMD(d)
    const cell = document.createElement('div')
    cell.className = 'month-cell'
    cell.setAttribute('data-date', iso)
    // overall grid index (1-based)
    cell.setAttribute('data-grid-index', String(i+1))

    const header = document.createElement('div')
    header.className = 'date-header'
    header.textContent = String(d.getDate())
    // lunar
    if(lunarData && lunarData[iso]){
      header.setAttribute('data-lunar', lunarData[iso])
    }

    // determine same-month using YYYY-MM string (avoid timezone edge cases)
    const sameMonthKey = iso.slice(0,7)
    const viewMonthKey = toLocalYMD(monthDate).slice(0,7)
    if(sameMonthKey !== viewMonthKey){
      cell.classList.add('other-month')
      header.classList.add('muted')
    } else {
      // assign month-relative index
      monthCounter += 1
      cell.setAttribute('data-month-index', String(monthCounter))
    }

    // highlight the view's current date (e.g., currentDate from ViewState)
    const currentViewISO = toLocalYMD(monthDate)
    if(iso === currentViewISO){
      const dot = document.createElement('span')
      dot.className = 'today-dot'
      header.appendChild(dot)
    }

    const eventsWrap = document.createElement('div')
    eventsWrap.className = 'event-summary'

    // collect events for this date (compare local YYYY-MM-DD to avoid timezone shifts)
    const dayEvents = events.filter(ev => {
      const s = typeof ev.start === 'string' ? dfParseISO(ev.start) : ev.start
      return dfFormat(s, 'yyyy-MM-dd') === iso
    })

    dayEvents.slice(0,3).forEach(ev => {
      const it = document.createElement('div')
      // mark summary items as clickable event entries and give them event-item styling
      it.className = 'item event event-item'
      it.setAttribute('data-id', ev.id)
      it.setAttribute('role','button')
      it.textContent = ev.title
      eventsWrap.appendChild(it)
    })

    if(dayEvents.length > 3){
      const more = document.createElement('div')
      more.className = 'more-count'
      more.textContent = `+${dayEvents.length - 3}`
      eventsWrap.appendChild(more)
    }

    cell.appendChild(header)
    cell.appendChild(eventsWrap)
    grid.appendChild(cell)
    dayCells.push(cell)
  }

  root.appendChild(grid)
  container.appendChild(root)
  return root
}