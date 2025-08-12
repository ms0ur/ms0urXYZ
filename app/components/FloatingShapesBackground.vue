<template>
  <!-- Фон: градиент позади, канвас поверх. Не перехватывает клики -->
  <ClientOnly>
    <div :class="['floating-bg', fixed ? 'is-fixed' : 'is-absolute']">
      <div class="bg-gradient" :class="isDark ? 'dark' : 'light'" />

      <TresCanvas
          :alpha="true"
          :antialias="true"
          :dpr="canvasDpr"
      >
        <!-- Камера -->
        <TresPerspectiveCamera ref="cameraRef" :position="[0, 0, 14]" :fov="55" />

        <!-- Лёгкий свет (без теней) для объёма на плоских гранях -->
        <TresAmbientLight :intensity="isDark ? 0.4 : 0.55" />
        <TresDirectionalLight :position="[6, 8, 10]" :intensity="isDark ? 0.9 : 0.8" />

        <!-- Фигуры -->
        <TresGroup>
          <template v-for="s in shapes" :key="s.id">
            <TresMesh
                :ref="(el) => el && shapeNodes.set(s.id, el)"
                :geometry="s.meshGeo"
                :scale="[s.scale, s.scale, s.scale]"
            >
              <TresMeshLambertMaterial
                  :color="s.color"
                  :flatShading="true"
              />
            </TresMesh>
          </template>
        </TresGroup>
      </TresCanvas>
    </div>
  </ClientOnly>
</template>

<script setup>
/**
 * FloatingShapesBackground — лёгкий адаптивный фон под разные экраны:
 * - Flat-материал (без теней/toon)
 * - Рандомная палитра по теме (dark/light)
 * - Равномерная раскладка (grid + jitter)
 * - Коллизии, отскоки от краёв, отталкивание от курсора
 * - Отталкивание теперь учитывает перспективу: вычисляем проекцию курсора на плоскость z каждой фигуры,
 *   чтобы влияние было одинаковым по X/Y на любом Z (эффект «цилиндра» сквозь глубину)
 * - Адаптив: автоскейл количества фигур, DPR и качества геометрий
 */

import * as THREE from 'three'

/* ---------- Пропсы ---------- */
const props = defineProps({
  count: { type: Number, default: 36 },
  seed: { type: [Number, String], default: 20250811 },

  quality: { type: String, default: 'medium' },    // 'low'|'medium'|'high'
  speedMin: { type: Number, default: 0.22 },
  speedMax: { type: Number, default: 0.55 },
  maxSpeed: { type: Number, default: 1.2 },

  // Отталкивание курсором
  repelRadius: { type: Number, default: 10.0 },
  repelStrength: { type: Number, default: 30.0 },

  // Тема
  theme: { type: String, default: 'auto' },        // 'auto'|'dark'|'light'

  // Позиционирование фона: fixed на весь вьюпорт или в пределах секции
  fixed: { type: Boolean, default: false }
})

/* ---------- Тема и палитры ---------- */
const darkPalettes = [
  ['#FF3B30','#34C759','#0A84FF','#FF9F0A','#BF5AF2','#FF375F','#FFD60A','#32D74B','#64D2FF'],
  ['#F94144','#F3722C','#F8961E','#90BE6D','#43AA8B','#577590'],
  ['#E11D48','#F59E0B','#10B981','#22D3EE','#6366F1']
]
const lightPalettes = [
  ['#FF453A','#30D158','#0A84FF','#FF9F0A','#BF5AF2','#FF2D55','#FFD60A','#34C759','#64D2FF'],
  ['#EF4444','#F59E0B','#10B981','#3B82F6','#A855F7','#F472B6'],
  ['#EA580C','#84CC16','#06B6D4','#60A5FA','#D946EF']
]

const isDark = ref(true)
function detectDark() {
  if (props.theme === 'dark') return true
  if (props.theme === 'light') return false
  const root = document.documentElement
  if (root.classList.contains('dark')) return true
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}
const currentPalette = ref([])

function pickPalette(recolor = false) {
  const sets = isDark.value ? darkPalettes : lightPalettes
  currentPalette.value = sets[Math.floor(rand() * sets.length)].slice()
  if (recolor) for (const s of shapes) s.color = randPick(currentPalette.value)
}

