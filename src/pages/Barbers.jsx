import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'

export default function Barbers() {
  const [barbers, setBarbers] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [photo, setPhoto] = useState(null) // Novo: arquivo da foto
  const [photoPreview, setPhotoPreview] = useState('') // Novo: preview da foto
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const fileInputRef = useRef(null) // Novo: referência para o input file

  async function loadBarbers() {
    try {
      const res = await api.get('/barbers')
      setBarbers(res.data.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBarbers() }, [])

  function handleEdit(barber) {
    setEditing(barber)
    setName(barber.name)
    setPhone(barber.phone || '')
    setPhotoPreview(barber.photo || '') // Carrega a foto existente
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancel() {
    setEditing(null)
    setName('')
    setPhone('')
    setPhoto(null)
    setPhotoPreview('')
    setShowForm(false)
    setError('')
  }

  // Novo: função para lidar com a seleção da foto
  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('phone', phone)
      if (photo) {
        formData.append('photo', photo) // Envia a foto como arquivo
      }

      if (editing) {
        await api.put(`/barbers/${editing.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await api.post('/barbers', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      handleCancel()
      loadBarbers()
    } catch (err) {
      setError('Erro ao salvar barbeiro. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja remover este barbeiro da equipe?')) return
    try {
      await api.delete(`/barbers/${id}`)
      loadBarbers()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <span style={{ color: '#a1a1aa', marginTop: '12px' }}>Carregando equipe...</span>
      </div>
    )
  }

  return (
    <div style={styles.pageWrapper}>
      <Navbar />
      
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Barbeiros</h1>
            <p style={styles.pageSubtitle}>Gerencie sua equipe de profissionais</p>
          </div>
          <button 
            onClick={() => showForm ? handleCancel() : setShowForm(true)} 
            style={showForm ? styles.btnSecondary : styles.btnPrimary}
          >
            {showForm ? (
              <><i className="ti ti-x" style={{ marginRight: '6px' }}></i> Cancelar</>
            ) : (
              <><i className="ti ti-plus" style={{ marginRight: '6px' }}></i> Novo Barbeiro</>
            )}
          </button>
        </div>

        {showForm && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              {editing ? 'Editar Profissional' : 'Adicionar Novo Barbeiro'}
            </h2>
            
            {error && <div style={styles.errorAlert}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                {/* NOVO: Campo de upload de foto */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Foto de Perfil</label>
                  <div style={styles.photoUploadContainer}>
                    {photoPreview ? (
                      <div style={styles.photoPreview}>
                        <img src={photoPreview} alt="Preview" style={styles.photoPreviewImg} />
                        <button 
                          type="button" 
                          onClick={() => {
                            setPhoto(null)
                            setPhotoPreview('')
                            if (fileInputRef.current) fileInputRef.current.value = ''
                          }}
                          style={styles.removePhotoBtn}
                        >
                          <i className="ti ti-x"></i>
                        </button>
                      </div>
                    ) : (
                      <div 
                        style={styles.photoPlaceholder}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <i className="ti ti-camera" style={{ fontSize: '32px', color: '#52525b' }}></i>
                        <span style={{ fontSize: '12px', color: '#71717a', marginTop: '8px' }}>
                          Clique para adicionar foto
                        </span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nome do Profissional</label>
                  <div style={styles.inputWrapper}>
                    <i className="ti ti-scissors" style={styles.inputIcon}></i>
                    <input
                      style={styles.input}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Carlos Barber"
                      required
                    />
                  </div>
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Telefone (Opcional)</label>
                  <div style={styles.inputWrapper}>
                    <i className="ti ti-phone" style={styles.inputIcon}></i>
                    <input
                      style={styles.input}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-0000"
                    />
                  </div>
                </div>
              </div>

              <div style={styles.formActions}>
                <button style={styles.btnPrimary} type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : editing ? 'Atualizar Cadastro' : 'Confirmar Adição'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={styles.teamGrid}>
          {barbers.length === 0 ? (
            <div style={{ ...styles.card, gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
              <i className="ti ti-users-group" style={{ fontSize: '48px', color: '#27272a', marginBottom: '16px' }}></i>
              <p style={{ color: '#71717a' }}>Nenhum barbeiro cadastrado na equipe.</p>
            </div>
          ) : (
            barbers.map((barber) => (
              <div key={barber.id} style={styles.barberCard}>
                <div style={styles.barberHeader}>
                  <div style={styles.avatar}>
                    {barber.photo ? (
                      <img src={barber.photo} alt={barber.name} style={styles.avatarImg} />
                    ) : (
                      barber.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div style={styles.barberActions}>
                    <button onClick={() => handleEdit(barber)} style={styles.iconBtn} title="Editar">
                      <i className="ti ti-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(barber.id)} style={styles.iconBtnDelete} title="Excluir">
                      <i className="ti ti-trash"></i>
                    </button>
                  </div>
                </div>
                
                <div style={styles.barberInfo}>
                  <h3 style={styles.barberName}>{barber.name}</h3>
                  <div style={styles.barberContact}>
                    <i className="ti ti-phone" style={{ fontSize: '14px', color: '#52525b' }}></i>
                    <span>{barber.phone || 'Sem telefone'}</span>
                  </div>
                </div>

                <div style={styles.barberFooter}>
                  <span style={styles.statusBadge}>Ativo</span>
                  <div style={styles.rating}>
                    <i className="ti ti-star-filled" style={{ color: '#f59e0b', fontSize: '12px' }}></i>
                    <span style={{ fontSize: '12px', color: '#fff', fontWeight: '500' }}>5.0</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  // ... todos os estilos existentes ...

  // NOVOS ESTILOS PARA FOTO
  photoUploadContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  photoPreview: {
    position: 'relative',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid #3f3f46'
  },
  photoPreviewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  removePhotoBtn: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  },
  photoPlaceholder: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: '#09090b',
    border: '2px dashed #3f3f46',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: '14px',
    objectFit: 'cover'
  }
  // ... resto dos estilos
}