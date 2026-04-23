import { useState, useEffect, useRef, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────
interface Task { id: number; text: string; done: boolean }
interface Phase { id: number; name: string; tasks: Task[] }
interface ProductionEntry { id: number; date: string; meters: number }
interface Campaign { id: number; name: string; inv: number; sales: number; meters: number }
interface ProductEntry { id: number; name: string; qty: number; price: number }
interface Idea { id: number; text: string; priority: 'Alta' | 'Media' | 'Baja'; done: boolean }
interface StockItem { id: number; name: string; qty: number; min: number }
interface Metrics { leads: number; salesCount: number; goal: number }

// ── Persistence helpers ────────────────────────────────────────────
function dbGet<T>(key: string, def: T): T {
  try { return JSON.parse(localStorage.getItem('dtf_' + key) ?? 'null') ?? def } catch { return def }
}
function dbSet(key: string, val: unknown) {
  localStorage.setItem('dtf_' + key, JSON.stringify(val))
}

// ── Utils ──────────────────────────────────────────────────────────
function fmt(n: number) { return Number(n).toLocaleString('es', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }
function formatDate(d: string) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
function today() { return new Date().toISOString().split('T')[0] }

// ── Default plan data ──────────────────────────────────────────────
const DEFAULT_PHASES: Phase[] = [
  { id: 1, name: 'Fase 1 — Infraestructura', tasks: [
    { id: 1, text: 'Adquirir equipos (impresora, curado)', done: false },
    { id: 2, text: 'Instalar y calibrar maquinaria', done: false },
    { id: 3, text: 'Configurar espacio de trabajo', done: false },
  ]},
  { id: 2, name: 'Fase 2 — Operaciones', tasks: [
    { id: 4, text: 'Establecer proveedores de insumos', done: false },
    { id: 5, text: 'Definir precios y catálogo', done: false },
  ]},
  { id: 3, name: 'Fase 3 — Lanzamiento', tasks: [
    { id: 6, text: 'Primeros clientes piloto', done: false },
    { id: 7, text: 'Marketing inicial (redes sociales)', done: false },
  ]},
]

// ── Chart helper ───────────────────────────────────────────────────
function drawChart(canvas: HTMLCanvasElement, labels: string[], data: number[]) {
  const ctx = canvas.getContext('2d')
  if (!ctx || !data.length) return
  const W = canvas.parentElement?.clientWidth || 600
  const H = 200
  canvas.width = W
  canvas.height = H
  const pad = { top: 20, right: 20, bottom: 40, left: 55 }
  const chartW = W - pad.left - pad.right
  const chartH = H - pad.top - pad.bottom
  const max = Math.max(...data) * 1.1 || 10
  ctx.clearRect(0, 0, W, H)
  ctx.font = '11px system-ui'
  for (let i = 0; i <= 5; i++) {
    const v = (max / 5) * i
    const y = pad.top + chartH - (i / 5) * chartH
    ctx.strokeStyle = 'rgba(51,65,85,0.6)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke()
    ctx.fillStyle = '#94a3b8'
    ctx.textAlign = 'right'
    ctx.fillText(Math.round(v).toString(), pad.left - 6, y + 4)
  }
  const step = Math.max(1, Math.floor(labels.length / 8))
  labels.forEach((lbl, i) => {
    if (i % step !== 0) return
    const x = pad.left + (i / (labels.length - 1 || 1)) * chartW
    ctx.fillStyle = '#94a3b8'
    ctx.textAlign = 'center'
    ctx.fillText(lbl, x, H - 8)
  })
  ctx.beginPath()
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  data.forEach((v, i) => {
    const x = pad.left + (i / (data.length - 1 || 1)) * chartW
    const y = pad.top + chartH - (v / max) * chartH
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  })
  ctx.stroke()
  ctx.beginPath()
  data.forEach((v, i) => {
    const x = pad.left + (i / (data.length - 1 || 1)) * chartW
    const y = pad.top + chartH - (v / max) * chartH
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  })
  ctx.lineTo(pad.left + chartW, pad.top + chartH)
  ctx.lineTo(pad.left, pad.top + chartH)
  ctx.closePath()
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH)
  grad.addColorStop(0, 'rgba(59,130,246,0.35)')
  grad.addColorStop(1, 'rgba(59,130,246,0.03)')
  ctx.fillStyle = grad
  ctx.fill()
}

// ══════════════════════════════════════════════════════════════════
// Main Dashboard Component
// ══════════════════════════════════════════════════════════════════
export default function DTFDashboard() {
  const [activeTab, setActiveTab] = useState('plan')
  const [now, setNow] = useState('')

  useEffect(() => {
    const update = () => {
      const d = new Date()
      setNow(
        d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ' · ' + d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
      )
    }
    update()
    const t = setInterval(update, 30000)
    return () => clearInterval(t)
  }, [])

  const tabs = [
    { id: 'plan', label: '📋 Plan' },
    { id: 'produccion', label: '⚙️ Producción' },
    { id: 'campanas', label: '📣 Campañas' },
    { id: 'productos', label: '📦 Productos' },
    { id: 'ideas', label: '💡 Ideas' },
    { id: 'stock', label: '🗃️ Stock' },
    { id: 'metricas', label: '📊 Métricas' },
  ]

  return (
    <>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px', margin: 0 }}>🖨️ DTF Print — Panel Operacional</h1>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>{now}</span>
        </div>
      </header>

      <nav className="tabs">
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <div className="content" style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        {activeTab === 'plan' && <PlanSection />}
        {activeTab === 'produccion' && <ProduccionSection />}
        {activeTab === 'campanas' && <CampanasSection />}
        {activeTab === 'productos' && <ProductosSection />}
        {activeTab === 'ideas' && <IdeasSection />}
        {activeTab === 'stock' && <StockSection />}
        {activeTab === 'metricas' && <MetricasSection />}
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════
// 1. PLAN
// ══════════════════════════════════════════════════════════════════
function PlanSection() {
  const [phases, setPhases] = useState<Phase[]>(() => dbGet('phases', DEFAULT_PHASES))
  const [phaseSeq, setPhaseSeq] = useState(() => dbGet('phaseIdSeq', 10))
  const [taskSeq, setTaskSeq] = useState(() => dbGet('taskIdSeq', 20))

  const save = useCallback((p: Phase[], ps: number, ts: number) => {
    dbSet('phases', p); dbSet('phaseIdSeq', ps); dbSet('taskIdSeq', ts)
  }, [])

  const allTasks = phases.flatMap(p => p.tasks)
  const done = allTasks.filter(t => t.done).length
  const pct = allTasks.length ? Math.round((done / allTasks.length) * 100) : 0

  const addPhase = () => {
    const ns = phaseSeq + 1
    const np = [...phases, { id: ns, name: 'Nueva fase', tasks: [] }]
    setPhaseSeq(ns); setPhases(np); save(np, ns, taskSeq)
  }
  const deletePhase = (pi: number) => {
    if (!confirm('¿Eliminar esta fase?')) return
    const np = phases.filter((_, i) => i !== pi); setPhases(np); save(np, phaseSeq, taskSeq)
  }
  const renamePhase = (pi: number, val: string) => {
    const np = phases.map((p, i) => i === pi ? { ...p, name: val } : p)
    setPhases(np); save(np, phaseSeq, taskSeq)
  }
  const addTask = (pi: number) => {
    const ns = taskSeq + 1
    const np = phases.map((p, i) => i === pi ? { ...p, tasks: [...p.tasks, { id: ns, text: 'Nueva tarea', done: false }] } : p)
    setTaskSeq(ns); setPhases(np); save(np, phaseSeq, ns)
  }
  const deleteTask = (pi: number, ti: number) => {
    const np = phases.map((p, i) => i === pi ? { ...p, tasks: p.tasks.filter((_, j) => j !== ti) } : p)
    setPhases(np); save(np, phaseSeq, taskSeq)
  }
  const toggleTask = (pi: number, ti: number, val: boolean) => {
    const np = phases.map((p, i) => i === pi ? { ...p, tasks: p.tasks.map((t, j) => j === ti ? { ...t, done: val } : t) } : p)
    setPhases(np); save(np, phaseSeq, taskSeq)
  }
  const editTask = (pi: number, ti: number, val: string) => {
    const np = phases.map((p, i) => i === pi ? { ...p, tasks: p.tasks.map((t, j) => j === ti ? { ...t, text: val } : t) } : p)
    setPhases(np); save(np, phaseSeq, taskSeq)
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Plan de Despliegue</h2>
        <button className="btn btn-blue" onClick={addPhase}>+ Nueva fase</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div className="progress-wrap" style={{ flex: 1 }}>
          <div className="progress-bar green" style={{ width: pct + '%' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', color: 'var(--green)' }}>{pct}%</span>
      </div>
      {phases.map((phase, pi) => {
        const doneTasks = phase.tasks.filter(t => t.done).length
        const phasePct = phase.tasks.length ? Math.round((doneTasks / phase.tasks.length) * 100) : 0
        return (
          <div key={phase.id} className="phase">
            <div className="phase-header">
              <input className="phase-name-input" type="text" defaultValue={phase.name}
                onBlur={e => renamePhase(pi, e.target.value)} />
              <span className="text-muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{doneTasks}/{phase.tasks.length} · {phasePct}%</span>
              <button className="btn btn-blue btn-sm" onClick={() => addTask(pi)}>+ Tarea</button>
              <button className="btn btn-red btn-sm" onClick={() => deletePhase(pi)}>✕</button>
            </div>
            {phase.tasks.map((task, ti) => (
              <div key={task.id} className={`task-row${task.done ? ' done' : ''}`}>
                <input type="checkbox" checked={task.done} onChange={e => toggleTask(pi, ti, e.target.checked)} />
                <input className="task-text-input" type="text" defaultValue={task.text}
                  onBlur={e => editTask(pi, ti, e.target.value)} />
                <button className="btn btn-red btn-sm" onClick={() => deleteTask(pi, ti)}>✕</button>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// 2. PRODUCCIÓN
// ══════════════════════════════════════════════════════════════════
function ProduccionSection() {
  const [production, setProduction] = useState<ProductionEntry[]>(() => dbGet('production', []))
  const [date, setDate] = useState(today())
  const [meters, setMeters] = useState('')
  const [sortKey, setSortKey] = useState<'date' | 'meters'>('date')
  const [sortDir, setSortDir] = useState(-1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const total = production.reduce((a, p) => a + p.meters, 0)
  const avg = production.length ? (total / production.length).toFixed(1) : '0'

  useEffect(() => {
    if (!canvasRef.current) return
    const sorted = [...production].sort((a, b) => a.date.localeCompare(b.date))
    if (!sorted.length) return
    let cum = 0
    const labels = sorted.map(p => formatDate(p.date))
    const data = sorted.map(p => { cum += p.meters; return cum })
    drawChart(canvasRef.current, labels, data)
  }, [production])

  const addProduction = () => {
    const m = parseFloat(meters)
    if (!date || isNaN(m) || m < 0) return alert('Ingresa fecha y metros válidos.')
    const np = [...production, { id: Date.now(), date, meters: m }]
    setProduction(np); dbSet('production', np); setMeters('')
  }

  const deleteProduction = (id: number) => {
    const np = production.filter(p => p.id !== id)
    setProduction(np); dbSet('production', np)
  }

  const toggleSort = (key: 'date' | 'meters') => {
    if (sortKey === key) setSortDir(d => d * -1); else { setSortKey(key); setSortDir(-1) }
  }

  const sorted = [...production].sort((a, b) => {
    const va = sortKey === 'date' ? a.date : a.meters
    const vb = sortKey === 'date' ? b.date : b.meters
    return va < vb ? sortDir : va > vb ? -sortDir : 0
  })

  return (
    <>
      <div className="stats-row">
        <div className="stat-card"><div className="label">Total metros</div><div className="value">{total.toFixed(1)}</div></div>
        <div className="stat-card"><div className="label">Promedio/día</div><div className="value">{avg}</div></div>
        <div className="stat-card"><div className="label">Días registrados</div><div className="value">{production.length}</div></div>
      </div>
      <div className="card">
        <h2>Registrar producción diaria</h2>
        <div className="input-row">
          <div><label>Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div><label>Metros impresos</label><input type="number" value={meters} placeholder="0.0" step="0.1" min="0" onChange={e => setMeters(e.target.value)} /></div>
          <button className="btn btn-green" onClick={addProduction}>Guardar</button>
        </div>
      </div>
      <div className="card">
        <h2>Crecimiento acumulado</h2>
        <canvas ref={canvasRef} height={200} />
      </div>
      <div className="card">
        <h2>Historial <span className="text-muted" style={{ fontSize: 12, fontWeight: 400 }}>(clic columna para ordenar)</span></h2>
        <table>
          <thead><tr>
            <th onClick={() => toggleSort('date')} style={{ cursor: 'pointer' }}>Fecha ↕</th>
            <th onClick={() => toggleSort('meters')} style={{ cursor: 'pointer' }}>Metros ↕</th>
            <th style={{ width: 60 }}></th>
          </tr></thead>
          <tbody>
            {sorted.length ? sorted.map(p => (
              <tr key={p.id}>
                <td>{formatDate(p.date)}</td>
                <td>{p.meters.toFixed(1)} m</td>
                <td><button className="btn btn-red btn-sm" onClick={() => deleteProduction(p.id)}>✕</button></td>
              </tr>
            )) : <tr><td colSpan={3} className="empty">Sin registros</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════
// 3. CAMPAÑAS
// ══════════════════════════════════════════════════════════════════
function CampanasSection() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => dbGet('campaigns', []))
  const [name, setName] = useState(''); const [inv, setInv] = useState(''); const [sales, setSales] = useState(''); const [meters, setMeters] = useState('')

  const add = () => {
    if (!name.trim()) return alert('Ingresa el nombre de la campaña.')
    const nc = [...campaigns, { id: Date.now(), name: name.trim(), inv: parseFloat(inv) || 0, sales: parseFloat(sales) || 0, meters: parseFloat(meters) || 0 }]
    setCampaigns(nc); dbSet('campaigns', nc); setName(''); setInv(''); setSales(''); setMeters('')
  }
  const del = (id: number) => { const nc = campaigns.filter(c => c.id !== id); setCampaigns(nc); dbSet('campaigns', nc) }

  return (
    <>
      <div className="card">
        <h2>Nueva campaña</h2>
        <div className="input-row">
          <div style={{ gridColumn: 'span 2' }}><label>Nombre</label><input type="text" value={name} placeholder="Campaña verano" onChange={e => setName(e.target.value)} /></div>
          <div><label>Inversión $</label><input type="number" value={inv} placeholder="0" min="0" onChange={e => setInv(e.target.value)} /></div>
          <div><label>Ventas $</label><input type="number" value={sales} placeholder="0" min="0" onChange={e => setSales(e.target.value)} /></div>
          <div><label>Metros vendidos</label><input type="number" value={meters} placeholder="0" step="0.1" min="0" onChange={e => setMeters(e.target.value)} /></div>
          <button className="btn btn-green" onClick={add}>Guardar</button>
        </div>
      </div>
      <div className="card">
        <h2>Campañas registradas</h2>
        <table>
          <thead><tr><th>Nombre</th><th>Inversión</th><th>Ventas</th><th>Metros</th><th>ROI</th><th></th></tr></thead>
          <tbody>
            {campaigns.length ? campaigns.map(c => {
              const roi = c.sales - c.inv
              return (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>${fmt(c.inv)}</td>
                  <td>${fmt(c.sales)}</td>
                  <td>{c.meters.toFixed(1)} m</td>
                  <td className={roi >= 0 ? 'text-green' : 'text-red'} style={{ fontWeight: 600 }}>${fmt(roi)}</td>
                  <td><button className="btn btn-red btn-sm" onClick={() => del(c.id)}>✕</button></td>
                </tr>
              )
            }) : <tr><td colSpan={6} className="empty">Sin campañas</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════
// 4. PRODUCTOS
// ══════════════════════════════════════════════════════════════════
function ProductosSection() {
  const [products, setProducts] = useState<ProductEntry[]>(() => dbGet('products', []))
  const [name, setName] = useState(''); const [qty, setQty] = useState(''); const [price, setPrice] = useState('')

  const add = () => {
    if (!name.trim() || parseFloat(qty) <= 0) return alert('Ingresa nombre y cantidad válida.')
    const q = parseFloat(qty) || 0; const p = parseFloat(price) || 0
    const existing = products.find(x => x.name.toLowerCase() === name.trim().toLowerCase())
    let np: ProductEntry[]
    if (existing) np = products.map(x => x.id === existing.id ? { ...x, qty: x.qty + q, price: p } : x)
    else np = [...products, { id: Date.now(), name: name.trim(), qty: q, price: p }]
    setProducts(np); dbSet('products', np); setName(''); setQty(''); setPrice('')
  }
  const del = (id: number) => { const np = products.filter(p => p.id !== id); setProducts(np); dbSet('products', np) }

  const sorted = [...products].sort((a, b) => b.qty - a.qty)

  return (
    <>
      <div className="card">
        <h2>Registrar venta de producto</h2>
        <div className="input-row">
          <div style={{ gridColumn: 'span 2' }}><label>Producto</label><input type="text" value={name} placeholder="Nombre del producto" onChange={e => setName(e.target.value)} /></div>
          <div><label>Cantidad vendida</label><input type="number" value={qty} placeholder="0" min="0" onChange={e => setQty(e.target.value)} /></div>
          <div><label>Precio unitario $</label><input type="number" value={price} placeholder="0" step="0.01" min="0" onChange={e => setPrice(e.target.value)} /></div>
          <button className="btn btn-green" onClick={add}>Guardar</button>
        </div>
      </div>
      <div className="card">
        <h2>Ranking por cantidad vendida</h2>
        <table>
          <thead><tr><th>#</th><th>Producto</th><th>Qty vendida</th><th>Precio unit.</th><th>Total $</th><th></th></tr></thead>
          <tbody>
            {sorted.length ? sorted.map((p, i) => (
              <tr key={p.id}>
                <td style={{ color: 'var(--muted)', fontWeight: 700 }}>{i + 1}</td>
                <td>{p.name}</td>
                <td style={{ fontWeight: 600 }}>{p.qty}</td>
                <td>${fmt(p.price)}</td>
                <td style={{ color: 'var(--green)' }}>${fmt(p.qty * p.price)}</td>
                <td><button className="btn btn-red btn-sm" onClick={() => del(p.id)}>✕</button></td>
              </tr>
            )) : <tr><td colSpan={6} className="empty">Sin productos</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════
// 5. IDEAS / BACKLOG
// ══════════════════════════════════════════════════════════════════
function IdeasSection() {
  const [ideas, setIdeas] = useState<Idea[]>(() => dbGet('ideas', []))
  const [text, setText] = useState(''); const [priority, setPriority] = useState<Idea['priority']>('Media')

  const add = () => {
    if (!text.trim()) return alert('Escribe la idea primero.')
    const ni = [...ideas, { id: Date.now(), text: text.trim(), priority, done: false }]
    setIdeas(ni); dbSet('ideas', ni); setText('')
  }
  const toggle = (id: number) => { const ni = ideas.map(i => i.id === id ? { ...i, done: !i.done } : i); setIdeas(ni); dbSet('ideas', ni) }
  const del = (id: number) => { const ni = ideas.filter(i => i.id !== id); setIdeas(ni); dbSet('ideas', ni) }

  const order: Record<string, number> = { Alta: 0, Media: 1, Baja: 2 }
  const sorted = [...ideas].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    return (order[a.priority] ?? 1) - (order[b.priority] ?? 1)
  })

  return (
    <>
      <div className="card">
        <h2>Nueva idea / backlog</h2>
        <div className="input-row">
          <div style={{ gridColumn: 'span 2' }}><label>Idea</label><input type="text" value={text} placeholder="Descripción de la idea" onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} /></div>
          <div>
            <label>Prioridad</label>
            <select value={priority} onChange={e => setPriority(e.target.value as Idea['priority'])}>
              <option value="Alta">🔴 Alta</option>
              <option value="Media">🟡 Media</option>
              <option value="Baja">🟢 Baja</option>
            </select>
          </div>
          <button className="btn btn-green" onClick={add}>Agregar</button>
        </div>
      </div>
      <div className="card">
        <h2>Backlog de ideas</h2>
        {sorted.length ? sorted.map(idea => (
          <div key={idea.id} className={`idea-row${idea.done ? ' done' : ''}`}>
            <span className={`badge badge-${idea.priority.toLowerCase()}`}>{idea.priority}</span>
            <span className="idea-text">{idea.text}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => toggle(idea.id)}>{idea.done ? '↩ Reabrir' : '✓ Hecho'}</button>
            <button className="btn btn-red btn-sm" onClick={() => del(idea.id)}>✕</button>
          </div>
        )) : <div className="empty">Sin ideas registradas</div>}
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════
// 6. STOCK
// ══════════════════════════════════════════════════════════════════
function StockSection() {
  const [stock, setStock] = useState<StockItem[]>(() => dbGet('stock', []))
  const [name, setName] = useState(''); const [qty, setQty] = useState(''); const [min, setMin] = useState('')

  const add = () => {
    if (!name.trim() || qty === '' || min === '') return alert('Completa todos los campos.')
    const q = parseFloat(qty); const m = parseFloat(min)
    if (isNaN(q) || isNaN(m)) return alert('Completa todos los campos.')
    const existing = stock.find(s => s.name.toLowerCase() === name.trim().toLowerCase())
    let ns: StockItem[]
    if (existing) ns = stock.map(s => s.id === existing.id ? { ...s, qty: q, min: m } : s)
    else ns = [...stock, { id: Date.now(), name: name.trim(), qty: q, min: m }]
    setStock(ns); dbSet('stock', ns); setName(''); setQty(''); setMin('')
  }
  const del = (id: number) => { const ns = stock.filter(s => s.id !== id); setStock(ns); dbSet('stock', ns) }
  const editQty = (id: number, val: string) => {
    const ns = stock.map(s => s.id === id ? { ...s, qty: parseFloat(val) || 0 } : s)
    setStock(ns); dbSet('stock', ns)
  }

  const sorted = [...stock].sort((a, b) => (a.qty < a.min ? 0 : 1) - (b.qty < b.min ? 0 : 1))

  return (
    <>
      <div className="card">
        <h2>Agregar insumo</h2>
        <div className="input-row">
          <div style={{ gridColumn: 'span 2' }}><label>Insumo</label><input type="text" value={name} placeholder="Tinta blanca, rollo, etc." onChange={e => setName(e.target.value)} /></div>
          <div><label>Cantidad actual</label><input type="number" value={qty} placeholder="0" step="0.1" min="0" onChange={e => setQty(e.target.value)} /></div>
          <div><label>Mínimo requerido</label><input type="number" value={min} placeholder="0" step="0.1" min="0" onChange={e => setMin(e.target.value)} /></div>
          <button className="btn btn-green" onClick={add}>Guardar</button>
        </div>
      </div>
      <div className="card">
        <h2>Inventario</h2>
        <table>
          <thead><tr><th>Insumo</th><th>Cantidad</th><th>Mínimo</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {sorted.length ? sorted.map(s => {
              const alert = s.qty < s.min
              return (
                <tr key={s.id} className={alert ? 'stock-alert' : ''}>
                  <td>{alert ? '⚠️ ' : ''}{s.name}</td>
                  <td><input type="number" defaultValue={s.qty} step="0.1" min="0" style={{ width: 80 }} onBlur={e => editQty(s.id, e.target.value)} /></td>
                  <td>{s.min}</td>
                  <td>{alert ? <span className="badge badge-alta">Bajo stock</span> : <span className="badge badge-baja">OK</span>}</td>
                  <td><button className="btn btn-red btn-sm" onClick={() => del(s.id)}>✕</button></td>
                </tr>
              )
            }) : <tr><td colSpan={5} className="empty">Sin insumos</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════
// 7. MÉTRICAS
// ══════════════════════════════════════════════════════════════════
function MetricasSection() {
  const [metrics, setMetrics] = useState<Metrics>(() => dbGet('metrics', { leads: 0, salesCount: 0, goal: 0 }))
  const production: ProductionEntry[] = dbGet('production', [])
  const prodTotal = production.reduce((a, p) => a + p.meters, 0)

  const update = (key: keyof Metrics, val: string) => {
    const nm = { ...metrics, [key]: parseFloat(val) || 0 }
    setMetrics(nm); dbSet('metrics', nm)
  }

  const conv = metrics.leads > 0 ? ((metrics.salesCount / metrics.leads) * 100).toFixed(1) : '0'
  const goalPct = metrics.goal > 0 ? Math.min(((prodTotal / metrics.goal) * 100), 9999).toFixed(1) : '0'
  const rem = metrics.goal > 0 ? Math.max(metrics.goal - prodTotal, 0).toFixed(1) + ' m' : '—'
  const barW = Math.min(parseFloat(goalPct), 100)

  return (
    <>
      <div className="card">
        <h2>Entradas de métricas</h2>
        <div className="input-row">
          <div><label>Leads totales</label><input type="number" value={metrics.leads || ''} placeholder="0" min="0" onChange={e => update('leads', e.target.value)} /></div>
          <div><label>Ventas cerradas</label><input type="number" value={metrics.salesCount || ''} placeholder="0" min="0" onChange={e => update('salesCount', e.target.value)} /></div>
          <div><label>Meta metros (mes)</label><input type="number" value={metrics.goal || ''} placeholder="0" step="0.1" min="0" onChange={e => update('goal', e.target.value)} /></div>
        </div>
      </div>
      <div className="stats-row">
        <div className="stat-card"><div className="label">Tasa de conversión</div><div className="value">{conv}%</div></div>
        <div className="stat-card"><div className="label">Progreso meta metros</div><div className="value">{goalPct}%</div></div>
        <div className="stat-card"><div className="label">Metros producidos</div><div className="value">{prodTotal.toFixed(1)}</div></div>
        <div className="stat-card"><div className="label">Meta restante</div><div className="value">{rem}</div></div>
      </div>
      <div className="card">
        <h2>Progreso meta de metros</h2>
        <div className="progress-wrap" style={{ height: 14 }}>
          <div className="progress-bar" style={{ width: barW + '%' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span className="text-muted" style={{ fontSize: 12 }}>{prodTotal.toFixed(1)} / {metrics.goal} metros</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{goalPct}%</span>
        </div>
      </div>
    </>
  )
}
