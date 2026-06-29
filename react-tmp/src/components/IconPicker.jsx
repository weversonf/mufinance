const ICONS = [
  'ti-home', 'ti-building', 'ti-building-store', 'ti-briefcase', 'ti-wallet', 'ti-coin', 'ti-credit-card', 'ti-cash',
  'ti-shopping-cart', 'ti-shopping-bag', 'ti-gift', 'ti-tag', 'ti-discount', 'ti-percentage',
  'ti-car', 'ti-motorbike', 'ti-bus', 'ti-plane', 'ti-ship', 'ti-truck', 'ti-gas-station', 'ti-tool', 'ti-settings',
  'ti-heart', 'ti-medical-cross', 'ti-pill', 'ti-stethoscope',
  'ti-book', 'ti-graduation-cap', 'ti-pencil', 'ti-code', 'ti-devices',
  'ti-phone', 'ti-device-mobile', 'ti-laptop', 'ti-wifi', 'ti-battery', 'ti-plug',
  'ti-music', 'ti-video', 'ti-camera', 'ti-photo', 'ti-movie', 'ti-headphones',
  'ti-tv', 'ti-player-play', 'ti-news', 'ti-newspaper', 'ti-cloud', 'ti-download',
  'ti-umbrella', 'ti-sun', 'ti-moon', 'ti-flame', 'ti-snowflake', 'ti-droplet',
  'ti-leaf', 'ti-tree', 'ti-flower', 'ti-paw',
  'ti-shirt', 'ti-shoe', 'ti-ring', 'ti-diamond', 'ti-clock', 'ti-calendar',
  'ti-cup', 'ti-glass', 'ti-bottle', 'ti-meat', 'ti-apple', 'ti-cake',
  'ti-users', 'ti-user', 'ti-crown', 'ti-flag', 'ti-star',
  'ti-plane-tilt', 'ti-luggage', 'ti-map', 'ti-map-pin', 'ti-compass', 'ti-road',
  'ti-lock', 'ti-shield', 'ti-eye', 'ti-bell', 'ti-speakerphone', 'ti-alarm',
  'ti-wash', 'ti-soap', 'ti-trash', 'ti-cleaning', 'ti-brush',
  'ti-pet', 'ti-dog-bowl', 'ti-cat',
  'ti-fence', 'ti-roof', 'ti-window', 'ti-lamp',
  'ti-chart-bar', 'ti-chart-pie', 'ti-chart-line', 'ti-report', 'ti-file-invoice', 'ti-file-text',
  'ti-activity', 'ti-trending-up', 'ti-trending-down', 'ti-arrows-exchange',
  'ti-food', 'ti-tools-kitchen-2', 'ti-glass-full',
]

export default function IconPicker({ selected, onSelect }) {
  return (
    <div className="icon-picker-grid">
      {ICONS.map(icon => (
        <div key={icon} className={'ip-item' + (selected === icon ? ' selected' : '')} onClick={() => onSelect(icon)}>
          <i className={'ti ' + icon} />
        </div>
      ))}
    </div>
  )
}
