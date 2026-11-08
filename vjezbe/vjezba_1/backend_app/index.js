import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const AVIONI = [
  {
    id: 1,
    naziv: 'Airbus A380',
    proizvodac: 'Airbus',
    tip: 'Putnički',
    prviLet: 2005,
    mjesta: 525,
    opis: 'Najveći putnički zrakoplov na svijetu, s dvije pune putničke palube.',
    emoji: '✈️',
  },
  {
    id: 2,
    naziv: 'Boeing 747-400',
    proizvodac: 'Boeing',
    tip: 'Putnički',
    prviLet: 1969,
    mjesta: 416,
    opis: 'Poznat kao "Jumbo Jet" po prepoznatljivoj grbi na prednjem dijelu trupa.',
    emoji: '🛫',
  },
  {
    id: 3,
    naziv: 'Concorde',
    proizvodac: 'BAC / Aérospatiale',
    tip: 'Nadzvučni',
    prviLet: 1969,
    mjesta: 100,
    opis: 'Putnički avion koji je letio brže od zvuka, a posljednji let imao je 2003.',
    emoji: '🚀',
  },
  {
    id: 4,
    naziv: 'Lockheed SR-71',
    proizvodac: 'Lockheed',
    tip: 'Vojni',
    prviLet: 1964,
    mjesta: 2,
    opis: 'Izviđački avion koji je letio brzinom većom od tri Macha.',
    emoji: '🦅',
  },
  {
    id: 5,
    naziv: 'Cessna 172',
    proizvodac: 'Cessna',
    tip: 'Mali / školski',
    prviLet: 1955,
    mjesta: 4,
    opis: 'Najproizvedeniji zrakoplov u povijesti, omiljen za školovanje pilota.',
    emoji: '🛩️',
  },
  {
    id: 6,
    naziv: 'Boeing 787-9 Dreamliner',
    proizvodac: 'Boeing',
    tip: 'Putnički',
    prviLet: 2009,
    mjesta: 290,
    opis: 'Moderan dalekolinijski avion s trupom od kompozitnih materijala.',
    emoji: '🌍',
  },
]

app.get('/', (req, res) => {
  res.json({
    poruka: 'Legende neba API radi',
    endpointi: ['/avioni', '/avioni/:id', '/tipovi'],
  })
})

app.get('/avioni', (req, res) => {
  const { tip } = req.query
  if (tip) {
    return res.json(AVIONI.filter((a) => a.tip.toLowerCase() === tip.toLowerCase()))
  }
  res.json(AVIONI)
})

app.get('/avioni/:id', (req, res) => {
  const avion = AVIONI.find((a) => a.id === Number(req.params.id))
  if (!avion) {
    return res.status(404).json({ greska: 'Avion nije pronađen' })
  }
  res.json(avion)
})

app.get('/tipovi', (req, res) => {
  res.json([...new Set(AVIONI.map((a) => a.tip))].sort())
})

app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`)
})