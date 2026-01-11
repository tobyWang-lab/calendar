import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

export function checkDir(dir = path.resolve(process.cwd(), 'dist'), threshold = 100 * 1024){
  if(!fs.existsSync(dir)){
    console.error('dist directory not found:', dir)
    process.exitCode = 2
    return false
  }

  const files = []
  function walk(d){
    for(const name of fs.readdirSync(d)){
      const full = path.join(d,name)
      const st = fs.statSync(full)
      if(st.isDirectory()) walk(full)
      else files.push(full)
    }
  }
  walk(dir)

  let ok = true
  for(const f of files){
    const buf = fs.readFileSync(f)
    const gz = zlib.gzipSync(buf)
    const size = gz.length
    console.log(`${path.relative(dir,f)} - gz ${size} bytes`)
    if(size > threshold){
      console.error(`ERROR: ${path.relative(dir,f)} exceeds threshold ${threshold} bytes`)
      ok = false
    }
  }

  if(!ok) process.exitCode = 1
  else console.log('All assets within threshold')
  return ok
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const t = Number(process.argv[2] || (100*1024))
  checkDir(process.argv[3] || path.resolve(process.cwd(),'dist'), t)
}
