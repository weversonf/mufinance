import { useState } from 'react'
import { doc, updateDoc, deleteDoc, collection, addDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useData } from '../context/DataContext'
import { useToast } from '../components/Toast'
import { formatBRL } from '../utils/format'

export default function SettingsPage({ onNavigate, onEditAccount, onEditCard, onToggleVehicleModule }) {
  const { accounts, cards, categories, modules, vehicle } = useData()
  const { showToast } = useToast()
  const [expAccordion, setExpAccordion] = useState(true)
  const [incAccordion, setIncAccordion] = useState(true)

  const handleAddCategory = async type => {
    const name = prompt(`Nome da nova categoria (${type === 'saída' ? 'Despesa' : 'Receita'}):`)
    if (!name) return
    const ref = await addDoc(collection(db, 'categories'), { name, type, icon: 'ti-category', color: '#888', isDefault: false })
    if (type === 'saída') await updateDoc(ref, { color: '#c0392b' })
    showToast('Categoria criada!')
  }

  const handleEditCategory = async c => {
    const name = prompt('Novo nome:', c.name)
    if (!name) return
    await updateDoc(doc(db, 'categories', c.id), { name })
    showToast('Renomeada!')
  }

  const handleDeleteCategory = async c => {
    if (!confirm(`Excluir categoria "${c.name}"?`)) return
    await deleteDoc(doc(db, 'categories', c.id))
    showToast('Excluída!')
  }

  const handleAddSubcat = async c => {
    const name = prompt('Nome da subcategoria:')
    if (!name) return
    const sub = { id: Date.now().toString(), name, icon: 'ti-corner-down-right' }
    await updateDoc(doc(db, 'categories', c.id), { subcats: arrayUnion(sub) })
    showToast('Subcategoria adicionada!')
  }

  const handleEditSubcat = async (c, sub) => {
    const name = prompt('Novo nome:', sub.name)
    if (!name) return
    const newSub = { ...sub, name }
    await updateDoc(doc(db, 'categories', c.id), { subcats: arrayRemove(sub) })
    await updateDoc(doc(db, 'categories', c.id), { subcats: arrayUnion(newSub) })
    showToast('Subcategoria renomeada!')
  }

  const handleDeleteSubcat = async (c, sub) => {
    if (!confirm(`Excluir subcategoria "${sub.name}"?`)) return
    await updateDoc(doc(db, 'categories', c.id), { subcats: arrayRemove(sub) })
    showToast('Subcategoria excluída!')
  }

  return (
    <div className="app page active">
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('profile')}><i className="ti ti-arrow-left"></i></button>
        <span className="page-title">Configurações</span>
      </div>
      <div className="page-content">
        <div className="section-title-new"><i className="ti ti-toggle-left"></i> Módulos</div>
        <div className="config-cat-item">
          <div className="cat-main" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}><i className="ti ti-car"></i></div>
              <div>
                <div className="name" style={{ fontSize: 13 }}>Veículo</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Controle de abastecimento e manutenção</div>
              </div>
            </div>
            <div className={'toggle-switch' + (modules?.vehicleActive ? ' active' : '')} onClick={onToggleVehicleModule} style={{ flexShrink: 0 }}></div>
          </div>
        </div>

        <div className="section-title-new"><i className="ti ti-wallet"></i> Contas Bancárias</div>
        {accounts.length > 0 ? accounts.map(a => (
          <div key={a.id} className="config-item-new" style={{ cursor: 'pointer' }} onClick={() => onEditAccount?.(a)}>
            <div className="ci-icon" style={{ background: (a.color || '#888') + '22', color: a.color || '#888' }}><i className="ti ti-wallet"></i></div>
            <div className="ci-info">
              <div className="ci-name">{a.name}</div>
              <div className="ci-sub">{a.type} · R$ {formatBRL(a.balance || 0)}</div>
            </div>
          </div>
        )) : <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 8 }}>Nenhuma conta</div>}

        <div className="section-title-new"><i className="ti ti-credit-card"></i> Cartões</div>
        {cards.length > 0 ? cards.map(c => (
          <div key={c.id} className="config-item-new" style={{ cursor: 'pointer' }} onClick={() => onEditCard?.(c)}>
            <div className="ci-icon" style={{ background: (c.color || '#888') + '22', color: c.color || '#888' }}><i className="ti ti-credit-card"></i></div>
            <div className="ci-info">
              <div className="ci-name">{c.name}</div>
              <div className="ci-sub">{c.brand || c.type}</div>
            </div>
          </div>
        )) : <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 8 }}>Nenhum cartão</div>}

        <div className="section-title-new"><i className="ti ti-category"></i> Categorias</div>

        <button className={'accordion-header' + (expAccordion ? ' open' : '')} onClick={() => setExpAccordion(!expAccordion)}>
          <i className="ti ti-minus-circle" style={{ color: '#c0392b' }} /> Despesas
          <span className="arrow"><i className="ti ti-chevron-down"></i></span>
        </button>
        <div className={'accordion-content' + (expAccordion ? ' open' : '')}>
          {(categories.saída || []).map(c => (
            <div key={c.id}>
              <div className="config-item-new">
                <div className="ci-icon" style={{ background: (c.color || '#888') + '22', color: c.color || '#888' }}><i className={'ti ' + (c.icon || 'ti-category')}></i></div>
                <div className="ci-info">
                  <div className="ci-name">{c.name}{c.isDefault ? <span className="badge-default" style={{ fontSize: 8 }}>Padrão</span> : ''}</div>
                </div>
                <div className="ci-actions">
                  <button onClick={() => handleEditCategory(c)} title="Renomear"><i className="ti ti-edit"></i></button>
                  <button onClick={() => handleEditCategory(c)} title="Alterar ícone"><i className="ti ti-image"></i></button>
                  {!c.isDefault && <button className="del" onClick={() => handleDeleteCategory(c)} title="Excluir"><i className="ti ti-trash"></i></button>}
                  <button onClick={() => handleAddSubcat(c)} title="Adicionar subcategoria"><i className="ti ti-plus" style={{ fontSize: 15 }}></i></button>
                </div>
              </div>
              {(c.subcats || []).map(sub => (
                <div key={sub.id} className="config-item-new" style={{ marginLeft: 20, padding: '6px 10px' }}>
                  <div className="ci-icon" style={{ width: 24, height: 24, fontSize: 11, background: (c.color || '#888') + '22', color: c.color || '#888' }}><i className={'ti ' + (sub.icon || 'ti-corner-down-right')}></i></div>
                  <div className="ci-info"><div className="ci-name" style={{ fontSize: 12 }}>{sub.name}</div></div>
                  <div className="ci-actions">
                    <button onClick={() => handleEditSubcat(c, sub)}><i className="ti ti-edit"></i></button>
                    <button className="del" onClick={() => handleDeleteSubcat(c, sub)}><i className="ti ti-trash"></i></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <button className="submit-btn" style={{ background: 'var(--card-bg)', color: 'var(--text-sec)', marginTop: 6, fontSize: 13 }} onClick={() => handleAddCategory('saída')}><i className="ti ti-plus"></i> Nova Categoria</button>
        </div>

        <button className={'accordion-header' + (incAccordion ? ' open' : '')} onClick={() => setIncAccordion(!incAccordion)}>
          <i className="ti ti-plus-circle" style={{ color: 'var(--primary)' }} /> Receitas
          <span className="arrow"><i className="ti ti-chevron-down"></i></span>
        </button>
        <div className={'accordion-content' + (incAccordion ? ' open' : '')}>
          {(categories.entrada || []).map(c => (
            <div key={c.id}>
              <div className="config-item-new">
                <div className="ci-icon" style={{ background: (c.color || '#888') + '22', color: c.color || '#888' }}><i className={'ti ' + (c.icon || 'ti-category')}></i></div>
                <div className="ci-info">
                  <div className="ci-name">{c.name}{c.isDefault ? <span className="badge-default" style={{ fontSize: 8 }}>Padrão</span> : ''}</div>
                </div>
                <div className="ci-actions">
                  <button onClick={() => handleEditCategory(c)} title="Renomear"><i className="ti ti-edit"></i></button>
                  <button onClick={() => handleEditCategory(c)} title="Alterar ícone"><i className="ti ti-image"></i></button>
                  {!c.isDefault && <button className="del" onClick={() => handleDeleteCategory(c)} title="Excluir"><i className="ti ti-trash"></i></button>}
                  <button onClick={() => handleAddSubcat(c)} title="Adicionar subcategoria"><i className="ti ti-plus" style={{ fontSize: 15 }}></i></button>
                </div>
              </div>
              {(c.subcats || []).map(sub => (
                <div key={sub.id} className="config-item-new" style={{ marginLeft: 20, padding: '6px 10px' }}>
                  <div className="ci-icon" style={{ width: 24, height: 24, fontSize: 11, background: (c.color || '#888') + '22', color: c.color || '#888' }}><i className={'ti ' + (sub.icon || 'ti-corner-down-right')}></i></div>
                  <div className="ci-info"><div className="ci-name" style={{ fontSize: 12 }}>{sub.name}</div></div>
                  <div className="ci-actions">
                    <button onClick={() => handleEditSubcat(c, sub)}><i className="ti ti-edit"></i></button>
                    <button className="del" onClick={() => handleDeleteSubcat(c, sub)}><i className="ti ti-trash"></i></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <button className="submit-btn" style={{ background: 'var(--card-bg)', color: 'var(--text-sec)', marginTop: 6, fontSize: 13 }} onClick={() => handleAddCategory('entrada')}><i className="ti ti-plus"></i> Nova Categoria</button>
        </div>
      </div>
    </div>
  )
}
