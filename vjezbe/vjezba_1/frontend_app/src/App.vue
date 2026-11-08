<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const API_URL = 'https://rs-vjezbe-backend-wz8l.onrender.com'

const avioni = ref([])
const ucitavanje = ref(true)
const greska = ref('')

// ----- detalji aviona (GET /avioni/:id) -----
const odabrani = ref(null)
const detalji = ref(null)
const detaljiUcitavanje = ref(false)
const detaljiGreska = ref('')

// ----- dodatne zanimljivosti (GET /avioni/:id/zanimljivost?n=) -----
const dodatna = ref(null)
const dodatnaUcitavanje = ref(false)
const dodatnaGreska = ref('')
let brojac = 0

async function novaZanimljivost() {
  const avion = odabrani.value
  if (!avion || dodatnaUcitavanje.value) return
  dodatnaUcitavanje.value = true
  dodatnaGreska.value = ''
  try {
    const odgovor = await fetch(`${API_URL}/avioni/${avion.id}/zanimljivost?n=${brojac}`)
    if (!odgovor.ok) throw new Error(`HTTP ${odgovor.status}`)
    const podaci = await odgovor.json()
    if (odabrani.value?.id === avion.id) {
      dodatna.value = podaci
      brojac++
    }
  } catch (e) {
    if (odabrani.value?.id === avion.id) {
      dodatnaGreska.value = 'Ne mogu dohvatiti zanimljivost s poslužitelja.'
    }
  } finally {
    dodatnaUcitavanje.value = false
  }
}

async function otvori(avion) {
  odabrani.value = avion
  detalji.value = null
  detaljiGreska.value = ''
  detaljiUcitavanje.value = true
  dodatna.value = null
  dodatnaGreska.value = ''
  dodatnaUcitavanje.value = false
  brojac = 0
  try {
    const odgovor = await fetch(`${API_URL}/avioni/${avion.id}`)
    if (!odgovor.ok) throw new Error(`HTTP ${odgovor.status}`)
    const podaci = await odgovor.json()
    if (!podaci.detalji) throw new Error('Backend ne vraća detalje')
    if (odabrani.value?.id === avion.id) detalji.value = podaci.detalji
  } catch (e) {
    if (odabrani.value?.id === avion.id) {
      detaljiGreska.value = 'Ne mogu dohvatiti detalje s poslužitelja.'
    }
  } finally {
    if (odabrani.value?.id === avion.id) detaljiUcitavanje.value = false
  }
}

function zatvori() {
  odabrani.value = null
  detalji.value = null
  dodatna.value = null
}

function naTipku(e) {
  if (e.key === 'Escape') zatvori()
}

const stavkeDetalja = computed(() => {
  const d = detalji.value
  if (!d) return []
  const stavke = [
    ['Duljina', d.duljina],
    ['Raspon krila', d.rasponKrila],
    ['Brzina', d.brzina],
    ['Domet', d.domet],
    ['Pogon', d.motori],
    ['Maks. masa', d.maksimalnaMasa],
  ]
  if (d.proizvedeno) {
    stavke.push(['Proizvedeno', `${d.proizvedeno.toLocaleString('hr-HR')} kom`])
  }
  return stavke
})

onMounted(async () => {
  window.addEventListener('keydown', naTipku)
  try {
    const odgovor = await fetch(`${API_URL}/avioni`)
    if (!odgovor.ok) throw new Error(`HTTP ${odgovor.status}`)
    avioni.value = await odgovor.json()
  } catch (e) {
    greska.value = 'Ne mogu dohvatiti avione s poslužitelja.'
  } finally {
    ucitavanje.value = false
  }
})

onUnmounted(() => window.removeEventListener('keydown', naTipku))

const tipovi = computed(() => ['Svi', ...new Set(avioni.value.map((a) => a.tip))])

const najstarijiLet = computed(() =>
  avioni.value.length ? Math.min(...avioni.value.map((a) => a.prviLet)) : '–'
)
const najnovijiLet = computed(() =>
  avioni.value.length ? Math.max(...avioni.value.map((a) => a.prviLet)) : '–'
)

const odabraniTip = ref('Svi')
const trazi = ref('')
const sortiranje = ref('godina')

