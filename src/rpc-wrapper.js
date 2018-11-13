export default function proxy(worker, methods) {
	let c = 0;
	let callbacks = {};
	worker.addEventListener('message', (e) => {
		let d = e.data;
		if (d.type!=='RPC') return;
		if (d.id) {
			let f = callbacks[d.id];
			if (f) {
				delete callbacks[d.id];
				if (d.error) {
					if (d.error.stack) {
						d.error = Object.assign(Error(d.error.message), d.error)
					}
					f[1](d.error);
				}
				else {
					f[0](d.result);
				}
			}
		}
		else {
			let evt = document.createEvent('Event');
			evt.initEvent(d.method, false, false);
			evt.data = d.params;
			worker.dispatchEvent(evt);
		}
	});
	return new Proxy(worker, {
		get: function(target, method) {
			if (target[method]) {
				let obj = target[method]
				return typeof obj === 'function' ? target[method].bind(target) : obj
			}
			else {
				return new Proxy(() => {}, {
					apply: function(target, thisArg, params) {
						return new Promise( (a, b) => {
							let id = ++c;
							callbacks[id] = [a, b];
							worker.postMessage({ type: 'RPC', id, method, params });
						})
					}
				})
			}
		}
	})
}
