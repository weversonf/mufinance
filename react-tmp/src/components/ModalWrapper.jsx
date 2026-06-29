export default function ModalWrapper({ id, open, onClose, title, children }) {
  return (
    <div className={`modal-overlay${open ? ' open' : ''}`} id={id} onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>
          {title}
          <button className="modal-close" onClick={onClose}><i className="ti ti-x"></i></button>
        </h2>
        {children}
      </div>
    </div>
  )
}
