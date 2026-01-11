import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { checkDir } from '../scripts/size-check.js' 

describe('size-check', ()=>{
  it('flags files larger than threshold and accepts small files', ()=>{
    const tmp = path.resolve(process.cwd(),'tmp-sizecheck')
    if(fs.existsSync(tmp)) fs.rmSync(tmp,{ recursive:true, force:true })
    fs.mkdirSync(tmp)
    // create small file
    fs.writeFileSync(path.join(tmp,'small.js'), 'console.log(1)')
    // create large file (~200KB) with random bytes (not compressible)
    const big = crypto.randomBytes(200 * 1024)
    fs.writeFileSync(path.join(tmp,'big.js'), big)

    const okSmall = checkDir(tmp, 100*1024)
    expect(okSmall).toBe(false)

    // remove big to make it pass
    fs.rmSync(path.join(tmp,'big.js'))
    const okNow = checkDir(tmp, 100*1024)
    expect(okNow).toBe(true)

    fs.rmSync(tmp,{ recursive:true, force:true })
  })
})