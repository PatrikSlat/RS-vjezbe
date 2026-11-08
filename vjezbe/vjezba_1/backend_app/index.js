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

// Vraća se na GET /avioni/:id (ne i na popisu /avioni).
const DETALJI = {
  1: {
    duljina: '72,7 m',
    rasponKrila: '79,8 m',
    brzina: '≈ 1 020 km/h (Mach 0,85)',
    domet: '15 200 km',
    motori: '4 turboventilatorska motora',
    maksimalnaMasa: '575 t',
    proizvedeno: 251,
    zanimljivost: 'Ima dvije pune putničke palube i može primiti više od 800 putnika u konfiguraciji s jednom klasom.',
  },
  2: {
    duljina: '70,6 m',
    rasponKrila: '64,4 m',
    brzina: '≈ 913 km/h (Mach 0,85)',
    domet: '13 450 km',
    motori: '4 turboventilatorska motora',
    maksimalnaMasa: '397 t',
    proizvedeno: 694,
    zanimljivost: 'Gornja paluba u grbi izvorno je zamišljena kao salon, a kasnije je postala dio putničke kabine.',
  },
  3: {
    duljina: '61,7 m',
    rasponKrila: '25,6 m',
    brzina: '≈ 2 179 km/h (Mach 2,04)',
    domet: '7 222 km',
    motori: '4 turbomlazna motora s naknadnim izgaranjem',
    maksimalnaMasa: '185 t',
    proizvedeno: 20,
    zanimljivost: 'Zbog zagrijavanja na nadzvučnoj brzini trup se u letu produljio za nekoliko desetaka centimetara.',
  },
  4: {
    duljina: '32,7 m',
    rasponKrila: '16,9 m',
    brzina: '≈ 3 540 km/h (Mach 3,2+)',
    domet: '≈ 5 400 km',
    motori: '2 turbomlazna motora',
    maksimalnaMasa: '78 t',
    proizvedeno: 32,
    zanimljivost: 'Nijedan SR-71 nikada nije oboren, a letio je na visinama iznad 25 000 m.',
  },
  5: {
    duljina: '8,3 m',
    rasponKrila: '11 m',
    brzina: '≈ 226 km/h (krstarenje)',
    domet: '≈ 1 290 km',
    motori: '1 klipni motor',
    maksimalnaMasa: '1,16 t',
    proizvedeno: 44000,
    zanimljivost: 'Proizvodi se od 1956. godine, što ga čini jednim od najdugovječnijih modela u zrakoplovstvu.',
  },
  6: {
    duljina: '62,8 m',
    rasponKrila: '60,1 m',
    brzina: '≈ 913 km/h (Mach 0,85)',
    domet: '14 140 km',
    motori: '2 turboventilatorska motora',
    maksimalnaMasa: '254 t',
    proizvedeno: null,
    zanimljivost: 'Trup i krila većinom su od kompozitnih materijala, pa je lakši i štedljiviji od klasičnih aluminijskih konstrukcija.',
  },
}

// Dodatne zanimljivosti: dohvaćaju se tek klikom (GET /avioni/:id/zanimljivost).
const ZANIMLJIVOSTI = {
  1: [
    'Prvi komercijalni let održan je 2007. godine na liniji Singapur – Sydney s Singapore Airlinesom.',
    'Emirates je u prvoj klasi A380 ugradio tuševe za putnike.',
    'Dijelovi se proizvode u više europskih zemalja, a završno sastavljanje je u Toulouseu.',
    'Zadnji A380 isporučen je 2021. godine i time je proizvodnja završila.',
  ],
  2: [
    'Model 747-400 prvi je put poletio 1988. godine.',
    'Staklena kabina omogućila je posadu od dva pilota, bez letačkog inženjera.',
    'Desetljećima je bio najveći putnički avion na svijetu, sve dok ga nije nadmašio A380.',
    'Predsjednički avion SAD-a Air Force One izveden je iz modela 747.',
  ],
  3: [
    'Letio je na visini od oko 18 000 m, gdje se na horizontu vidi zakrivljenost Zemlje.',
    'Let London – New York trajao je oko tri i pol sata.',
    'Nos mu se spuštao pri slijetanju kako bi pilot imao pogled na pistu.',
    'Njime su letjeli samo British Airways i Air France.',
  ],
  4: [
    'Nadimak mu je "Blackbird" zbog tamne boje koja je pomagala hlađenju trupa.',
    'Trup je većim dijelom od titana, a na velikoj brzini zagrijavao se na više od 300 °C.',
    'Na zemlji je curilo gorivo jer su se spojevi brtvili tek kad se trup zagrijao u letu.',
    'Godine 1974. preletio je put New York – London za nešto manje od dva sata.',
  ],
  5: [
    'Puni naziv mu je Cessna 172 Skyhawk.',
    'Visoko postavljena krila daju mu dobru stabilnost i pregled terena ispod sebe.',
    'Godine 1958. dvojica pilota ostala su u zraku više od 64 dana, a gorivo i hranu dobivali su s kamiona u vožnji.',
    'Većina pilota početnika prve sate leta odradi upravo na ovom modelu.',
  ],
  6: [
    'Prozori su veći od uobičajenih i umjesto zastora se elektronski zatamnjuju.',
    'Tlak u kabini odgovara manjoj visini nego u starijim avionima, pa je putnicima ugodnije.',
    'Prvi 787 poletio je 2009., a verzija 787-9 2013. godine.',
    'Oko polovice konstrukcije po masi čine kompozitni materijali.',
  ],
}

app.get('/', (req, res) => {
  res.json({
    poruka: 'Legende neba API radi',
    endpointi: ['/avioni', '/avioni/:id', '/avioni/:id/zanimljivost', '/tipovi'],
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
  const id = Number(req.params.id)
  const avion = AVIONI.find((a) => a.id === id)
  if (!avion) {
    return res.status(404).json({ greska: 'Avion nije pronađen' })
  }
  res.json({ ...avion, detalji: DETALJI[id] })
})

// GET /avioni/:id/zanimljivost?n=0  -> n-ta dodatna zanimljivost (ciklički)
app.get('/avioni/:id/zanimljivost', (req, res) => {
  const id = Number(req.params.id)
  const lista = ZANIMLJIVOSTI[id]
  if (!lista) {
    return res.status(404).json({ greska: 'Avion nije pronađen' })
  }
  const n = Number.parseInt(req.query.n, 10) || 0
  const indeks = ((n % lista.length) + lista.length) % lista.length
  res.json({
    id,
    zanimljivost: lista[indeks],
    redniBroj: indeks + 1,
    ukupno: lista.length,
  })
})

app.get('/tipovi', (req, res) => {
  res.json([...new Set(AVIONI.map((a) => a.tip))].sort())
})

app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`)
})