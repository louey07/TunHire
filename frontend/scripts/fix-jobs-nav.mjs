import fs from 'fs'

const path = 'app/jobs/page.tsx'
let s = fs.readFileSync(path, 'utf8')

if (!s.includes('</nav>')) {
  console.log('already clean')
  process.exit(0)
}

const start = s.indexOf('<Navbar />')
const filtersAside = s.indexOf(
  '<aside className="sticky top-32 hidden h-[calc(100vh-8rem)]',
  start,
)

if (start === -1 || filtersAside === -1) {
  console.error('could not locate sections')
  process.exit(1)
}

s =
  s.slice(0, start + '<Navbar />'.length) +
  '\n\n      ' +
  s.slice(filtersAside)

fs.writeFileSync(path, s)
console.log('fixed orphan nav block')