const prikaz = computed(() => {
  let lista = avioni.value.filter(
    (a) =>
      (odabraniTip.value === 'Svi' || a.tip === odabraniTip.value) &&
      a.naziv.toLowerCase().includes(trazi.value.toLowerCase())
  )
  lista = [...lista].sort((a, b) =>
    sortiranje.value === 'godina' ? a.prviLet - b.prviLet : b.mjesta - a.mjesta
  )
  return lista
})
</script>

<template>
  <div class="stranica">
    <header class="hero">
      <div class="zvijezde"></div>
      <div class="avion-let">✈️</div>

      <div class="hero-sadrzaj">
        <span class="znacka">✈ Zrakoplovna enciklopedija</span>
        <h1>Legende <span class="gradijent">neba</span></h1>
        <p class="podnaslov">
          Od školskih jednomotoraca do nadzvučnih putničkih divova.
        </p>

        <div class="brojke">
          <div>
            <strong>{{ avioni.length }}</strong>
            <span>zrakoplova</span>
          </div>
          <div>
            <strong>{{ tipovi.length - 1 }}</strong>
            <span>kategorije</span>
          </div>
          <div>
            <strong>{{ najstarijiLet }}–{{ najnovijiLet }}</strong>
            <span>godine prvog leta</span>
          </div>
        </div>

        <a href="#hradar" class="cta">Prati hrvatski zračni prostor ↓</a>
      </div>
    </header>

    <main>
      <section class="alati">
        <input
          v-model="trazi"
          type="search"
          placeholder="Pretraži avione..."
        />

        <div class="filteri">
          <button
            v-for="t in tipovi"
            :key="t"
            :class="{ aktivan: odabraniTip === t }"
            @click="odabraniTip = t"
          >
            {{ t }}
          </button>
        </div>

        <select v-model="sortiranje">
          <option value="godina">Sortiraj: najstariji prvo</option>
          <option value="mjesta">Sortiraj: najviše mjesta</option>
        </select>
      </section>

      <section class="mreza">
        <article
          v-for="a in prikaz"
          :key="a.id"
          class="kartica"
          tabindex="0"
          role="button"
          :aria-label="'Prikaži detalje: ' + a.naziv"
          @click="otvori(a)"
          @keydown.enter="otvori(a)"
        >
          <div class="ikona">{{ a.emoji }}</div>
          <span class="tip">{{ a.tip }}</span>
          <h2>{{ a.naziv }}</h2>
          <p class="proizvodac">{{ a.proizvodac }}</p>
          <p class="opis">{{ a.opis }}</p>

          <dl>
            <div>
              <dt>Prvi let</dt>
              <dd>{{ a.prviLet }}.</dd>
            </div>
            <div>
              <dt>Mjesta</dt>
              <dd>{{ a.mjesta }}</dd>
            </div>
          </dl>

          <span class="vise">Prikaži detalje →</span>
        </article>

        <p v-if="ucitavanje" class="prazno">
          Učitavam avione s poslužitelja... (prvi put može trajati do minute)
        </p>
        <p v-else-if="greska" class="prazno">{{ greska }}</p>
        <p v-else-if="prikaz.length === 0" class="prazno">
          Nema aviona koji odgovaraju pretrazi.
        </p>
      </section>
    </main>

    <section id="hradar" class="hradar">
      <div class="hradar-kartica">
        <div class="radar">
          <div class="radar-sweep"></div>
          <span class="tocka t1"></span>
          <span class="tocka t2"></span>
          <span class="tocka t3"></span>
        </div>

        <div class="hradar-tekst">
          <span class="uzivo"><i></i> UŽIVO</span>
          <h2>HRadar: hrvatski zračni prostor</h2>
          <p>
            Moj raniji projekt koji prati zrakoplove iznad Hrvatske u
            stvarnom vremenu. Pogledaj tko trenutno leti iznad tebe.
          </p>
          <a
            href="https://hradar.onrender.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="cta"
          >
            Otvori HRadar →
          </a>
        </div>
      </div>
    </section>

    <footer>Raspodijeljeni sustavi · Vježba 1</footer>

    <!-- ---------- MODAL S DETALJIMA ---------- -->
    <div v-if="odabrani" class="pozadina" @click.self="zatvori">
      <div class="modal" role="dialog" aria-modal="true">
        <button class="zatvori" @click="zatvori" aria-label="Zatvori">✕</button>

        <div class="modal-glava">
          <div class="modal-ikona">{{ odabrani.emoji }}</div>
          <div>
            <span class="tip">{{ odabrani.tip }}</span>
            <h2>{{ odabrani.naziv }}</h2>
            <p class="proizvodac">{{ odabrani.proizvodac }} · prvi let {{ odabrani.prviLet }}.</p>
          </div>
        </div>

        <p v-if="detaljiUcitavanje" class="modal-status">
          Dohvaćam detalje s poslužitelja...
        </p>
        <p v-else-if="detaljiGreska" class="modal-status">{{ detaljiGreska }}</p>

        <template v-else-if="detalji">
          <div class="specifikacije">
            <div v-for="[naziv, vrijednost] in stavkeDetalja" :key="naziv">
              <dt>{{ naziv }}</dt>
              <dd>{{ vrijednost }}</dd>
            </div>
          </div>

          <div class="zanimljivost">
            <strong>💡 Znaš li?</strong>
            <p>{{ detalji.zanimljivost }}</p>
          </div>

          <div class="dodatna">
            <button class="gumb-vise" :disabled="dodatnaUcitavanje" @click="novaZanimljivost">
              {{ dodatnaUcitavanje ? 'Dohvaćam...' : dodatna ? '🔄 Još jedna zanimljivost' : '✨ Prikaži zanimljivost' }}
            </button>

            <p v-if="dodatnaGreska" class="modal-status">{{ dodatnaGreska }}</p>

            <div v-if="dodatna" class="zanimljivost nova">
              <strong>🎯 Zanimljivost {{ dodatna.redniBroj }}/{{ dodatna.ukupno }}</strong>
              <p>{{ dodatna.zanimljivost }}</p>
            </div>
          </div>

          <p class="izvor">Podaci dohvaćeni s <code>GET /avioni/{{ odabrani.id }}</code></p>
        </template>
      </div>
    </div>
  </div>
