export default function FabMenu({ open, onClose, onSelect }) {
  return (
    <>
      <div className={`tab-fab-overlay${open ? ' active' : ''}`} onClick={onClose}></div>
      <div className={`tab-fab-sub${open ? ' active' : ''}`}>
        <button className="fab-opt fab-opt-left" onClick={() => { onSelect('send'); onClose() }}>
          <i className="ti ti-microphone"></i>
        </button>
        <button className="fab-opt fab-opt-center" onClick={() => { onSelect('receive'); onClose() }}>
          <i className="ti ti-bolt"></i>
        </button>
        <button className="fab-opt fab-opt-right" onClick={() => { onSelect('vehicle'); onClose() }}>
          <i className="ti ti-grid"></i>
        </button>
      </div>
    </>
  )
}
