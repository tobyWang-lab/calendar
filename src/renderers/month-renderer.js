import { startOfMonth as dfStartOfMonth, addDays as dfAddDays, startOfWeek as dfStartOfWeek, format as dfFormat, isSameMonth as dfIsSameMonth, parseISO as dfParseISO } from 'date-fns'

function toISO(d){
  const date = typeof d === 'string' ? dfParseISO(d) : d
  return date.toISOString().slice(0,10)
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
  for(let i=0;i<42;i++){
    const d = dfAddDays(start, i)
    const iso = toISO(d)
    const cell = document.createElement('div')
    cell.className = 'month-cell'
    cell.setAttribute('data-date', iso)

    const header = document.createElement('div')
    header.className = 'date-header'
    header.textContent = String(d.getDate())
    // lunar
    if(lunarData && lunarData[iso]){
      header.setAttribute('data-lunar', lunarData[iso])
    }

    if(!dfIsSameMonth(d, monthDate)){
      cell.classList.add('other-month')
      header.classList.add('muted')
    }

    // highlight the view's current date (e.g., currentDate from ViewState)
    const currentViewISO = toISO(monthDate)
    if(iso === currentViewISO){
      const dot = document.createElement('span')
      dot.className = 'today-dot'
      header.appendChild(dot)
    }

    const eventsWrap = document.createElement('div')
    eventsWrap.className = 'event-summary'

    // collect events for this date
    const dayEvents = events.filter(ev => {
      // prefer using the ISO date portion when available in the string to avoid timezone shifts
      if(typeof ev.start === 'string'){
        return ev.start.slice(0,10) === iso
      }
      const s = ev.start
      return s.toISOString().slice(0,10) === iso
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