import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'

const API = 'https://barber-saas-1-fpjl.onrender.com/api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [barbers, setBarbers] = useState([])
  const [clients, setClients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filter, setFilter] = useState('all')

  const [form, setForm] = useState({ appointment_id: '', barber_id: '', client_id: '', notes: '' })
  const [itemForm, setItemForm] = useState({ name: '', type: 'service', price: '', quantity: 1 })

  const token = localStorage.getItem('token')
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [ordersRes, barbersRes, clientsRes, appsRes] = await Promise.all([
        fetch(`${API}/orders`, { headers }),
        fetch(`${API}/barbers`, { headers }),
        fetch(`${API}/clients`, { headers }),
        fetch(`${API}/appointments`, { headers }),
      ])
      const ordersData = await ordersRes.json()
      const barbersData = await barbersRes.json()
      const clientsData = await clientsRes.json()
      const appsData = await appsRes.json()

      setOrders(ordersData.orders || [])
      setBarbers(barbersData.data?.data || barbersData.data || barbersData || [])
      setClients(clientsData.data?.data || clientsData.data || clientsData || [])
      setAppointments(appsData.data?.data || appsData.data || appsData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const createOrder = async () => {
    try {
      await fetch(`${API}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(form),
      })
      setShowModal(false)
      setForm({ appointment_id: '', barber_id: '', client_id: '', notes: '' })
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  const addItem = async () => {
    try {
      await fetch(`${API}/orders/${selectedOrder.id}/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify(itemForm),
      })
      setShowItemModal(false)
      setItemForm({ name: '', type: 'service', price: '', quantity: 1 })
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  const removeItem = async (orderId, itemId) => {
    if (!confirm('Remover item?')) return
    try {
      await fetch(`${API}/orders/${orderId}/items/${itemId}`, { method: 'DELETE', headers })
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  const closeOrder = async (orderId) => {
    if (!confirm('Fechar comanda e gerar comissão?')) return
    try {
      await fetch(`${API}/orders/${orderId}/close`, { method: 'PATCH', headers })
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Comandas</h1>
            <p style={styles.subtitle}>Gerencie as comandas dos atendimentos</p>
          </div>
          <button onClick={() => setShowModal(true)} style={styles.newBtn}>
            <i className="ti ti-plus" style={{ marginRight: '6px' }}></i>
            Nova Comanda
          </button>
        </div>

        <div style={styles.filters}>
          {['all', 'open', 'closed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
            >
              {f === 'all' ? 'Todas' : f === 'open' ? 'Abertas' : 'Fechadas'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={styles.empty}>
            <div style={styles.spinner}></div>
            <p style={{ margin: '16px 0 4px', color: '#a1a1aa' }}>Carregando comandas...</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#52525b' }}>Isso pode levar até 30 segundos na primeira vez</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <i className="ti ti-receipt-off" style={{ fontSize: '40px', color: '#3f3f46', marginBottom: '12px', display: 'block' }}></i>
            <p style={{ margin: 0, color: '#71717a' }}>Nenhuma comanda encontrada.</p>
          </div>
        ) : (
          <div style={styles.orderList}>
            {filtered.map(order => (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <div>
                    <span style={styles.orderId}>#{order.id}</span>
                    <span style={order.status === 'open' ? styles.badgeOpen : styles.badgeClosed}>
                      {order.status === 'open' ? 'Aberta' : 'Fechada'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {order.status === 'open' && (
                      <>
                        <button onClick={() => { setSelectedOrder(order); setShowItemModal(true) }} style={styles.addItemBtn}>
                          + Item
                        </button>
                        <button onClick={() => closeOrder(order.id)} style={styles.closeBtn}>
                          Fechar Comanda
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div style={styles.orderInfo}>
                  <span style={styles.infoItem}>
                    <i className="ti ti-scissors" style={{ marginRight: '4px' }}></i>
                    {order.barber?.name || '-'}
                  </span>
                  <span style={styles.infoItem}>
                    <i className="ti ti-user" style={{ marginRight: '4px' }}></i>
                    {order.client?.name || '-'}
                  </span>
                  <span style={{ ...styles.infoItem, color: '#f59e0b', fontWeight: '600' }}>
                    Total: R$ {Number(order.total || 0).toFixed(2)}
                  </span>
                </div>

                {order.items && order.items.length > 0 && (
                  <div style={styles.itemsList}>
                    {order.items.map(item => (
                      <div key={item.id} style={styles.itemRow}>
                        <span style={styles.itemType}>{item.type === 'service' ? '✂️' : '📦'}</span>
                        <span style={styles.itemName}>{item.name}</span>
                        <span style={styles.itemQty}>x{item.quantity}</span>
                        <span style={styles.itemPrice}>R$ {Number(item.subtotal || 0).toFixed(2)}</span>
                        {order.status === 'open' && (
                          <button onClick={() => removeItem(order.id, item.id)} style={styles.removeBtn}>✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {order.notes && <p style={styles.notes}>📝 {order.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Nova Comanda</h2>

            <label style={styles.label}>Agendamento</label>
            <select style={styles.input} value={form.appointment_id} onChange={e => setForm({ ...form, appointment_id: e.target.value })}>
              <option value="">Selecione</option>
              {appointments.map(a => (
                <option key={a.id} value={a.id}>#{a.id} — {a.appointment_date}</option>
              ))}
            </select>

            <label style={styles.label}>Barbeiro</label>
            <select style={styles.input} value={form.barber_id} onChange={e => setForm({ ...form, barber_id: e.target.value })}>
              <option value="">Selecione</option>
              {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>

            <label style={styles.label}>Cliente</label>
            <select style={styles.input} value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
              <option value="">Selecione</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <label style={styles.label}>Observações</label>
            <input style={styles.input} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Opcional" />

            <div style={styles.modalBtns}>
              <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancelar</button>
              <button onClick={createOrder} style={styles.confirmBtn}>Criar Comanda</button>
            </div>
          </div>
        </div>
      )}

      {showItemModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Adicionar Item</h2>

            <label style={styles.label}>Nome</label>
            <input style={styles.input} value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Ex: Corte, Pomada..." />

            <label style={styles.label}>Tipo</label>
            <select style={styles.input} value={itemForm.type} onChange={e => setItemForm({ ...itemForm, type: e.target.value })}>
              <option value="service">Serviço</option>
              <option value="product">Produto</option>
            </select>

            <label style={styles.label}>Preço (R$)</label>
            <input style={styles.input} type="number" value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: e.target.value })} placeholder="0.00" />

            <label style={styles.label}>Quantidade</label>
            <input style={styles.input} type="number" value={itemForm.quantity} onChange={e => setItemForm({ ...itemForm, quantity: e.target.value })} min="1" />

            <div style={styles.modalBtns}>
              <button onClick={() => setShowItemModal(false)} style={styles.cancelBtn}>Cancelar</button>
              <button onClick={addItem} style={styles.confirmBtn}>Adicionar</button>
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
  filters: { display: 'flex', gap: '8px', marginBottom: '20px' },
  filterBtn: { padding: '8px 16px', borderRadius: '8px', border: '0.5px solid #27272a', background: '#18181b', color: '#a1a1aa', fontSize: '13px', cursor: 'pointer' },
  filterBtnActive: { background: '#27272a', color: '#f59e0b', borderColor: '#f59e0b' },
  orderList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  orderCard: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '12px', padding: '20px' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  orderId: { fontSize: '16px', fontWeight: '700', color: '#fff', marginRight: '10px' },
  badgeOpen: { background: '#14532d', color: '#4ade80', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' },
  badgeClosed: { background: '#27272a', color: '#a1a1aa', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' },
  addItemBtn: { background: '#27272a', color: '#e4e4e7', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
  closeBtn: { background: '#f59e0b', color: '#09090b', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  orderInfo: { display: 'flex', gap: '20px', marginBottom: '12px' },
  infoItem: { fontSize: '14px', color: '#a1a1aa', display: 'flex', alignItems: 'center' },
  itemsList: { background: '#09090b', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  itemType: { fontSize: '16px' },
  itemName: { flex: 1, fontSize: '14px', color: '#e4e4e7' },
  itemQty: { fontSize: '13px', color: '#71717a' },
  itemPrice: { fontSize: '14px', color: '#f59e0b', fontWeight: '600' },
  removeBtn: { background: '#2a1414', color: '#f87171', border: 'none', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  notes: { fontSize: '13px', color: '#71717a', margin: '12px 0 0' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#18181b', border: '0.5px solid #27272a', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px' },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 20px' },
  label: { display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px', marginTop: '14px' },
  input: { width: '100%', background: '#09090b', border: '0.5px solid #27272a', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' },
  modalBtns: { display: 'flex', gap: '10px', marginTop: '24px' },
  cancelBtn: { flex: 1, padding: '10px', borderRadius: '8px', border: '0.5px solid #27272a', background: '#09090b', color: '#a1a1aa', fontSize: '14px', cursor: 'pointer' },
  confirmBtn: { flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#09090b', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '60px', background: '#18181b', borderRadius: '12px' },
  spinner: { width: '36px', height: '36px', border: '3px solid #27272a', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' },
}