</template>

<style>
* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  background: #0b1220;
  color: #e5e9f2;
}

/* ---------- HERO ---------- */
.hero {
  position: relative;
  overflow: hidden;
  text-align: center;
  padding: 6rem 1.25rem 5rem;
  background:
    radial-gradient(ellipse at 50% 120%, #3b82f6 0%, transparent 60%),
    linear-gradient(180deg, #0a1a4a 0%, #0b1220 100%);
}
.zvijezde {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1.5px 1.5px at 20% 30%, #fff 50%, transparent 51%),
    radial-gradient(1px 1px at 70% 20%, #fff 50%, transparent 51%),
    radial-gradient(1.5px 1.5px at 85% 60%, #bfdbfe 50%, transparent 51%),
    radial-gradient(1px 1px at 40% 70%, #fff 50%, transparent 51%),
    radial-gradient(1px 1px at 10% 80%, #bfdbfe 50%, transparent 51%),
    radial-gradient(1.5px 1.5px at 55% 45%, #fff 50%, transparent 51%);
  opacity: .7;
  animation: svjetlucanje 4s ease-in-out infinite alternate;
}
@keyframes svjetlucanje { from { opacity: .35; } to { opacity: .85; } }

.avion-let {
  position: absolute;
  top: 18%;
  left: -80px;
  font-size: 2.2rem;
  filter: drop-shadow(0 0 12px rgba(147, 197, 253, .8));
  animation: let 14s linear infinite;
}
.avion-let::after {
  content: '';
  position: absolute;
  right: 100%;
  top: 55%;
  width: 220px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(191, 219, 254, .7));
}
@keyframes let {
  from { transform: translate(0, 40px); }
  to   { transform: translate(calc(100vw + 160px), -60px); }
}

.hero-sadrzaj { position: relative; z-index: 1; }

.znacka {
  display: inline-block;
  padding: .4rem 1rem;
  border: 1px solid rgba(147, 197, 253, .35);
  background: rgba(59, 130, 246, .12);
  color: #bfdbfe;
  border-radius: 999px;
  font-size: .8rem;
  letter-spacing: .15em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}
h1 {
  font-size: clamp(2.8rem, 8vw, 5.5rem);
  line-height: 1.05;
  margin: 0 0 1rem;
  letter-spacing: -.03em;
}
.gradijent {
  background: linear-gradient(90deg, #60a5fa, #a78bfa, #38bdf8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.podnaslov {
  color: #bfdbfe;
  font-size: 1.2rem;
  max-width: 560px;
  margin: 0 auto 2.5rem;
}

.brojke {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2.5rem;
  margin-bottom: 2.5rem;
}
.brojke strong { display: block; font-size: 1.8rem; font-weight: 800; }
.brojke span {
  font-size: .75rem;
  color: #8ea0bf;
  text-transform: uppercase;
  letter-spacing: .1em;
}

.cta {
  display: inline-block;
  background: #3b82f6;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  padding: .9rem 1.8rem;
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(59, 130, 246, .4);
  transition: transform .15s, background .15s;
}
.cta:hover { background: #2563eb; transform: translateY(-2px); }

/* ---------- ALATI I KARTICE ---------- */
main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
}

.alati {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
}
input, select {
  background: #131c30;
  border: 1px solid #263450;
  color: #e5e9f2;
  padding: .7rem 1rem;
  border-radius: 10px;
  font-size: .95rem;
}
input { flex: 1; min-width: 200px; }
input:focus, select:focus { outline: 2px solid #3b82f6; }

.filteri { display: flex; flex-wrap: wrap; gap: .5rem; }
.filteri button {
  background: #131c30;
  border: 1px solid #263450;
  color: #c7d2e6;
  padding: .55rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: .9rem;
  transition: all .15s;
}
.filteri button:hover { border-color: #3b82f6; }
.filteri button.aktivan {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

.mreza {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.kartica {
  background: #131c30;
  border: 1px solid #263450;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: transform .2s, border-color .2s, box-shadow .2s;
}
.kartica:hover {
  transform: translateY(-4px);
  border-color: #3b82f6;
  box-shadow: 0 12px 28px rgba(59, 130, 246, .15);
}
.kartica:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }

.vise {
  display: inline-block;
  margin-top: 1rem;
  font-size: .85rem;
  font-weight: 600;
  color: #60a5fa;
  transition: transform .15s;
}
.kartica:hover .vise { transform: translateX(4px); }

.ikona { font-size: 2.5rem; margin-bottom: .5rem; }
.tip {
  display: inline-block;
  background: #1e3a8a;
  color: #bfdbfe;
  font-size: .75rem;
  padding: .2rem .6rem;
  border-radius: 999px;
  margin-bottom: .75rem;
}
h2 { margin: 0 0 .25rem; font-size: 1.3rem; }
.proizvodac { margin: 0 0 .75rem; color: #8ea0bf; font-size: .9rem; }
.opis { margin: 0 0 1.25rem; color: #c7d2e6; font-size: .95rem; line-height: 1.5; }

dl {
  display: flex;
  gap: 2rem;
  margin: 0;
  padding-top: 1rem;
  border-top: 1px solid #263450;
}
dt { font-size: .75rem; color: #8ea0bf; text-transform: uppercase; letter-spacing: .08em; }
dd { margin: .2rem 0 0; font-size: 1.2rem; font-weight: 700; }

.prazno { grid-column: 1 / -1; text-align: center; color: #8ea0bf; }

/* ---------- MODAL ---------- */
.pozadina {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: rgba(5, 10, 20, .75);
  backdrop-filter: blur(4px);
  animation: pojavi .2s ease-out;
}
@keyframes pojavi { from { opacity: 0; } to { opacity: 1; } }

.modal {
  position: relative;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  background: #131c30;
  border: 1px solid #3b82f6;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, .5);
  animation: izlaz .25s ease-out;
}
@keyframes izlaz {
  from { opacity: 0; transform: translateY(20px) scale(.97); }
  to   { opacity: 1; transform: none; }
}

.zatvori {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid #263450;
  background: #0b1220;
  color: #c7d2e6;
  cursor: pointer;
  font-size: .9rem;
}
.zatvori:hover { border-color: #3b82f6; color: #fff; }

.modal-glava { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.5rem; padding-right: 2rem; }
.modal-ikona { font-size: 3.5rem; }
.modal-glava .proizvodac { margin: 0; }
.modal-glava h2 { font-size: 1.6rem; }

.modal-status { color: #8ea0bf; text-align: center; padding: 1.5rem 0; margin: 0; }

.specifikacije {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.specifikacije > div {
  padding: .9rem 1rem;
  background: #0b1220;
  border: 1px solid #263450;
  border-radius: 12px;
}
.specifikacije dd { font-size: 1rem; }

.zanimljivost {
  padding: 1rem 1.25rem;
  background: rgba(59, 130, 246, .1);
  border-left: 3px solid #3b82f6;
  border-radius: 8px;
}
.zanimljivost p { margin: .4rem 0 0; color: #c7d2e6; line-height: 1.5; font-size: .95rem; }

.dodatna { margin-top: 1rem; }
.gumb-vise {
  width: 100%;
  padding: .8rem;
  border-radius: 10px;
  border: 1px solid #3b82f6;
  background: transparent;
  color: #93c5fd;
  font-size: .95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s, color .15s;
}
.gumb-vise:hover:not(:disabled) { background: #3b82f6; color: #fff; }
.gumb-vise:disabled { opacity: .6; cursor: wait; }
.zanimljivost.nova {
  margin-top: 1rem;
  border-left-color: #a78bfa;
  background: rgba(167, 139, 250, .1);
  animation: izlaz .25s ease-out;
}

.izvor { margin: 1.25rem 0 0; font-size: .8rem; color: #6b7a99; text-align: center; }
.izvor code { color: #60a5fa; }

@media (max-width: 480px) {
  .specifikacije { grid-template-columns: 1fr; }
}

/* ---------- HRADAR ---------- */
.hradar { max-width: 1100px; margin: 0 auto; padding: 0 1.25rem 3rem; }
.hradar-kartica {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  flex-wrap: wrap;
  padding: 2.5rem;
  border-radius: 20px;
  border: 1px solid #263450;
  background: linear-gradient(135deg, #131c30 0%, #0f2a3d 100%);
}
.hradar-tekst { flex: 1; min-width: 260px; }
.hradar-tekst h2 { font-size: 1.8rem; margin: .75rem 0; }
.hradar-tekst p { color: #c7d2e6; line-height: 1.6; margin: 0 0 1.5rem; }

.uzivo {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .15em;
  color: #4ade80;
}
.uzivo i {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #4ade80;
  animation: puls 1.5s infinite;
}
@keyframes puls {
  0%   { box-shadow: 0 0 0 0 rgba(74, 222, 128, .7); }
  100% { box-shadow: 0 0 0 10px rgba(74, 222, 128, 0); }
}

.radar {
  position: relative;
  width: 200px;
  height: 200px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid #22c55e;
  background:
    radial-gradient(circle, transparent 28%, rgba(34, 197, 94, .25) 29%, transparent 30%),
    radial-gradient(circle, transparent 58%, rgba(34, 197, 94, .25) 59%, transparent 60%),
    linear-gradient(#22c55e33, #22c55e33) center / 1px 100% no-repeat,
    linear-gradient(#22c55e33, #22c55e33) center / 100% 1px no-repeat,
    #06140d;
  overflow: hidden;
}
.radar-sweep {
  position: absolute;
  inset: 0;
  background: conic-gradient(from 0deg, rgba(34, 197, 94, .55), transparent 70deg);
  animation: rotiraj 4s linear infinite;
}
@keyframes rotiraj { to { transform: rotate(360deg); } }
.tocka {
  position: absolute;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #86efac;
  box-shadow: 0 0 8px #4ade80;
  animation: treptaj 4s infinite;
}
.t1 { top: 30%; left: 60%; }
.t2 { top: 65%; left: 35%; animation-delay: 1.3s; }
.t3 { top: 45%; left: 78%; animation-delay: 2.6s; }
@keyframes treptaj { 0%, 100% { opacity: .15; } 20% { opacity: 1; } }

/* ---------- FOOTER ---------- */
footer {
  text-align: center;
  padding: 2rem;
  color: #6b7a99;
  font-size: .85rem;
}
</style>