/* ---------- Рандом ---------- */
function hashString(str) { let h=2166136261; for (let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24) } return (h>>>0)/4294967295 }
function mulberry32(a){ return function(){ let t=(a+=0x6d2b79f5); t=Math.imul(t^(t>>>15), t|1); t^=t+Math.imul(t^(t>>>7), t|61); return ((t^(t>>>14))>>>0)/4294967295 } }
const seedNum = typeof props.seed === 'number' ? props.seed : Math.floor(hashString(String(props.seed)) * 1e9)
const rand = mulberry32(seedNum)
const randRange = (min, max) => min + (max - min) * rand()
const randPick = (arr) => arr[Math.floor(rand() * arr.length)]
const sign = () => (rand() < 0.5 ? -1 : 1)

/* ---------- Геометрии ---------- */
function seg(q, low, med, high){ return q==='high'?high : q==='low'?low : med }
const geometryCache = new Map()
function makeGeo(type, q) {
  const key = `${type}:${q}`
  if (geometryCache.has(key)) return geometryCache.get(key)
  let g
  switch (type) {
    case 'box': g = new THREE.BoxGeometry(1,1,1,1,1,1); break
    case 'sphere': g = new THREE.SphereGeometry(0.9, seg(q,16,24,32), seg(q,12,18,24)); break
    case 'icosa': g = new THREE.IcosahedronGeometry(1.0, 0); break
    case 'torus': g = new THREE.TorusGeometry(0.7, 0.24, seg(q,10,16,20), seg(q,16,28,36)); break
    case 'cone': g = new THREE.ConeGeometry(0.9, 1.3, seg(q,12,16,24), 1); break
    case 'tetra': g = new THREE.TetrahedronGeometry(1.0, 0); break
    case 'cylinder': g = new THREE.CylinderGeometry(0.7, 0.7, 1.2, seg(q,16,20,28), 1); break
    default: g = new THREE.BoxGeometry(1,1,1,1,1,1)
  }
  g.computeBoundingSphere()
  const baseRadius = g.boundingSphere ? g.boundingSphere.radius : 1
  const entry = { geo: g, baseRadius }
  geometryCache.set(key, entry)
  return entry
}
function randomScale(type) {
  switch (type) {
    case 'torus': return randRange(0.6, 1.2)
    case 'sphere': return randRange(0.75, 1.35)
    default: return randRange(0.75, 1.45)
  }
}

/* ---------- Мир/границы (адаптивно) ---------- */
const cameraRef = ref(null)
const DEG2RAD = Math.PI/180
const world = reactive({ halfWidth: 10, halfHeight: 6, margin: 0.8 })

function recomputeWorldBounds() {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1920
  const h = typeof window !== 'undefined' ? window.innerHeight : 1080
  const aspect = w / Math.max(1, h)
  const cameraZ = 14
  const fov = 55
  const halfH = Math.tan((fov * DEG2RAD)/2) * cameraZ
  const halfW = halfH * aspect
  world.halfWidth = halfW - world.margin
  world.halfHeight = halfH - world.margin
}

/* ---------- Адаптивные параметры (count / quality / DPR / физика) ---------- */
const canvasDpr = ref([1, 2])
const eff = reactive({
  repelRadius: props.repelRadius,
  repelStrength: props.repelStrength,
  maxSpeed: props.maxSpeed,
  dtCap: 0.033
})
let effectiveQuality = props.quality
let effectiveCount = props.count

function getCountForWidth(w) {
  const scale =
      w >= 1536 ? 1.00 :
          w >= 1280 ? 0.90 :
              w >= 1024 ? 0.80 :
                  w >= 768  ? 0.65 :
                      w >= 640  ? 0.50 : 0.40
  return Math.max(10, Math.round(props.count * scale))
}
function getQualityForWidth(w) {
  if (w < 640) return 'low'
  if (w < 1024) return props.quality === 'high' ? 'medium' : props.quality
  return props.quality
}
function updateAdaptiveKnobs() {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1920
  canvasDpr.value = w < 640 ? [1] : [1, 2]
  effectiveCount = getCountForWidth(w)
  const newQ = getQualityForWidth(w)
  const qChanged = newQ !== effectiveQuality
  effectiveQuality = newQ
  return { w, qChanged }
}

