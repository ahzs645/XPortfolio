async function doSetting(key1, key2, value) {
	const routes = {
		background: {
			image: v => {
				const el = document.getElementById('container')
				if (el) el.style.backgroundImage = `url('${v}')`
			},
			position: v => {
				const el = document.getElementById('container')
				if (!el) return
				const styleMap = {
					tile: { repeat: 'repeat', pos: 'left top', size: 'auto' },
					center: { repeat: 'no-repeat', pos: 'center center', size: 'auto' },
					stretch: { repeat: 'no-repeat', pos: 'center center', size: '100% 100%' }
				}
				const style = styleMap[v?.toLowerCase()] || styleMap.center
				Object.assign(el.style, {
					backgroundPosition: style.pos,
					backgroundSize: style.size,
					backgroundRepeat: style.repeat
				})
			},
			color: v => {
				const el = document.getElementById('container')
				if (!el) return
				const c = (v || '').trim().replace(/^#/, '').toUpperCase()
				const safe = /^[0-9A-F]{3}$|^[0-9A-F]{6}$/.test(c) ? '#' + c : '#3A6EA5'
				el.style.backgroundColor = safe
			}
		},
		display: {
			view: v => {
				document.querySelectorAll('#windows .window').forEach(explorer => {
					const allViews = explorer.querySelectorAll('[data-view]')
					allViews.forEach(el => el.classList.remove('active'))
					allViews.forEach(el => {
						if (el.getAttribute('data-view') === v) el.classList.add('active')
					})
					const items = explorer.querySelectorAll('.items')
					items.forEach(elem => {
						elem.classList.remove('thumb', 'tile', 'icon', 'list', 'details')
						elem.classList.add(v)
					})
				})
			},
			zoom: v => {
				const el = document.getElementById('container')
				if (el) el.style.zoom = v + '%'
			},
			quality: v => {
				const el = document.getElementById('container')
				const dither = document.getElementById('ditherpixels')
				if (el) el.style.filter = v === 'unset' ? '' : `url('#${v}')`
				if (dither)
					dither.style.display = ['8+col', '16+col', '256+col'].includes(v)
						? 'block'
						: 'none'
			}
		},
		screensaver: {
			name: v => getScreensaver(v, null),
			time: v => getScreensaver(null, v)
		},
		installed: {
			default: v => v
		}
	}

	if (!routes[key1]) return
	const fn = routes[key1][key2] || routes[key1].default
	if (typeof fn === 'function') fn(value)
}
