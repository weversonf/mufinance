import { useState, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase/config'

const EMOJI_AVATARS = ['🐶', '🐱', '🐼', '🐸', '🦊', '🐰', '🦁', '🐯', '🐙', '🦄', '🌈', '⭐', '🔥', '💎', '🎯', '🚀', '🎸', '🍕']

export default function AvatarModal({ currentAvatar, onClose }) {
  const [selected, setSelected] = useState(currentAvatar || '🐶')
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleEmojiSelect = async emoji => {
    setSelected(emoji)
    setPreview(null)
    await updateDoc(doc(db, 'profile', 'me'), { avatar: emoji, avatarType: 'emoji' })
    onClose()
  }

  const handleFileUpload = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target.result)
    reader.readAsDataURL(file)

    try {
      const storageRef = ref(storage, `avatars/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await updateDoc(doc(db, 'profile', 'me'), { avatar: url, avatarType: 'image' })
      onClose()
    } catch (err) {
      alert('Erro ao fazer upload: ' + err.message)
    }
    setUploading(false)
  }

  const handleDiceBear = async () => {
    const seed = Math.random().toString(36).slice(2, 8)
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
    setPreview(url)
    setSelected(url)
    await updateDoc(doc(db, 'profile', 'me'), { avatar: url, avatarType: 'dicebear' })
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target.className === 'modal-overlay open' && onClose()}>
      <div className="modal">
        <h2>
          Avatar
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </h2>
        <label className="field-label">Escolha um emoji</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', padding: '8px 0' }}>
          {EMOJI_AVATARS.map(emoji => (
            <div key={emoji} onClick={() => handleEmojiSelect(emoji)}
              style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, cursor: 'pointer', background: selected === emoji ? 'var(--primary)' : 'var(--card-bg)', transition: 'all .2s' }}>
              {emoji}
            </div>
          ))}
        </div>
        <label className="field-label">Upload de imagem</label>
        <input className="field-input" type="file" accept="image/*" onChange={handleFileUpload} style={{ padding: 8 }} disabled={uploading} />
        {preview && <div style={{ textAlign: 'center', margin: '8px 0' }}><img src={preview} style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 10 }} /></div>}
        <button className="submit-btn" style={{ background: 'var(--card-bg)', color: 'var(--text-sec)', marginTop: 8 }} onClick={handleDiceBear}>
          <i className="ti ti-shuffle" /> Gerar Avatar Aleatório
        </button>
      </div>
    </div>
  )
}
