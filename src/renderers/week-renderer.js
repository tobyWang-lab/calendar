import { format as dfFormat, addDays as dfAddDays, parseISO as dfParseISO } from 'date-fns'

function toLocalYMD(d){
  // input can be string or Date; return local YYYY-MM-DD
  const date = typeof d === 'string' ? dfParseISO(d) : d
  return dfFormat(date, 'yyyy-MM-dd')
}

export function renderWeek(container, weekStartDate, events = []){
  // clear
  container.innerHTML = ''
  const weekStartISO = toLocalYMD(weekStartDate)

  const root = document.createElement('div')
  root.className = 'week-view'
  root.setAttribute('data-week-start', weekStartISO)

  const timeCol = document.createElement('div')
  timeCol.className = 'time-col'
  // hours 0-23
  for(let h=0; h<24; h++){
    const slot = document.createElement('div')
    slot.className = 'time-slot'
    slot.textContent = `${String(h).padStart(2,'0')}:00`
    timeCol.appendChild(slot)
  }

  const daysGrid = document.createElement('div')
  daysGrid.className = 'days-grid'

  // build 7 days
  for(let i=0; i<7; i++){
    const d = dfAddDays(weekStartDate, i)
    const iso = toLocalYMD(d)
    const day = document.createElement('div')
    day.className = 'day'
    day.setAttribute('data-date', iso)

    const header = document.createElement('div')
    header.className = 'day-header'
    header.textContent = `${dfFormat(d,'EEE')} ${dfFormat(d,'MM/dd')}`

    const body = document.createElement('div')
    body.className = 'day-body'

    day.appendChild(header)
    day.appendChild(body)
    daysGrid.appendChild(day)
  }

  // highlight today if matches any
  const todayISO = dfFormat(new Date(), 'yyyy-MM-dd')
  const todayEl = daysGrid.querySelector(`[data-date="${todayISO}"]`)
  if(todayEl){
    todayEl.classList.add('today')
  }

  // group events by day (local date) for layout
  const eventsByDay = new Map()
  for(const ev of events){
    const evStart = typeof ev.start === 'string' ? dfParseISO(ev.start) : ev.start
    const evEnd = typeof ev.end === 'string' ? dfParseISO(ev.end) : ev.end
    const dateISO = dfFormat(evStart, 'yyyy-MM-dd')

    if(!eventsByDay.has(dateISO)) eventsByDay.set(dateISO, [])
    eventsByDay.get(dateISO).push({ ev, evStart, evEnd })
  }

  // for each day, layout events with overlapping columns
  for(const [dateISO, dayEvents] of eventsByDay.entries()){
    const dayBody = daysGrid.querySelector(`[data-date="${dateISO}"] .day-body`)
    if(!dayBody) continue

    // sort by start
    dayEvents.sort((a,b)=> a.evStart - b.evStart)

    // assign columns greedily
    const columns = [] // each column stores endMinute
    const elements = []

    for(const item of dayEvents){
      const { ev, evStart, evEnd } = item
      const startMinutes = evStart.getHours()*60 + evStart.getMinutes()
      const durationMinutes = (evEnd - evStart) / (60*1000)
      const topPercent = (startMinutes / (24*60)) * 100
      const heightPercent = (durationMinutes / (24*60)) * 100

      // find a column where this event doesn't overlap (start >= column end)
      let colIndex = -1
      for(let i=0;i<columns.length;i++){
        if(startMinutes >= columns[i]){ colIndex = i; break }
      }
      if(colIndex === -1){ colIndex = columns.length; columns.push(startMinutes + durationMinutes) }
      else { columns[colIndex] = startMinutes + durationMinutes }

      const el = document.createElement('div')
      el.className = 'event'
      el.setAttribute('data-id', ev.id)
      el.textContent = ev.title
      el.setAttribute('data-top-percent', String(topPercent))
      el.setAttribute('data-height-percent', String(heightPercent))
      el.style.top = `calc(${topPercent}% - 1px)`
      el.style.height = `${heightPercent}%`
      el.style.setProperty('background', 'var(--primary)', 'important')
      el.style.color = 'var(--bg)'
      el.style.opacity = '0.8'
      el.style.zIndex = '10'
      el.setAttribute('role','button')
      el.style.cursor = 'pointer'
      // override right so we control width/left
      el.style.right = 'auto'

      elements.push({ el, colIndex })
    }

    const numCols = Math.max(1, columns.length)
    // apply left/width based on columns
    elements.forEach(({ el, colIndex }) =>{
      const leftPercent = (colIndex / numCols) * 100
      el.style.left = `calc(${leftPercent}% + 8px)`
      el.style.width = `calc(${100/numCols}% - 16px)`
      dayBody.appendChild(el)
    })
  }

  root.appendChild(timeCol)
  root.appendChild(daysGrid)
  container.appendChild(root)
  return root
}
