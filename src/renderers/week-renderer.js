import { format as dfFormat, addDays as dfAddDays, parseISO as dfParseISO } from 'date-fns'

function toISODate(d){
  // input can be string or Date
  const date = typeof d === 'string' ? dfParseISO(d) : d
  return date.toISOString().slice(0,10)
}

export function renderWeek(container, weekStartDate, events = []){
  // clear
  container.innerHTML = ''
  const weekStartISO = toISODate(weekStartDate)

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
    const iso = toISODate(d)
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
  const todayISO = new Date().toISOString().slice(0,10)
  const todayEl = daysGrid.querySelector(`[data-date="${todayISO}"]`)
  if(todayEl){
    todayEl.classList.add('today')
  }

  // render events
  for(const ev of events){
    const evStart = typeof ev.start === 'string' ? dfParseISO(ev.start) : ev.start
    const evEnd = typeof ev.end === 'string' ? dfParseISO(ev.end) : ev.end
    const dateISO = evStart.toISOString().slice(0,10)
    const dayBody = daysGrid.querySelector(`[data-date="${dateISO}"] .day-body`)
    if(!dayBody) continue

    const topPercent = ((evStart.getHours()*60 + evStart.getMinutes()) / (24*60)) * 100
    const durationMinutes = (evEnd - evStart) / (60*1000)
    const heightPercent = (durationMinutes / (24*60)) * 100

    const el = document.createElement('div')
    el.className = 'event'
    el.setAttribute('data-id', ev.id)
    el.textContent = ev.title
    el.style.top = `${topPercent}%`
    el.style.height = `${heightPercent}%`

    dayBody.appendChild(el)
  }

  root.appendChild(timeCol)
  root.appendChild(daysGrid)
  container.appendChild(root)
  return root
}