/* ---------- Раскладка по сетке ---------- */
function gridPositions(count) {
  const aspect = world.halfWidth / world.halfHeight
  const cols = Math.max(1, Math.ceil(Math.sqrt(count * aspect)))
  const rows = Math.max(1, Math.ceil(count / cols))
  const cellW = (world.halfWidth * 2) / cols
  const cellH = (world.halfHeight * 2) / rows
  const positions = []
  for (let i = 0; i < count; i++) {
    const c = i % cols
    const r = Math.floor(i / cols)
    const cx = -world.halfWidth + cellW * (c + 0.5)
    const cy = -world.halfHeight + cellH * (r + 0.5)
    const jitter = Math.min(cellW, cellH) * 0.25
    positions.push([cx + (rand()-0.5)*2*jitter, cy + (rand()-0.5)*2*jitter])
  }
  return positions
}

/* ---------- Модели фигур ---------- */
const shapes = reactive([])
const shapeNodes = reactive(new Map())

function createShapes() {
  shapes.length = 0
  const basePositions = gridPositions(effectiveCount)

  for (let i = 0; i < effectiveCount; i++) {
    const type = randPick(['box','sphere','icosa','torus','cone','tetra','cylinder'])
    const { geo, baseRadius } = makeGeo(type, effectiveQuality)
    const scale = randomScale(type)
    const radius = baseRadius * scale

    const [x, y] = basePositions[i]
    const z = randRange(-0.8, 0.8)

    const speed = randRange(props.speedMin, props.speedMax)
    const ang = randRange(0, Math.PI*2)
    const vx = Math.cos(ang) * speed
    const vy = Math.sin(ang) * speed

    shapes.push({
      id: i,
      type,
      meshGeo: geo,
      color: randPick(currentPalette.value.length ? currentPalette.value : (isDark.value ? darkPalettes[0] : lightPalettes[0])),
      scale,
      radius,
      pos: [x, y, z],
      vel: [vx, vy],
      rot: [randRange(0.2,0.9)*sign(), randRange(0.15,0.8)*sign(), randRange(0.1,0.7)*sign()]
    })
  }

  const area = (world.halfWidth * 2) * (world.halfHeight * 2)
  const avgDiameter = shapes.reduce((s, o) => s + 2 * o.radius, 0) / shapes.length
  const cellSize = Math.sqrt(area / shapes.length)
  const crowdRatio = avgDiameter / Math.max(0.0001, cellSize)
  const speedMul = crowdRatio > 1 ? Math.max(0.5, 1 / (1 + 0.8 * (crowdRatio - 1))) : 1

  const w = typeof window !== 'undefined' ? window.innerWidth : 1920
  const mobileScale = w < 640 ? 0.8 : (w < 768 ? 0.9 : 1)

  for (const s of shapes) {
    s.vel[0] *= speedMul
    s.vel[1] *= speedMul
  }
  eff.repelStrength = props.repelStrength * speedMul * mobileScale
  eff.repelRadius   = props.repelRadius   * mobileScale
  eff.maxSpeed      = props.maxSpeed      * speedMul * mobileScale
  eff.dtCap         = w < 640 ? 0.025 : 0.033
}

/* ---------- Мышь/тач и отталкивание ---------- */
const mouseNorm = reactive({ x: 0, y: 0 })
let hasPointer = false
const raycaster = new THREE.Raycaster()

// актуальный луч в кадре (обновляется в onLoop)
const lastRay = {
  origin: new THREE.Vector3(),
  dir: new THREE.Vector3(0, 0, -1)
}

function updatePointerFromEvent(e) {
  const w = window.innerWidth || 1
  const h = window.innerHeight || 1
  mouseNorm.x = (e.clientX / w) * 2 - 1
  mouseNorm.y = -(e.clientY / h) * 2 + 1
}
function onPointerDown(e){ hasPointer = true; updatePointerFromEvent(e) }
function onPointerMove(e){ hasPointer = true; updatePointerFromEvent(e) }
function onPointerUp(){ hasPointer = false }
function onPointerCancel(){ hasPointer = false }
function onPointerLeave(){ hasPointer = false }

