import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'

const API = 'https://barber-saas-1-fpjl.onrender.com/api'

const CATEGORIES = ['todos', 'pomada', 'shampoo', 'lâmina', 'tintura', 'outros']

export default function Stock() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todos')
  const [showModal, setShowModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name: '', category: 'outros', description: '', price: '', cost: '', quantity: '', min_quantity: '5', unit: 'un' })
  const [stockForm, setStockForm] = useState({ quantity: '', type: 'add' })

  const token = localStorage.getItem('token')
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/products`, { headers })
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const createProduct = async () => {
    try {
      await fetch(`${API}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(form),
      })
      setShowModal(false)
      setForm({ name: '', category: 'outros', description: '', price: '', cost: '', quantity: '', min_quantity: '5', unit: 'un' })
      fetchProducts()
    } catch (err) {
      console.error(err)
    }
  }

  const adjustStock = async () => {
    try {
      await fetch(`${API}/products/${selected.id}/stock`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(stockForm),
      })
      setShowStockModal(false)
      setStockForm({ quantity: '', type: 'add' })
      fetchProducts()
    } catch (err) {
      console.error(err)
    }
  }

  const deleteProduct = async (id) => {
    if (!confirm('Excluir produto?')) return
    try {
      await fetch(`${API}/products/${id}`, { method: 'DELETE', headers })
      fetchProducts()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = filter === 'todos' ? products : products.filter(p => p.category === filter)
  const lowStock = products.filter(p => p.low_stock)

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Estoque</h1>
            <p style={styles.subtitle}>Controle de produtos e insumos da barbearia</p>
          </div>
          <button onClick={() => setShowModal(true)} style={styles.newBtn}>
            <i className="ti ti-plus" style={{ marginRight: '6px' }}></i>
            Novo Produto
          </button>
        </div>

        {/* Alerta estoque baixo */}
        {lowStock.length > 0 && (
          <div style={styles.alert}>
            <i className="ti ti-alert-triangle" style={{ marginRight: '8px', color: '#fb923c' }}></i>
            <span><strong>{lowStock.length} produto(s)</strong> com estoque baixo: {lowStock.map(p => p.name).join(', ')}</span>
          </div>
        )}

        {/* Filtros */}
        <div style={styles.filters}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{ ...styles.filterBtn, ...(filter === c ? styles.filterBtnActive : {}) }}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div style={styles.empty}>
            <div style={styles.spinner}></div>
            <p style={{ margin: '16px 0 4px', color: '#a1a1aa' }}>Carregando produtos...</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#52525b' }}>Isso pode levar até 30 segundos na primeira vez</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <i className="ti ti-package-off" style={{ fontSize: '40px', color: '#3f3f46', marginBottom: '12px', display: 'block' }}></i>
            <p style={{ margin: 0, color: '#71717a' }}>Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(product => (
              <div key={product.id} style={{ ...styles.card, ...(product.low_stock ? styles.cardLow : {}) }}>
                <div style={styles.cardHeader}>
                  <div>
                    <p style={styles.productName}>{product.name}</p>
                    <span style={styles.categoryBadge}>{product.category}</span>
                  </div>
                  {product.low_stock && (
                    <span style={styles.lowBadge}>⚠️ Baixo</span>
                  )}
                </div>

                <div style={styles.stockRow}>
                  <div style={styles.stockInfo}>
                    <span style={styles.stockNum}>{product.quantity}</span>
                    <span style={styles.stockUnit}>{product.unit}</span>
                  </div>
                  <span style={styles.minStock}>Mín: {product.min_quantity}</span>
                </div>

                <div style={styles.priceRow}>
                  <span style={styles.price}>Venda: R$ {Number(product.price).toFixed(2)}</span>
                  <span style={styles.cost}>Custo: R$ {Number(product.cost).toFixed(2)}</span>
                </div>

                {product.description && (
                  <p style={styles.description}>{product.description}</p>
                )}

                <div style={styles.cardActions}>
                  <button
                    onClick={() => { setSelected(product); setShowStockModal(true) }}
                    style={styles.adjustBtn}
                  >
                    <i className="ti ti-adjustments" style={{ marginRight: '4px' }}></i>
                    Ajustar
                  </button>
                  <button onClick={() => deleteProduct(product.id)} style={styles.deleteBtn}>
                    <i className="ti ti-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Novo Produto */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Novo Produto</h2>

            <label style={styles.label}>Nome *</label>
            <input style={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Pomada Modeladora" />

            <label style={styles.label}>Categoria</label>
            <select style={styles.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.filter(c => c !== 'todos').map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={styles.label}>Preço de Venda (R$)</label>
                <input style={styles.input} type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label style={styles.label}>Custo (R$)</label>
                <input style={styles.input} type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="0.00" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={styles.label}>Quantidade</label>
                <input style={styles.input} type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label style={styles.label}>Qtd Mínima</label>
                <input style={styles.input} type="number" value={form.min_quantity} onChange={e => setForm({ ...form, min_quantity: e.target.value })} placeholder="5" />
              </div>
              <div>
                <label style={styles.label}>Unidade</label>
                <select style={styles.input} value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                  <option value="un">un</option>
                  <option value="ml">ml</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="l">l</option>
                </select>
              </div>
            </div>

            <label style={styles.label}>Descrição</label>
            <input style={styles.input} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Opcional" />

            <div style={styles.modalBtns}>
              <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancelar</button>
              <button onClick={createProduct} style={styles.confirmBtn}>Criar Produto</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajustar Estoque */}
      {showStockModal && selected && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Ajustar Estoque</h2>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '20px' }}>
              Produto: <strong style={{ color: '#fff' }}>{selected.name}</strong> — Atual: <strong style={{ color: '#f59e0b' }}>{selected.quantity} {selected.unit}</strong>
            </p>

            <label style={styles.label}>Tipo de ajuste</label>
            <select style={styles.input} value={stockForm.type} onChange={e => setStockForm({ ...stockForm, type: e.target.value })}>
              <option value="add">➕ Adicionar ao estoque</option>
              <option value="remove">➖ Remover do estoque</option>
              <option value="set">🔄 Definir quantidade exata</option>
            </select>

            <label style={styles.label}>Quantidade</label>
            <input style={styles.input} type="number" value={stockForm.quantity} onChange={e => setStockForm({ ...stockForm, quantity: e.target.value })} placeholder="0" min="0" />

            <div style={styles.modalBtns}>
              <button onClick={() => setShowStockModal(false)} style={styles.cancelBtn}>Cancelar</button>
              <button onClick={adjustStock} style={styles.confirmBtn}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#09090b' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#fff', margin: 0 },
  subtitle: { fontSize: '14px', color: '#71717a', margin: '4px 0 0' },
  newBtn: { background: '#f59e0b', color: '#09090b', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  alert: { background: '#2a1f10', border: '0.5px solid #7c2d12', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#fb923c', display: 'flex', alignItems: 'center' },
  filters: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  filterBtn: { padding: '7px 14px', borderRadius: '8px', border: '0.5px solid #27272a', background: '#18181b', color: '#a1a1aa', fontSize: '13px', cursor: 'pointer' },
  filterBtnActive: { background: '#27272a', color: '#f59e0b', borderColor: '#f59e0b' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  card: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '20px' },
  cardLow: { borderColor: '#7c2d12' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  productName: { fontSize: '16px', fontWeight: '600', color: '#fff', margin: '0 0 6px' },
  categoryBadge: { fontSize: '11px', background: '#27272a', color: '#a1a1aa', padding: '2px 8px', borderRadius: '20px' },
  lowBadge: { fontSize: '11px', background: '#2a1f10', color: '#fb923c', padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap' },
  stockRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  stockInfo: { display: 'flex', alignItems: 'baseline', gap: '4px' },
  stockNum: { fontSize: '32px', fontWeight: '700', color: '#fff' },
  stockUnit: { fontSize: '14px', color: '#71717a' },
  minStock: { fontSize: '12px', color: '#52525b' },
  priceRow: { display: 'flex', gap: '12px', marginBottom: '8px' },
  price: { fontSize: '13px', color: '#4ade80' },
  cost: { fontSize: '13px', color: '#71717a' },
  description: { fontSize: '13px', color: '#71717a', margin: '8px 0', lineHeight: '1.5' },
  cardActions: { display: 'flex', gap: '8px', marginTop: '12px' },
  adjustBtn: { flex: 1, background: '#27272a', color: '#e4e4e7', border: 'none', padding: '8px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { background: '#2a1414', color: '#f87171', border: 'none', width: '36px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' },
  empty: { textAlign: 'center', padding: '60px', background: '#18181b', borderRadius: '12px' },
  spinner: { width: '36px', height: '36px', border: '3px solid #27272a', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 20px' },
  label: { display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px', marginTop: '14px' },
  input: { width: '100%', background: '#09090b', border: '0.5px solid #27272a', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' },
  modalBtns: { display: 'flex', gap: '10px', marginTop: '24px' },
  cancelBtn: { flex: 1, padding: '10px', borderRadius: '8px', border: '0.5px solid #27272a', background: '#09090b', color: '#a1a1aa', fontSize: '14px', cursor: 'pointer' },
  confirmBtn: { flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#09090b', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
}