/**
 * Возвращает точку на луче под текущим курсором на высоте z=z0.
 * Если d.z слишком мал (почти параллелен плоскости), возвращаем точку при z=0.
 */
function mousePointAtZ(z0) {
  const oz = lastRay.origin.z
  const dz = lastRay.dir.z
  let t
  if (Math.abs(dz) < 1e-4) {
    // почти параллель — fallback к z=0, чтобы было стабильно
    if (Math.abs(dz) < 1e-6) return new THREE.Vector2(1e9, 1e9) // effectively no influence
    t = (0 - oz) / dz
  } else {
    t = (z0 - oz) / dz
  }
  _tmp3.copy(lastRay.dir).multiplyScalar(t).add(lastRay.origin)
  return _tmp2.set(_tmp3.x, _tmp3.y)
}

const _tmp2 = new THREE.Vector2()
const _tmp3 = new THREE.Vector3()

/* ---------- Resize/Theme listeners ---------- */
function onResize() {
  recomputeWorldBounds()
  const { w, qChanged } = updateAdaptiveKnobs()
  const newCount = getCountForWidth(w)
  if (newCount !== shapes.length || qChanged) {
    createShapes()
  } else {
    const basePositions = gridPositions(shapes.length)
    for (let i = 0; i < shapes.length; i++) {
      shapes[i].pos[0] = basePositions[i][0]
      shapes[i].pos[1] = basePositions[i][1]
    }
  }
}

onMounted(() => {
  isDark.value = detectDark()
  pickPalette()
  recomputeWorldBounds()
  updateAdaptiveKnobs()
  createShapes()

  window.addEventListener('pointerdown', onPointerDown, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerup', onPointerUp, { passive: true })
  window.addEventListener('pointercancel', onPointerCancel, { passive: true })
  window.addEventListener('pointerleave', onPointerLeave, { passive: true })

  window.addEventListener('resize', onResize)
  window.addEventListener('orientationchange', onResize)

  if (props.theme === 'auto') {
    const obs = new MutationObserver(() => {
      const nd = detectDark()
      if (nd !== isDark.value) { isDark.value = nd; pickPalette(true) }
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const mm = window.matchMedia('(prefers-color-scheme: dark)')
    const cb = () => { const nd = detectDark(); if (nd !== isDark.value) { isDark.value = nd; pickPalette(true) } }
    mm.addEventListener?.('change', cb)

    onBeforeUnmount(() => { obs.disconnect(); mm.removeEventListener?.('change', cb) })
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerCancel)
  window.removeEventListener('pointerleave', onPointerLeave)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('orientationchange', onResize)
})

/* ---------- Физика ---------- */
function integrateAndCollide(delta) {
  const damp = 0.999
  const wL = -world.halfWidth, wR = world.halfWidth
  const wB = -world.halfHeight, wT = world.halfHeight

  const cam = cameraRef.value && (cameraRef.value.value ?? cameraRef.value)

  // строим луч под курсором один раз за кадр
  if (hasPointer && cam) {
    raycaster.setFromCamera({ x: mouseNorm.x, y: mouseNorm.y }, cam)
    lastRay.origin.copy(raycaster.ray.origin)
    lastRay.dir.copy(raycaster.ray.direction)
  }

  for (const s of shapes) {
    if (hasPointer) {
      // XY-точка курсора на плоскости z = z_фигуры
      const mp = mousePointAtZ(s.pos[2])

      const dx = s.pos[0] - mp.x
      const dy = s.pos[1] - mp.y
      const dist2 = dx*dx + dy*dy
      const r = Math.max(eff.repelRadius, 0.001), r2 = r*r
      if (dist2 < r2) {
        const dist = Math.max(Math.sqrt(dist2), 0.0001)
        const nx = dx / dist, ny = dy / dist
        const k = (1 - dist / r) * eff.repelStrength
        s.vel[0] += nx * k * delta
        s.vel[1] += ny * k * delta
      }
    }

    const sp2 = s.vel[0]*s.vel[0] + s.vel[1]*s.vel[1]
    if (sp2 > eff.maxSpeed*eff.maxSpeed) {
      const inv = eff.maxSpeed / Math.sqrt(sp2)
      s.vel[0] *= inv; s.vel[1] *= inv
    }

    s.pos[0] += s.vel[0] * delta
    s.pos[1] += s.vel[1] * delta

    if (s.pos[0] - s.radius < wL) { s.pos[0] = wL + s.radius; s.vel[0] = Math.abs(s.vel[0]) }
    else if (s.pos[0] + s.radius > wR) { s.pos[0] = wR - s.radius; s.vel[0] = -Math.abs(s.vel[0]) }
    if (s.pos[1] - s.radius < wB) { s.pos[1] = wB + s.radius; s.vel[1] = Math.abs(s.vel[1]) }
    else if (s.pos[1] + s.radius > wT) { s.pos[1] = wT - s.radius; s.vel[1] = -Math.abs(s.vel[1]) }

    s.vel[0] *= damp; s.vel[1] *= damp
  }

  // простые сферические коллизии 2D (в плоскости XY)
  for (let i = 0; i < shapes.length; i++) {
    const a = shapes[i]
    for (let j = i + 1; j < shapes.length; j++) {
      const b = shapes[j]
      const dx = b.pos[0] - a.pos[0]
      const dy = b.pos[1] - a.pos[1]
      const dist2 = dx*dx + dy*dy
      const minDist = a.radius + b.radius
      if (dist2 <= 0 || dist2 >= minDist*minDist) continue

      const dist = Math.sqrt(dist2)
      const nx = dx / dist, ny = dy / dist
      const overlap = (minDist - dist) * 0.5
      a.pos[0] -= nx * overlap; a.pos[1] -= ny * overlap
      b.pos[0] += nx * overlap; b.pos[1] += ny * overlap

      const va = a.vel[0]*nx + a.vel[1]*ny
      const vb = b.vel[0]*nx + b.vel[1]*ny
      if (va - vb <= 0) {
        const ma = a.radius * a.radius
        const mb = b.radius * b.radius
        const va2 = (va * (ma - mb) + 2 * mb * vb) / (ma + mb)
        const vb2 = (vb * (mb - ma) + 2 * ma * va) / (ma + mb)
        const dva = va2 - va, dvb = vb2 - vb
        a.vel[0] += dva*nx; a.vel[1] += dva*ny
        b.vel[0] += dvb*nx; b.vel[1] += dvb*ny
      }
    }
  }
}

/* ---------- Рендерлуп ---------- */
const { onLoop } = useRenderLoop()
onLoop(({ delta }) => {
  integrateAndCollide(Math.min(delta, eff.dtCap))
  for (const s of shapes) {
    const holder = shapeNodes.get(s.id)
    const node = holder && (holder.value ?? holder)
    if (!node) continue
    node.position.set(s.pos[0], s.pos[1], s.pos[2])
    node.rotation.x += s.rot[0] * delta
    node.rotation.y += s.rot[1] * delta
    node.rotation.z += s.rot[2] * delta
  }
})

/* ---------- Пересборка геометрий при смене качества ---------- */
watch(() => props.quality, () => { onResize() })
</script>

<style scoped>
.floating-bg {
  inset: 0;
  z-index: 0;            /* на одном слое с секцией */
  pointer-events: none;  /* не мешаем кликам */
  overflow: hidden;
}
.floating-bg.is-fixed { position: fixed; }
.floating-bg.is-absolute { position: absolute; }

/* Фон под темы */
.bg-gradient {
  position: absolute;
  inset: 0;
  z-index: 0;
  filter: saturate(1.05);
}
.bg-gradient.dark {
  background:
      radial-gradient(60% 50% at 70% 30%, rgba(100,130,160,0.22) 0%, rgba(0,0,0,0) 60%),
      radial-gradient(50% 40% at 20% 70%, rgba(200,80,100,0.18) 0%, rgba(0,0,0,0) 60%),
      linear-gradient(180deg, #0e0f12 0%, #0b0c0f 100%);
}
.bg-gradient.light {
  background:
      radial-gradient(60% 50% at 70% 30%, rgba(120,150,180,0.25) 0%, rgba(255,255,255,0) 60%),
      radial-gradient(50% 40% at 20% 70%, rgba(255,180,200,0.20) 0%, rgba(255,255,255,0) 60%),
      linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%);
}
</style>
