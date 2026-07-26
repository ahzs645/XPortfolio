//#region src/data/scenes.ts
var e = [
	{
		swf: "A-tour.swf",
		label: "Tour Shell",
		length: .15
	},
	{
		swf: "intro.swf",
		label: "Intro",
		length: 39.07
	},
	{
		swf: "nav.swf",
		label: "Navigation",
		length: 29.2
	},
	{
		swf: "segment1.swf",
		label: "Segment 1",
		length: 6.75
	},
	{
		swf: "segment2.swf",
		label: "Segment 2",
		length: 8.8
	},
	{
		swf: "segment3.swf",
		label: "Segment 3",
		length: 13.47
	},
	{
		swf: "segment4.swf",
		label: "Segment 4",
		length: 9.47
	},
	{
		swf: "segment5.swf",
		label: "Basics",
		length: 4.2
	},
	{
		swf: "bnl.swf",
		label: "Buy n Large",
		length: .1
	}
];
function t(e) {
	return e.replace(/\.swf$/i, "");
}
//#endregion
//#region src/data/shapeBitmapInline.ts
var n = /\b(xlink:href|href)="(generated\/[^"]*?\/images\/[^"]+?)"/g;
function r(e) {
	return n.lastIndex = 0, n.test(e);
}
function i(e, t) {
	return e.includes("/images/") ? e.replace(n, (e, n, r) => {
		let i = t(r);
		return i ? `${n}="data:${i.type};base64,${o(i.bytes)}"` : e;
	}) : e;
}
async function a(e, t) {
	if (!e.includes("/images/")) return e;
	n.lastIndex = 0;
	let r = /* @__PURE__ */ new Set();
	for (let t of e.matchAll(n)) r.add(t[2]);
	if (!r.size) return e;
	let a = /* @__PURE__ */ new Map();
	return await Promise.all([...r].map(async (e) => {
		let n = await t(e);
		n && a.set(e, n);
	})), i(e, (e) => a.get(e));
}
function o(e) {
	let t = globalThis.Buffer;
	if (t) return t.from(e).toString("base64");
	let n = "", r = 32768;
	for (let t = 0; t < e.length; t += r) n += String.fromCharCode(...e.subarray(t, t + r));
	return btoa(n);
}
function s(e) {
	return e.replace(/^\/?generated\/[^/]+\//, "");
}
//#endregion
//#region src/data/packedAssets.ts
var c = new TextEncoder(), l = new TextDecoder(), u = /* @__PURE__ */ new Map();
function d() {
	for (let e of u.values()) URL.revokeObjectURL(e);
	u.clear();
}
async function f(e) {
	e?.length && await Promise.all(e.map(async (e) => {
		let t = e.replace(/^\//, "");
		if (!u.has(t)) try {
			let e = await fetch(`${T}/${t}`);
			if (!e.ok) return;
			let n = await e.text();
			if (!r(n)) return;
			let i = await a(n, async (e) => {
				let t = await fetch(`${T}/${e.replace(/^\//, "")}`);
				if (!t.ok) return;
				let n = t.headers.get("content-type") || p(e);
				return {
					bytes: new Uint8Array(await t.arrayBuffer()),
					type: n
				};
			});
			u.set(t, URL.createObjectURL(new Blob([i], { type: "image/svg+xml" })));
		} catch {}
	}));
}
function p(e) {
	return /\.jpe?g$/i.test(e) ? "image/jpeg" : /\.gif$/i.test(e) ? "image/gif" : "image/png";
}
var m = "files", h = 0, g = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), v = /* @__PURE__ */ new Map(), y = !0, b = "", x = null, S = /* @__PURE__ */ new Map();
function C() {
	for (let e of S.values()) e.url && URL.revokeObjectURL(e.url);
	S.clear();
}
function w(e) {
	b = e, x = null, C();
}
var T = "";
function E(e) {
	T = e.replace(/\/+$/, "");
}
function D() {
	return T;
}
function O() {
	return m;
}
function k(e) {
	e !== m && (m = e, h += 1, ae(), re(), A(), d());
}
function A() {
	for (let e of v.values()) {
		for (let t of e.shapes.values()) t.url && URL.revokeObjectURL(t.url);
		for (let t of e.media.values()) t.url && URL.revokeObjectURL(t.url);
	}
	v.clear(), x = null, C();
}
async function j(e) {
	if (e[0] === 31 && e[1] === 139 && typeof DecompressionStream < "u") {
		let t = new Blob([e]).stream().pipeThrough(new DecompressionStream("gzip"));
		return await new Response(t).text();
	}
	return new TextDecoder().decode(e);
}
async function M(e) {
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(0, !0), n = JSON.parse(await j(e.slice(4, 4 + t))), r = /* @__PURE__ */ new Map();
	for (let [e, t] of Object.entries(n.shapes ?? {})) r.set(e, { svg: t });
	let i = /* @__PURE__ */ new Map();
	for (let [e, t] of Object.entries(n.media ?? {})) i.set(e, t);
	return {
		timeline: n.timeline ?? null,
		shapes: r,
		media: i,
		body: e,
		bodyStart: 4 + t
	};
}
async function N(e, t, n) {
	let r = await fetch(e, { headers: { Range: `bytes=${t}-${n}` } });
	if (!r.ok) return null;
	let i = new Uint8Array(await r.arrayBuffer());
	return r.status === 206 ? i : i.slice(t, n + 1);
}
async function ee() {
	if (x) return x;
	let e = await N(b, 0, 65535);
	if (!e || e.byteLength < 4) return null;
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(0, !0), n = JSON.parse(await j(e.slice(4, 4 + t)));
	for (let [e, t] of Object.entries(n.vars ?? {})) S.set(e, { content: t });
	return x = {
		blocksStart: 4 + t,
		scenes: n.scenes
	}, x;
}
async function te(e) {
	let t = v.get(e);
	if (t) return t;
	let n = await ee(), r = n?.scenes[e];
	if (!n || !r) return null;
	let i = n.blocksStart + r.offset, a = await N(b, i, i + r.length - 1);
	if (!a) return null;
	let o = await M(a);
	return v.set(e, o), o;
}
async function ne(e) {
	let t = v.get(e);
	if (t) return t;
	let n = await fetch(`${T}/generated-packs/${e}.scene?v=${Date.now()}`);
	if (!n.ok) return null;
	let r = await M(new Uint8Array(await n.arrayBuffer()));
	return v.set(e, r), r;
}
function re() {
	for (let e of _.values()) for (let t of e.shapes.values()) t.url && URL.revokeObjectURL(t.url);
	_.clear();
}
async function ie(e) {
	let t = _.get(e);
	if (t) return t;
	let n = null;
	try {
		let t = await fetch(`${T}/generated-bundles/${e}.json.gz?v=${Date.now()}`);
		t.ok && (n = await j(new Uint8Array(await t.arrayBuffer())));
	} catch {
		n = null;
	}
	if (n === null) return null;
	let r;
	try {
		r = JSON.parse(n);
	} catch {
		return null;
	}
	let i = /* @__PURE__ */ new Map();
	for (let [e, t] of Object.entries(r.shapes ?? {})) i.set(e, { svg: t });
	let a = {
		timeline: r.timeline ?? null,
		shapes: i
	};
	return _.set(e, a), a;
}
function ae() {
	for (let e of g.values()) for (let t of e.files.values()) t.url && URL.revokeObjectURL(t.url);
	g.clear(), h += 1;
}
function oe(e) {
	return `${m}:${h}:${e}`;
}
async function se(e) {
	if (m === "files") {
		let t = await le(e);
		return t && await f(t.bitmapFillShapeSrcs), t;
	}
	if (m === "bundle") {
		let t = (await ie(e))?.timeline ?? null;
		return t && await f(t.bitmapFillShapeSrcs), t;
	}
	return m === "archive" ? (await te(e))?.timeline ?? null : m === "scene-pack" ? (await ne(e))?.timeline ?? null : (await ue(e))?.timeline ?? null;
}
function ce(e) {
	if (m === "archive" || m === "scene-pack") {
		let t = e.replace(/^\//, ""), n = /^generated\/([^/]+)\//.exec(t)?.[1], a = n ? v.get(n) : void 0;
		if (a) if (t.endsWith(".svg")) {
			let e = a.shapes.get(t);
			if (e) {
				if (!e.url) {
					let t = r(e.svg) ? i(e.svg, (e) => {
						let t = a.media.get(e.replace(/^\//, ""));
						if (!t) return;
						let n = a.bodyStart + t.offset;
						return {
							bytes: a.body.slice(n, n + t.length),
							type: t.type
						};
					}) : e.svg;
					e.url = URL.createObjectURL(new Blob([t], { type: "image/svg+xml" }));
				}
				return e.url;
			}
		} else {
			let e = a.media.get(t);
			if (e) {
				if (!e.url) {
					let t = a.bodyStart + e.offset;
					e.url = URL.createObjectURL(new Blob([a.body.slice(t, t + e.length)], { type: e.type }));
				}
				return e.url;
			}
		}
		let o = S.get(t);
		return o ? (o.url ||= URL.createObjectURL(new Blob([o.content], { type: "text/plain" })), o.url) : `${T}/${t}`;
	}
	if (m === "bundle") {
		let t = e.replace(/^\//, "");
		if (t.endsWith(".svg")) {
			let e = u.get(t);
			if (e) return e;
			let n = /^generated\/([^/]+)\//.exec(t)?.[1], r = n ? _.get(n)?.shapes.get(t) : void 0;
			if (r) return r.url ||= URL.createObjectURL(new Blob([r.svg], { type: "image/svg+xml" })), r.url;
		}
		return `${T}/${t}`;
	}
	if (m === "pack") {
		let t = e.replace(/^\//, ""), n = /^generated\/([^/]+)\/(.+)$/.exec(t);
		if (n) {
			let e = g.get(n[1]), t = e?.files.get(n[2]);
			if (t && e) {
				if (!t.url) {
					if (t.type === "image/svg+xml") {
						let n = l.decode(t.bytes);
						if (r(n)) {
							let r = i(n, (t) => {
								let n = e.files.get(s(t));
								return n ? {
									bytes: n.bytes,
									type: n.type
								} : void 0;
							});
							return t.url = URL.createObjectURL(new Blob([c.encode(r)], { type: t.type })), t.url;
						}
					}
					t.url = URL.createObjectURL(new Blob([t.bytes.slice().buffer], { type: t.type }));
				}
				return t.url;
			}
		}
	}
	let t = e.replace(/^\//, "");
	if (t.endsWith(".svg")) {
		let e = u.get(t);
		if (e) return e;
	}
	return `${T}/${t}`;
}
async function le(e) {
	let t = await fetch(`${T}/generated/${e}/timeline.json?v=${Date.now()}`);
	if (!t.ok) return null;
	try {
		return await t.json();
	} catch {
		return null;
	}
}
async function ue(e) {
	let t = g.get(e);
	if (t) return t;
	if (!y) return null;
	let n = await fetch(`${T}/generated-packed/${e}/${e}.pack?v=${Date.now()}`);
	if (!n.ok) return null;
	let r = new Uint8Array(await n.arrayBuffer());
	if (r.byteLength < 4) return null;
	let i = 4 + new DataView(r.buffer, r.byteOffset, r.byteLength).getUint32(0, !0);
	if (i > r.byteLength) return null;
	let a;
	try {
		a = JSON.parse(new TextDecoder().decode(r.slice(4, i)));
	} catch {
		return null;
	}
	if (a.format !== "mmtour-generated-pack" || a.scene !== e) return null;
	let o = /* @__PURE__ */ new Map();
	for (let e of a.files) {
		let t = i + e.offset, n = t + e.length;
		t < i || n > r.byteLength || o.set(e.path, {
			type: e.type,
			bytes: r.slice(t, n)
		});
	}
	let s = o.get("timeline.json")?.bytes, c = null;
	if (s) try {
		c = JSON.parse(new TextDecoder().decode(s));
	} catch {
		c = null;
	}
	let l = {
		scene: e,
		files: o,
		timeline: c
	};
	return g.set(e, l), l;
}
//#endregion
//#region src/data/TimelineLoader.ts
var de = /* @__PURE__ */ new Map();
function fe() {
	de.clear();
}
async function pe(e) {
	let n = oe(e.toLowerCase()), r = de.get(n);
	if (r) return r;
	let i = await se(t(e));
	return i ? (!i.frameSvgsOmitted && !i.frameSvgs?.length && (i.frameSvgs = Array.from({ length: i.frameCount }, (e, t) => `generated/${i.scene}/frames/${t + 1}.svg`)), de.set(n, i), i) : null;
}
function P(e) {
	return ce(e);
}
//#endregion
//#region src/data/prefetch.ts
var me = /\.swf$/i;
function he(e) {
	let t = /* @__PURE__ */ new Set(), n = (e) => {
		if (e) {
			e.swf && me.test(e.swf) && t.add(e.swf), e.exitNavigation?.swf && me.test(e.exitNavigation.swf) && t.add(e.exitNavigation.swf);
			for (let n of e.loads ?? []) me.test(n.swf) && t.add(n.swf);
		}
	};
	for (let t of Object.values(e.control?.buttonActions ?? {})) n(t.release), n(t.rollOver), n(t.rollOut), n(t.press);
	for (let t of e.control?.frameActions ?? []) for (let e of t.actions ?? []) n(e);
	return [...t];
}
async function ge(e) {
	let t = await pe(e);
	t && _e(t, 0);
}
function _e(e, t) {
	for (let n of e.frames[t]?.instances ?? []) {
		let t = e.assets[String(n.characterId)], r = t?.src ?? t?.frames?.[0] ?? t?.states?.up?.src;
		r && fetch(P(r)).catch(() => {});
	}
}
//#endregion
//#region src/data/soundTimings.ts
function ve(e) {
	let t = /* @__PURE__ */ new Map();
	for (let [n, r] of Object.entries(e?.soundTimings ?? {})) {
		let e = typeof r == "number" ? r : Number(r?.durationMs);
		n && Number.isFinite(e) && e > 0 && t.set(n, { durationMs: e });
	}
	let n = (e) => {
		for (let n of e?.functionCalls ?? []) {
			let e = ye(n);
			e && t.set(e.name, { durationMs: e.durationMs });
		}
	};
	for (let t of e?.frameActions ?? []) for (let e of t.actions ?? []) n(e);
	for (let t of e?.spriteActions ?? []) for (let e of t.actions ?? []) n(e);
	for (let t of Object.values(e?.definedFunctions ?? {})) for (let e of t?.actions ?? []) n(e);
	for (let t of Object.values(e?.buttonActions ?? {})) n(t.release), n(t.rollOver), n(t.rollOut), n(t.press);
	return Object.fromEntries([...t.entries()].sort(([e], [t]) => e.localeCompare(t, void 0, { numeric: !0 })));
}
function ye(e) {
	if (e.functionName !== "push" || !be(e.target)) return;
	let t = Se(e.arguments), n = t.length === 1 && t[0]?.trim().startsWith("[") ? xe(t[0]) : t, r = Ce(n[0]), i = Number(n[1]);
	if (!(!r || !Number.isFinite(i) || i <= 0)) return {
		name: r,
		durationMs: i
	};
}
function be(e) {
	let t = String(e ?? "").replace(/[^a-z]/gi, "").toLowerCase();
	return !!(t && /(?:snd|sound).*(?:time|duration|lib)|(?:time|duration).*(?:snd|sound)/.test(t));
}
function xe(e) {
	let t = e.trim();
	return !t.startsWith("[") || !t.endsWith("]") ? [] : Se(t.slice(1, -1));
}
function Se(e) {
	if (!e) return [];
	let t = [], n = "", r = 0, i = 0;
	for (let a = 0; a < e.length; a += 1) {
		let o = e[a];
		if (n) {
			o === n && e[a - 1] !== "\\" && (n = "");
			continue;
		}
		o === "\"" || o === "'" ? n = o : o === "(" || o === "[" || o === "{" ? r += 1 : o === ")" || o === "]" || o === "}" ? --r : o === "," && r === 0 && (t.push(e.slice(i, a).trim()), i = a + 1);
	}
	return t.push(e.slice(i).trim()), t;
}
function Ce(e) {
	let t = e?.trim();
	if (t && (t.startsWith("\"") && t.endsWith("\"") || t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
}
//#endregion
//#region node_modules/gsap/gsap-core.js
function we(e) {
	if (e === void 0) throw ReferenceError("this hasn't been initialised - super() hasn't been called");
	return e;
}
function Te(e, t) {
	e.prototype = Object.create(t.prototype), e.prototype.constructor = e, e.__proto__ = t;
}
var Ee = {
	autoSleep: 120,
	force3D: "auto",
	nullTargetWarn: 1,
	units: { lineHeight: "" }
}, De = {
	duration: .5,
	overwrite: !1,
	delay: 0
}, Oe, F, I, ke = 1e8, L = 1 / ke, Ae = Math.PI * 2, je = Ae / 4, Me = 0, Ne = Math.sqrt, Pe = Math.cos, Fe = Math.sin, R = function(e) {
	return typeof e == "string";
}, z = function(e) {
	return typeof e == "function";
}, Ie = function(e) {
	return typeof e == "number";
}, Le = function(e) {
	return e === void 0;
}, Re = function(e) {
	return typeof e == "object";
}, ze = function(e) {
	return e !== !1;
}, Be = function() {
	return typeof window < "u";
}, Ve = function(e) {
	return z(e) || R(e);
}, He = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {}, B = Array.isArray, Ue = /random\([^)]+\)/g, We = /,\s*/g, Ge = /(?:-?\.?\d|\.)+/gi, Ke = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, qe = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, Je = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, Ye = /[+-]=-?[.\d]+/, Xe = /[^,'"\[\]\s]+/gi, Ze = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, V, Qe, $e, et, tt = {}, nt = {}, rt, it = function(e) {
	return (nt = Pt(e, tt)) && Xr;
}, at = function(e, t) {
	return console.warn("Invalid property", e, "set to", t, "Missing plugin? gsap.registerPlugin()");
}, ot = function(e, t) {
	return !t && console.warn(e);
}, st = function(e, t) {
	return e && (tt[e] = t) && nt && (nt[e] = t) || tt;
}, ct = function() {
	return 0;
}, lt = {
	suppressEvents: !0,
	isStart: !0,
	kill: !1
}, ut = {
	suppressEvents: !0,
	kill: !1
}, dt = { suppressEvents: !0 }, ft = {}, pt = [], mt = {}, ht, gt = {}, _t = {}, vt = 30, yt = [], bt = "", xt = function(e) {
	var t = e[0], n, r;
	if (Re(t) || z(t) || (e = [e]), !(n = (t._gsap || {}).harness)) {
		for (r = yt.length; r-- && !yt[r].targetTest(t););
		n = yt[r];
	}
	for (r = e.length; r--;) e[r] && (e[r]._gsap || (e[r]._gsap = new sr(e[r], n))) || e.splice(r, 1);
	return e;
}, St = function(e) {
	return e._gsap || xt(_n(e))[0]._gsap;
}, Ct = function(e, t, n) {
	return (n = e[t]) && z(n) ? e[t]() : Le(n) && e.getAttribute && e.getAttribute(t) || n;
}, wt = function(e, t) {
	return (e = e.split(",")).forEach(t) || e;
}, H = function(e) {
	return Math.round(e * 1e5) / 1e5 || 0;
}, U = function(e) {
	return Math.round(e * 1e7) / 1e7 || 0;
}, Tt = function(e, t) {
	var n = t.charAt(0), r = parseFloat(t.substr(2));
	return e = parseFloat(e), n === "+" ? e + r : n === "-" ? e - r : n === "*" ? e * r : e / r;
}, Et = function(e, t) {
	for (var n = t.length, r = 0; e.indexOf(t[r]) < 0 && ++r < n;);
	return r < n;
}, Dt = function() {
	var e = pt.length, t = pt.slice(0), n, r;
	for (mt = {}, pt.length = 0, n = 0; n < e; n++) r = t[n], r && r._lazy && (r.render(r._lazy[0], r._lazy[1], !0)._lazy = 0);
}, Ot = function(e) {
	return !!(e._initted || e._startAt || e.add);
}, kt = function(e, t, n, r) {
	pt.length && !F && Dt(), e.render(t, n, r || !!(F && t < 0 && Ot(e))), pt.length && !F && Dt();
}, At = function(e) {
	var t = parseFloat(e);
	return (t || t === 0) && (e + "").match(Xe).length < 2 ? t : R(e) ? e.trim() : e;
}, jt = function(e) {
	return e;
}, Mt = function(e, t) {
	for (var n in t) n in e || (e[n] = t[n]);
	return e;
}, Nt = function(e) {
	return function(t, n) {
		for (var r in n) r in t || r === "duration" && e || r === "ease" || (t[r] = n[r]);
	};
}, Pt = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, Ft = function e(t, n) {
	for (var r in n) r !== "__proto__" && r !== "constructor" && r !== "prototype" && (t[r] = Re(n[r]) ? e(t[r] || (t[r] = {}), n[r]) : n[r]);
	return t;
}, It = function(e, t) {
	var n = {}, r;
	for (r in e) r in t || (n[r] = e[r]);
	return n;
}, Lt = function(e) {
	var t = e.parent || V, n = e.keyframes ? Nt(B(e.keyframes)) : Mt;
	if (ze(e.inherit)) for (; t;) n(e, t.vars.defaults), t = t.parent || t._dp;
	return e;
}, Rt = function(e, t) {
	for (var n = e.length, r = n === t.length; r && n-- && e[n] === t[n];);
	return n < 0;
}, zt = function(e, t, n, r, i) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var a = e[r], o;
	if (i) for (o = t[i]; a && a[i] > o;) a = a._prev;
	return a ? (t._next = a._next, a._next = t) : (t._next = e[n], e[n] = t), t._next ? t._next._prev = t : e[r] = t, t._prev = a, t.parent = t._dp = e, t;
}, Bt = function(e, t, n, r) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var i = t._prev, a = t._next;
	i ? i._next = a : e[n] === t && (e[n] = a), a ? a._prev = i : e[r] === t && (e[r] = i), t._next = t._prev = t.parent = null;
}, Vt = function(e, t) {
	e.parent && (!t || e.parent.autoRemoveChildren) && e.parent.remove && e.parent.remove(e), e._act = 0;
}, Ht = function(e, t) {
	if (e && (!t || t._end > e._dur || t._start < 0)) for (var n = e; n;) n._dirty = 1, n = n.parent;
	return e;
}, Ut = function(e) {
	for (var t = e.parent; t && t.parent;) t._dirty = 1, t.totalDuration(), t = t.parent;
	return e;
}, Wt = function(e, t, n, r) {
	return e._startAt && (F ? e._startAt.revert(ut) : e.vars.immediateRender && !e.vars.autoRevert || e._startAt.render(t, !0, r));
}, Gt = function e(t) {
	return !t || t._ts && e(t.parent);
}, Kt = function(e) {
	return e._repeat ? qt(e._tTime, e = e.duration() + e._rDelay) * e : 0;
}, qt = function(e, t) {
	var n = Math.floor(e = U(e / t));
	return e && n === e ? n - 1 : n;
}, Jt = function(e, t) {
	return (e - t._start) * t._ts + (t._ts >= 0 ? 0 : t._dirty ? t.totalDuration() : t._tDur);
}, Yt = function(e) {
	return e._end = U(e._start + (e._tDur / Math.abs(e._ts || e._rts || L) || 0));
}, Xt = function(e, t) {
	var n = e._dp;
	return n && n.smoothChildTiming && e._ts && (e._start = U(n._time - (e._ts > 0 ? t / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - t) / -e._ts)), Yt(e), n._dirty || Ht(n, e)), e;
}, Zt = function(e, t) {
	var n;
	if ((t._time || !t._dur && t._initted || t._start < e._time && (t._dur || !t.add)) && (n = Jt(e.rawTime(), t), (!t._dur || fn(0, t.totalDuration(), n) - t._tTime > L) && t.render(n, !0)), Ht(e, t)._dp && e._initted && e._time >= e._dur && e._ts) {
		if (e._dur < e.duration()) for (n = e; n._dp;) n.rawTime() >= 0 && n.totalTime(n._tTime), n = n._dp;
		e._zTime = -L;
	}
}, Qt = function(e, t, n, r) {
	return t.parent && Vt(t), t._start = U((Ie(n) ? n : n || e !== V ? ln(e, n, t) : e._time) + t._delay), t._end = U(t._start + (t.totalDuration() / Math.abs(t.timeScale()) || 0)), zt(e, t, "_first", "_last", e._sort ? "_start" : 0), nn(t) || (e._recent = t), r || Zt(e, t), e._ts < 0 && Xt(e, e._tTime), e;
}, $t = function(e, t) {
	return (tt.ScrollTrigger || at("scrollTrigger", t)) && tt.ScrollTrigger.create(t, e);
}, en = function(e, t, n, r, i) {
	if (gr(e, t, i), !e._initted) return 1;
	if (!n && e._pt && !F && (e._dur && e.vars.lazy !== !1 || !e._dur && e.vars.lazy) && ht !== Jn.frame) return pt.push(e), e._lazy = [i, r], 1;
}, tn = function e(t) {
	var n = t.parent;
	return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || e(n));
}, nn = function(e) {
	var t = e.data;
	return t === "isFromStart" || t === "isStart";
}, rn = function(e, t, n, r) {
	var i = e.ratio, a = t < 0 || !t && (!e._start && tn(e) && !(!e._initted && nn(e)) || (e._ts < 0 || e._dp._ts < 0) && !nn(e)) ? 0 : 1, o = e._rDelay, s = 0, c, l, u;
	if (o && e._repeat && (s = fn(0, e._tDur, t), l = qt(s, o), e._yoyo && l & 1 && (a = 1 - a), l !== qt(e._tTime, o) && (i = 1 - a, e.vars.repeatRefresh && e._initted && e.invalidate())), a !== i || F || r || e._zTime === L || !t && e._zTime) {
		if (!e._initted && en(e, t, r, n, s)) return;
		for (u = e._zTime, e._zTime = t || (n ? L : 0), n ||= t && !u, e.ratio = a, e._from && (a = 1 - a), e._time = 0, e._tTime = s, c = e._pt; c;) c.r(a, c.d), c = c._next;
		t < 0 && Wt(e, t, n, !0), e._onUpdate && !n && Pn(e, "onUpdate"), s && e._repeat && !n && e.parent && Pn(e, "onRepeat"), (t >= e._tDur || t < 0) && e.ratio === a && (a && Vt(e, 1), !n && !F && (Pn(e, a ? "onComplete" : "onReverseComplete", !0), e._prom && e._prom()));
	} else e._zTime ||= t;
}, an = function(e, t, n) {
	var r;
	if (n > t) for (r = e._first; r && r._start <= n;) {
		if (r.data === "isPause" && r._start > t) return r;
		r = r._next;
	}
	else for (r = e._last; r && r._start >= n;) {
		if (r.data === "isPause" && r._start < t) return r;
		r = r._prev;
	}
}, on = function(e, t, n, r) {
	var i = e._repeat, a = U(t) || 0, o = e._tTime / e._tDur;
	return o && !r && (e._time *= a / e._dur), e._dur = a, e._tDur = i ? i < 0 ? 1e10 : U(a * (i + 1) + e._rDelay * i) : a, o > 0 && !r && Xt(e, e._tTime = e._tDur * o), e.parent && Yt(e), n || Ht(e.parent, e), e;
}, sn = function(e) {
	return e instanceof lr ? Ht(e) : on(e, e._dur);
}, cn = {
	_start: 0,
	endTime: ct,
	totalDuration: ct
}, ln = function e(t, n, r) {
	var i = t.labels, a = t._recent || cn, o = t.duration() >= ke ? a.endTime(!1) : t._dur, s, c, l;
	return R(n) && (isNaN(n) || n in i) ? (c = n.charAt(0), l = n.substr(-1) === "%", s = n.indexOf("="), c === "<" || c === ">" ? (s >= 0 && (n = n.replace(/=/, "")), (c === "<" ? a._start : a.endTime(a._repeat >= 0)) + (parseFloat(n.substr(1)) || 0) * (l ? (s < 0 ? a : r).totalDuration() / 100 : 1)) : s < 0 ? (n in i || (i[n] = o), i[n]) : (c = parseFloat(n.charAt(s - 1) + n.substr(s + 1)), l && r && (c = c / 100 * (B(r) ? r[0] : r).totalDuration()), s > 1 ? e(t, n.substr(0, s - 1), r) + c : o + c)) : n == null ? o : +n;
}, un = function(e, t, n) {
	var r = Ie(t[1]), i = (r ? 2 : 1) + (e < 2 ? 0 : 1), a = t[i], o, s;
	if (r && (a.duration = t[1]), a.parent = n, e) {
		for (o = a, s = n; s && !("immediateRender" in o);) o = s.vars.defaults || {}, s = ze(s.vars.inherit) && s.parent;
		a.immediateRender = ze(o.immediateRender), e < 2 ? a.runBackwards = 1 : a.startAt = t[i - 1];
	}
	return new q(t[0], a, t[i + 1]);
}, dn = function(e, t) {
	return e || e === 0 ? t(e) : t;
}, fn = function(e, t, n) {
	return n < e ? e : n > t ? t : n;
}, W = function(e, t) {
	return !R(e) || !(t = Ze.exec(e)) ? "" : t[1];
}, pn = function(e, t, n) {
	return dn(n, function(n) {
		return fn(e, t, n);
	});
}, mn = [].slice, hn = function(e, t) {
	return e && Re(e) && "length" in e && (!t && !e.length || e.length - 1 in e && Re(e[0])) && !e.nodeType && e !== Qe;
}, gn = function(e, t, n) {
	return n === void 0 && (n = []), e.forEach(function(e) {
		var r;
		return R(e) && !t || hn(e, 1) ? (r = n).push.apply(r, _n(e)) : n.push(e);
	}) || n;
}, _n = function(e, t, n) {
	return I && !t && I.selector ? I.selector(e) : R(e) && !n && ($e || !Yn()) ? mn.call((t || et).querySelectorAll(e), 0) : B(e) ? gn(e, n) : hn(e) ? mn.call(e, 0) : e ? [e] : [];
}, vn = function(e) {
	return e = _n(e)[0] || ot("Invalid scope") || {}, function(t) {
		var n = e.current || e.nativeElement || e;
		return _n(t, n.querySelectorAll ? n : n === e ? ot("Invalid scope") || et.createElement("div") : e);
	};
}, yn = function(e) {
	return e.sort(function() {
		return .5 - Math.random();
	});
}, bn = function(e) {
	if (z(e)) return e;
	var t = Re(e) ? e : { each: e }, n = nr(t.ease), r = t.from || 0, i = parseFloat(t.base) || 0, a = {}, o = r > 0 && r < 1, s = isNaN(r) || o, c = t.axis, l = r, u = r;
	return R(r) ? l = u = {
		center: .5,
		edges: .5,
		end: 1
	}[r] || 0 : !o && s && (l = r[0], u = r[1]), function(e, o, d) {
		var f = (d || t).length, p = a[f], m, h, g, _, v, y, b, x, S;
		if (!p) {
			if (S = t.grid === "auto" ? 0 : (t.grid || [1, ke])[1], !S) {
				for (b = -ke; b < (b = d[S++].getBoundingClientRect().left) && S < f;);
				S < f && S--;
			}
			for (p = a[f] = [], m = s ? Math.min(S, f) * l - .5 : r % S, h = S === ke ? 0 : s ? f * u / S - .5 : r / S | 0, b = 0, x = ke, y = 0; y < f; y++) g = y % S - m, _ = h - (y / S | 0), p[y] = v = c ? Math.abs(c === "y" ? _ : g) : Ne(g * g + _ * _), v > b && (b = v), v < x && (x = v);
			r === "random" && yn(p), p.max = b - x, p.min = x, p.v = f = (parseFloat(t.amount) || parseFloat(t.each) * (S > f ? f - 1 : c ? c === "y" ? f / S : S : Math.max(S, f / S)) || 0) * (r === "edges" ? -1 : 1), p.b = f < 0 ? i - f : i, p.u = W(t.amount || t.each) || 0, n = n && f < 0 ? tr(n) : n;
		}
		return f = (p[e] - p.min) / p.max || 0, U(p.b + (n ? n(f) : f) * p.v) + p.u;
	};
}, xn = function(e) {
	var t = 10 ** ((e + "").split(".")[1] || "").length;
	return function(n) {
		var r = U(Math.round(parseFloat(n) / e) * e * t);
		return (r - r % 1) / t + (Ie(n) ? 0 : W(n));
	};
}, Sn = function(e, t) {
	var n = B(e), r, i;
	return !n && Re(e) && (r = n = e.radius || ke, e.values ? (e = _n(e.values), (i = !Ie(e[0])) && (r *= r)) : e = xn(e.increment)), dn(t, n ? z(e) ? function(t) {
		return i = e(t), Math.abs(i - t) <= r ? i : t;
	} : function(t) {
		for (var n = parseFloat(i ? t.x : t), a = parseFloat(i ? t.y : 0), o = ke, s = 0, c = e.length, l, u; c--;) i ? (l = e[c].x - n, u = e[c].y - a, l = l * l + u * u) : l = Math.abs(e[c] - n), l < o && (o = l, s = c);
		return s = !r || o <= r ? e[s] : t, i || s === t || Ie(t) ? s : s + W(t);
	} : xn(e));
}, Cn = function(e, t, n, r) {
	return dn(B(e) ? !t : n === !0 ? !!(n = 0) : !r, function() {
		return B(e) ? e[~~(Math.random() * e.length)] : (n ||= 1e-5) && (r = n < 1 ? 10 ** ((n + "").length - 2) : 1) && Math.floor(Math.round((e - n / 2 + Math.random() * (t - e + n * .99)) / n) * n * r) / r;
	});
}, wn = function() {
	var e = [...arguments];
	return function(t) {
		return e.reduce(function(e, t) {
			return t(e);
		}, t);
	};
}, Tn = function(e, t) {
	return function(n) {
		return e(parseFloat(n)) + (t || W(n));
	};
}, En = function(e, t, n) {
	return jn(e, t, 0, 1, n);
}, Dn = function(e, t, n) {
	return dn(n, function(n) {
		return e[~~t(n)];
	});
}, On = function e(t, n, r) {
	var i = n - t;
	return B(t) ? Dn(t, e(0, t.length), n) : dn(r, function(e) {
		return (i + (e - t) % i) % i + t;
	});
}, kn = function e(t, n, r) {
	var i = n - t, a = i * 2;
	return B(t) ? Dn(t, e(0, t.length - 1), n) : dn(r, function(e) {
		return e = (a + (e - t) % a) % a || 0, t + (e > i ? a - e : e);
	});
}, An = function(e) {
	return e.replace(Ue, function(e) {
		var t = e.indexOf("[") + 1, n = e.substring(t || 7, t ? e.indexOf("]") : e.length - 1).split(We);
		return Cn(t ? n : +n[0], t ? 0 : +n[1], +n[2] || 1e-5);
	});
}, jn = function(e, t, n, r, i) {
	var a = t - e, o = r - n;
	return dn(i, function(t) {
		return n + ((t - e) / a * o || 0);
	});
}, Mn = function e(t, n, r, i) {
	var a = isNaN(t + n) ? 0 : function(e) {
		return (1 - e) * t + e * n;
	};
	if (!a) {
		var o = R(t), s = {}, c, l, u, d, f;
		if (r === !0 && (i = 1) && (r = null), o) t = { p: t }, n = { p: n };
		else if (B(t) && !B(n)) {
			for (u = [], d = t.length, f = d - 2, l = 1; l < d; l++) u.push(e(t[l - 1], t[l]));
			d--, a = function(e) {
				e *= d;
				var t = Math.min(f, ~~e);
				return u[t](e - t);
			}, r = n;
		} else i || (t = Pt(B(t) ? [] : {}, t));
		if (!u) {
			for (c in n) dr.call(s, t, c, "get", n[c]);
			a = function(e) {
				return jr(e, s) || (o ? t.p : t);
			};
		}
	}
	return dn(r, a);
}, Nn = function(e, t, n) {
	var r = e.labels, i = ke, a, o, s;
	for (a in r) o = r[a] - t, o < 0 == !!n && o && i > (o = Math.abs(o)) && (s = a, i = o);
	return s;
}, Pn = function(e, t, n) {
	var r = e.vars, i = r[t], a = I, o = e._ctx, s, c, l;
	if (i) return s = r[t + "Params"], c = r.callbackScope || e, n && pt.length && Dt(), o && (I = o), l = s ? i.apply(c, s) : i.call(c), I = a, l;
}, Fn = function(e) {
	return Vt(e), e.scrollTrigger && e.scrollTrigger.kill(!!F), e.progress() < 1 && Pn(e, "onInterrupt"), e;
}, In, Ln = [], Rn = function(e) {
	if (e) if (e = !e.name && e.default || e, Be() || e.headless) {
		var t = e.name, n = z(e), r = t && !n && e.init ? function() {
			this._props = [];
		} : e, i = {
			init: ct,
			render: jr,
			add: dr,
			kill: Nr,
			modifier: Mr,
			rawVars: 0
		}, a = {
			targetTest: 0,
			get: 0,
			getSetter: Dr,
			aliases: {},
			register: 0
		};
		if (Yn(), e !== r) {
			if (gt[t]) return;
			Mt(r, Mt(It(e, i), a)), Pt(r.prototype, Pt(i, It(e, a))), gt[r.prop = t] = r, e.targetTest && (yt.push(r), ft[t] = 1), t = (t === "css" ? "CSS" : t.charAt(0).toUpperCase() + t.substr(1)) + "Plugin";
		}
		st(t, r), e.register && e.register(Xr, r, Ir);
	} else Ln.push(e);
}, G = 255, zn = {
	aqua: [
		0,
		G,
		G
	],
	lime: [
		0,
		G,
		0
	],
	silver: [
		192,
		192,
		192
	],
	black: [
		0,
		0,
		0
	],
	maroon: [
		128,
		0,
		0
	],
	teal: [
		0,
		128,
		128
	],
	blue: [
		0,
		0,
		G
	],
	navy: [
		0,
		0,
		128
	],
	white: [
		G,
		G,
		G
	],
	olive: [
		128,
		128,
		0
	],
	yellow: [
		G,
		G,
		0
	],
	orange: [
		G,
		165,
		0
	],
	gray: [
		128,
		128,
		128
	],
	purple: [
		128,
		0,
		128
	],
	green: [
		0,
		128,
		0
	],
	red: [
		G,
		0,
		0
	],
	pink: [
		G,
		192,
		203
	],
	cyan: [
		0,
		G,
		G
	],
	transparent: [
		G,
		G,
		G,
		0
	]
}, Bn = function(e, t, n) {
	return e += e < 0 ? 1 : e > 1 ? -1 : 0, (e * 6 < 1 ? t + (n - t) * e * 6 : e < .5 ? n : e * 3 < 2 ? t + (n - t) * (2 / 3 - e) * 6 : t) * G + .5 | 0;
}, Vn = function(e, t, n) {
	var r = e ? Ie(e) ? [
		e >> 16,
		e >> 8 & G,
		e & G
	] : 0 : zn.black, i, a, o, s, c, l, u, d, f, p;
	if (!r) {
		if (e.substr(-1) === "," && (e = e.substr(0, e.length - 1)), zn[e]) r = zn[e];
		else if (e.charAt(0) === "#") {
			if (e.length < 6 && (i = e.charAt(1), a = e.charAt(2), o = e.charAt(3), e = "#" + i + i + a + a + o + o + (e.length === 5 ? e.charAt(4) + e.charAt(4) : "")), e.length === 9) return r = parseInt(e.substr(1, 6), 16), [
				r >> 16,
				r >> 8 & G,
				r & G,
				parseInt(e.substr(7), 16) / 255
			];
			e = parseInt(e.substr(1), 16), r = [
				e >> 16,
				e >> 8 & G,
				e & G
			];
		} else if (e.substr(0, 3) === "hsl") {
			if (r = p = e.match(Ge), !t) s = r[0] % 360 / 360, c = r[1] / 100, l = r[2] / 100, a = l <= .5 ? l * (c + 1) : l + c - l * c, i = l * 2 - a, r.length > 3 && (r[3] *= 1), r[0] = Bn(s + 1 / 3, i, a), r[1] = Bn(s, i, a), r[2] = Bn(s - 1 / 3, i, a);
			else if (~e.indexOf("=")) return r = e.match(Ke), n && r.length < 4 && (r[3] = 1), r;
		} else r = e.match(Ge) || zn.transparent;
		r = r.map(Number);
	}
	return t && !p && (i = r[0] / G, a = r[1] / G, o = r[2] / G, u = Math.max(i, a, o), d = Math.min(i, a, o), l = (u + d) / 2, u === d ? s = c = 0 : (f = u - d, c = l > .5 ? f / (2 - u - d) : f / (u + d), s = u === i ? (a - o) / f + (a < o ? 6 : 0) : u === a ? (o - i) / f + 2 : (i - a) / f + 4, s *= 60), r[0] = ~~(s + .5), r[1] = ~~(c * 100 + .5), r[2] = ~~(l * 100 + .5)), n && r.length < 4 && (r[3] = 1), r;
}, Hn = function(e) {
	var t = [], n = [], r = -1;
	return e.split(Wn).forEach(function(e) {
		var i = e.match(qe) || [];
		t.push.apply(t, i), n.push(r += i.length + 1);
	}), t.c = n, t;
}, Un = function(e, t, n) {
	var r = "", i = (e + r).match(Wn), a = t ? "hsla(" : "rgba(", o = 0, s, c, l, u;
	if (!i) return e;
	if (i = i.map(function(e) {
		return (e = Vn(e, t, 1)) && a + (t ? e[0] + "," + e[1] + "%," + e[2] + "%," + e[3] : e.join(",")) + ")";
	}), n && (l = Hn(e), s = n.c, s.join(r) !== l.c.join(r))) for (c = e.replace(Wn, "1").split(qe), u = c.length - 1; o < u; o++) r += c[o] + (~s.indexOf(o) ? i.shift() || a + "0,0,0,0)" : (l.length ? l : i.length ? i : n).shift());
	if (!c) for (c = e.split(Wn), u = c.length - 1; o < u; o++) r += c[o] + i[o];
	return r + c[u];
}, Wn = function() {
	var e = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", t;
	for (t in zn) e += "|" + t + "\\b";
	return RegExp(e + ")", "gi");
}(), Gn = /hsl[a]?\(/, Kn = function(e) {
	var t = e.join(" "), n;
	if (Wn.lastIndex = 0, Wn.test(t)) return n = Gn.test(t), e[1] = Un(e[1], n), e[0] = Un(e[0], n, Hn(e[1])), !0;
}, qn, Jn = function() {
	var e = Date.now, t = 500, n = 33, r = e(), i = r, a = 1e3 / 240, o = a, s = [], c, l, u, d, f, p, m = function u(m) {
		var h = e() - i, g = m === !0, _, v, y, b;
		if ((h > t || h < 0) && (r += h - n), i += h, y = i - r, _ = y - o, (_ > 0 || g) && (b = ++d.frame, f = y - d.time * 1e3, d.time = y /= 1e3, o += _ + (_ >= a ? 4 : a - _), v = 1), g || (c = l(u)), v) for (p = 0; p < s.length; p++) s[p](y, f, b, m);
	};
	return d = {
		time: 0,
		frame: 0,
		tick: function() {
			m(!0);
		},
		deltaRatio: function(e) {
			return f / (1e3 / (e || 60));
		},
		wake: function() {
			rt && (!$e && Be() && (Qe = $e = window, et = Qe.document || {}, tt.gsap = Xr, (Qe.gsapVersions ||= []).push(Xr.version), it(nt || Qe.GreenSockGlobals || !Qe.gsap && Qe || {}), Ln.forEach(Rn)), u = typeof requestAnimationFrame < "u" && requestAnimationFrame, c && d.sleep(), l = u || function(e) {
				return setTimeout(e, o - d.time * 1e3 + 1 | 0);
			}, qn = 1, m(2));
		},
		sleep: function() {
			(u ? cancelAnimationFrame : clearTimeout)(c), qn = 0, l = ct;
		},
		lagSmoothing: function(e, r) {
			t = e || Infinity, n = Math.min(r || 33, t);
		},
		fps: function(e) {
			a = 1e3 / (e || 240), o = d.time * 1e3 + a;
		},
		add: function(e, t, n) {
			var r = t ? function(t, n, i, a) {
				e(t, n, i, a), d.remove(r);
			} : e;
			return d.remove(e), s[n ? "unshift" : "push"](r), Yn(), r;
		},
		remove: function(e, t) {
			~(t = s.indexOf(e)) && s.splice(t, 1) && p >= t && p--;
		},
		_listeners: s
	}, d;
}(), Yn = function() {
	return !qn && Jn.wake();
}, K = {}, Xn = /^[\d.\-M][\d.\-,\s]/, Zn = /["']/g, Qn = function(e) {
	for (var t = {}, n = e.substr(1, e.length - 3).split(":"), r = n[0], i = 1, a = n.length, o, s, c; i < a; i++) s = n[i], o = i === a - 1 ? s.length : s.lastIndexOf(","), c = s.substr(0, o), t[r] = isNaN(c) ? c.replace(Zn, "").trim() : +c, r = s.substr(o + 1).trim();
	return t;
}, $n = function(e) {
	var t = e.indexOf("(") + 1, n = e.indexOf(")"), r = e.indexOf("(", t);
	return e.substring(t, ~r && r < n ? e.indexOf(")", n + 1) : n);
}, er = function(e) {
	var t = (e + "").split("("), n = K[t[0]];
	return n && t.length > 1 && n.config ? n.config.apply(null, ~e.indexOf("{") ? [Qn(t[1])] : $n(e).split(",").map(At)) : K._CE && Xn.test(e) ? K._CE("", e) : n;
}, tr = function(e) {
	return function(t) {
		return 1 - e(1 - t);
	};
}, nr = function(e, t) {
	return e && (z(e) ? e : K[e] || er(e)) || t;
}, rr = function(e, t, n, r) {
	n === void 0 && (n = function(e) {
		return 1 - t(1 - e);
	}), r === void 0 && (r = function(e) {
		return e < .5 ? t(e * 2) / 2 : 1 - t((1 - e) * 2) / 2;
	});
	var i = {
		easeIn: t,
		easeOut: n,
		easeInOut: r
	}, a;
	return wt(e, function(e) {
		for (var t in K[e] = tt[e] = i, K[a = e.toLowerCase()] = n, i) K[a + (t === "easeIn" ? ".in" : t === "easeOut" ? ".out" : ".inOut")] = K[e + "." + t] = i[t];
	}), i;
}, ir = function(e) {
	return function(t) {
		return t < .5 ? (1 - e(1 - t * 2)) / 2 : .5 + e((t - .5) * 2) / 2;
	};
}, ar = function e(t, n, r) {
	var i = n >= 1 ? n : 1, a = (r || (t ? .3 : .45)) / (n < 1 ? n : 1), o = a / Ae * (Math.asin(1 / i) || 0), s = function(e) {
		return e === 1 ? 1 : i * 2 ** (-10 * e) * Fe((e - o) * a) + 1;
	}, c = t === "out" ? s : t === "in" ? function(e) {
		return 1 - s(1 - e);
	} : ir(s);
	return a = Ae / a, c.config = function(n, r) {
		return e(t, n, r);
	}, c;
}, or = function e(t, n) {
	n === void 0 && (n = 1.70158);
	var r = function(e) {
		return e ? --e * e * ((n + 1) * e + n) + 1 : 0;
	}, i = t === "out" ? r : t === "in" ? function(e) {
		return 1 - r(1 - e);
	} : ir(r);
	return i.config = function(n) {
		return e(t, n);
	}, i;
};
wt("Linear,Quad,Cubic,Quart,Quint,Strong", function(e, t) {
	var n = t < 5 ? t + 1 : t;
	rr(e + ",Power" + (n - 1), t ? function(e) {
		return e ** +n;
	} : function(e) {
		return e;
	}, function(e) {
		return 1 - (1 - e) ** n;
	}, function(e) {
		return e < .5 ? (e * 2) ** n / 2 : 1 - ((1 - e) * 2) ** n / 2;
	});
}), K.Linear.easeNone = K.none = K.Linear.easeIn, rr("Elastic", ar("in"), ar("out"), ar()), (function(e, t) {
	var n = 1 / t, r = 2 * n, i = 2.5 * n, a = function(a) {
		return a < n ? e * a * a : a < r ? e * (a - 1.5 / t) ** 2 + .75 : a < i ? e * (a -= 2.25 / t) * a + .9375 : e * (a - 2.625 / t) ** 2 + .984375;
	};
	rr("Bounce", function(e) {
		return 1 - a(1 - e);
	}, a);
})(7.5625, 2.75), rr("Expo", function(e) {
	return 2 ** (10 * (e - 1)) * e + e * e * e * e * e * e * (1 - e);
}), rr("Circ", function(e) {
	return -(Ne(1 - e * e) - 1);
}), rr("Sine", function(e) {
	return e === 1 ? 1 : -Pe(e * je) + 1;
}), rr("Back", or("in"), or("out"), or()), K.SteppedEase = K.steps = tt.SteppedEase = { config: function(e, t) {
	e === void 0 && (e = 1);
	var n = 1 / e, r = e + +!t, i = +!!t, a = 1 - L;
	return function(e) {
		return ((r * fn(0, a, e) | 0) + i) * n;
	};
} }, De.ease = K["quad.out"], wt("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(e) {
	return bt += e + "," + e + "Params,";
});
var sr = function(e, t) {
	this.id = Me++, e._gsap = this, this.target = e, this.harness = t, this.get = t ? t.get : Ct, this.set = t ? t.getSetter : Dr;
}, cr = /* @__PURE__ */ function() {
	function e(e) {
		this.vars = e, this._delay = +e.delay || 0, (this._repeat = e.repeat === Infinity ? -2 : e.repeat || 0) && (this._rDelay = e.repeatDelay || 0, this._yoyo = !!e.yoyo || !!e.yoyoEase), this._ts = 1, on(this, +e.duration, 1, 1), this.data = e.data, I && (this._ctx = I, I.data.push(this)), qn || Jn.wake();
	}
	var t = e.prototype;
	return t.delay = function(e) {
		return e || e === 0 ? (this.parent && this.parent.smoothChildTiming && this.startTime(this._start + e - this._delay), this._delay = e, this) : this._delay;
	}, t.duration = function(e) {
		return arguments.length ? this.totalDuration(this._repeat > 0 ? e + (e + this._rDelay) * this._repeat : e) : this.totalDuration() && this._dur;
	}, t.totalDuration = function(e) {
		return arguments.length ? (this._dirty = 0, on(this, this._repeat < 0 ? e : (e - this._repeat * this._rDelay) / (this._repeat + 1))) : this._tDur;
	}, t.totalTime = function(e, t) {
		if (Yn(), !arguments.length) return this._tTime;
		var n = this._dp;
		if (n && n.smoothChildTiming && this._ts) {
			for (Xt(this, e), !n._dp || n.parent || Zt(n, this); n && n.parent;) n.parent._time !== n._start + (n._ts >= 0 ? n._tTime / n._ts : (n.totalDuration() - n._tTime) / -n._ts) && n.totalTime(n._tTime, !0), n = n.parent;
			!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && e < this._tDur || this._ts < 0 && e > 0 || !this._tDur && !e) && Qt(this._dp, this, this._start - this._delay);
		}
		return (this._tTime !== e || !this._dur && !t || this._initted && Math.abs(this._zTime) === L || !this._initted && this._dur && e || !e && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = e), kt(this, e, t)), this;
	}, t.time = function(e, t) {
		return arguments.length ? this.totalTime(Math.min(this.totalDuration(), e + Kt(this)) % (this._dur + this._rDelay) || (e ? this._dur : 0), t) : this._time;
	}, t.totalProgress = function(e, t) {
		return arguments.length ? this.totalTime(this.totalDuration() * e, t) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
	}, t.progress = function(e, t) {
		return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - e : e) + Kt(this), t) : this.duration() ? Math.min(1, this._time / this._dur) : +(this.rawTime() > 0);
	}, t.iteration = function(e, t) {
		var n = this.duration() + this._rDelay;
		return arguments.length ? this.totalTime(this._time + (e - 1) * n, t) : this._repeat ? qt(this._tTime, n) + 1 : 1;
	}, t.timeScale = function(e, t) {
		if (!arguments.length) return this._rts === -L ? 0 : this._rts;
		if (this._rts === e) return this;
		var n = this.parent && this._ts ? Jt(this.parent._time, this) : this._tTime;
		return this._rts = +e || 0, this._ts = this._ps || e === -L ? 0 : this._rts, this.totalTime(fn(-Math.abs(this._delay), this.totalDuration(), n), t !== !1), Yt(this), Ut(this);
	}, t.paused = function(e) {
		return arguments.length ? (this._ps !== e && (this._ps = e, e ? (this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()), this._ts = this._act = 0) : (Yn(), this._ts = this._rts, this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== L && (this._tTime -= L)))), this) : this._ps;
	}, t.startTime = function(e) {
		if (arguments.length) {
			this._start = U(e);
			var t = this.parent || this._dp;
			return t && (t._sort || !this.parent) && Qt(t, this, this._start - this._delay), this;
		}
		return this._start;
	}, t.endTime = function(e) {
		return this._start + (ze(e) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
	}, t.rawTime = function(e) {
		var t = this.parent || this._dp;
		return t ? e && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : this._ts ? Jt(t.rawTime(e), this) : this._tTime : this._tTime;
	}, t.revert = function(e) {
		e === void 0 && (e = dt);
		var t = F;
		return F = e, Ot(this) && (this.timeline && this.timeline.revert(e), this.totalTime(-.01, e.suppressEvents)), this.data !== "nested" && e.kill !== !1 && this.kill(), F = t, this;
	}, t.globalTime = function(e) {
		for (var t = this, n = arguments.length ? e : t.rawTime(); t;) n = t._start + n / (Math.abs(t._ts) || 1), t = t._dp;
		return !this.parent && this._sat ? this._sat.globalTime(e) : n;
	}, t.repeat = function(e) {
		return arguments.length ? (this._repeat = e === Infinity ? -2 : e, sn(this)) : this._repeat === -2 ? Infinity : this._repeat;
	}, t.repeatDelay = function(e) {
		if (arguments.length) {
			var t = this._time;
			return this._rDelay = e, sn(this), t ? this.time(t) : this;
		}
		return this._rDelay;
	}, t.yoyo = function(e) {
		return arguments.length ? (this._yoyo = e, this) : this._yoyo;
	}, t.seek = function(e, t) {
		return this.totalTime(ln(this, e), ze(t));
	}, t.restart = function(e, t) {
		return this.play().totalTime(e ? -this._delay : 0, ze(t)), this._dur || (this._zTime = -L), this;
	}, t.play = function(e, t) {
		return e != null && this.seek(e, t), this.reversed(!1).paused(!1);
	}, t.reverse = function(e, t) {
		return e != null && this.seek(e || this.totalDuration(), t), this.reversed(!0).paused(!1);
	}, t.pause = function(e, t) {
		return e != null && this.seek(e, t), this.paused(!0);
	}, t.resume = function() {
		return this.paused(!1);
	}, t.reversed = function(e) {
		return arguments.length ? (!!e !== this.reversed() && this.timeScale(-this._rts || (e ? -L : 0)), this) : this._rts < 0;
	}, t.invalidate = function() {
		return this._initted = this._act = 0, this._zTime = -L, this;
	}, t.isActive = function() {
		var e = this.parent || this._dp, t = this._start, n;
		return !!(!e || this._ts && this._initted && e.isActive() && (n = e.rawTime(!0)) >= t && n < this.endTime(!0) - L);
	}, t.eventCallback = function(e, t, n) {
		var r = this.vars;
		return arguments.length > 1 ? (t ? (r[e] = t, n && (r[e + "Params"] = n), e === "onUpdate" && (this._onUpdate = t)) : delete r[e], this) : r[e];
	}, t.then = function(e) {
		var t = this, n = t._prom;
		return new Promise(function(r) {
			var i = z(e) ? e : jt, a = function() {
				var e = t.then;
				t.then = null, n && n(), z(i) && (i = i(t)) && (i.then || i === t) && (t.then = e), r(i), t.then = e;
			};
			t._initted && t.totalProgress() === 1 && t._ts >= 0 || !t._tTime && t._ts < 0 ? a() : t._prom = a;
		});
	}, t.kill = function() {
		Fn(this);
	}, e;
}();
Mt(cr.prototype, {
	_time: 0,
	_start: 0,
	_end: 0,
	_tTime: 0,
	_tDur: 0,
	_dirty: 0,
	_repeat: 0,
	_yoyo: !1,
	parent: null,
	_initted: !1,
	_rDelay: 0,
	_ts: 1,
	_dp: 0,
	ratio: 0,
	_zTime: -L,
	_prom: 0,
	_ps: !1,
	_rts: 1
});
var lr = /* @__PURE__ */ function(e) {
	Te(t, e);
	function t(t, n) {
		var r;
		return t === void 0 && (t = {}), r = e.call(this, t) || this, r.labels = {}, r.smoothChildTiming = !!t.smoothChildTiming, r.autoRemoveChildren = !!t.autoRemoveChildren, r._sort = ze(t.sortChildren), V && Qt(t.parent || V, we(r), n), t.reversed && r.reverse(), t.paused && r.paused(!0), t.scrollTrigger && $t(we(r), t.scrollTrigger), r;
	}
	var n = t.prototype;
	return n.to = function(e, t, n) {
		return un(0, arguments, this), this;
	}, n.from = function(e, t, n) {
		return un(1, arguments, this), this;
	}, n.fromTo = function(e, t, n, r) {
		return un(2, arguments, this), this;
	}, n.set = function(e, t, n) {
		return t.duration = 0, t.parent = this, Lt(t).repeatDelay || (t.repeat = 0), t.immediateRender = !!t.immediateRender, new q(e, t, ln(this, n), 1), this;
	}, n.call = function(e, t, n) {
		return Qt(this, q.delayedCall(0, e, t), n);
	}, n.staggerTo = function(e, t, n, r, i, a, o) {
		return n.duration = t, n.stagger = n.stagger || r, n.onComplete = a, n.onCompleteParams = o, n.parent = this, new q(e, n, ln(this, i)), this;
	}, n.staggerFrom = function(e, t, n, r, i, a, o) {
		return n.runBackwards = 1, Lt(n).immediateRender = ze(n.immediateRender), this.staggerTo(e, t, n, r, i, a, o);
	}, n.staggerFromTo = function(e, t, n, r, i, a, o, s) {
		return r.startAt = n, Lt(r).immediateRender = ze(r.immediateRender), this.staggerTo(e, t, r, i, a, o, s);
	}, n.render = function(e, t, n) {
		var r = this._time, i = this._dirty ? this.totalDuration() : this._tDur, a = this._dur, o = e <= 0 ? 0 : U(e), s = this._zTime < 0 != e < 0 && (this._initted || !a), c, l, u, d, f, p, m, h, g, _, v, y;
		if (this !== V && o > i && e >= 0 && (o = i), o !== this._tTime || n || s) {
			if (r !== this._time && a && (o += this._time - r, e += this._time - r), c = o, g = this._start, h = this._ts, p = !h, s && (a || (r = this._zTime), (e || !t) && (this._zTime = e)), this._repeat) {
				if (v = this._yoyo, f = a + this._rDelay, this._repeat < -1 && e < 0) return this.totalTime(f * 100 + e, t, n);
				if (c = U(o % f), o === i ? (d = this._repeat, c = a) : (_ = U(o / f), d = ~~_, d && d === _ && (c = a, d--), c > a && (c = a)), _ = qt(this._tTime, f), !r && this._tTime && _ !== d && this._tTime - _ * f - this._dur <= 0 && (_ = d), v && d & 1 && (c = a - c, y = 1), d !== _ && !this._lock) {
					var b = v && _ & 1, x = b === (v && d & 1);
					if (d < _ && (b = !b), r = b ? 0 : o % a ? a : o, this._lock = 1, this.render(r || (y ? 0 : U(d * f)), t, !a)._lock = 0, this._tTime = o, !t && this.parent && Pn(this, "onRepeat"), this.vars.repeatRefresh && !y && (this.invalidate()._lock = 1, _ = d), r && r !== this._time || p !== !this._ts || this.vars.onRepeat && !this.parent && !this._act || (a = this._dur, i = this._tDur, x && (this._lock = 2, r = b ? a : -1e-4, this.render(r, !0), this.vars.repeatRefresh && !y && this.invalidate()), this._lock = 0, !this._ts && !p)) return this;
				}
			}
			if (this._hasPause && !this._forcing && this._lock < 2 && (m = an(this, U(r), U(c)), m && (o -= c - (c = m._start))), this._tTime = o, this._time = c, this._act = !!h, this._initted || (this._onUpdate = this.vars.onUpdate, this._initted = 1, this._zTime = e, r = 0), !r && o && a && !t && !_ && (Pn(this, "onStart"), this._tTime !== o)) return this;
			if (c >= r && e >= 0) for (l = this._first; l;) {
				if (u = l._next, (l._act || c >= l._start) && l._ts && m !== l) {
					if (l.parent !== this) return this.render(e, t, n);
					if (l.render(l._ts > 0 ? (c - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (c - l._start) * l._ts, t, n), c !== this._time || !this._ts && !p) {
						m = 0, u && (o += this._zTime = -L);
						break;
					}
				}
				l = u;
			}
			else {
				l = this._last;
				for (var S = e < 0 ? e : c; l;) {
					if (u = l._prev, (l._act || S <= l._end) && l._ts && m !== l) {
						if (l.parent !== this) return this.render(e, t, n);
						if (l.render(l._ts > 0 ? (S - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (S - l._start) * l._ts, t, n || F && Ot(l)), c !== this._time || !this._ts && !p) {
							m = 0, u && (o += this._zTime = S ? -L : L);
							break;
						}
					}
					l = u;
				}
			}
			if (m && !t && (this.pause(), m.render(c >= r ? 0 : -L)._zTime = c >= r ? 1 : -1, this._ts)) return this._start = g, Yt(this), this.render(e, t, n);
			this._onUpdate && !t && Pn(this, "onUpdate", !0), (o === i && this._tTime >= this.totalDuration() || !o && r) && (g === this._start || Math.abs(h) !== Math.abs(this._ts)) && (this._lock || ((e || !a) && (o === i && this._ts > 0 || !o && this._ts < 0) && Vt(this, 1), !t && !(e < 0 && !r) && (o || r || !i) && (Pn(this, o === i && e >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(o < i && this.timeScale() > 0) && this._prom())));
		}
		return this;
	}, n.add = function(e, t) {
		var n = this;
		if (Ie(t) || (t = ln(this, t, e)), !(e instanceof cr)) {
			if (B(e)) return e.forEach(function(e) {
				return n.add(e, t);
			}), this;
			if (R(e)) return this.addLabel(e, t);
			if (z(e)) e = q.delayedCall(0, e);
			else return this;
		}
		return this === e ? this : Qt(this, e, t);
	}, n.getChildren = function(e, t, n, r) {
		e === void 0 && (e = !0), t === void 0 && (t = !0), n === void 0 && (n = !0), r === void 0 && (r = -ke);
		for (var i = [], a = this._first; a;) a._start >= r && (a instanceof q ? t && i.push(a) : (n && i.push(a), e && i.push.apply(i, a.getChildren(!0, t, n)))), a = a._next;
		return i;
	}, n.getById = function(e) {
		for (var t = this.getChildren(1, 1, 1), n = t.length; n--;) if (t[n].vars.id === e) return t[n];
	}, n.remove = function(e) {
		return R(e) ? this.removeLabel(e) : z(e) ? this.killTweensOf(e) : (e.parent === this && Bt(this, e), e === this._recent && (this._recent = this._last), Ht(this));
	}, n.totalTime = function(t, n) {
		return arguments.length ? (this._forcing = 1, !this._dp && this._ts && (this._start = U(Jn.time - (this._ts > 0 ? t / this._ts : (this.totalDuration() - t) / -this._ts))), e.prototype.totalTime.call(this, t, n), this._forcing = 0, this) : this._tTime;
	}, n.addLabel = function(e, t) {
		return this.labels[e] = ln(this, t), this;
	}, n.removeLabel = function(e) {
		return delete this.labels[e], this;
	}, n.addPause = function(e, t, n) {
		var r = q.delayedCall(0, t || ct, n);
		return r.data = "isPause", this._hasPause = 1, Qt(this, r, ln(this, e));
	}, n.removePause = function(e) {
		var t = this._first;
		for (e = ln(this, e); t;) t._start === e && t.data === "isPause" && Vt(t), t = t._next;
	}, n.killTweensOf = function(e, t, n) {
		for (var r = this.getTweensOf(e, n), i = r.length; i--;) mr !== r[i] && r[i].kill(e, t);
		return this;
	}, n.getTweensOf = function(e, t) {
		for (var n = [], r = _n(e), i = this._first, a = Ie(t), o; i;) i instanceof q ? Et(i._targets, r) && (a ? (!mr || i._initted && i._ts) && i.globalTime(0) <= t && i.globalTime(i.totalDuration()) > t : !t || i.isActive()) && n.push(i) : (o = i.getTweensOf(r, t)).length && n.push.apply(n, o), i = i._next;
		return n;
	}, n.tweenTo = function(e, t) {
		t ||= {};
		var n = this, r = ln(n, e), i = t, a = i.startAt, o = i.onStart, s = i.onStartParams, c = i.immediateRender, l, u = q.to(n, Mt({
			ease: t.ease || "none",
			lazy: !1,
			immediateRender: !1,
			time: r,
			overwrite: "auto",
			duration: t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale()) || L,
			onStart: function() {
				if (n.pause(), !l) {
					var e = t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale());
					u._dur !== e && on(u, e, 0, 1).render(u._time, !0, !0), l = 1;
				}
				o && o.apply(u, s || []);
			}
		}, t));
		return c ? u.render(0) : u;
	}, n.tweenFromTo = function(e, t, n) {
		return this.tweenTo(t, Mt({ startAt: { time: ln(this, e) } }, n));
	}, n.recent = function() {
		return this._recent;
	}, n.nextLabel = function(e) {
		return e === void 0 && (e = this._time), Nn(this, ln(this, e));
	}, n.previousLabel = function(e) {
		return e === void 0 && (e = this._time), Nn(this, ln(this, e), 1);
	}, n.currentLabel = function(e) {
		return arguments.length ? this.seek(e, !0) : this.previousLabel(this._time + L);
	}, n.shiftChildren = function(e, t, n) {
		n === void 0 && (n = 0);
		var r = this._first, i = this.labels, a;
		for (e = U(e); r;) r._start >= n && (r._start += e, r._end += e), r = r._next;
		if (t) for (a in i) i[a] >= n && (i[a] += e);
		return Ht(this);
	}, n.invalidate = function(t) {
		var n = this._first;
		for (this._lock = 0; n;) n.invalidate(t), n = n._next;
		return e.prototype.invalidate.call(this, t);
	}, n.clear = function(e) {
		e === void 0 && (e = !0);
		for (var t = this._first, n; t;) n = t._next, this.remove(t), t = n;
		return this._dp && (this._time = this._tTime = this._pTime = 0), e && (this.labels = {}), Ht(this);
	}, n.totalDuration = function(e) {
		var t = 0, n = this, r = n._last, i = ke, a, o, s;
		if (arguments.length) return n.timeScale((n._repeat < 0 ? n.duration() : n.totalDuration()) / (n.reversed() ? -e : e));
		if (n._dirty) {
			for (s = n.parent; r;) a = r._prev, r._dirty && r.totalDuration(), o = r._start, o > i && n._sort && r._ts && !n._lock ? (n._lock = 1, Qt(n, r, o - r._delay, 1)._lock = 0) : i = o, o < 0 && r._ts && (t -= o, (!s && !n._dp || s && s.smoothChildTiming) && (n._start += U(o / n._ts), n._time -= o, n._tTime -= o), n.shiftChildren(-o, !1, -Infinity), i = 0), r._end > t && r._ts && (t = r._end), r = a;
			on(n, n === V && n._time > t ? n._time : t, 1, 1), n._dirty = 0;
		}
		return n._tDur;
	}, t.updateRoot = function(e) {
		if (V._ts && (kt(V, Jt(e, V)), ht = Jn.frame), Jn.frame >= vt) {
			vt += Ee.autoSleep || 120;
			var t = V._first;
			if ((!t || !t._ts) && Ee.autoSleep && Jn._listeners.length < 2) {
				for (; t && !t._ts;) t = t._next;
				t || Jn.sleep();
			}
		}
	}, t;
}(cr);
Mt(lr.prototype, {
	_lock: 0,
	_hasPause: 0,
	_forcing: 0
});
var ur = function(e, t, n, r, i, a, o) {
	var s = new Ir(this._pt, e, t, 0, 1, Ar, null, i), c = 0, l = 0, u, d, f, p, m, h, g, _;
	for (s.b = n, s.e = r, n += "", r += "", (g = ~r.indexOf("random(")) && (r = An(r)), a && (_ = [n, r], a(_, e, t), n = _[0], r = _[1]), d = n.match(Je) || []; u = Je.exec(r);) p = u[0], m = r.substring(c, u.index), f ? f = (f + 1) % 5 : m.substr(-5) === "rgba(" && (f = 1), p !== d[l++] && (h = parseFloat(d[l - 1]) || 0, s._pt = {
		_next: s._pt,
		p: m || l === 1 ? m : ",",
		s: h,
		c: p.charAt(1) === "=" ? Tt(h, p) - h : parseFloat(p) - h,
		m: f && f < 4 ? Math.round : 0
	}, c = Je.lastIndex);
	return s.c = c < r.length ? r.substring(c, r.length) : "", s.fp = o, (Ye.test(r) || g) && (s.e = 0), this._pt = s, s;
}, dr = function(e, t, n, r, i, a, o, s, c, l) {
	z(r) && (r = r(i || 0, e, a));
	var u = e[t], d = n === "get" ? z(u) ? c ? e[t.indexOf("set") || !z(e["get" + t.substr(3)]) ? t : "get" + t.substr(3)](c) : e[t]() : u : n, f = z(u) ? c ? Tr : wr : Cr, p;
	if (R(r) && (~r.indexOf("random(") && (r = An(r)), r.charAt(1) === "=" && (p = Tt(d, r) + (W(d) || 0), (p || p === 0) && (r = p))), !l || d !== r || hr) return !isNaN(d * r) && r !== "" ? (p = new Ir(this._pt, e, t, +d || 0, r - (d || 0), typeof u == "boolean" ? kr : Or, 0, f), c && (p.fp = c), o && p.modifier(o, this, e), this._pt = p) : (!u && !(t in e) && at(t, r), ur.call(this, e, t, d, r, f, s || Ee.stringFilter, c));
}, fr = function(e, t, n, r, i) {
	if (z(e) && (e = br(e, i, t, n, r)), !Re(e) || e.style && e.nodeType || B(e) || He(e)) return R(e) ? br(e, i, t, n, r) : e;
	var a = {}, o;
	for (o in e) a[o] = br(e[o], i, t, n, r);
	return a;
}, pr = function(e, t, n, r, i, a) {
	var o, s, c, l;
	if (gt[e] && (o = new gt[e]()).init(i, o.rawVars ? t[e] : fr(t[e], r, i, a, n), n, r, a) !== !1 && (n._pt = s = new Ir(n._pt, i, e, 0, 1, o.render, o, 0, o.priority), n !== In)) for (c = n._ptLookup[n._targets.indexOf(i)], l = o._props.length; l--;) c[o._props[l]] = s;
	return o;
}, mr, hr, gr = function e(t, n, r) {
	var i = t.vars, a = i.ease, o = i.startAt, s = i.immediateRender, c = i.lazy, l = i.onUpdate, u = i.runBackwards, d = i.yoyoEase, f = i.keyframes, p = i.autoRevert, m = t._dur, h = t._startAt, g = t._targets, _ = t.parent, v = _ && _.data === "nested" ? _.vars.targets : g, y = t._overwrite === "auto" && !Oe, b = t.timeline, x = i.easeReverse || d, S, C, w, T, E, D, O, k, A, j, M, N, ee;
	if (b && (!f || !a) && (a = "none"), t._ease = nr(a, De.ease), t._rEase = x && (nr(x) || t._ease), t._from = !b && !!i.runBackwards, t._from && (t.ratio = 1), !b || f && !i.stagger) {
		if (k = g[0] ? St(g[0]).harness : 0, N = k && i[k.prop], S = It(i, ft), h && (h._zTime < 0 && h.progress(1), n < 0 && u && s && !p ? h.render(-1, !0) : h.revert(u && m ? ut : lt), h._lazy = 0), o) {
			if (Vt(t._startAt = q.set(g, Mt({
				data: "isStart",
				overwrite: !1,
				parent: _,
				immediateRender: !0,
				lazy: !h && ze(c),
				startAt: null,
				delay: 0,
				onUpdate: l && function() {
					return Pn(t, "onUpdate");
				},
				stagger: 0
			}, o))), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (F || !s && !p) && t._startAt.revert(ut), s && m && n <= 0 && r <= 0) {
				n && (t._zTime = n);
				return;
			}
		} else if (u && m && !h) {
			if (n && (s = !1), w = Mt({
				overwrite: !1,
				data: "isFromStart",
				lazy: s && !h && ze(c),
				immediateRender: s,
				stagger: 0,
				parent: _
			}, S), N && (w[k.prop] = N), Vt(t._startAt = q.set(g, w)), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (F ? t._startAt.revert(ut) : t._startAt.render(-1, !0)), t._zTime = n, !s) e(t._startAt, L, L);
			else if (!n) return;
		}
		for (t._pt = t._ptCache = 0, c = m && ze(c) || c && !m, C = 0; C < g.length; C++) {
			if (E = g[C], O = E._gsap || xt(g)[C]._gsap, t._ptLookup[C] = j = {}, mt[O.id] && pt.length && Dt(), M = v === g ? C : v.indexOf(E), k && (A = new k()).init(E, N || S, t, M, v) !== !1 && (t._pt = T = new Ir(t._pt, E, A.name, 0, 1, A.render, A, 0, A.priority), A._props.forEach(function(e) {
				j[e] = T;
			}), A.priority && (D = 1)), !k || N) for (w in S) gt[w] && (A = pr(w, S, t, M, E, v)) ? A.priority && (D = 1) : j[w] = T = dr.call(t, E, w, "get", S[w], M, v, 0, i.stringFilter);
			t._op && t._op[C] && t.kill(E, t._op[C]), y && t._pt && (mr = t, V.killTweensOf(E, j, t.globalTime(n)), ee = !t.parent, mr = 0), t._pt && c && (mt[O.id] = 1);
		}
		D && Fr(t), t._onInit && t._onInit(t);
	}
	t._onUpdate = l, t._initted = (!t._op || t._pt) && !ee, f && n <= 0 && b.render(ke, !0, !0);
}, _r = function(e, t, n, r, i, a, o, s) {
	var c = (e._pt && e._ptCache || (e._ptCache = {}))[t], l, u, d, f;
	if (!c) for (c = e._ptCache[t] = [], d = e._ptLookup, f = e._targets.length; f--;) {
		if (l = d[f][t], l && l.d && l.d._pt) for (l = l.d._pt; l && l.p !== t && l.fp !== t;) l = l._next;
		if (!l) return hr = 1, e.vars[t] = "+=0", gr(e, o), hr = 0, s ? ot(t + " not eligible for reset. Try splitting into individual properties") : 1;
		c.push(l);
	}
	for (f = c.length; f--;) u = c[f], l = u._pt || u, l.s = (r || r === 0) && !i ? r : l.s + (r || 0) + a * l.c, l.c = n - l.s, u.e &&= H(n) + W(u.e), u.b &&= l.s + W(u.b);
}, vr = function(e, t) {
	var n = e[0] ? St(e[0]).harness : 0, r = n && n.aliases, i, a, o, s;
	if (!r) return t;
	for (a in i = Pt({}, t), r) if (a in i) for (s = r[a].split(","), o = s.length; o--;) i[s[o]] = i[a];
	return i;
}, yr = function(e, t, n, r) {
	var i = t.ease || r || "power1.inOut", a, o;
	if (B(t)) o = n[e] || (n[e] = []), t.forEach(function(e, n) {
		return o.push({
			t: n / (t.length - 1) * 100,
			v: e,
			e: i
		});
	});
	else for (a in t) o = n[a] || (n[a] = []), a === "ease" || o.push({
		t: parseFloat(e),
		v: t[a],
		e: i
	});
}, br = function(e, t, n, r, i) {
	return z(e) ? e.call(t, n, r, i) : R(e) && ~e.indexOf("random(") ? An(e) : e;
}, xr = bt + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert", Sr = {};
wt(xr + ",id,stagger,delay,duration,paused,scrollTrigger", function(e) {
	return Sr[e] = 1;
});
var q = /* @__PURE__ */ function(e) {
	Te(t, e);
	function t(t, n, r, i) {
		var a;
		typeof n == "number" && (r.duration = n, n = r, r = null), a = e.call(this, i ? n : Lt(n)) || this;
		var o = a.vars, s = o.duration, c = o.delay, l = o.immediateRender, u = o.stagger, d = o.overwrite, f = o.keyframes, p = o.defaults, m = o.scrollTrigger, h = n.parent || V, g = (B(t) || He(t) ? Ie(t[0]) : "length" in n) ? [t] : _n(t), _, v, y, b, x, S, C, w;
		if (a._targets = g.length ? xt(g) : ot("GSAP target " + t + " not found. https://gsap.com", !Ee.nullTargetWarn) || [], a._ptLookup = [], a._overwrite = d, f || u || Ve(s) || Ve(c)) {
			n = a.vars;
			var T = n.easeReverse || n.yoyoEase;
			if (_ = a.timeline = new lr({
				data: "nested",
				defaults: p || {},
				targets: h && h.data === "nested" ? h.vars.targets : g
			}), _.kill(), _.parent = _._dp = we(a), _._start = 0, u || Ve(s) || Ve(c)) {
				if (b = g.length, C = u && bn(u), Re(u)) for (x in u) ~xr.indexOf(x) && (w ||= {}, w[x] = u[x]);
				for (v = 0; v < b; v++) y = It(n, Sr), y.stagger = 0, T && (y.easeReverse = T), w && Pt(y, w), S = g[v], y.duration = +br(s, we(a), v, S, g), y.delay = (+br(c, we(a), v, S, g) || 0) - a._delay, !u && b === 1 && y.delay && (a._delay = c = y.delay, a._start += c, y.delay = 0), _.to(S, y, C ? C(v, S, g) : 0), _._ease = K.none;
				_.duration() ? s = c = 0 : a.timeline = 0;
			} else if (f) {
				Lt(Mt(_.vars.defaults, { ease: "none" })), _._ease = nr(f.ease || n.ease || "none");
				var E = 0, D, O, k;
				if (B(f)) f.forEach(function(e) {
					return _.to(g, e, ">");
				}), _.duration();
				else {
					for (x in y = {}, f) x === "ease" || x === "easeEach" || yr(x, f[x], y, f.easeEach);
					for (x in y) for (D = y[x].sort(function(e, t) {
						return e.t - t.t;
					}), E = 0, v = 0; v < D.length; v++) O = D[v], k = {
						ease: O.e,
						duration: (O.t - (v ? D[v - 1].t : 0)) / 100 * s
					}, k[x] = O.v, _.to(g, k, E), E += k.duration;
					_.duration() < s && _.to({}, { duration: s - _.duration() });
				}
			}
			s || a.duration(s = _.duration());
		} else a.timeline = 0;
		return d === !0 && !Oe && (mr = we(a), V.killTweensOf(g), mr = 0), Qt(h, we(a), r), n.reversed && a.reverse(), n.paused && a.paused(!0), (l || !s && !f && a._start === U(h._time) && ze(l) && Gt(we(a)) && h.data !== "nested") && (a._tTime = -L, a.render(Math.max(0, -c) || 0)), m && $t(we(a), m), a;
	}
	var n = t.prototype;
	return n.render = function(e, t, n) {
		var r = this._time, i = this._tDur, a = this._dur, o = e < 0, s = e > i - L && !o ? i : e < L ? 0 : e, c, l, u, d, f, p, m, h;
		if (!a) rn(this, e, t, n);
		else if (s !== this._tTime || !e || n || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== o || this._lazy) {
			if (c = s, h = this.timeline, this._repeat) {
				if (d = a + this._rDelay, this._repeat < -1 && o) return this.totalTime(d * 100 + e, t, n);
				if (c = U(s % d), s === i ? (u = this._repeat, c = a) : (f = U(s / d), u = ~~f, u && u === f ? (c = a, u--) : c > a && (c = a)), p = this._yoyo && u & 1, p && (c = a - c), f = qt(this._tTime, d), c === r && !n && this._initted && u === f) return this._tTime = s, this;
				u !== f && this.vars.repeatRefresh && !p && !this._lock && c !== d && this._initted && (this._lock = n = 1, this.render(U(d * u), !0).invalidate()._lock = 0);
			}
			if (!this._initted) {
				if (en(this, o ? e : c, n, t, s)) return this._tTime = 0, this;
				if (r !== this._time && !(n && this.vars.repeatRefresh && u !== f)) return this;
				if (a !== this._dur) return this.render(e, t, n);
			}
			if (this._rEase) {
				var g = c < r;
				if (g !== this._inv) {
					var _ = g ? r : a - r;
					this._inv = g, this._from && (this.ratio = 1 - this.ratio), this._invRatio = this.ratio, this._invTime = r, this._invRecip = _ ? (g ? -1 : 1) / _ : 0, this._invScale = g ? -this.ratio : 1 - this.ratio, this._invEase = g ? this._rEase : this._ease;
				}
				this.ratio = m = this._invRatio + this._invScale * this._invEase((c - this._invTime) * this._invRecip);
			} else this.ratio = m = this._ease(c / a);
			if (this._from && (this.ratio = m = 1 - m), this._tTime = s, this._time = c, !this._act && this._ts && (this._act = 1, this._lazy = 0), !r && s && !t && !f && (Pn(this, "onStart"), this._tTime !== s)) return this;
			for (l = this._pt; l;) l.r(m, l.d), l = l._next;
			h && h.render(e < 0 ? e : h._dur * h._ease(c / this._dur), t, n) || this._startAt && (this._zTime = e), this._onUpdate && !t && (o && Wt(this, e, t, n), Pn(this, "onUpdate")), this._repeat && u !== f && this.vars.onRepeat && !t && this.parent && Pn(this, "onRepeat"), (s === this._tDur || !s) && this._tTime === s && (o && !this._onUpdate && Wt(this, e, !0, !0), (e || !a) && (s === this._tDur && this._ts > 0 || !s && this._ts < 0) && Vt(this, 1), !t && !(o && !r) && (s || r || p) && (Pn(this, s === i ? "onComplete" : "onReverseComplete", !0), this._prom && !(s < i && this.timeScale() > 0) && this._prom()));
		}
		return this;
	}, n.targets = function() {
		return this._targets;
	}, n.invalidate = function(t) {
		return (!t || !this.vars.runBackwards) && (this._startAt = 0), this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0, this._ptLookup = [], this.timeline && this.timeline.invalidate(t), e.prototype.invalidate.call(this, t);
	}, n.resetTo = function(e, t, n, r, i) {
		qn || Jn.wake(), this._ts || this.play();
		var a = Math.min(this._dur, (this._dp._time - this._start) * this._ts), o;
		return this._initted || gr(this, a), o = this._ease(a / this._dur), _r(this, e, t, n, r, o, a, i) ? this.resetTo(e, t, n, r, 1) : (Xt(this, 0), this.parent || zt(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0), this.render(0));
	}, n.kill = function(e, t) {
		if (t === void 0 && (t = "all"), !e && (!t || t === "all")) return this._lazy = this._pt = 0, this.parent ? Fn(this) : this.scrollTrigger && this.scrollTrigger.kill(!!F), this;
		if (this.timeline) {
			var n = this.timeline.totalDuration();
			return this.timeline.killTweensOf(e, t, mr && mr.vars.overwrite !== !0)._first || Fn(this), this.parent && n !== this.timeline.totalDuration() && on(this, this._dur * this.timeline._tDur / n, 0, 1), this;
		}
		var r = this._targets, i = e ? _n(e) : r, a = this._ptLookup, o = this._pt, s, c, l, u, d, f, p;
		if ((!t || t === "all") && Rt(r, i)) return t === "all" && (this._pt = 0), Fn(this);
		for (s = this._op = this._op || [], t !== "all" && (R(t) && (d = {}, wt(t, function(e) {
			return d[e] = 1;
		}), t = d), t = vr(r, t)), p = r.length; p--;) if (~i.indexOf(r[p])) for (d in c = a[p], t === "all" ? (s[p] = t, u = c, l = {}) : (l = s[p] = s[p] || {}, u = t), u) f = c && c[d], f && ((!("kill" in f.d) || f.d.kill(d) === !0) && Bt(this, f, "_pt"), delete c[d]), l !== "all" && (l[d] = 1);
		return this._initted && !this._pt && o && Fn(this), this;
	}, t.to = function(e, n) {
		return new t(e, n, arguments[2]);
	}, t.from = function(e, t) {
		return un(1, arguments);
	}, t.delayedCall = function(e, n, r, i) {
		return new t(n, 0, {
			immediateRender: !1,
			lazy: !1,
			overwrite: !1,
			delay: e,
			onComplete: n,
			onReverseComplete: n,
			onCompleteParams: r,
			onReverseCompleteParams: r,
			callbackScope: i
		});
	}, t.fromTo = function(e, t, n) {
		return un(2, arguments);
	}, t.set = function(e, n) {
		return n.duration = 0, n.repeatDelay || (n.repeat = 0), new t(e, n);
	}, t.killTweensOf = function(e, t, n) {
		return V.killTweensOf(e, t, n);
	}, t;
}(cr);
Mt(q.prototype, {
	_targets: [],
	_lazy: 0,
	_startAt: 0,
	_op: 0,
	_onInit: 0
}), wt("staggerTo,staggerFrom,staggerFromTo", function(e) {
	q[e] = function() {
		var t = new lr(), n = mn.call(arguments, 0);
		return n.splice(e === "staggerFromTo" ? 5 : 4, 0, 0), t[e].apply(t, n);
	};
});
var Cr = function(e, t, n) {
	return e[t] = n;
}, wr = function(e, t, n) {
	return e[t](n);
}, Tr = function(e, t, n, r) {
	return e[t](r.fp, n);
}, Er = function(e, t, n) {
	return e.setAttribute(t, n);
}, Dr = function(e, t) {
	return z(e[t]) ? wr : Le(e[t]) && e.setAttribute ? Er : Cr;
}, Or = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e6) / 1e6, t);
}, kr = function(e, t) {
	return t.set(t.t, t.p, !!(t.s + t.c * e), t);
}, Ar = function(e, t) {
	var n = t._pt, r = "";
	if (!e && t.b) r = t.b;
	else if (e === 1 && t.e) r = t.e;
	else {
		for (; n;) r = n.p + (n.m ? n.m(n.s + n.c * e) : Math.round((n.s + n.c * e) * 1e4) / 1e4) + r, n = n._next;
		r += t.c;
	}
	t.set(t.t, t.p, r, t);
}, jr = function(e, t) {
	for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
}, Mr = function(e, t, n, r) {
	for (var i = this._pt, a; i;) a = i._next, i.p === r && i.modifier(e, t, n), i = a;
}, Nr = function(e) {
	for (var t = this._pt, n, r; t;) r = t._next, t.p === e && !t.op || t.op === e ? Bt(this, t, "_pt") : t.dep || (n = 1), t = r;
	return !n;
}, Pr = function(e, t, n, r) {
	r.mSet(e, t, r.m.call(r.tween, n, r.mt), r);
}, Fr = function(e) {
	for (var t = e._pt, n, r, i, a; t;) {
		for (n = t._next, r = i; r && r.pr > t.pr;) r = r._next;
		(t._prev = r ? r._prev : a) ? t._prev._next = t : i = t, (t._next = r) ? r._prev = t : a = t, t = n;
	}
	e._pt = i;
}, Ir = /* @__PURE__ */ function() {
	function e(e, t, n, r, i, a, o, s, c) {
		this.t = t, this.s = r, this.c = i, this.p = n, this.r = a || Or, this.d = o || this, this.set = s || Cr, this.pr = c || 0, this._next = e, e && (e._prev = this);
	}
	var t = e.prototype;
	return t.modifier = function(e, t, n) {
		this.mSet = this.mSet || this.set, this.set = Pr, this.m = e, this.mt = n, this.tween = t;
	}, e;
}();
wt(bt + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse", function(e) {
	return ft[e] = 1;
}), tt.TweenMax = tt.TweenLite = q, tt.TimelineLite = tt.TimelineMax = lr, V = new lr({
	sortChildren: !1,
	defaults: De,
	autoRemoveChildren: !0,
	id: "root",
	smoothChildTiming: !0
}), Ee.stringFilter = Kn;
var Lr = [], Rr = {}, zr = [], Br = 0, Vr = 0, Hr = function(e) {
	return (Rr[e] || zr).map(function(e) {
		return e();
	});
}, Ur = function() {
	var e = Date.now(), t = [];
	e - Br > 2 && (Hr("matchMediaInit"), Lr.forEach(function(e) {
		var n = e.queries, r = e.conditions, i, a, o, s;
		for (a in n) i = Qe.matchMedia(n[a]).matches, i && (o = 1), i !== r[a] && (r[a] = i, s = 1);
		s && (e.revert(), o && t.push(e));
	}), Hr("matchMediaRevert"), t.forEach(function(e) {
		return e.onMatch(e, function(t) {
			return e.add(null, t);
		});
	}), Br = e, Hr("matchMedia"));
}, Wr = /* @__PURE__ */ function() {
	function e(e, t) {
		this.selector = t && vn(t), this.data = [], this._r = [], this.isReverted = !1, this.id = Vr++, e && this.add(e);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		z(e) && (n = t, t = e, e = z);
		var r = this, i = function() {
			var e = I, i = r.selector, a;
			return e && e !== r && e.data.push(r), n && (r.selector = vn(n)), I = r, a = t.apply(r, arguments), z(a) && r._r.push(a), I = e, r.selector = i, r.isReverted = !1, a;
		};
		return r.last = i, e === z ? i(r, function(e) {
			return r.add(null, e);
		}) : e ? r[e] = i : i;
	}, t.ignore = function(e) {
		var t = I;
		I = null, e(this), I = t;
	}, t.getTweens = function() {
		var t = [];
		return this.data.forEach(function(n) {
			return n instanceof e ? t.push.apply(t, n.getTweens()) : n instanceof q && !(n.parent && n.parent.data === "nested") && t.push(n);
		}), t;
	}, t.clear = function() {
		this._r.length = this.data.length = 0;
	}, t.kill = function(e, t) {
		var n = this;
		if (e ? (function() {
			for (var t = n.getTweens(), r = n.data.length, i; r--;) i = n.data[r], i.data === "isFlip" && (i.revert(), i.getChildren(!0, !0, !1).forEach(function(e) {
				return t.splice(t.indexOf(e), 1);
			}));
			for (t.map(function(e) {
				return {
					g: e._dur || e._delay || e._sat && !e._sat.vars.immediateRender ? e.globalTime(0) : -Infinity,
					t: e
				};
			}).sort(function(e, t) {
				return t.g - e.g || -Infinity;
			}).forEach(function(t) {
				return t.t.revert(e);
			}), r = n.data.length; r--;) i = n.data[r], i instanceof lr ? i.data !== "nested" && (i.scrollTrigger && i.scrollTrigger.revert(), i.kill()) : !(i instanceof q) && i.revert && i.revert(e);
			n._r.forEach(function(t) {
				return t(e, n);
			}), n.isReverted = !0;
		})() : this.data.forEach(function(e) {
			return e.kill && e.kill();
		}), this.clear(), t) for (var r = Lr.length; r--;) Lr[r].id === this.id && Lr.splice(r, 1);
	}, t.revert = function(e) {
		this.kill(e || {});
	}, e;
}(), Gr = /* @__PURE__ */ function() {
	function e(e) {
		this.contexts = [], this.scope = e, I && I.data.push(this);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		Re(e) || (e = { matches: e });
		var r = new Wr(0, n || this.scope), i = r.conditions = {}, a, o, s;
		for (o in I && !r.selector && (r.selector = I.selector), this.contexts.push(r), t = r.add("onMatch", t), r.queries = e, e) o === "all" ? s = 1 : (a = Qe.matchMedia(e[o]), a && (Lr.indexOf(r) < 0 && Lr.push(r), (i[o] = a.matches) && (s = 1), a.addListener ? a.addListener(Ur) : a.addEventListener("change", Ur)));
		return s && t(r, function(e) {
			return r.add(null, e);
		}), this;
	}, t.revert = function(e) {
		this.kill(e || {});
	}, t.kill = function(e) {
		this.contexts.forEach(function(t) {
			return t.kill(e, !0);
		});
	}, e;
}(), Kr = {
	registerPlugin: function() {
		[...arguments].forEach(function(e) {
			return Rn(e);
		});
	},
	timeline: function(e) {
		return new lr(e);
	},
	getTweensOf: function(e, t) {
		return V.getTweensOf(e, t);
	},
	getProperty: function(e, t, n, r) {
		R(e) && (e = _n(e)[0]);
		var i = St(e || {}).get, a = n ? jt : At;
		return n === "native" && (n = ""), e && (t ? a((gt[t] && gt[t].get || i)(e, t, n, r)) : function(t, n, r) {
			return a((gt[t] && gt[t].get || i)(e, t, n, r));
		});
	},
	quickSetter: function(e, t, n) {
		if (e = _n(e), e.length > 1) {
			var r = e.map(function(e) {
				return Xr.quickSetter(e, t, n);
			}), i = r.length;
			return function(e) {
				for (var t = i; t--;) r[t](e);
			};
		}
		e = e[0] || {};
		var a = gt[t], o = St(e), s = o.harness && (o.harness.aliases || {})[t] || t, c = a ? function(t) {
			var r = new a();
			In._pt = 0, r.init(e, n ? t + n : t, In, 0, [e]), r.render(1, r), In._pt && jr(1, In);
		} : o.set(e, s);
		return a ? c : function(t) {
			return c(e, s, n ? t + n : t, o, 1);
		};
	},
	quickTo: function(e, t, n) {
		var r, i = Xr.to(e, Mt((r = {}, r[t] = "+=0.1", r.paused = !0, r.stagger = 0, r), n || {})), a = function(e, n, r) {
			return i.resetTo(t, e, n, r);
		};
		return a.tween = i, a;
	},
	isTweening: function(e) {
		return V.getTweensOf(e, !0).length > 0;
	},
	defaults: function(e) {
		return e && e.ease && (e.ease = nr(e.ease, De.ease)), Ft(De, e || {});
	},
	config: function(e) {
		return Ft(Ee, e || {});
	},
	registerEffect: function(e) {
		var t = e.name, n = e.effect, r = e.plugins, i = e.defaults, a = e.extendTimeline;
		(r || "").split(",").forEach(function(e) {
			return e && !gt[e] && !tt[e] && ot(t + " effect requires " + e + " plugin.");
		}), _t[t] = function(e, t, r) {
			return n(_n(e), Mt(t || {}, i), r);
		}, a && (lr.prototype[t] = function(e, n, r) {
			return this.add(_t[t](e, Re(n) ? n : (r = n) && {}, this), r);
		});
	},
	registerEase: function(e, t) {
		K[e] = nr(t);
	},
	parseEase: function(e, t) {
		return arguments.length ? nr(e, t) : K;
	},
	getById: function(e) {
		return V.getById(e);
	},
	exportRoot: function(e, t) {
		e === void 0 && (e = {});
		var n = new lr(e), r, i;
		for (n.smoothChildTiming = ze(e.smoothChildTiming), V.remove(n), n._dp = 0, n._time = n._tTime = V._time, r = V._first; r;) i = r._next, (t || !(!r._dur && r instanceof q && r.vars.onComplete === r._targets[0])) && Qt(n, r, r._start - r._delay), r = i;
		return Qt(V, n, 0), n;
	},
	context: function(e, t) {
		return e ? new Wr(e, t) : I;
	},
	matchMedia: function(e) {
		return new Gr(e);
	},
	matchMediaRefresh: function() {
		return Lr.forEach(function(e) {
			var t = e.conditions, n, r;
			for (r in t) t[r] && (t[r] = !1, n = 1);
			n && e.revert();
		}) || Ur();
	},
	addEventListener: function(e, t) {
		var n = Rr[e] || (Rr[e] = []);
		~n.indexOf(t) || n.push(t);
	},
	removeEventListener: function(e, t) {
		var n = Rr[e], r = n && n.indexOf(t);
		r >= 0 && n.splice(r, 1);
	},
	utils: {
		wrap: On,
		wrapYoyo: kn,
		distribute: bn,
		random: Cn,
		snap: Sn,
		normalize: En,
		getUnit: W,
		clamp: pn,
		splitColor: Vn,
		toArray: _n,
		selector: vn,
		mapRange: jn,
		pipe: wn,
		unitize: Tn,
		interpolate: Mn,
		shuffle: yn
	},
	install: it,
	effects: _t,
	ticker: Jn,
	updateRoot: lr.updateRoot,
	plugins: gt,
	globalTimeline: V,
	core: {
		PropTween: Ir,
		globals: st,
		Tween: q,
		Timeline: lr,
		Animation: cr,
		getCache: St,
		_removeLinkedListItem: Bt,
		reverting: function() {
			return F;
		},
		context: function(e) {
			return e && I && (I.data.push(e), e._ctx = I), I;
		},
		suppressOverwrites: function(e) {
			return Oe = e;
		}
	}
};
wt("to,from,fromTo,delayedCall,set,killTweensOf", function(e) {
	return Kr[e] = q[e];
}), Jn.add(lr.updateRoot), In = Kr.to({}, { duration: 0 });
var qr = function(e, t) {
	for (var n = e._pt; n && n.p !== t && n.op !== t && n.fp !== t;) n = n._next;
	return n;
}, Jr = function(e, t) {
	var n = e._targets, r, i, a;
	for (r in t) for (i = n.length; i--;) a = e._ptLookup[i][r], (a &&= a.d) && (a._pt && (a = qr(a, r)), a && a.modifier && a.modifier(t[r], e, n[i], r));
}, Yr = function(e, t) {
	return {
		name: e,
		headless: 1,
		rawVars: 1,
		init: function(e, n, r) {
			r._onInit = function(e) {
				var r, i;
				if (R(n) && (r = {}, wt(n, function(e) {
					return r[e] = 1;
				}), n = r), t) {
					for (i in r = {}, n) r[i] = t(n[i]);
					n = r;
				}
				Jr(e, n);
			};
		}
	};
}, Xr = Kr.registerPlugin({
	name: "attr",
	init: function(e, t, n, r, i) {
		var a, o, s;
		for (a in this.tween = n, t) s = e.getAttribute(a) || "", o = this.add(e, "setAttribute", (s || 0) + "", t[a], r, i, 0, 0, a), o.op = a, o.b = s, this._props.push(a);
	},
	render: function(e, t) {
		for (var n = t._pt; n;) F ? n.set(n.t, n.p, n.b, n) : n.r(e, n.d), n = n._next;
	}
}, {
	name: "endArray",
	headless: 1,
	init: function(e, t) {
		for (var n = t.length; n--;) this.add(e, n, e[n] || 0, t[n], 0, 0, 0, 0, 0, 1);
	}
}, Yr("roundProps", xn), Yr("modifiers"), Yr("snap", Sn)) || Kr;
q.version = lr.version = Xr.version = "3.15.0", rt = 1, Be() && Yn(), K.Power0, K.Power1, K.Power2, K.Power3, K.Power4, K.Linear, K.Quad, K.Cubic, K.Quart, K.Quint, K.Strong, K.Elastic, K.Back, K.SteppedEase, K.Bounce, K.Sine, K.Expo, K.Circ;
//#endregion
//#region node_modules/gsap/CSSPlugin.js
var Zr, Qr, $r, ei, ti, ni, ri, ii = function() {
	return typeof window < "u";
}, ai = {}, oi = 180 / Math.PI, si = Math.PI / 180, ci = Math.atan2, li = 1e8, ui = /([A-Z])/g, di = /(left|right|width|margin|padding|x)/i, fi = /[\s,\(]\S/, pi = {
	autoAlpha: "opacity,visibility",
	scale: "scaleX,scaleY",
	alpha: "opacity"
}, mi = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, hi = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, gi = function(e, t) {
	return t.set(t.t, t.p, e ? Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u : t.b, t);
}, _i = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : e ? Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u : t.b, t);
}, vi = function(e, t) {
	var n = t.s + t.c * e;
	t.set(t.t, t.p, ~~(n + (n < 0 ? -.5 : .5)) + t.u, t);
}, yi = function(e, t) {
	return t.set(t.t, t.p, e ? t.e : t.b, t);
}, bi = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : t.b, t);
}, xi = function(e, t, n) {
	return e.style[t] = n;
}, Si = function(e, t, n) {
	return e.style.setProperty(t, n);
}, Ci = function(e, t, n) {
	return e._gsap[t] = n;
}, wi = function(e, t, n) {
	return e._gsap.scaleX = e._gsap.scaleY = n;
}, Ti = function(e, t, n, r, i) {
	var a = e._gsap;
	a.scaleX = a.scaleY = n, a.renderTransform(i, a);
}, Ei = function(e, t, n, r, i) {
	var a = e._gsap;
	a[t] = n, a.renderTransform(i, a);
}, J = "transform", Di = J + "Origin", Oi = function e(t, n) {
	var r = this, i = this.target, a = i.style, o = i._gsap;
	if (t in ai && a) {
		if (this.tfm = this.tfm || {}, t !== "transform") t = pi[t] || t, ~t.indexOf(",") ? t.split(",").forEach(function(e) {
			return r.tfm[e] = qi(i, e);
		}) : this.tfm[t] = o.x ? o[t] : qi(i, t), t === Di && (this.tfm.zOrigin = o.zOrigin);
		else return pi.transform.split(",").forEach(function(t) {
			return e.call(r, t, n);
		});
		if (this.props.indexOf(J) >= 0) return;
		o.svg && (this.svgo = i.getAttribute("data-svg-origin"), this.props.push(Di, n, "")), t = J;
	}
	(a || n) && this.props.push(t, n, a[t]);
}, ki = function(e) {
	e.translate && (e.removeProperty("translate"), e.removeProperty("scale"), e.removeProperty("rotate"));
}, Ai = function() {
	var e = this.props, t = this.target, n = t.style, r = t._gsap, i, a;
	for (i = 0; i < e.length; i += 3) e[i + 1] ? e[i + 1] === 2 ? t[e[i]](e[i + 2]) : t[e[i]] = e[i + 2] : e[i + 2] ? n[e[i]] = e[i + 2] : n.removeProperty(e[i].substr(0, 2) === "--" ? e[i] : e[i].replace(ui, "-$1").toLowerCase());
	if (this.tfm) {
		for (a in this.tfm) r[a] = this.tfm[a];
		r.svg && (r.renderTransform(), t.setAttribute("data-svg-origin", this.svgo || "")), i = ri(), (!i || !i.isStart) && !n[J] && (ki(n), r.zOrigin && n[Di] && (n[Di] += " " + r.zOrigin + "px", r.zOrigin = 0, r.renderTransform()), r.uncache = 1);
	}
}, ji = function(e, t) {
	var n = {
		target: e,
		props: [],
		revert: Ai,
		save: Oi
	};
	return e._gsap || Xr.core.getCache(e), t && e.style && e.nodeType && t.split(",").forEach(function(e) {
		return n.save(e);
	}), n;
}, Mi, Ni = function(e, t) {
	var n = Qr.createElementNS ? Qr.createElementNS((t || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), e) : Qr.createElement(e);
	return n && n.style ? n : Qr.createElement(e);
}, Pi = function e(t, n, r) {
	var i = getComputedStyle(t);
	return i[n] || i.getPropertyValue(n.replace(ui, "-$1").toLowerCase()) || i.getPropertyValue(n) || !r && e(t, Ii(n) || n, 1) || "";
}, Fi = "O,Moz,ms,Ms,Webkit".split(","), Ii = function(e, t, n) {
	var r = (t || ti).style, i = 5;
	if (e in r && !n) return e;
	for (e = e.charAt(0).toUpperCase() + e.substr(1); i-- && !(Fi[i] + e in r););
	return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? Fi[i] : "") + e;
}, Li = function() {
	ii() && window.document && (Zr = window, Qr = Zr.document, $r = Qr.documentElement, ti = Ni("div") || { style: {} }, Ni("div"), J = Ii(J), Di = J + "Origin", ti.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0", Mi = !!Ii("perspective"), ri = Xr.core.reverting, ei = 1);
}, Ri = function(e) {
	var t = e.ownerSVGElement, n = Ni("svg", t && t.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), r = e.cloneNode(!0), i;
	r.style.display = "block", n.appendChild(r), $r.appendChild(n);
	try {
		i = r.getBBox();
	} catch {}
	return n.removeChild(r), $r.removeChild(n), i;
}, zi = function(e, t) {
	for (var n = t.length; n--;) if (e.hasAttribute(t[n])) return e.getAttribute(t[n]);
}, Bi = function(e) {
	var t, n;
	try {
		t = e.getBBox();
	} catch {
		t = Ri(e), n = 1;
	}
	return t && (t.width || t.height) || n || (t = Ri(e)), t && !t.width && !t.x && !t.y ? {
		x: +zi(e, [
			"x",
			"cx",
			"x1"
		]) || 0,
		y: +zi(e, [
			"y",
			"cy",
			"y1"
		]) || 0,
		width: 0,
		height: 0
	} : t;
}, Vi = function(e) {
	return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && Bi(e));
}, Hi = function(e, t) {
	if (t) {
		var n = e.style, r;
		t in ai && t !== Di && (t = J), n.removeProperty ? (r = t.substr(0, 2), (r === "ms" || t.substr(0, 6) === "webkit") && (t = "-" + t), n.removeProperty(r === "--" ? t : t.replace(ui, "-$1").toLowerCase())) : n.removeAttribute(t);
	}
}, Ui = function(e, t, n, r, i, a) {
	var o = new Ir(e._pt, t, n, 0, 1, a ? bi : yi);
	return e._pt = o, o.b = r, o.e = i, e._props.push(n), o;
}, Wi = {
	deg: 1,
	rad: 1,
	turn: 1
}, Gi = {
	grid: 1,
	flex: 1
}, Ki = function e(t, n, r, i) {
	var a = parseFloat(r) || 0, o = (r + "").trim().substr((a + "").length) || "px", s = ti.style, c = di.test(n), l = t.tagName.toLowerCase() === "svg", u = (l ? "client" : "offset") + (c ? "Width" : "Height"), d = 100, f = i === "px", p = i === "%", m, h, g, _;
	if (i === o || !a || Wi[i] || Wi[o]) return a;
	if (o !== "px" && !f && (a = e(t, n, r, "px")), _ = t.getCTM && Vi(t), (p || o === "%") && (ai[n] || ~n.indexOf("adius"))) return m = _ ? t.getBBox()[c ? "width" : "height"] : t[u], H(p ? a / m * d : a / 100 * m);
	if (s[c ? "width" : "height"] = d + (f ? o : i), h = i !== "rem" && ~n.indexOf("adius") || i === "em" && t.appendChild && !l ? t : t.parentNode, _ && (h = (t.ownerSVGElement || {}).parentNode), (!h || h === Qr || !h.appendChild) && (h = Qr.body), g = h._gsap, g && p && g.width && c && g.time === Jn.time && !g.uncache) return H(a / g.width * d);
	if (p && (n === "height" || n === "width")) {
		var v = t.style[n];
		t.style[n] = d + i, m = t[u], v ? t.style[n] = v : Hi(t, n);
	} else (p || o === "%") && !Gi[Pi(h, "display")] && (s.position = Pi(t, "position")), h === t && (s.position = "static"), h.appendChild(ti), m = ti[u], h.removeChild(ti), s.position = "absolute";
	return c && p && (g = St(h), g.time = Jn.time, g.width = h[u]), H(f ? m * a / d : m && a ? d / m * a : 0);
}, qi = function(e, t, n, r) {
	var i;
	return ei || Li(), t in pi && t !== "transform" && (t = pi[t], ~t.indexOf(",") && (t = t.split(",")[0])), ai[t] && t !== "transform" ? (i = aa(e, r), i = t === "transformOrigin" ? i.svg ? i.origin : oa(Pi(e, Di)) + " " + i.zOrigin + "px" : i[t]) : (i = e.style[t], (!i || i === "auto" || r || ~(i + "").indexOf("calc(")) && (i = Qi[t] && Qi[t](e, t, n) || Pi(e, t) || Ct(e, t) || +(t === "opacity"))), n && !~(i + "").trim().indexOf(" ") ? Ki(e, t, i, n) + n : i;
}, Ji = function(e, t, n, r) {
	if (!n || n === "none") {
		var i = Ii(t, e, 1), a = i && Pi(e, i, 1);
		a && a !== n ? (t = i, n = a) : t === "borderColor" && (n = Pi(e, "borderTopColor"));
	}
	var o = new Ir(this._pt, e.style, t, 0, 1, Ar), s = 0, c = 0, l, u, d, f, p, m, h, g, _, v, y, b;
	if (o.b = n, o.e = r, n += "", r += "", r.substring(0, 6) === "var(--" && (r = Pi(e, r.substring(4, r.indexOf(")")))), r === "auto" && (m = e.style[t], e.style[t] = r, r = Pi(e, t) || r, m ? e.style[t] = m : Hi(e, t)), l = [n, r], Kn(l), n = l[0], r = l[1], d = n.match(qe) || [], b = r.match(qe) || [], b.length) {
		for (; u = qe.exec(r);) h = u[0], _ = r.substring(s, u.index), p ? p = (p + 1) % 5 : (_.substr(-5) === "rgba(" || _.substr(-5) === "hsla(") && (p = 1), h !== (m = d[c++] || "") && (f = parseFloat(m) || 0, y = m.substr((f + "").length), h.charAt(1) === "=" && (h = Tt(f, h) + y), g = parseFloat(h), v = h.substr((g + "").length), s = qe.lastIndex - v.length, v || (v = v || Ee.units[t] || y, s === r.length && (r += v, o.e += v)), y !== v && (f = Ki(e, t, m, v) || 0), o._pt = {
			_next: o._pt,
			p: _ || c === 1 ? _ : ",",
			s: f,
			c: g - f,
			m: p && p < 4 || t === "zIndex" ? Math.round : 0
		});
		o.c = s < r.length ? r.substring(s, r.length) : "";
	} else o.r = t === "display" && r === "none" ? bi : yi;
	return Ye.test(r) && (o.e = 0), this._pt = o, o;
}, Yi = {
	top: "0%",
	bottom: "100%",
	left: "0%",
	right: "100%",
	center: "50%"
}, Xi = function(e) {
	var t = e.split(" "), n = t[0], r = t[1] || "50%";
	return (n === "top" || n === "bottom" || r === "left" || r === "right") && (e = n, n = r, r = e), t[0] = Yi[n] || n, t[1] = Yi[r] || r, t.join(" ");
}, Zi = function(e, t) {
	if (t.tween && t.tween._time === t.tween._dur) {
		var n = t.t, r = n.style, i = t.u, a = n._gsap, o, s, c;
		if (i === "all" || i === !0) r.cssText = "", s = 1;
		else for (i = i.split(","), c = i.length; --c > -1;) o = i[c], ai[o] && (s = 1, o = o === "transformOrigin" ? Di : J), Hi(n, o);
		s && (Hi(n, J), a && (a.svg && n.removeAttribute("transform"), r.scale = r.rotate = r.translate = "none", aa(n, 1), a.uncache = 1, ki(r)));
	}
}, Qi = { clearProps: function(e, t, n, r, i) {
	if (i.data !== "isFromStart") {
		var a = e._pt = new Ir(e._pt, t, n, 0, 0, Zi);
		return a.u = r, a.pr = -10, a.tween = i, e._props.push(n), 1;
	}
} }, $i = [
	1,
	0,
	0,
	1,
	0,
	0
], ea = {}, ta = function(e) {
	return e === "matrix(1, 0, 0, 1, 0, 0)" || e === "none" || !e;
}, na = function(e) {
	var t = Pi(e, J);
	return ta(t) ? $i : t.substr(7).match(Ke).map(H);
}, ra = function(e, t) {
	var n = e._gsap || St(e), r = e.style, i = na(e), a, o, s, c;
	return n.svg && e.getAttribute("transform") ? (s = e.transform.baseVal.consolidate().matrix, i = [
		s.a,
		s.b,
		s.c,
		s.d,
		s.e,
		s.f
	], i.join(",") === "1,0,0,1,0,0" ? $i : i) : (i === $i && !e.offsetParent && e !== $r && !n.svg && (s = r.display, r.display = "block", a = e.parentNode, (!a || !e.offsetParent && !e.getBoundingClientRect().width) && (c = 1, o = e.nextElementSibling, $r.appendChild(e)), i = na(e), s ? r.display = s : Hi(e, "display"), c && (o ? a.insertBefore(e, o) : a ? a.appendChild(e) : $r.removeChild(e))), t && i.length > 6 ? [
		i[0],
		i[1],
		i[4],
		i[5],
		i[12],
		i[13]
	] : i);
}, ia = function(e, t, n, r, i, a) {
	var o = e._gsap, s = i || ra(e, !0), c = o.xOrigin || 0, l = o.yOrigin || 0, u = o.xOffset || 0, d = o.yOffset || 0, f = s[0], p = s[1], m = s[2], h = s[3], g = s[4], _ = s[5], v = t.split(" "), y = parseFloat(v[0]) || 0, b = parseFloat(v[1]) || 0, x, S, C, w;
	n ? s !== $i && (S = f * h - p * m) && (C = h / S * y + b * (-m / S) + (m * _ - h * g) / S, w = y * (-p / S) + f / S * b - (f * _ - p * g) / S, y = C, b = w) : (x = Bi(e), y = x.x + (~v[0].indexOf("%") ? y / 100 * x.width : y), b = x.y + (~(v[1] || v[0]).indexOf("%") ? b / 100 * x.height : b)), r || r !== !1 && o.smooth ? (g = y - c, _ = b - l, o.xOffset = u + (g * f + _ * m) - g, o.yOffset = d + (g * p + _ * h) - _) : o.xOffset = o.yOffset = 0, o.xOrigin = y, o.yOrigin = b, o.smooth = !!r, o.origin = t, o.originIsAbsolute = !!n, e.style[Di] = "0px 0px", a && (Ui(a, o, "xOrigin", c, y), Ui(a, o, "yOrigin", l, b), Ui(a, o, "xOffset", u, o.xOffset), Ui(a, o, "yOffset", d, o.yOffset)), e.setAttribute("data-svg-origin", y + " " + b);
}, aa = function(e, t) {
	var n = e._gsap || new sr(e);
	if ("x" in n && !t && !n.uncache) return n;
	var r = e.style, i = n.scaleX < 0, a = "px", o = "deg", s = getComputedStyle(e), c = Pi(e, Di) || "0", l = u = d = m = h = g = _ = v = y = 0, u, d, f = p = 1, p, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, A, j, M, N, ee, te, ne, re, ie, ae, oe;
	return n.svg = !!(e.getCTM && Vi(e)), s.translate && ((s.translate !== "none" || s.scale !== "none" || s.rotate !== "none") && (r[J] = (s.translate === "none" ? "" : "translate3d(" + (s.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") ") + (s.rotate === "none" ? "" : "rotate(" + s.rotate + ") ") + (s.scale === "none" ? "" : "scale(" + s.scale.split(" ").join(",") + ") ") + (s[J] === "none" ? "" : s[J])), r.scale = r.rotate = r.translate = "none"), S = ra(e, n.svg), n.svg && (n.uncache ? (N = e.getBBox(), c = n.xOrigin - N.x + "px " + (n.yOrigin - N.y) + "px", M = "") : M = !t && e.getAttribute("data-svg-origin"), ia(e, M || c, !!M || n.originIsAbsolute, n.smooth !== !1, S)), b = n.xOrigin || 0, x = n.yOrigin || 0, S !== $i && (E = S[0], D = S[1], O = S[2], k = S[3], l = A = S[4], u = j = S[5], S.length === 6 ? (f = Math.sqrt(E * E + D * D), p = Math.sqrt(k * k + O * O), m = E || D ? ci(D, E) * oi : 0, _ = O || k ? ci(O, k) * oi + m : 0, _ && (p *= Math.abs(Math.cos(_ * si))), n.svg && (l -= b - (b * E + x * O), u -= x - (b * D + x * k))) : (oe = S[6], ie = S[7], te = S[8], ne = S[9], re = S[10], ae = S[11], l = S[12], u = S[13], d = S[14], C = ci(oe, re), h = C * oi, C && (w = Math.cos(-C), T = Math.sin(-C), M = A * w + te * T, N = j * w + ne * T, ee = oe * w + re * T, te = A * -T + te * w, ne = j * -T + ne * w, re = oe * -T + re * w, ae = ie * -T + ae * w, A = M, j = N, oe = ee), C = ci(-O, re), g = C * oi, C && (w = Math.cos(-C), T = Math.sin(-C), M = E * w - te * T, N = D * w - ne * T, ee = O * w - re * T, ae = k * T + ae * w, E = M, D = N, O = ee), C = ci(D, E), m = C * oi, C && (w = Math.cos(C), T = Math.sin(C), M = E * w + D * T, N = A * w + j * T, D = D * w - E * T, j = j * w - A * T, E = M, A = N), h && Math.abs(h) + Math.abs(m) > 359.9 && (h = m = 0, g = 180 - g), f = H(Math.sqrt(E * E + D * D + O * O)), p = H(Math.sqrt(j * j + oe * oe)), C = ci(A, j), _ = Math.abs(C) > 2e-4 ? C * oi : 0, y = ae ? 1 / (ae < 0 ? -ae : ae) : 0), n.svg && (M = e.getAttribute("transform"), n.forceCSS = e.setAttribute("transform", "") || !ta(Pi(e, J)), M && e.setAttribute("transform", M))), Math.abs(_) > 90 && Math.abs(_) < 270 && (i ? (f *= -1, _ += m <= 0 ? 180 : -180, m += m <= 0 ? 180 : -180) : (p *= -1, _ += _ <= 0 ? 180 : -180)), t ||= n.uncache, n.x = l - ((n.xPercent = l && (!t && n.xPercent || (Math.round(e.offsetWidth / 2) === Math.round(-l) ? -50 : 0))) ? e.offsetWidth * n.xPercent / 100 : 0) + a, n.y = u - ((n.yPercent = u && (!t && n.yPercent || (Math.round(e.offsetHeight / 2) === Math.round(-u) ? -50 : 0))) ? e.offsetHeight * n.yPercent / 100 : 0) + a, n.z = d + a, n.scaleX = H(f), n.scaleY = H(p), n.rotation = H(m) + o, n.rotationX = H(h) + o, n.rotationY = H(g) + o, n.skewX = _ + o, n.skewY = v + o, n.transformPerspective = y + a, (n.zOrigin = parseFloat(c.split(" ")[2]) || !t && n.zOrigin || 0) && (r[Di] = oa(c)), n.xOffset = n.yOffset = 0, n.force3D = Ee.force3D, n.renderTransform = n.svg ? pa : Mi ? fa : ca, n.uncache = 0, n;
}, oa = function(e) {
	return (e = e.split(" "))[0] + " " + e[1];
}, sa = function(e, t, n) {
	var r = W(t);
	return H(parseFloat(t) + parseFloat(Ki(e, "x", n + "px", r))) + r;
}, ca = function(e, t) {
	t.z = "0px", t.rotationY = t.rotationX = "0deg", t.force3D = 0, fa(e, t);
}, la = "0deg", ua = "0px", da = ") ", fa = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.z, c = n.rotation, l = n.rotationY, u = n.rotationX, d = n.skewX, f = n.skewY, p = n.scaleX, m = n.scaleY, h = n.transformPerspective, g = n.force3D, _ = n.target, v = n.zOrigin, y = "", b = g === "auto" && e && e !== 1 || g === !0;
	if (v && (u !== la || l !== la)) {
		var x = parseFloat(l) * si, S = Math.sin(x), C = Math.cos(x), w;
		x = parseFloat(u) * si, w = Math.cos(x), a = sa(_, a, S * w * -v), o = sa(_, o, -Math.sin(x) * -v), s = sa(_, s, C * w * -v + v);
	}
	h !== ua && (y += "perspective(" + h + da), (r || i) && (y += "translate(" + r + "%, " + i + "%) "), (b || a !== ua || o !== ua || s !== ua) && (y += s !== ua || b ? "translate3d(" + a + ", " + o + ", " + s + ") " : "translate(" + a + ", " + o + da), c !== la && (y += "rotate(" + c + da), l !== la && (y += "rotateY(" + l + da), u !== la && (y += "rotateX(" + u + da), (d !== la || f !== la) && (y += "skew(" + d + ", " + f + da), (p !== 1 || m !== 1) && (y += "scale(" + p + ", " + m + da), _.style[J] = y || "translate(0, 0)";
}, pa = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.rotation, c = n.skewX, l = n.skewY, u = n.scaleX, d = n.scaleY, f = n.target, p = n.xOrigin, m = n.yOrigin, h = n.xOffset, g = n.yOffset, _ = n.forceCSS, v = parseFloat(a), y = parseFloat(o), b, x, S, C, w;
	s = parseFloat(s), c = parseFloat(c), l = parseFloat(l), l && (l = parseFloat(l), c += l, s += l), s || c ? (s *= si, c *= si, b = Math.cos(s) * u, x = Math.sin(s) * u, S = Math.sin(s - c) * -d, C = Math.cos(s - c) * d, c && (l *= si, w = Math.tan(c - l), w = Math.sqrt(1 + w * w), S *= w, C *= w, l && (w = Math.tan(l), w = Math.sqrt(1 + w * w), b *= w, x *= w)), b = H(b), x = H(x), S = H(S), C = H(C)) : (b = u, C = d, x = S = 0), (v && !~(a + "").indexOf("px") || y && !~(o + "").indexOf("px")) && (v = Ki(f, "x", a, "px"), y = Ki(f, "y", o, "px")), (p || m || h || g) && (v = H(v + p - (p * b + m * S) + h), y = H(y + m - (p * x + m * C) + g)), (r || i) && (w = f.getBBox(), v = H(v + r / 100 * w.width), y = H(y + i / 100 * w.height)), w = "matrix(" + b + "," + x + "," + S + "," + C + "," + v + "," + y + ")", f.setAttribute("transform", w), _ && (f.style[J] = w);
}, ma = function(e, t, n, r, i) {
	var a = 360, o = R(i), s = parseFloat(i) * (o && ~i.indexOf("rad") ? oi : 1) - r, c = r + s + "deg", l, u;
	return o && (l = i.split("_")[1], l === "short" && (s %= a, s !== s % (a / 2) && (s += s < 0 ? a : -a)), l === "cw" && s < 0 ? s = (s + a * li) % a - ~~(s / a) * a : l === "ccw" && s > 0 && (s = (s - a * li) % a - ~~(s / a) * a)), e._pt = u = new Ir(e._pt, t, n, r, s, hi), u.e = c, u.u = "deg", e._props.push(n), u;
}, ha = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, ga = function(e, t, n) {
	var r = ha({}, n._gsap), i = "perspective,force3D,transformOrigin,svgOrigin", a = n.style, o, s, c, l, u, d, f, p;
	for (s in r.svg ? (c = n.getAttribute("transform"), n.setAttribute("transform", ""), a[J] = t, o = aa(n, 1), Hi(n, J), n.setAttribute("transform", c)) : (c = getComputedStyle(n)[J], a[J] = t, o = aa(n, 1), a[J] = c), ai) c = r[s], l = o[s], c !== l && i.indexOf(s) < 0 && (f = W(c), p = W(l), u = f === p ? parseFloat(c) : Ki(n, s, c, p), d = parseFloat(l), e._pt = new Ir(e._pt, o, s, u, d - u, mi), e._pt.u = p || 0, e._props.push(s));
	ha(o, r);
};
wt("padding,margin,Width,Radius", function(e, t) {
	var n = "Top", r = "Right", i = "Bottom", a = "Left", o = (t < 3 ? [
		n,
		r,
		i,
		a
	] : [
		n + a,
		n + r,
		i + r,
		i + a
	]).map(function(n) {
		return t < 2 ? e + n : "border" + n + e;
	});
	Qi[t > 1 ? "border" + e : e] = function(e, t, n, r, i) {
		var a, s;
		if (arguments.length < 4) return a = o.map(function(t) {
			return qi(e, t, n);
		}), s = a.join(" "), s.split(a[0]).length === 5 ? a[0] : s;
		a = (r + "").split(" "), s = {}, o.forEach(function(e, t) {
			return s[e] = a[t] = a[t] || a[(t - 1) / 2 | 0];
		}), e.init(t, s, i);
	};
});
var _a = {
	name: "css",
	register: Li,
	targetTest: function(e) {
		return e.style && e.nodeType;
	},
	init: function(e, t, n, r, i) {
		var a = this._props, o = e.style, s = n.vars.startAt, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w;
		for (m in ei || Li(), this.styles = this.styles || ji(e), C = this.styles.props, this.tween = n, t) if (m !== "autoRound" && (l = t[m], !(gt[m] && pr(m, t, n, r, e, i)))) {
			if (f = typeof l, p = Qi[m], f === "function" && (l = l.call(n, r, e, i), f = typeof l), f === "string" && ~l.indexOf("random(") && (l = An(l)), p) p(this, e, m, l, n) && (S = 1);
			else if (m.substr(0, 2) === "--") c = (getComputedStyle(e).getPropertyValue(m) + "").trim(), l += "", Wn.lastIndex = 0, Wn.test(c) || (h = W(c), g = W(l), g ? h !== g && (c = Ki(e, m, c, g) + g) : h && (l += h)), this.add(o, "setProperty", c, l, r, i, 0, 0, m), a.push(m), C.push(m, 0, o[m]);
			else if (f !== "undefined") {
				if (s && m in s ? (c = typeof s[m] == "function" ? s[m].call(n, r, e, i) : s[m], R(c) && ~c.indexOf("random(") && (c = An(c)), W(c + "") || c === "auto" || (c += Ee.units[m] || W(qi(e, m)) || ""), (c + "").charAt(1) === "=" && (c = qi(e, m))) : c = qi(e, m), d = parseFloat(c), _ = f === "string" && l.charAt(1) === "=" && l.substr(0, 2), _ && (l = l.substr(2)), u = parseFloat(l), m in pi && (m === "autoAlpha" && (d === 1 && qi(e, "visibility") === "hidden" && u && (d = 0), C.push("visibility", 0, o.visibility), Ui(this, o, "visibility", d ? "inherit" : "hidden", u ? "inherit" : "hidden", !u)), m !== "scale" && m !== "transform" && (m = pi[m], ~m.indexOf(",") && (m = m.split(",")[0]))), v = m in ai, v) {
					if (this.styles.save(m), w = l, f === "string" && l.substring(0, 6) === "var(--") {
						if (l = Pi(e, l.substring(4, l.indexOf(")"))), l.substring(0, 5) === "calc(") {
							var T = e.style.perspective;
							e.style.perspective = l, l = Pi(e, "perspective"), T ? e.style.perspective = T : Hi(e, "perspective");
						}
						u = parseFloat(l);
					}
					if (y || (b = e._gsap, b.renderTransform && !t.parseTransform || aa(e, t.parseTransform), x = t.smoothOrigin !== !1 && b.smooth, y = this._pt = new Ir(this._pt, o, J, 0, 1, b.renderTransform, b, 0, -1), y.dep = 1), m === "scale") this._pt = new Ir(this._pt, b, "scaleY", b.scaleY, (_ ? Tt(b.scaleY, _ + u) : u) - b.scaleY || 0, mi), this._pt.u = 0, a.push("scaleY", m), m += "X";
					else if (m === "transformOrigin") {
						C.push(Di, 0, o[Di]), l = Xi(l), b.svg ? ia(e, l, 0, x, 0, this) : (g = parseFloat(l.split(" ")[2]) || 0, g !== b.zOrigin && Ui(this, b, "zOrigin", b.zOrigin, g), Ui(this, o, m, oa(c), oa(l)));
						continue;
					} else if (m === "svgOrigin") {
						ia(e, l, 1, x, 0, this);
						continue;
					} else if (m in ea) {
						ma(this, b, m, d, _ ? Tt(d, _ + l) : l);
						continue;
					} else if (m === "smoothOrigin") {
						Ui(this, b, "smooth", b.smooth, l);
						continue;
					} else if (m === "force3D") {
						b[m] = l;
						continue;
					} else if (m === "transform") {
						ga(this, l, e);
						continue;
					}
				} else m in o || (m = Ii(m) || m);
				if (v || (u || u === 0) && (d || d === 0) && !fi.test(l) && m in o) h = (c + "").substr((d + "").length), u ||= 0, g = W(l) || (m in Ee.units ? Ee.units[m] : h), h !== g && (d = Ki(e, m, c, g)), this._pt = new Ir(this._pt, v ? b : o, m, d, (_ ? Tt(d, _ + u) : u) - d, !v && (g === "px" || m === "zIndex") && t.autoRound !== !1 ? vi : mi), this._pt.u = g || 0, v && w !== l ? (this._pt.b = c, this._pt.e = w, this._pt.r = _i) : h !== g && g !== "%" && (this._pt.b = c, this._pt.r = gi);
				else if (m in o) Ji.call(this, e, m, c, _ ? _ + l : l);
				else if (m in e) this.add(e, m, c || e[m], _ ? _ + l : l, r, i);
				else if (m !== "parseTransform") {
					at(m, l);
					continue;
				}
				v || (m in o ? C.push(m, 0, o[m]) : typeof e[m] == "function" ? C.push(m, 2, e[m]()) : C.push(m, 1, c || e[m])), a.push(m);
			}
		}
		S && Fr(this);
	},
	render: function(e, t) {
		if (t.tween._time || !ri()) for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
		else t.styles.revert();
	},
	get: qi,
	aliases: pi,
	getSetter: function(e, t, n) {
		var r = pi[t];
		return r && r.indexOf(",") < 0 && (t = r), t in ai && t !== Di && (e._gsap.x || qi(e, "x")) ? n && ni === n ? t === "scale" ? wi : Ci : (ni = n || {}) && (t === "scale" ? Ti : Ei) : e.style && !Le(e.style[t]) ? xi : ~t.indexOf("-") ? Si : Dr(e, t);
	},
	core: {
		_removeProperty: Hi,
		_getMatrix: ra
	}
};
Xr.utils.checkPrefix = Ii, Xr.core.getStyleSaver = ji, (function(e, t, n, r) {
	var i = wt(e + "," + t + "," + n, function(e) {
		ai[e] = 1;
	});
	wt(t, function(e) {
		Ee.units[e] = "deg", ea[e] = 1;
	}), pi[i[13]] = e + "," + t, wt(r, function(e) {
		var t = e.split(":");
		pi[t[1]] = i[t[0]];
	});
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY"), wt("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(e) {
	Ee.units[e] = "px";
}), Xr.registerPlugin(_a);
//#endregion
//#region node_modules/gsap/index.js
var va = Xr.registerPlugin(_a) || Xr;
va.core.Tween;
//#endregion
//#region src/render/colorTransform.ts
var ya = "http://www.w3.org/2000/svg", ba = "mmtour-color-transform-filters";
function xa(e, t) {
	let n = t?.rm ?? 1, r = t?.gm ?? 1, i = t?.bm ?? 1, a = t?.am ?? 1, o = t?.ra ?? 0, s = t?.ga ?? 0, c = t?.ba ?? 0, l = t?.aa ?? 0;
	if (n === 1 && r === 1 && i === 1 && a === 1 && o === 0 && s === 0 && c === 0 && l === 0) {
		e.style.removeProperty("filter");
		return;
	}
	e.style.filter = `url(#${Sa(n, r, i, a, o, s, c, l)})`;
}
function Sa(e, t, n, r, i, a, o, s) {
	let c = wa(e, t, n, r, i, a, o, s);
	if (document.getElementById(c)) return c;
	let l = document.getElementById(ba);
	l || (l = document.createElementNS(ya, "svg"), l.id = ba, l.setAttribute("width", "0"), l.setAttribute("height", "0"), l.setAttribute("aria-hidden", "true"), l.style.position = "absolute", l.style.width = "0", l.style.height = "0", l.style.overflow = "hidden", document.body.append(l));
	let u = document.createElementNS(ya, "filter");
	u.id = c, u.setAttribute("color-interpolation-filters", "sRGB");
	let d = document.createElementNS(ya, "feComponentTransfer");
	return d.append(Ca("feFuncR", e, i), Ca("feFuncG", t, a), Ca("feFuncB", n, o), Ca("feFuncA", r, s)), u.append(d), l.append(u), c;
}
function Ca(e, t, n) {
	let r = document.createElementNS(ya, e);
	return r.setAttribute("type", "linear"), r.setAttribute("slope", String(t)), r.setAttribute("intercept", String(n)), r;
}
function wa(...e) {
	return `mmtour-ct-${e.map((e) => String(Math.round(e * 1e5)).replace("-", "n")).join("-")}`;
}
//#endregion
//#region src/render/DomRenderer.ts
var Ta = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", Ea = /* @__PURE__ */ new Map();
function Da(e) {
	let t = Ea.get(e);
	if (t) return t;
	let n = new Promise((t) => {
		let n = new Image(), r = !1, i = !1, a = (e) => {
			r || (r = !0, n.onload = null, n.onerror = null, t(e));
		}, o = () => {
			if (!(i || r)) {
				if (i = !0, typeof n.decode != "function") {
					a(n.naturalWidth > 0);
					return;
				}
				n.decode().then(() => a(!0)).catch(() => a(n.complete && n.naturalWidth > 0));
			}
		};
		n.decoding = "async", n.onload = o, n.onerror = () => a(!1), n.src = e, n.complete && o();
	});
	return Ea.set(e, n), n;
}
async function Oa(e) {
	if (typeof e.decode == "function") try {
		await e.decode();
		return;
	} catch {}
	e.complete || await new Promise((t) => {
		e.addEventListener("load", () => t(), { once: !0 }), e.addEventListener("error", () => t(), { once: !0 });
	});
}
var ka = 2, Aa = /* @__PURE__ */ new Map(), ja = /* @__PURE__ */ new Set(), Ma = {
	a: 1,
	b: 0,
	c: 0,
	d: 1,
	tx: 0,
	ty: 0
};
function Na(e, t) {
	return {
		a: e.a * t.a + e.c * t.b,
		b: e.b * t.a + e.d * t.b,
		c: e.a * t.c + e.c * t.d,
		d: e.b * t.c + e.d * t.d,
		tx: e.a * t.tx + e.c * t.ty + e.tx,
		ty: e.b * t.tx + e.d * t.ty + e.ty
	};
}
function Pa(e) {
	if (Aa.has(e)) return Aa.get(e);
	ja.has(e) || (ja.add(e), fetch(P(e)).then((e) => e.ok ? e.text() : "").then((t) => {
		let n = t.replace(/<\?xml[^>]*\?>/i, "").replace(/<svg[^>]*>/i, "").replace(/<\/svg>\s*$/i, ""), r = n.match(/<g\s+transform="matrix\(([^)]+)\)"\s*>([\s\S]*)<\/g>\s*$/i), i = Ma, a = n;
		if (r) {
			let e = r[1].split(/[\s,]+/).map(Number);
			e.length === 6 && e.every(Number.isFinite) && (i = {
				a: e[0],
				b: e[1],
				c: e[2],
				d: e[3],
				tx: e[4],
				ty: e[5]
			}), a = r[2];
		}
		a = a.replace(/fill="[^"]*"/g, "fill=\"#ffffff\"").replace(/stroke="[^"]*"/g, "stroke=\"none\""), Aa.set(e, {
			gMatrix: i,
			body: a
		});
	}).catch(() => Aa.set(e, null)));
}
function Fa(e, t = "", n, r, i) {
	if (e.maskGroup) return `<g${t}>${La(e.maskGroup, r, n, i)}</g>`;
	if (e.text) return Ia(e, t, i);
	let a = e.matrix, o = P(e.src), s = e.colorTransform ? ` filter="url(#${Va(e.colorTransform)})"` : "";
	return `<image href="${o}" xlink:href="${o}" x="${-e.origin.x}" y="${-e.origin.y}" width="${e.origin.width}" height="${e.origin.height}" transform="matrix(${a.a},${a.b},${a.c},${a.d},${a.tx},${a.ty})"${s}${t}/>`;
}
function Ia(e, t = "", n) {
	let r = e.text, i = e.matrix, a = r.x ?? e.origin.x, o = r.y ?? e.origin.y, s = Math.max(1, r.width ?? e.origin.width), c = Math.max(1, r.height ?? e.origin.height), l = `${r.lineHeight ?? r.fontHeight + (r.leading ?? 0)}px`, u = r.wordWrap ? "pre-wrap" : "pre", d = r.align ?? "left", f = r.staticLines?.length ? Qa(r, s) : "", p = r.html ? qa(Ja(r.text ?? "")) : ao(Ja(r.text ?? "")), m = [
		"margin:0",
		"padding:0",
		"overflow:visible",
		`width:${s}px`,
		`height:${c}px`,
		`font-size:${r.fontHeight}px`,
		`line-height:${l}`,
		`color:${r.color ?? "#000"}`,
		`text-align:${d}`,
		`white-space:${u}`,
		`font-family:${(n?.(r.fontId) ?? "sans-serif").replace(/"/g, "'")}`
	].join(";");
	return `<foreignObject class="player-text player-mask-text" x="${a}" y="${o}" width="${s}" height="${c}" overflow="visible" style="overflow:visible" transform="matrix(${i.a},${i.b},${i.c},${i.d},${i.tx},${i.ty})"${t}><div xmlns="http://www.w3.org/1999/xhtml" style="${m}">${f || p}</div></foreignObject>`;
}
function La(e, t, n, r) {
	let i = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${n.width}" height="${n.height}" style="position:absolute;left:0;top:0;overflow:visible">`, a = Ba(e.items), o = Pa(e.mask.src);
	if (!o) return `${i}${a ? `<defs>${a}</defs>` : ""}${e.items.map((e, i) => Fa(e, "", n, `${t}_${e.key ?? i}`, r)).join("")}</svg>`;
	let s = e.mask.matrix, c = e.mask.origin, l = Na(Na(s, {
		a: 1,
		b: 0,
		c: 0,
		d: 1,
		tx: -c.x,
		ty: -c.y
	}), o.gMatrix), u = `c${t.replace(/\W/g, "_")}`, d = `matrix(${l.a},${l.b},${l.c},${l.d},${l.tx},${l.ty})`;
	return `${i}<defs>${a}<clipPath id="${u}" clipPathUnits="userSpaceOnUse">${o.body.replace(/<(path|polygon|rect|ellipse|circle)\b/g, `<$1 transform="${d}"`)}</clipPath></defs><g clip-path="url(#${u})">${e.items.map((e, i) => Fa(e, e.opacity === 1 ? "" : ` opacity="${e.opacity}"`, n, `${t}_${e.key ?? i}`, r)).join("")}</g></svg>`;
}
function Ra(e, t) {
	e.maskGroup ? za(e.maskGroup, t) : !e.text && e.src && t.add(P(e.src));
}
function za(e, t) {
	Ra(e.mask, t);
	for (let n of e.items) Ra(n, t);
}
function Ba(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) n.colorTransform && t.set(Va(n.colorTransform), n.colorTransform);
	return [...t.entries()].map(([e, t]) => {
		let n = t.rm ?? 1, r = t.gm ?? 1, i = t.bm ?? 1;
		return `<filter id="${e}" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="${n}" intercept="${t.ra ?? 0}"/><feFuncG type="linear" slope="${r}" intercept="${t.ga ?? 0}"/><feFuncB type="linear" slope="${i}" intercept="${t.ba ?? 0}"/></feComponentTransfer></filter>`;
	}).join("");
}
function Va(e) {
	return `mc${[
		e.rm ?? 1,
		e.gm ?? 1,
		e.bm ?? 1,
		e.ra ?? 0,
		e.ga ?? 0,
		e.ba ?? 0
	].map((e) => String(Math.round(e * 1e5)).replace("-", "n")).join("_")}`;
}
var Ha = class {
	layer;
	options;
	renderTarget;
	nodes = /* @__PURE__ */ new Map();
	queuedFrame;
	framePreparing = !1;
	frameEpoch = 0;
	hoveredButtonKeys = /* @__PURE__ */ new Set();
	pointerX = -1;
	pointerY = -1;
	pointerTracking = !1;
	hoverDepth = 0;
	currentHover = null;
	constructor(e, t = {}) {
		this.layer = e, this.renderTarget = e, this.options = t, t.onButtonEvent && this.ensurePointerTracking();
	}
	trackPointer = (e) => {
		this.pointerX = e.clientX, this.pointerY = e.clientY, this.updateHover();
	};
	ensurePointerTracking() {
		this.pointerTracking || typeof window > "u" || (this.pointerTracking = !0, window.addEventListener("pointermove", this.trackPointer, !0), window.addEventListener("pointerdown", this.trackPointer, !0));
	}
	clear() {
		this.frameEpoch += 1, this.queuedFrame = void 0, this.nodes.clear(), this.hoveredButtonKeys.clear(), this.currentHover = null, this.pointerTracking && typeof window < "u" && (window.removeEventListener("pointermove", this.trackPointer, !0), window.removeEventListener("pointerdown", this.trackPointer, !0), this.pointerTracking = !1), this.layer.replaceChildren();
	}
	apply(e) {
		this.queuedFrame = eo(e), this.framePreparing || this.prepareNextFrame();
	}
	async prepareNextFrame() {
		let e = this.queuedFrame;
		if (!e) return;
		this.queuedFrame = void 0, this.framePreparing = !0;
		let t = this.frameEpoch, n = /* @__PURE__ */ new Set();
		for (let t of e) t.maskGroup ? za(t.maskGroup, n) : t.kind !== "text" && t.src && n.add(P(t.src));
		await Promise.all([...n].map(Da));
		let r = document.createElement("div");
		r.className = "player-frame", Object.assign(r.style, {
			position: "absolute",
			inset: "0",
			width: "100%",
			height: "100%",
			pointerEvents: "none"
		});
		let i = this.nodes;
		this.nodes = /* @__PURE__ */ new Map(), this.renderTarget = r, this.commitFrame(e, !1);
		let a = this.nodes;
		this.nodes = i, this.renderTarget = this.layer, await Promise.all([...r.querySelectorAll("img")].map(Oa)), t === this.frameEpoch && (this.layer.replaceChildren(r), this.nodes = a, this.scheduleStaticFit(), this.updateHover()), this.framePreparing = !1, this.queuedFrame && this.prepareNextFrame();
	}
	commitFrame(e, t = !0) {
		let n = /* @__PURE__ */ new Set();
		for (let t of e) {
			if (t.maskGroup) {
				n.add(t.key), this.applyMaskGroup(t);
				continue;
			}
			if (!t.src && t.kind !== "text" && t.kind !== "button") continue;
			n.add(t.key);
			let e = this.nodes.get(t.key), r = e?.kind === "button" && e.characterId !== t.characterId;
			(!e || e.kind !== t.kind || r) && (e?.element.remove(), e = this.createNode(t), this.nodes.set(t.key, e)), this.updateMedia(e, t), this.commitNode(e, t);
		}
		for (let [e, t] of this.nodes) n.has(e) || (t.element.remove(), this.nodes.delete(e), this.hoveredButtonKeys.delete(e));
		t && (this.scheduleStaticFit(), this.updateHover());
	}
	updateHover() {
		let e = this.options.onButtonEvent;
		if (!e || this.hoverDepth > 8) return;
		let t = null;
		if (this.pointerX >= 0 || this.pointerY >= 0) {
			let e = document.elementFromPoint(this.pointerX, this.pointerY)?.closest(".player-hit");
			e && this.layer.contains(e) && e.dataset.buttonKey && (t = {
				key: e.dataset.buttonKey,
				ownerPath: e.dataset.buttonOwnerPath ?? "",
				character: Number(e.dataset.buttonCharacter)
			});
		}
		if (t?.key === this.currentHover?.key) return;
		let n = this.currentHover;
		this.currentHover = t, this.hoverDepth++;
		try {
			n && (this.hoveredButtonKeys.delete(n.key), e(n.ownerPath, n.character, "rollOut", n.key)), t && (this.hoveredButtonKeys.add(t.key), e(t.ownerPath, t.character, "rollOver", t.key));
		} finally {
			this.hoverDepth--;
		}
	}
	staticFitQueued = !1;
	scheduleStaticFit() {
		this.staticFitQueued || (this.staticFitQueued = !0, requestAnimationFrame(() => {
			this.staticFitQueued = !1, $a(this.layer);
		}), document.fonts?.ready.then(() => $a(this.layer)).catch(() => {}));
	}
	applyMaskGroup(e) {
		let t = this.nodes.get(e.key);
		if (!t) {
			let n = document.createElement("div");
			n.className = "player-instance", this.renderTarget.append(n), t = {
				element: n,
				media: n,
				characterId: -1,
				kind: e.kind,
				src: ""
			}, this.nodes.set(e.key, t);
		}
		t.element.style.zIndex = String(e.order), t.element.style.transform = "none", t.element.innerHTML = La(e.maskGroup, e.key, this.options.stageDimensions ?? {
			width: 640,
			height: 480
		}, this.options.resolveFontFamily);
	}
	createNode(e) {
		let t = document.createElement("div");
		t.className = "player-instance", t.dataset.key = e.key, t.dataset.character = String(e.characterId);
		let n = this.createMedia(e);
		return n.classList.add("player-media"), t.append(n), this.renderTarget.append(t), e.kind === "button" && e.buttonOwnerPath !== void 0 && this.wireButton(n, e.buttonOwnerPath, e.characterId, e.key), {
			element: t,
			media: n,
			characterId: e.characterId,
			kind: e.kind,
			src: ""
		};
	}
	wireButton(e, t, n, r) {
		let i = this.options.onButtonEvent;
		i && (e.dataset.buttonOwnerPath = t, e.dataset.buttonCharacter = String(n), e.dataset.buttonKey = r, e.style.pointerEvents = "auto", e.style.cursor = "pointer", e.addEventListener("pointerdown", (a) => {
			if (a.button !== 0) return;
			let o = e.getBoundingClientRect(), s = this.pointerStageScale(), c = a.clientX, l = a.clientY, u = (e, t) => e >= o.left && e <= o.right && t >= o.top && t <= o.bottom, d = () => {
				window.removeEventListener("pointermove", f, !0), window.removeEventListener("pointerup", p, !0), window.removeEventListener("pointercancel", m, !0);
			}, f = (e) => {
				if (e.pointerId !== a.pointerId) return;
				let t = (e.clientX - c) * s.x, n = (e.clientY - l) * s.y;
				c = e.clientX, l = e.clientY, (t || n) && this.options.onPointerDrag?.(t, n);
			}, p = (e) => {
				e.pointerId === a.pointerId && (d(), (document.elementFromPoint(e.clientX, e.clientY)?.closest(".player-hit"))?.dataset.buttonKey === r || u(e.clientX, e.clientY) ? i(t, n, "release", r) : i(t, n, "releaseOutside", r));
			}, m = (e) => {
				e.pointerId === a.pointerId && d();
			};
			window.addEventListener("pointermove", f, !0), window.addEventListener("pointerup", p, !0), window.addEventListener("pointercancel", m, !0);
			try {
				e.setPointerCapture(a.pointerId);
			} catch {}
			i(t, n, "press", r);
		}));
	}
	pointerStageScale() {
		let e = this.layer.getBoundingClientRect(), t = this.options.stageDimensions ?? {
			width: e.width || 1,
			height: e.height || 1
		};
		return {
			x: e.width ? t.width / e.width : 1,
			y: e.height ? t.height / e.height : 1
		};
	}
	createMedia(e) {
		if (e.kind === "text") {
			let t = document.createElement("div");
			return t.className = "player-text", this.styleText(t, e), t;
		}
		if (e.kind === "button") {
			let t = document.createElement("img");
			return t.className = "player-hit", t.decoding = "async", t.draggable = !1, t.src = e.src ? P(e.src) : Ta, t;
		}
		let t = document.createElement("img");
		return t.decoding = "sync", t.draggable = !1, t;
	}
	updateMedia(e, t) {
		if (e.kind === "text") {
			t.text ? this.styleText(e.media, t) : e.src !== t.src && t.src && this.loadPlainText(e.media, t.src), e.src = t.src;
			return;
		}
		let n = e.media;
		!(n instanceof HTMLImageElement) || e.src === t.src || (n.src = t.src ? P(t.src) : Ta, e.src = t.src);
	}
	commitNode(e, t) {
		e.characterId = t.characterId, e.element.dataset.character = String(t.characterId), this.placeNode(e, t);
	}
	loadPlainText(e, t) {
		fetch(P(t)).then((e) => e.ok ? e.text() : "").then((t) => {
			e.textContent = Ja(t).trim();
		});
	}
	styleText(e, t) {
		let n = t.text;
		if (!n) {
			e.style.whiteSpace = "pre";
			return;
		}
		let r = this.options.resolveFontFamily?.(n.fontId);
		e.style.position = "absolute", e.style.left = `${n.x ?? t.origin.x}px`, e.style.top = `${n.y ?? t.origin.y}px`;
		let i = n.width ?? t.origin.width;
		i > 0 && (e.style.width = `${i}px`);
		let a = n.height ?? t.origin.height;
		if (a > 0 && (e.style.height = `${a}px`), n.staticLines?.length || (e.style.boxSizing = "border-box", e.style.padding = `${ka}px`), e.style.fontSize = `${n.fontHeight}px`, e.style.lineHeight = `${n.lineHeight ?? n.fontHeight + (n.leading ?? 0)}px`, e.style.color = n.color ?? "#000", e.style.textAlign = n.align ?? "left", e.style.whiteSpace = n.wordWrap ? "pre-wrap" : "pre", r && (e.style.fontFamily = r), n.staticLines?.length) {
			e.innerHTML = Qa(n, i);
			return;
		}
		n.html ? e.innerHTML = qa(Ja(n.text ?? "")) : Ya(e, Ja(n.text ?? ""), n, i);
	}
	placeNode(e, t) {
		e.kind !== "text" && va.set(e.media, {
			position: "absolute",
			left: -t.origin.x,
			top: -t.origin.y,
			width: t.origin.width || "auto",
			height: t.origin.height || "auto"
		});
		let { a: n, b: r, c: i, d: a, tx: o, ty: s } = t.matrix, c = i, l = a, u = Math.hypot(i, a);
		if (e.kind !== "text" && u >= Ga && t.origin.height > 0 && t.origin.height <= Ka) {
			let e = (u * t.origin.height + Wa) / (u * t.origin.height);
			c = i * e, l = a * e;
		}
		va.set(e.element, {
			zIndex: t.order,
			opacity: t.opacity,
			transform: `matrix(${n}, ${r}, ${c}, ${l}, ${o}, ${s})`
		});
		let d = e.kind === "text" ? 0 : Math.max(Math.hypot(n, r), Math.hypot(i, a));
		e.element.style.willChange = d >= Ua ? "auto" : "transform, opacity", xa(e.media, t.colorTransform);
	}
}, Ua = 2, Wa = 2, Ga = 4, Ka = 64;
function qa(e) {
	let t = document.createElement("template");
	t.innerHTML = e.replace(/<sbr\b[^>]*\/?>/gi, "<br>");
	let n = (e) => {
		if (e.nodeType === Node.TEXT_NODE) return ao(e.textContent ?? "");
		if (!(e instanceof Element)) return "";
		let t = e.tagName.toLowerCase(), r = [...e.childNodes].map(n).join("");
		if (t === "sbr" || t === "br") return "<br>";
		if (t === "p") {
			let t = ro(e.getAttribute("align"));
			return `<div style="margin:0${t ? `;text-align:${t}` : ""}">${r}</div>`;
		}
		if (t === "font") {
			let t = no(e);
			return t ? `<span style="${t}">${r}</span>` : `<span>${r}</span>`;
		}
		if (t === "a") {
			let t = io(e.getAttribute("href"));
			return t ? `<a href="${ao(t)}" target="_blank" rel="noreferrer">${r}</a>` : `<span>${r}</span>`;
		}
		return t === "b" || t === "strong" ? `<strong>${r}</strong>` : t === "i" || t === "em" ? `<em>${r}</em>` : t === "u" ? `<u>${r}</u>` : r;
	};
	return [...t.content.childNodes].map(n).join("");
}
function Ja(e) {
	return e.replace(/\s*--- RECORDSEPARATOR ---\s*/g, "\n").replace(/\r/g, "\n").split("\n").filter((e) => e.trim() !== "--- RECORDSEPARATOR ---").join("\n");
}
function Ya(e, t, n, r) {
	if (n.wordWrap || n.multiline || t.includes("\n") || r <= 0) {
		e.textContent = t;
		return;
	}
	let i = document.createElement("span");
	i.className = "player-text-fit", i.textContent = t, i.style.display = "inline-block", i.style.whiteSpace = "pre", i.style.transformOrigin = n.align === "right" ? "right top" : n.align === "center" ? "center top" : "left top", e.replaceChildren(i), Xa(e, i, r);
}
function Xa(e, t, n) {
	let r = () => Za(e, t, n);
	requestAnimationFrame(r), requestAnimationFrame(() => requestAnimationFrame(r)), document.fonts?.ready.then(r).catch(() => {});
}
function Za(e, t, n) {
	if (!t.isConnected || t.parentElement !== e) return;
	t.style.transform = "";
	let r = t.scrollWidth || t.offsetWidth || t.getBoundingClientRect().width;
	if (!Number.isFinite(r) || r <= 0 || r <= n) return;
	let i = Math.max(.1, n / r);
	t.style.transform = `scaleX(${i})`;
}
function Qa(e, t) {
	let n = Math.max(1, t), r = e.baselineRatio ?? 1;
	return (e.staticLines ?? []).map((t) => {
		let i = Math.max(1, t.width ?? n), a = e.align === "center" ? t.x + (n - i) / 2 : t.x, o = t.y - e.fontHeight * r, s = e.align ?? "left";
		return `<span class="player-static-line" data-sw="${i}" style="position:absolute;left:${a}px;top:${o}px;width:${i}px;height:${e.fontHeight}px;line-height:${e.fontHeight}px;white-space:pre;transform-origin:left top;color:${e.color ?? "#000"};text-align:${s}">${ao(t.text.trimEnd())}</span>`;
	}).join("");
}
function $a(e) {
	let t = e.querySelectorAll("span.player-static-line");
	for (let e of t) {
		let t = parseFloat(e.dataset.sw ?? "");
		if (!Number.isFinite(t) || t <= 0) continue;
		e.style.transform = "";
		let n = e.scrollWidth || e.getBoundingClientRect().width;
		Number.isFinite(n) && n > t + .5 && (e.style.transform = `scaleX(${t / n})`);
	}
}
function eo(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map();
	for (let i of e) {
		if (i.kind !== "text" || !i.text) continue;
		let e = to(i);
		if (!e) continue;
		let a = i.text.width ?? i.origin.width, o = i.text.height ?? i.origin.height;
		if (!(a > 0 && o > 0)) continue;
		let s = i.matrix.tx + (i.text.x ?? i.origin.x) + a / 2, c = i.matrix.ty + (i.text.y ?? i.origin.y) + o / 2, l = `${e}|${Math.round(s / 2) * 2}|${Math.round(c / 2) * 2}`, u = a * o, d = t.get(l);
		if (!d) {
			t.set(l, {
				node: i,
				area: u
			});
			continue;
		}
		let f = u > d.area * 1.1 ? {
			node: i,
			area: u
		} : d, p = f.node === i ? d.node : i, m = Math.max(d.node.order, i.order);
		f.node.order < m && r.set(f.node.key, {
			...f.node,
			order: m
		}), f.node !== p && n.add(p.key), t.set(l, f);
	}
	return n.size ? e.filter((e) => !n.has(e.key)).map((e) => r.get(e.key) ?? e) : e;
}
function to(e) {
	let t = e.text;
	return t ? (t.staticLines?.length ? t.staticLines.map((e) => e.text.trim()).join("\n") : Ja(t.text ?? "")).replace(/\s+/g, " ").trim() : "";
}
function no(e) {
	let t = [], n = e.getAttribute("color"), r = e.getAttribute("face"), i = Number.parseFloat(e.getAttribute("size") ?? ""), a = Number.parseFloat(e.getAttribute("letterSpacing") ?? "");
	return n && /^#[0-9a-f]{6}$/i.test(n) && t.push(`color:${n}`), r && t.push(`font-family:${r.split(",").map((e) => `"${e.trim().replaceAll("\"", "\\\"")}"`).join(",")}`), Number.isFinite(i) && i > 0 && t.push(`font-size:${i}px`), Number.isFinite(a) && t.push(`letter-spacing:${a}px`), t.join(";");
}
function ro(e) {
	let t = String(e ?? "").toLowerCase();
	return t === "left" || t === "right" || t === "center" || t === "justify" ? t : "";
}
function io(e) {
	let t = String(e ?? "");
	return /^(https?:|mailto:)/i.test(t) ? t : "";
}
function ao(e) {
	return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");
}
//#endregion
//#region src/render/TextRenderer.ts
var oo = class {
	registered = /* @__PURE__ */ new Set();
	families = /* @__PURE__ */ new Map();
	style;
	cssRules = /* @__PURE__ */ new Set();
	loads = [];
	ready() {
		return Promise.allSettled(this.loads).then(() => void 0);
	}
	register(e) {
		let t = Object.values(e.assets ?? {}).filter((e) => e.kind === "font" && e.src), n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
		for (let e of t) {
			let t = e.src.split("/").pop() ?? "", i = e.fontName ?? t.replace(/\.ttf$/i, "").replace(/^\d+_/, "").trim();
			e.fontLoadable !== !1 && (co(n, i, `swf-font-${e.id}`, e.byteLength), co(r, lo(i), `swf-font-${e.id}`, e.byteLength));
		}
		for (let e of t) {
			if (e.kind !== "font" || !e.src) continue;
			let t = e.src.split("/").pop() ?? "", i = e.fontName ?? t.replace(/\.ttf$/i, "").replace(/^\d+_/, "").trim(), a = `swf-font-${e.id}`, o = e.fontLoadable === !1 ? (r.get(lo(i)) ?? n.get(i))?.family : void 0;
			if (this.families.set(e.id, `${o ? `"${o}", ` : ""}"${a}", "${i}", Arial, Helvetica, sans-serif`), e.fontLoadable === !1 || this.registered.has(e.id)) continue;
			this.registered.add(e.id);
			let s = encodeURI(P(e.src));
			if (this.addCssFace(a, s), typeof FontFace < "u" && typeof document.fonts?.add == "function") {
				let e = new FontFace(a, `url("${s}")`);
				this.loads.push(e.load().then((e) => document.fonts.add(e)).catch(() => {}));
			}
		}
	}
	resolveFamily(e) {
		if (e != null) return this.families.get(e);
	}
	addCssFace(e, t) {
		this.style || (this.style = document.createElement("style"), this.style.dataset.mmtourFonts = "true", document.head.append(this.style)), !this.cssRules.has(e) && (this.cssRules.add(e), this.style.append(`\n@font-face{font-family:"${so(e)}";src:url("${t}") format("truetype");font-weight:400;font-style:normal;font-display:block;}`));
	}
};
function so(e) {
	return e.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}
function co(e, t, n, r = 0) {
	let i = e.get(t);
	(!i || r > i.byteLength) && e.set(t, {
		family: n,
		byteLength: r
	});
}
function lo(e) {
	return e.toLowerCase().replace(/\b(lt|std|regular|medium|book|roman)\b/g, "").replace(/[^a-z0-9]+/g, "");
}
//#endregion
//#region src/player/avm1Properties.ts
var uo = [
	Y("_x", 0, "display", "readwrite", "number"),
	Y("_y", 1, "display", "readwrite", "number"),
	Y("_xscale", 2, "display", "readwrite", "number"),
	Y("_yscale", 3, "display", "readwrite", "number"),
	Y("_currentframe", 4, "movieclip", "read", "number"),
	Y("_totalframes", 5, "movieclip", "read", "number"),
	Y("_alpha", 6, "display", "readwrite", "number"),
	Y("_visible", 7, "display", "readwrite", "boolean"),
	Y("_width", 8, "display", "readwrite", "number"),
	Y("_height", 9, "display", "readwrite", "number"),
	Y("_rotation", 10, "display", "readwrite", "number"),
	Y("_target", 11, "movieclip", "read", "string"),
	Y("_framesloaded", 12, "movieclip", "read", "number"),
	Y("_name", 13, "display", "readwrite", "string"),
	Y("_droptarget", 14, "movieclip", "read", "string"),
	Y("_url", 15, "movieclip", "read", "string"),
	Y("_highquality", 16, "global", "readwrite", "number"),
	Y("_focusrect", 17, "global", "readwrite", "boolean"),
	Y("_soundbuftime", 18, "global", "readwrite", "number"),
	Y("_quality", 19, "global", "readwrite", "string"),
	Y("_xmouse", 20, "movieclip", "read", "number"),
	Y("_ymouse", 21, "movieclip", "read", "number")
], fo = [
	Y("enabled", void 0, "button", "readwrite", "boolean"),
	Y("text", void 0, "textfield", "readwrite", "string"),
	Y("htmlText", void 0, "textfield", "readwrite", "string", ["htmltext"]),
	Y("html", void 0, "textfield", "readwrite", "boolean"),
	Y("textColor", void 0, "textfield", "readwrite", "number", ["textcolor"]),
	Y("variable", void 0, "textfield", "readwrite", "string"),
	Y("selectable", void 0, "textfield", "readwrite", "boolean"),
	Y("type", void 0, "textfield", "readwrite", "string"),
	Y("wordWrap", void 0, "textfield", "readwrite", "boolean", ["wordwrap"]),
	Y("multiline", void 0, "textfield", "readwrite", "boolean")
], po = [...uo, ...fo];
new Map(po.filter((e) => e.index !== void 0).map((e) => [e.index, e]));
var mo = new Map(po.flatMap((e) => [[_o(e.canonicalName), e], ...e.aliases.map((t) => [_o(t), e])]));
function ho(e) {
	return mo.get(_o(e));
}
function go(e) {
	return ho(e)?.canonicalName;
}
function _o(e) {
	return e.trim().toLowerCase();
}
function Y(e, t, n, r, i, a = []) {
	return {
		canonicalName: e,
		index: t,
		aliases: a,
		owner: n,
		access: r,
		valueType: i
	};
}
//#endregion
//#region src/player/avm1.ts
function vo(e) {
	if (!e?.trim()) return [];
	let t = [], n = 0, r = "", i = 0;
	for (let a = 0; a < e.length; a++) {
		let o = e[a];
		if (r) {
			o === r && e[a - 1] !== "\\" && (r = "");
			continue;
		}
		o === "\"" || o === "'" ? r = o : o === "(" || o === "[" || o === "{" ? n++ : o === ")" || o === "]" || o === "}" ? n-- : o === "," && n === 0 && (t.push(e.slice(i, a)), i = a + 1);
	}
	return t.push(e.slice(i)), t;
}
function yo(e) {
	let t = e.trim();
	return /^[A-Za-z_$][\w$]*$/.test(t) && !/^(true|false|null|undefined|this|_root|_global|_parent|_level\d+)$/.test(t);
}
function bo(e, t) {
	let n = e;
	for (let [e, r] of Object.entries(t)) {
		if (r === void 0) continue;
		let t = typeof r == "string" ? JSON.stringify(r) : String(r);
		n = n.replace(RegExp(`\\b${e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"), t);
	}
	return n;
}
//#endregion
//#region src/player/types.ts
function xo(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
//#endregion
//#region src/player/renderNodes.ts
function So(e, t) {
	for (let n of e.childClips.values()) if (n.name === t) return n;
	return null;
}
function Co(e) {
	return e.kind === "sprite" && !!(e.timeline?.length || e.frames?.length);
}
function wo(e, t) {
	if (e.kind === "sprite" && e.frames?.length) {
		let n = t ? xo(t.currentFrame, 0, e.frames.length - 1) : 0;
		return e.frames[n] ?? "";
	}
	return e.kind === "button" ? e.states?.up?.src ?? e.src ?? "" : e.src ?? "";
}
function To(e) {
	let t = {};
	return e.visible !== void 0 && (t.visible = e.visible), e.blendMode !== void 0 && (t.blendMode = e.blendMode), e.filters !== void 0 && (t.filters = e.filters), e.cacheAsBitmap !== void 0 && (t.cacheAsBitmap = e.cacheAsBitmap), e.className !== void 0 && (t.className = e.className), e.clipActions !== void 0 && (t.clipActions = e.clipActions), t;
}
function Eo(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = (t.rm ?? 1) * (e.rm ?? 1), r = (t.gm ?? 1) * (e.gm ?? 1), i = (t.bm ?? 1) * (e.bm ?? 1), a = (t.am ?? 1) * (e.am ?? 1), o = (t.ra ?? 0) * (e.rm ?? 1) + (e.ra ?? 0), s = (t.ga ?? 0) * (e.gm ?? 1) + (e.ga ?? 0), c = (t.ba ?? 0) * (e.bm ?? 1) + (e.ba ?? 0), l = (t.aa ?? 0) * (e.am ?? 1) + (e.aa ?? 0);
	if (!(n === 1 && r === 1 && i === 1 && a === 1 && o === 0 && s === 0 && c === 0 && l === 0)) return {
		rm: n,
		gm: r,
		bm: i,
		am: a,
		ra: o,
		ga: s,
		ba: c,
		aa: l
	};
}
function Do(e, t, n, r, i, a, o, s, c = o.colorTransform) {
	return {
		key: e,
		order: t,
		characterId: n.id,
		kind: n.kind,
		name: o.name,
		src: r,
		origin: n.origin,
		matrix: i,
		opacity: a,
		colorTransform: c,
		...To(o),
		clipDepth: o.clipDepth,
		spriteFrame: s
	};
}
function Oo(e, t, n, r, i, a, o, s = 1, c, l = i.colorTransform) {
	let u = c === "down" ? n.states?.down ?? n.states?.over ?? n.states?.up : c === "over" ? n.states?.over ?? n.states?.up : n.states?.up, d = o || c ? u : void 0;
	return {
		key: e,
		order: t,
		characterId: n.id,
		kind: "button",
		name: i.name,
		src: d?.src ?? "",
		origin: d?.origin ?? n.origin,
		matrix: r,
		opacity: d?.src ? s : 1,
		colorTransform: l,
		...To(i),
		buttonOwnerPath: a
	};
}
//#endregion
//#region src/player/ClipInstance.ts
var X = class {
	characterId;
	parent;
	scriptKey;
	constructorRun = !1;
	name;
	currentFrame = 0;
	playing = !0;
	enteredFrame = -1;
	childClips = /* @__PURE__ */ new Map();
	dynamicInstances = /* @__PURE__ */ new Map();
	depthNames = /* @__PURE__ */ new Map();
	locals = {};
	props = {};
	leafProps = /* @__PURE__ */ new Map();
	mutatedLeaves = /* @__PURE__ */ new Set();
	displayListMutated = !1;
	visible;
	alpha;
	x;
	y;
	placedX = 0;
	placedY = 0;
	rotation;
	width;
	height;
	xscale;
	yscale;
	depthOverride;
	maskClip;
	loadedTimeline;
	loadedFrame = 0;
	loadedPlaying = !1;
	constructor(e, t, n) {
		this.characterId = e, this.name = t, this.parent = n;
	}
}, ko = void 0, Ao = class {
	steps = 0;
	host;
	budget;
	constructor(e, t = 5e6) {
		this.host = e, this.budget = t;
	}
	callFunction(e, t, n) {
		let r = Array(e.registerCount ?? 0), i = Object.create(null), a = e.flags ?? 0, o = 1;
		a & 1 && (r[o++] = n), a & 4 && (r[o++] = t), a & 16 && (r[o++] = this.host.getVar("super")), a & 64 && (r[o++] = this.host.getVar("_root")), a & 128 && (r[o++] = n?.__parent ?? this.host.getVar("_parent")), a & 256 && (r[o++] = this.host.getVar("_global"));
		for (let n = 0; n < e.params.length; n++) {
			let a = e.params[n];
			a.register ? r[a.register] = t[n] : i[a.name] = t[n];
		}
		if (!("arguments" in i)) {
			try {
				t.callee = e;
			} catch {}
			i.arguments = t;
		}
		return this.exec(e.body, {
			thisObj: n,
			registers: r,
			locals: i,
			label: Io(e)
		});
	}
	exec(e, t) {
		let n = [], r = /* @__PURE__ */ new Map(), i = 0;
		for (; i < e.length;) {
			if (++this.steps > this.budget) throw Error(this.branchError("avm1 budget exceeded", t, i, void 0, n));
			let a = e[i];
			switch (a.op) {
				case "ConstantPool": break;
				case "End": return ko;
				case "Push":
					for (let e of a.values ?? []) n.push(e.type === "register" ? t.registers[e.value] : e.value);
					break;
				case "Pop":
					n.pop();
					break;
				case "PushDuplicate":
					n.push(n[n.length - 1]);
					break;
				case "StackSwap": {
					let e = n.pop(), t = n.pop();
					n.push(e, t);
					break;
				}
				case "StoreRegister":
					t.registers[a.register] = n[n.length - 1];
					break;
				case "GetVariable": {
					let e = String(n.pop());
					n.push(this.getVar(t, e));
					break;
				}
				case "SetVariable": {
					let e = n.pop(), r = String(n.pop());
					this.setVar(t, r, e);
					break;
				}
				case "GetMember": {
					let e = String(n.pop()), t = n.pop();
					n.push(this.host.getMember(t, e));
					break;
				}
				case "SetMember": {
					let e = n.pop(), t = String(n.pop()), r = n.pop();
					this.host.setMember(r, t, e);
					break;
				}
				case "Delete": {
					let e = String(n.pop()), t = n.pop();
					n.push(this.host.deleteMember?.(t, e) ?? Lo(t, e));
					break;
				}
				case "Delete2": {
					let e = String(n.pop());
					n.push(this.deleteVar(t, e));
					break;
				}
				case "DefineLocal": {
					let e = n.pop(), r = String(n.pop());
					t.locals[r] = e;
					break;
				}
				case "DefineLocal2": {
					let e = String(n.pop());
					e in t.locals || (t.locals[e] = ko);
					break;
				}
				case "InitArray": {
					let e = Number(n.pop()) | 0, t = [];
					for (let r = 0; r < e; r++) t.push(n.pop());
					n.push(t);
					break;
				}
				case "InitObject": {
					let e = Number(n.pop()) | 0, t = {};
					for (let r = 0; r < e; r++) {
						let e = n.pop(), r = String(n.pop());
						t[r] = e;
					}
					n.push(t);
					break;
				}
				case "NewObject": {
					let e = String(n.pop()), t = Fo(n);
					n.push(this.host.construct(e, t));
					break;
				}
				case "NewMethod": {
					let e = n.pop(), t = n.pop(), r = Fo(n);
					n.push(this.newMethod(t, e, r));
					break;
				}
				case "Enumerate2": {
					let e = n.pop();
					n.push(null);
					for (let t of this.enumerate(e)) n.push(t);
					break;
				}
				case "Not":
					n.push(!No(n.pop()));
					break;
				case "And": {
					let e = n.pop(), t = n.pop();
					n.push(No(t) && No(e));
					break;
				}
				case "Or": {
					let e = n.pop(), t = n.pop();
					n.push(No(t) || No(e));
					break;
				}
				case "BitAnd": {
					let e = n.pop(), t = n.pop();
					n.push((Number(t) | 0) & (Number(e) | 0));
					break;
				}
				case "BitOr": {
					let e = n.pop(), t = n.pop();
					n.push(Number(t) | 0 | Number(e) | 0);
					break;
				}
				case "Equals":
				case "Equals2": {
					let e = n.pop(), t = n.pop();
					n.push(t == e);
					break;
				}
				case "StrictEquals": {
					let e = n.pop(), t = n.pop();
					n.push(t === e);
					break;
				}
				case "Less":
				case "Less2": {
					let e = n.pop(), t = n.pop();
					n.push(t < e);
					break;
				}
				case "Greater": {
					let e = n.pop(), t = n.pop();
					n.push(t > e);
					break;
				}
				case "StringEquals": {
					let e = n.pop(), t = n.pop();
					n.push(String(t) === String(e));
					break;
				}
				case "StringLess": {
					let e = n.pop(), t = n.pop();
					n.push(String(t) < String(e));
					break;
				}
				case "Add":
				case "Add2": {
					let e = n.pop(), t = n.pop();
					n.push(typeof t == "string" || typeof e == "string" ? Mo(t) + Mo(e) : Number(t) + Number(e));
					break;
				}
				case "StringAdd": {
					let e = n.pop(), t = n.pop();
					n.push(Mo(t) + Mo(e));
					break;
				}
				case "Subtract": {
					let e = n.pop(), t = n.pop();
					n.push(Number(t) - Number(e));
					break;
				}
				case "Multiply": {
					let e = n.pop(), t = n.pop();
					n.push(Number(t) * Number(e));
					break;
				}
				case "Divide": {
					let e = n.pop(), t = n.pop();
					n.push(Number(t) / Number(e));
					break;
				}
				case "Modulo": {
					let e = n.pop(), t = n.pop();
					n.push(Number(t) % Number(e));
					break;
				}
				case "Increment":
					n.push(Number(n.pop()) + 1);
					break;
				case "Decrement":
					n.push(Number(n.pop()) - 1);
					break;
				case "ToInteger":
					n.push(Number(n.pop()) | 0);
					break;
				case "ToNumber":
					n.push(Number(n.pop()));
					break;
				case "ToString":
					n.push(Mo(n.pop()));
					break;
				case "TypeOf":
					n.push(Po(n.pop()));
					break;
				case "Trace":
					n.pop();
					break;
				case "GetProperty": {
					let e = Number(n.pop()) | 0, t = n.pop();
					n.push(this.host.getProperty?.(t, e));
					break;
				}
				case "SetProperty": {
					let e = n.pop(), t = Number(n.pop()) | 0, r = n.pop();
					this.host.setProperty?.(r, t, e);
					break;
				}
				case "DefineFunction":
				case "DefineFunction2": {
					let e = {
						__avm1fn: !0,
						params: a.params ?? [],
						body: a.body ?? [],
						registerCount: a.registerCount,
						flags: a.flags,
						debugName: a.name
					};
					a.name ? this.setVar(t, a.name, e) : n.push(e);
					break;
				}
				case "Extends": {
					let e = n.pop();
					zo(n.pop(), e);
					break;
				}
				case "InstanceOf": {
					let e = n.pop(), t = n.pop();
					n.push(Bo(t, e));
					break;
				}
				case "CallFunction": {
					let e = String(n.pop()), r = Fo(n);
					n.push(this.callNamed(t, e, r));
					break;
				}
				case "CallMethod": {
					let e = n.pop(), t = n.pop(), r = Fo(n), i = e === ko || e === null || e === "" ? void 0 : String(e);
					n.push(this.callMethod(t, i, r));
					break;
				}
				case "Return": return n.pop();
				case "Jump": {
					let e = a.jumpTo ?? i + 1;
					this.checkBackwardBranch(r, t, i, e, n), i = e;
					continue;
				}
				case "If":
					if (No(n.pop())) {
						let e = a.jumpTo ?? i + 1;
						this.checkBackwardBranch(r, t, i, e, n), i = e;
						continue;
					}
					break;
				case "Stop":
				case "Play":
				case "GotoFrame":
				case "GotoFrame2":
				case "GotoLabel":
				case "SetTarget":
				case "SetTarget2": break;
				default: break;
			}
			i++;
		}
		return ko;
	}
	getVar(e, t) {
		return t === "this" ? e.thisObj : t in e.locals ? e.locals[t] : this.host.getVar(t);
	}
	setVar(e, t, n) {
		if (t in e.locals) {
			e.locals[t] = n;
			return;
		}
		this.host.setVar(t, n);
	}
	deleteVar(e, t) {
		return t in e.locals ? (delete e.locals[t], !0) : this.host.deleteVar?.(t) ?? !1;
	}
	enumerate(e) {
		let t = this.host.enumerate?.(e);
		if (t) return t;
		if (e == null) return [];
		if (Array.isArray(e)) return e.map((e, t) => String(t));
		if (typeof e == "object" || typeof e == "function") try {
			return Object.keys(e);
		} catch {
			return [];
		}
		return [];
	}
	callNamed(e, t, n) {
		let r = this.getVar(e, t);
		return Z(r) ? this.callFunction(r, n, e.thisObj) : this.host.callNamed(t, n, e.thisObj);
	}
	callMethod(e, t, n) {
		if (Z(e) && (t === "apply" || t === "call")) {
			let r = n[0], i = t === "apply" ? Array.isArray(n[1]) ? n[1] : n[1] == null ? [] : Array.from(n[1]) : n.slice(1);
			return this.callFunction(e, i, r);
		}
		if (typeof e == "function" && t === void 0) try {
			return e(...n);
		} catch {
			return;
		}
		if (typeof e == "function" && (t === "apply" || t === "call")) {
			let r = n[0], i = t === "apply" ? Array.isArray(n[1]) ? n[1] : n[1] == null ? [] : Array.from(n[1]) : n.slice(1);
			try {
				return e.apply(r, i);
			} catch {
				return;
			}
		}
		if (e != null && t !== void 0) {
			let r = this.host.getMember(e, t);
			if (Z(r)) return this.callFunction(r, n, e);
		}
		return this.host.callMethod(e, t, n);
	}
	newMethod(e, t, n) {
		let r = t == null || t === "" ? e : this.host.getMember(e, String(t));
		return this.host.instantiate(r, n);
	}
	checkBackwardBranch(e, t, n, r, i) {
		if (r > n) return;
		let a = `${n}->${r}`, o = (e.get(a) ?? 0) + 1;
		if (e.set(a, o), o > 2e5) throw Error(this.branchError("avm1 backward branch limit exceeded", t, n, r, i));
	}
	branchError(e, t, n, r, i) {
		return `${e}: function=${t.label}, opcode=${n}, target=${r ?? "n/a"}, stackTop=${Ro(i)}`;
	}
};
function Z(e) {
	return !!e && typeof e == "object" && e.__avm1fn === !0;
}
function jo(e) {
	if (!e || typeof e != "object") return;
	let t = e;
	return t.prototype ||= Object.create(null), t.prototype;
}
function Mo(e) {
	if (e == null) return "";
	if (typeof e == "object") try {
		return String(e);
	} catch {
		return "[object Object]";
	}
	return String(e);
}
function No(e) {
	return !(e == null || e === !1 || e === 0 || e === "" || typeof e == "number" && isNaN(e));
}
function Po(e) {
	return e === void 0 ? "undefined" : e === null ? "null" : Z(e) || typeof e == "function" ? "function" : Array.isArray(e) ? "object" : typeof e;
}
function Fo(e) {
	let t = Number(e.pop()) | 0, n = [];
	for (let r = 0; r < t; r++) n.push(e.pop());
	return n;
}
function Io(e) {
	let t = e.debugName || e.__fqn;
	return typeof t == "string" && t ? t : "<anonymous>";
}
function Lo(e, t) {
	if (e == null || typeof e != "object" && typeof e != "function") return !1;
	try {
		return delete e[t];
	} catch {
		return !1;
	}
}
function Ro(e) {
	return JSON.stringify(e.slice(-5).map((e) => e === void 0 ? "undefined" : e === null || typeof e == "string" || typeof e == "number" || typeof e == "boolean" ? e : Z(e) ? `[Function ${Io(e)}]` : Array.isArray(e) ? `[Array(${e.length})]` : typeof e == "object" ? e.__appClip ? "[MovieClip]" : e.__appText ? "[TextField]" : "[Object]" : String(e)));
}
function zo(e, t) {
	let n = jo(e), r = jo(t);
	if (!(!n || !r)) {
		Object.getPrototypeOf(n) !== r && Object.setPrototypeOf(n, r), n.__constructor ||= e, r.__constructor ||= t;
		try {
			e.__super = t;
		} catch {}
	}
}
function Bo(e, t) {
	if (t?.__nativeCtor === "Array") return Array.isArray(e);
	if (t?.__nativeCtor === "Object") return e !== null && (typeof e == "object" || typeof e == "function");
	if (!e || typeof e != "object" || !t || typeof t != "object") return !1;
	let n = jo(t);
	if (!n) return !1;
	let r = Object.getPrototypeOf(e);
	for (; r;) {
		if (r === n) return !0;
		r = Object.getPrototypeOf(r);
	}
	let i = e.__class, a = 0;
	for (; i && a++ < 40;) {
		if (i === t) return !0;
		let e = jo(i);
		if (!e) break;
		let n = Object.getPrototypeOf(e);
		if (!n) break;
		i = n.__constructor;
	}
	return !1;
}
//#endregion
//#region src/player/avm1App.ts
function Vo(e) {
	let t = 0, n = {
		__xmlNode: !0,
		nodeName: "#document",
		attributes: {},
		childNodes: []
	}, r = n, i = [n], a = (e, t) => e.childNodes.push({
		__xmlNode: !0,
		nodeName: "#text",
		nodeValue: t,
		attributes: {},
		childNodes: []
	});
	for (; t < e.length;) {
		if (e.startsWith("<!--", t)) {
			let n = e.indexOf("-->", t);
			t = n < 0 ? e.length : n + 3;
			continue;
		}
		if (e.startsWith("<![CDATA[", t)) {
			let n = e.indexOf("]]>", t);
			a(r, e.slice(t + 9, n)), t = n + 3;
			continue;
		}
		if (e.startsWith("<?", t)) {
			let n = e.indexOf("?>", t);
			t = n < 0 ? e.length : n + 2;
			continue;
		}
		if (e[t] === "<" && e[t + 1] === "/") {
			let n = e.indexOf(">", t);
			i.pop(), r = i[i.length - 1], t = n + 1;
			continue;
		}
		if (e[t] === "<") {
			let n = e.indexOf(">", t), a = e.slice(t + 1, n), o = a.endsWith("/");
			o && (a = a.slice(0, -1));
			let s = (a.match(/^([\w:.-]+)/) || [, a])[1], c = {}, l = /([\w:.-]+)\s*=\s*"([^"]*)"/g, u;
			for (; u = l.exec(a.slice(s.length));) c[u[1]] = u[2];
			let d = {
				__xmlNode: !0,
				nodeName: s,
				attributes: c,
				childNodes: []
			};
			r.childNodes.push(d), o || (i.push(d), r = d), t = n + 1;
			continue;
		}
		let n = e.indexOf("<", t), o = e.slice(t, n < 0 ? e.length : n);
		o.trim() && a(r, o), t = n < 0 ? e.length : n;
	}
	let o = (e) => {
		e.firstChild = e.childNodes[0] ?? null;
		for (let t = 0; t < e.childNodes.length; t++) e.childNodes[t].nextSibling = e.childNodes[t + 1] ?? null, o(e.childNodes[t]);
	};
	return o(n), n;
}
var Ho = (e) => !!e && e.__xmlNode === !0;
function Uo(e, t) {
	let n = [], r = (e) => {
		for (let i of e?.childNodes || []) i.nodeName === t && n.push(i), r(i);
	};
	return r(e), n;
}
function Wo(e, t) {
	return Uo(e, String(t).replace(/^\/+/, ""));
}
var Go = (e) => {
	if (e == null) return "";
	if (typeof e == "object") try {
		return String(e);
	} catch {
		return "";
	}
	return String(e);
}, Ko = (e) => !!e && e.__appClip === !0, qo = (e) => !!e && e.__appText === !0, Jo = new Set([
	"release",
	"releaseoutside",
	"rollover",
	"rollout",
	"press"
]), Yo = new Map([
	["onRelease", "release"],
	["onReleaseOutside", "releaseoutside"],
	["onRollOver", "rollover"],
	["onRollOut", "rollout"],
	["onPress", "press"]
]);
function Xo(e, t) {
	let n = e.initActions ?? [], r = e.frameBytecode ?? [], i = e.registeredClasses ?? {};
	if (!n.length || !r.length) return null;
	let a = Object.create(null), o = Object.create(null), s = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakSet(), l = /* @__PURE__ */ new WeakSet(), u = /* @__PURE__ */ new WeakMap(), d = t.root(), f = 1, p = 0, m = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Set(), _ = /* @__PURE__ */ new Set(), v = !1, y = () => {
		v || t.render();
	}, b = {}, x = (e, t, n) => {
		if (e && Z(e)) return b.vm.callFunction(e, t, n);
	}, S = (e) => {
		let t = jo(e);
		return t && !t.__constructor && (t.__constructor = e), t;
	}, C = (e, t) => {
		let n = S(e), r = 0;
		for (; n && r++ < 40;) {
			if (t in n) return n[t];
			n = Object.getPrototypeOf(n);
		}
	}, w = (e, t) => {
		let n = S(e), r = 0;
		for (; n && r++ < 40;) {
			if (n.__accessors && t in n.__accessors) return n.__accessors[t];
			n = Object.getPrototypeOf(n);
		}
	}, T = (e, t) => w(e, t)?.get ?? C(e, `__get__${t}`) ?? C(e, `get ${t}`), E = (e, t) => w(e, t)?.set ?? C(e, `__set__${t}`) ?? C(e, `set ${t}`), D = (e) => e.toLowerCase().replace(/\s+/g, " ").trim(), O = /* @__PURE__ */ new Map(), k = (e) => {
		let t = a;
		for (let n of e.split(".")) {
			if (t == null) return;
			t = t[n];
		}
		return Z(t) ? t : void 0;
	}, A = (e) => {
		let n = s.get(e);
		if (!n) {
			let r = t.linkageOf(e);
			if (r) {
				let e = i[r] ?? i[r.trim()];
				n = e && k(e) || o[r] || o[r.trim()] || O.get(D(r));
			}
			if (n && (s.set(e, n), c.has(e) || (c.add(e), t.setClipMethodDispatcher?.(e, (t, n) => M(e, t, n))), !l.has(e))) {
				l.add(e);
				try {
					x(n, [], e);
				} catch (e) {
					console.warn("[avm1App] placed-clip constructor failed", e);
				}
			}
		}
		return n;
	}, j = (e) => {
		let t = u.get(e);
		return t || (t = Object.create(null), u.set(e, t)), t;
	}, M = (e, t, n = []) => {
		if (!e || !t) return !1;
		if (Ko(e)) {
			let r = A(e), i = r ? C(r, t) : void 0;
			return i ? (x(i, n, e), y(), !0) : !1;
		}
		let r = e[t] ?? e.props?.[t];
		return Z(r) ? (x(r, n, e), y(), !0) : !1;
	}, N = (e, t) => {
		let n = t[0], r = String(t[1] ?? ""), i = Math.max(0, Number(t[2] ?? 0) || 0), a = f++;
		return e ? h.set(a, {
			period: Math.max(1, i),
			next: p + Math.max(1, i),
			target: n,
			method: r
		}) : m.set(a, {
			due: p + i,
			target: n,
			method: r
		}), a;
	}, ee = (e) => {
		let t = Number(e);
		m.delete(t), h.delete(t);
	}, te = (e) => {
		e.completed = !0, g.delete(e), e.target && e.prop && ce.setMember(e.target, e.prop, e.finish);
		let t = e.onMotionChanged;
		Z(t) && x(t, [e], e);
		let n = e.onMotionFinished;
		Z(n) && (e.completed = !1, x(n, [e], e)), y();
	}, ne = (e) => {
		let t = e[0], n = String(e[1] ?? ""), r = {
			__tween: !0,
			target: t,
			prop: n,
			easing: e[2],
			begin: Number(e[3]),
			finish: Number(e[4]),
			duration: Number(e[5] ?? 0),
			useSeconds: !!e[6],
			elapsed: 0,
			completed: !1,
			position: Number(e[3])
		};
		return !t || !n || !Number.isFinite(r.begin) || !Number.isFinite(r.finish) ? (r.completed = !0, t && n && Number.isFinite(r.finish) && ce.setMember(t, n, r.finish), r) : (ce.setMember(t, n, r.begin), !Number.isFinite(r.duration) || r.duration <= 0 ? (te(r), r) : (g.add(r), y(), r));
	}, re = (e, t) => {
		e.elapsed += e.useSeconds ? t / 1e3 : 1;
		let n = e.duration, r = Math.min(e.elapsed, n), i = e.finish - e.begin, a = e.begin + i * (n ? r / n : 1);
		if (Z(e.easing)) {
			let t = Number(x(e.easing, [
				r,
				e.begin,
				i,
				n
			], null));
			Number.isFinite(t) && (a = t);
		}
		e.position = a, ce.setMember(e.target, e.prop, a);
		let o = e.onMotionChanged;
		Z(o) && x(o, [e], e), e.elapsed >= n && te(e);
	}, ie = (e) => {
		let n = Number.isFinite(e) && e > 0 ? e : 50;
		p += n, v = !0;
		try {
			for (let [e, t] of [...m]) p >= t.due && (m.delete(e), M(t.target, t.method));
			for (let [, e] of [...h]) {
				let t = 0;
				for (; p >= e.next && t++ < 4;) e.next += e.period, M(e.target, e.method);
			}
			for (let e of [...g]) re(e, n);
			for (let e of [..._]) {
				let n = t.clipField(e, "onEnterFrame");
				Z(n) ? x(n, [], e) : _.delete(e);
			}
		} finally {
			v = !1;
		}
	}, ae = (e) => {
		for (let [n] of Yo) if (t.clipField(e, n)) return !0;
		let n = j(e);
		return Object.keys(n).some((e) => Jo.has(e.toLowerCase()) && n[e]?.length);
	}, oe = (e, n) => {
		let r = [...Yo.entries()].find(([, e]) => e === n)?.[0], i = r ? t.clipField(e, r) : void 0;
		if (i) {
			x(i, [{
				target: e,
				type: n
			}], e), t.render();
			return;
		}
		let a = j(e);
		for (let t of Object.keys(a)) {
			if (t.toLowerCase() !== n) continue;
			let r = {
				target: e,
				type: t
			};
			for (let n of a[t] || []) x(n, [r], e);
		}
		t.render();
	}, se = (e) => {
		if (ae(e)) {
			t.setClipField(e, "__appPointerEvents", !0), t.setPointerEventHandler?.(e, (t) => oe(e, t));
			return;
		}
		t.setClipField(e, "__appPointerEvents", void 0), t.setPointerEventHandler?.(e, void 0);
	}, ce = {
		getVar(e) {
			if (e === "_global") return a;
			if (e === "_root" || e === "_level0" || e === "this") return d;
			if (e in a) return a[e];
		},
		setVar(e, t) {
			a[e] = t;
		},
		getMember(e, n) {
			if (e != null && !(n === "addEventListener" || n === "removeEventListener" || n === "dispatchEvent") && !((n === "selectNodes" || n === "selectSingleNode") && e.__fqn === "com.xfactorstudio.xml.xpath.XPath")) {
				if (Z(e)) return n === "prototype" ? S(e) : n in e ? e[n] : void 0;
				if (qo(e)) return n === "text" || n === "htmlText" ? t.getText(e) : t.getTextProp?.(e, n) ?? e[n];
				if (Ko(e)) {
					let r = A(e), i = r ? T(r, n) : void 0;
					if (i) return x(i, [], e);
					if (t.hasClipField(e, n)) return t.clipField(e, n);
					let a = t.child(e, n);
					if (a !== void 0) return Ko(a) && !s.has(a) && A(a), a;
					if (r) {
						let e = C(r, n);
						if (e !== void 0) return e;
					}
					return t.getClipProp(e, n);
				}
				if (Ho(e)) return e[n];
				if (typeof e == "string" || e instanceof String) {
					if (n === "length") return Go(e).length;
					let t = String.prototype[n];
					return typeof t == "function" ? (...n) => t.apply(Go(e), n) : void 0;
				}
				if (Array.isArray(e)) {
					let t = e[n];
					return typeof t == "function" ? (...n) => t.apply(e, n) : t;
				}
				if (e.__class) {
					if (e.props && n in e.props) return e.props[n];
					if (n in e) return e[n];
					let t = C(e.__class, n);
					return t === void 0 ? void 0 : t;
				}
				try {
					return e[n];
				} catch {
					return;
				}
			}
		},
		setMember(e, n, r) {
			if (e != null) {
				if (e.__tween) {
					e[n] = r, n === "onMotionFinished" && e.completed && r && (e.completed = !1, x(r, [], e), t.render());
					return;
				}
				if (Z(e)) {
					e[n] = r;
					return;
				}
				if (qo(e)) {
					if (n === "text" || n === "htmlText") {
						t.setText(e, Go(r), n === "htmlText");
						return;
					}
					t.setTextProp?.(e, n, r), e[n] = r;
					return;
				}
				if (Ko(e)) {
					let i = A(e), a = i ? E(i, n) : void 0;
					if (a) {
						x(a, [r], e);
						return;
					}
					if (n.startsWith("_")) {
						t.setClipProp(e, n, r);
						return;
					}
					t.setClipField(e, n, r), n === "onEnterFrame" && (Z(r) ? _.add(e) : _.delete(e)), Yo.has(n) && se(e);
					return;
				}
				try {
					e[n] = r;
				} catch {}
			}
		},
		deleteMember(e, n) {
			if (e == null) return !1;
			if (Z(e)) try {
				return delete e[n];
			} catch {
				return !1;
			}
			if (qo(e)) try {
				return delete e[n];
			} catch {
				return !1;
			}
			if (Ko(e)) return t.setClipField(e, n, void 0), n === "onEnterFrame" && _.delete(e), Yo.has(n) && se(e), !0;
			try {
				return delete e[n];
			} catch {
				return !1;
			}
		},
		deleteVar(e) {
			return e in a ? (delete a[e], !0) : !1;
		},
		enumerate(e) {
			if (e == null) return [];
			if (Ho(e)) return Object.keys(e).filter((t) => e[t] !== void 0);
			if (Ko(e)) {
				let n = /* @__PURE__ */ new Set();
				for (let t of Object.keys(e || {})) n.add(t);
				for (let r of Object.keys(e.props || {})) t.clipField(e, r) !== void 0 && n.add(r);
				return [...n];
			}
			if (e.props && typeof e.props == "object") return Object.keys(e.props).filter((t) => e.props[t] !== void 0);
			try {
				return Object.keys(e).filter((t) => e[t] !== void 0);
			} catch {
				return [];
			}
		},
		construct(e, t) {
			if (e === "Object") return Object.create(null);
			if (e === "Array") return t.length === 1 && typeof t[0] == "number" ? Array(t[0]) : [...t];
			if (e === "XML" || e === "LoadVars") return {
				__xml: !0,
				props: Object.create(null),
				ignoreWhite: !0
			};
			if (e === "mx.transitions.Tween" || e.endsWith(".Tween")) return ne(t);
			let n = String(e).split("."), r = a;
			for (let e of n) r = r?.[e];
			return this.instantiate(r, t);
		},
		instantiate(e, t) {
			let n = typeof e?.__fqn == "string" ? e.__fqn : "";
			if (n === "mx.transitions.Tween" || n.endsWith(".Tween")) return ne(t);
			if (!Z(e)) return Object.create(null);
			let r = Object.create(null);
			return r.props = Object.create(null), r.__class = e, x(e, t, r), r;
		},
		callNamed(e, t) {
			switch (e) {
				case "parseInt": return parseInt(t[0], 10);
				case "parseFloat": return parseFloat(t[0]);
				case "Number": return Number(t[0]);
				case "String": return String(t[0] ?? "");
				case "Boolean": return !!t[0];
				case "Array": return t.length === 1 && typeof t[0] == "number" ? Array(t[0]) : [...t];
				case "Object": return Object.create(null);
				case "getTimer": return p;
				case "setTimeout": return N(!1, t);
				case "setInterval": return N(!0, t);
				case "clearInterval":
				case "clearTimeout":
					ee(t[0]);
					return;
				case "updateAfterEvent":
				case "trace":
				case "ASSetPropFlags":
				case "getURL": return;
				default: return;
			}
		},
		callMethod(e, n, r) {
			if (e == null || n === void 0) return;
			if (n === "addEventListener") {
				let t = String(r[0]), n = j(e);
				n[t] = [...n[t] || [], r[1]], Ko(e) && Jo.has(t.toLowerCase()) && se(e);
				return;
			}
			if (n === "removeEventListener") {
				let t = String(r[0]), n = j(e);
				n[t]?.length && (n[t] = n[t].filter((e) => e !== r[1])), Ko(e) && Jo.has(t.toLowerCase()) && se(e);
				return;
			}
			if (n === "dispatchEvent") {
				let t = r[0], n = String(t?.type ?? "");
				for (let r of j(e)[n] || []) x(r, [t], e);
				return;
			}
			if ((n === "setTimeout" || n === "setInterval") && e === a) return N(n === "setInterval", r);
			if ((n === "clearTimeout" || n === "clearInterval") && e === a) {
				ee(r[0]);
				return;
			}
			if (n === "addProperty") return (e.__accessors ??= Object.create(null))[String(r[0])] = {
				get: r[1],
				set: r[2]
			}, !0;
			if (e.__xml) return n === "load" ? (t.fetchText(String(r[0]), (n) => {
				let r = n == null ? null : Vo(n);
				e.firstChild = r, e.childNodes = r?.childNodes, e.loaded = !0;
				let i = e.onLoad ?? e.props?.onLoad;
				try {
					i && x(i, [!0], e);
				} catch (e) {
					console.warn("[avm1App] XML onLoad failed", e);
				} finally {
					t.render();
				}
			}), !0) : void 0;
			if (e.__fqn === "com.xfactorstudio.xml.xpath.XPath") {
				let e = Wo(r[0], String(r[1]));
				return n === "selectNodes" ? e : e[0];
			}
			if (Ho(e)) {
				if (n === "selectNodes") return Wo(e, String(r[0]));
				if (n === "selectSingleNode") return Wo(e, String(r[0]))[0];
			}
			if (qo(e) && n === "setTextFormat") {
				let n = r[0], i = n && typeof n == "object" ? {
					...n,
					...n.props ?? {}
				} : {};
				t.setTextFormat?.(e, i), y();
				return;
			}
			if (typeof e == "string" || e instanceof String) {
				let t = Go(e);
				switch (n) {
					case "split": return t.split(Go(r[0]), r[1] === void 0 ? void 0 : Number(r[1]));
					case "substr": return t.substr(Number(r[0] ?? 0), r[1] === void 0 ? void 0 : Number(r[1]));
					case "substring": return t.substring(Number(r[0] ?? 0), r[1] === void 0 ? void 0 : Number(r[1]));
					case "indexOf": return t.indexOf(Go(r[0]), r[1] === void 0 ? void 0 : Number(r[1]));
					case "charAt": return t.charAt(Number(r[0] ?? 0));
					case "toUpperCase": return t.toUpperCase();
					case "toLowerCase": return t.toLowerCase();
					case "slice": return t.slice(Number(r[0] ?? 0), r[1] === void 0 ? void 0 : Number(r[1]));
					default: return;
				}
			}
			if (Array.isArray(e)) {
				let t = e[n];
				return typeof t == "function" ? t.apply(e, r) : void 0;
			}
			if (n === "registerClass") return o[String(r[0])] = r[1], !0;
			if (Ko(e)) switch (n) {
				case "attachMovie": {
					let n = t.attachMovie(e, String(r[0]), String(r[1]), Number(r[2] ?? t.nextDepth(e)));
					return n && A(n), n ?? Object.create(null);
				}
				case "createEmptyMovieClip": return t.createEmptyMovieClip(e, String(r[0]), Number(r[1] ?? t.nextDepth(e)));
				case "removeMovieClip":
				case "unloadMovie":
					t.removeClip?.(e);
					return;
				case "createTextField": return t.createEmptyMovieClip(e, String(r[0]), Number(r[2] ?? t.nextDepth(e)));
				case "getNextHighestDepth": return t.nextDepth(e);
				case "getBytesLoaded":
				case "getBytesTotal": return 100;
				case "gotoAndPlay":
				case "gotoAndStop":
				case "play":
				case "stop":
				case "nextFrame":
				case "prevFrame": return t.timelineCommand?.(e, n, r[0]) ?? void 0;
				case "startDrag": {
					let n = r.length >= 5;
					t.startDrag?.(e, n ? {
						left: Number(r[1]),
						top: Number(r[2]),
						right: Number(r[3]),
						bottom: Number(r[4])
					} : void 0);
					return;
				}
				case "stopDrag":
					t.stopDrag?.(e);
					return;
				case "swapDepths":
					t.swapDepths?.(e, r[0]);
					return;
				default: return;
			}
			let i = this.getMember(e, n);
			if (Z(i)) return x(i, r, e);
		},
		getProperty() {
			return 0;
		},
		setProperty() {}
	}, le = new Ao(ce, 6e7);
	b.vm = le, a.Object = {
		__nativeCtor: "Object",
		prototype: Object.create(null)
	}, a.Array = {
		__nativeCtor: "Array",
		prototype: Object.create(null)
	}, a.MovieClip = {
		__nativeCtor: "MovieClip",
		prototype: Object.create(null)
	}, a._global = a;
	for (let e of n) try {
		le.callFunction({
			__avm1fn: !0,
			params: [],
			body: e,
			registerCount: 256,
			flags: 0
		}, [], d);
	} catch {}
	let ue = /* @__PURE__ */ new WeakSet(), de = (e, t, n = 0) => {
		if (!(!e || typeof e != "object" || n > 8 || ue.has(e))) {
			ue.add(e);
			for (let r of Object.keys(e)) {
				if (r === "_global" || r === "_root" || r === "_level0") continue;
				let i = e[r];
				if (i && typeof i == "object") {
					let e = t ? t + "." + r : r;
					Z(i) && !i.__fqn && (i.__fqn = e), de(i, e, n + 1);
				}
			}
		}
	};
	de(a, "");
	let fe = !1;
	for (let e of r) try {
		le.callFunction({
			__avm1fn: !0,
			params: [],
			body: e.ops,
			registerCount: 256,
			flags: 0
		}, [], d), fe = !0;
	} catch {}
	for (let e of Object.keys(o)) O.set(D(e), o[e]);
	return t.render(), fe ? { enterFrame: ie } : null;
}
//#endregion
//#region src/player/conditions.ts
function Zo(e, t) {
	if (!e) return !0;
	let n = e.trim();
	return n === "" || n === "else" || n === "true" ? !0 : n === "false" ? !1 : Qo(n, t);
}
function Qo(e, t) {
	let n = os(e, "||");
	return n.length > 1 ? n.some((e) => $o(e, t)) : $o(e, t);
}
function $o(e, t) {
	let n = os(e, "&&");
	return n.length > 1 ? n.every((e) => es(e, t)) : es(e, t);
}
function es(e, t) {
	let n = e.trim();
	for (; n.startsWith("(") && cs(n) === n.length - 1;) n = n.slice(1, -1).trim();
	if (os(n, "||").length > 1) return Qo(n, t);
	if (os(n, "&&").length > 1) return $o(n, t);
	if (n.startsWith("!")) return !es(n.slice(1), t);
	for (let e of [
		"==",
		"!=",
		"<=",
		">=",
		"<",
		">"
	]) {
		let r = ss(n, e);
		if (r >= 0) return ts(ns(n.slice(0, r), t), ns(n.slice(r + e.length), t), e);
	}
	return is(ns(n, t));
}
function ts(e, t, n) {
	if (e == null && t == null) {
		if (n === "==") return !0;
		if (n === "!=") return !1;
	}
	let r = as(e), i = as(t);
	if (r !== void 0 && i !== void 0) switch (n) {
		case "==": return r === i;
		case "!=": return r !== i;
		case "<": return r < i;
		case ">": return r > i;
		case "<=": return r <= i;
		case ">=": return r >= i;
	}
	let a = e === void 0 ? "" : String(e), o = t === void 0 ? "" : String(t);
	switch (n) {
		case "==": return a === o;
		case "!=": return a !== o;
		case "<": return a < o;
		case ">": return a > o;
		case "<=": return a <= o;
		case ">=": return a >= o;
		default: return !1;
	}
}
function ns(e, t) {
	let n = e.trim();
	if (n === "") return;
	let r = rs(n, "eval");
	if (r !== void 0) {
		let e = ns(r, t);
		return e === void 0 ? void 0 : t.get(String(e));
	}
	return n.startsWith("\"") && n.endsWith("\"") || n.startsWith("'") && n.endsWith("'") ? n.slice(1, -1) : n === "true" ? !0 : n === "false" ? !1 : n === "null" ? null : /^-?\d+(\.\d+)?$/.test(n) ? Number(n) : t.get(n);
}
function rs(e, t) {
	let n = `${t}(`;
	if (!e.startsWith(n) || !e.endsWith(")")) return;
	let r = e.slice(t.length);
	if (cs(r) === r.length - 1) return r.slice(1, -1).trim();
}
function is(e) {
	return e != null && e !== !1 && e !== 0 && e !== "" && e !== "0";
}
function as(e) {
	if (typeof e == "number") return e;
	if (typeof e == "boolean") return +!!e;
	if (typeof e == "string" && /^-?\d+(\.\d+)?$/.test(e.trim())) return Number(e);
}
function os(e, t) {
	let n = [], r = 0, i = "", a = 0;
	for (let o = 0; o <= e.length - t.length; o++) {
		let s = e[o];
		if (i) {
			s === i && (i = "");
			continue;
		}
		s === "\"" || s === "'" ? i = s : s === "(" ? r++ : s === ")" ? r-- : r === 0 && e.startsWith(t, o) && (n.push(e.slice(a, o)), o += t.length - 1, a = o + 1);
	}
	return n.push(e.slice(a)), n.map((e) => e.trim()).filter((e) => e.length > 0);
}
function ss(e, t) {
	let n = 0, r = "";
	for (let i = 0; i <= e.length - t.length; i++) {
		let a = e[i];
		if (r) {
			a === r && (r = "");
			continue;
		}
		if (a === "\"" || a === "'") r = a;
		else if (a === "(") n++;
		else if (a === ")") n--;
		else if (n === 0 && e.startsWith(t, i)) {
			if ((t === "<" || t === ">") && e[i + 1] === "=") continue;
			return i;
		}
	}
	return -1;
}
function cs(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(") t++;
	else if (e[n] === ")" && (t--, t === 0)) return n;
	return -1;
}
//#endregion
//#region src/player/matrix.ts
var ls = {
	a: 1,
	b: 0,
	c: 0,
	d: 1,
	tx: 0,
	ty: 0
};
function us(e, t) {
	return {
		a: e.a * t.a + e.c * t.b,
		b: e.b * t.a + e.d * t.b,
		c: e.a * t.c + e.c * t.d,
		d: e.b * t.c + e.d * t.d,
		tx: e.a * t.tx + e.c * t.ty + e.tx,
		ty: e.b * t.tx + e.d * t.ty + e.ty
	};
}
//#endregion
//#region src/player/Ticker.ts
var ds = class e {
	fps;
	state = { t: 0 };
	tween;
	lastTick = -1;
	onTick;
	static HORIZON = 1e7;
	constructor(t, n) {
		this.fps = t, this.onTick = n, this.tween = va.to(this.state, {
			t: e.HORIZON,
			duration: e.HORIZON / t,
			ease: "none",
			paused: !0,
			onUpdate: () => this.emit()
		});
	}
	emit() {
		let e = Math.round(this.state.t);
		e !== this.lastTick && (this.lastTick = e, this.onTick(e));
	}
	play() {
		this.tween.play();
	}
	pause() {
		this.tween.pause();
	}
	get isPlaying() {
		return this.tween.isActive();
	}
	get tick() {
		return Math.round(this.state.t);
	}
	seek(e) {
		this.state.t = e, this.tween.pause(e / this.fps, !1), this.lastTick = -1, this.emit();
	}
	destroy() {
		this.tween.kill();
	}
}, fs = /^_(?:level\d+|root|parent)\./;
function ps(e) {
	let t = e.trim();
	for (; fs.test(t);) t = t.replace(fs, "");
	return t;
}
var ms = class {
	values = /* @__PURE__ */ new Map();
	seed(e) {
		if (e) for (let [t, n] of Object.entries(e)) {
			let e = ps(t);
			!this.values.has(e) && hs(n) && this.values.set(e, n);
		}
	}
	get(e) {
		return this.values.get(ps(e));
	}
	set(e, t) {
		this.values.set(ps(e), t);
	}
	has(e) {
		return this.values.has(ps(e));
	}
	reset() {
		this.values.clear();
	}
};
function hs(e) {
	return e === null || typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "object";
}
//#endregion
//#region src/player/Player.ts
var gs = new Set([
	"gotoAndPlay",
	"gotoAndStop",
	"play",
	"stop",
	"nextFrame",
	"prevFrame"
]), _s = new Set(["waitForVal", "startTimer"]), vs = new Set(["markSnd", "markSndSegment"]), ys = /^_level[1-9]\d*\b/i, bs = "__avm1OwnerClip", xs = "__avm1OwnerProperty", Ss = -1, Cs = 24, ws = 8, Ts = 3, Es = {
	x: 0,
	y: 0,
	width: 0,
	height: 0
}, Ds = class {
	timeline;
	renderer;
	options;
	ticker;
	destroyed = !1;
	dataApp = null;
	assets;
	linkageAssetIds = /* @__PURE__ */ new Map();
	linkageClassKeys = /* @__PURE__ */ new Map();
	rootFrames;
	startFrame;
	rootStop;
	rootActions = /* @__PURE__ */ new Map();
	spriteActions = /* @__PURE__ */ new Map();
	spriteStop = /* @__PURE__ */ new Map();
	functions = /* @__PURE__ */ new Map();
	methodFunctions = /* @__PURE__ */ new Map();
	spriteFunctions = /* @__PURE__ */ new Map();
	store;
	textVars = /* @__PURE__ */ new Map();
	textOverrides = /* @__PURE__ */ new Map();
	clipTextOverrides = /* @__PURE__ */ new WeakMap();
	textTranslator;
	explicitLeafProps = /* @__PURE__ */ new WeakMap();
	boundTextVars = /* @__PURE__ */ new Set();
	pendingClipCommands = /* @__PURE__ */ new Map();
	voWaiting = !1;
	soundObjectTargets = /* @__PURE__ */ new Set();
	soundBindings = /* @__PURE__ */ new Map();
	buttonVisualStates = /* @__PURE__ */ new Map();
	latentButtonPlacementsCache = /* @__PURE__ */ new Map();
	soundSegmentDurations = /* @__PURE__ */ new Map();
	root;
	clipByPath = /* @__PURE__ */ new Map();
	lastNodes = [];
	hasAnyDynamicInstances = !1;
	functionReentry = /* @__PURE__ */ new Map();
	runtimeTimers = /* @__PURE__ */ new Set();
	activeDrag;
	constructor(e, t, n = {}) {
		this.timeline = e, this.renderer = t, this.options = n, this.textTranslator = n.translateText, this.assets = e.assets ?? {};
		for (let e of Object.values(this.assets)) for (let t of e.linkageNames ?? []) this.linkageAssetIds.set(_c(t), e.id);
		for (let [t, n] of Object.entries(e.control?.registeredClasses ?? {})) {
			let e = nc(n.split(".").pop() ?? n);
			e && this.linkageClassKeys.set(_c(t), e);
		}
		for (let e of Object.values(this.assets)) {
			let t = e?.text?.normalizedVariableName;
			t && this.boundTextVars.add(ps(t));
		}
		for (let t of Object.values(e.control?.dynamicTexts ?? {})) {
			let e = t?.normalizedVariableName;
			e && this.boundTextVars.add(ps(e));
		}
		this.rootFrames = e.frames ?? [], this.rootStop = new Set(e.control?.stopFrames ?? []), this.startFrame = xo(n.startFrame ?? e.entryFrame ?? 0, 0, Math.max(0, this.rootFrames.length - 1));
		for (let t of e.control?.frameActions ?? []) {
			let e = (t.actions ?? []).filter((e) => !e.executionContext || e.executionContext === "timeline" || e.executionContext === "branch");
			e.length && this.rootActions.set(t.frame, [...this.rootActions.get(t.frame) ?? [], ...e]);
		}
		for (let t of e.control?.spriteActions ?? []) {
			if (typeof t.spriteId != "number" || typeof t.frame != "number") continue;
			let e = (t.actions ?? []).filter((e) => !e.executionContext || e.executionContext === "timeline" || e.executionContext === "branch");
			if (!e.length) continue;
			let n = `${t.spriteId}:${t.frame}`;
			this.spriteActions.set(n, [...this.spriteActions.get(n) ?? [], ...e]);
		}
		this.store = n.store, this.buildFunctionTable(), this.buildSoundSegmentDurations(), this.ticker = new ds(e.fps || 20, () => this.onTick()), this.root = this.buildRoot(this.startFrame), this.primeAmbientSound(), this.render(), this.tryRunDataDrivenApp();
	}
	tryRunDataDrivenApp() {
		let e = this.timeline.control;
		if (!e?.initActions?.length || !e?.frameBytecode?.length) return;
		let t = this.options.awaitFonts?.();
		if (t) {
			t.then(() => this.runDataDrivenAppNow(e)).catch(() => this.runDataDrivenAppNow(e));
			return;
		}
		this.runDataDrivenAppNow(e);
	}
	runDataDrivenAppNow(e) {
		if (this.destroyed) return;
		let t = Math.max(0, ...e.frameBytecode.map((e) => Number(e.frame) || 0));
		this.root.currentFrame !== t && (this.root = this.buildRoot(t));
		let n = /* @__PURE__ */ new Map();
		for (let [e, t] of Object.entries(this.timeline.linkage ?? {})) n.has(t) || n.set(t, e);
		for (let e of Object.values(this.assets)) {
			let t = e.linkageNames;
			!t?.length || n.has(e.id) || n.set(e.id, t[0]);
		}
		try {
			this.dataApp = Xo(e, this.makeAppBridge(n));
		} catch (e) {
			console.warn("[avm1App] data-driven app bootstrap failed", e);
		}
	}
	makeAppBridge(e) {
		let t = (e) => (e.__appClip = !0, e), n = (e) => e;
		return {
			root: () => t(this.root),
			child: (e, r) => {
				let i = n(e), a = So(i, r) ?? this.findClipByName(i, r);
				if (a) return t(a);
				if (this.findTextChildByName(i, r) !== void 0) return {
					__appText: !0,
					clip: e,
					field: r
				};
			},
			attachMovie: (e, r, i, a) => {
				let o = this.attachMovieByLinkage(n(e), r, i, a);
				return o ? t(o) : void 0;
			},
			createEmptyMovieClip: (e, r, i) => t(this.createEmptyClip(n(e), r, i)),
			removeClip: (e) => this.removeMovieClip(n(e)),
			setText: (e, t, r) => {
				let i = n(e.clip), a = this.findTextChildByName(i, e.field);
				if (a === void 0) return;
				let o = this.textOverrideFor({
					id: a,
					owner: i,
					name: e.field
				});
				o.text = t, o.html = r, i.mutatedLeaves.add(e.field);
			},
			getText: (e) => {
				let t = n(e.clip), r = this.findTextChildByName(t, e.field);
				return r === void 0 ? "" : String(this.clipTextOverrides.get(t)?.get(e.field)?.text ?? this.textOverrides.get(r)?.text ?? "");
			},
			getTextProp: (e, t) => this.getAppTextProp(n(e.clip), e.field, go(t) ?? t),
			setTextProp: (e, t, r) => {
				let i = n(e.clip);
				this.setLeafDisplayProp(i, e.field, go(t) ?? t, r);
			},
			setTextFormat: (e, t) => {
				let r = n(e.clip), i = this.findTextChildByName(r, e.field);
				i !== void 0 && (Object.assign(this.textOverrideFor({
					id: i,
					owner: r,
					name: e.field
				}), Ns(t)), r.mutatedLeaves.add(e.field));
			},
			getClipProp: (e, t) => this.getAppClipProp(n(e), go(t) ?? t),
			setClipProp: (e, t, r) => {
				Fs(n(e), go(t) ?? t, r);
			},
			clipField: (e, t) => n(e).props[t],
			setClipField: (e, t, r) => {
				let i = n(e);
				r == null ? delete i.props[t] : i.props[t] = r;
			},
			hasClipField: (e, t) => Object.prototype.hasOwnProperty.call(n(e).props, t),
			linkageOf: (t) => e.get(n(t).characterId),
			nextDepth: (e) => this.nextHighestDepth(n(e)),
			render: () => this.render(),
			fetchText: (e, t) => {
				fetch(P(e)).then((e) => e.ok && !/\btext\/html\b/i.test(e.headers.get("content-type") ?? "") ? e.text() : null).then(t).catch(() => t(null));
			},
			setPointerEventHandler: (e, t) => {
				let r = n(e);
				t ? r.props.__appPointerDispatcher = t : delete r.props.__appPointerDispatcher;
			},
			timelineCommand: (e, t, r) => this.runAppClipTimelineCommand(n(e), t, r),
			setClipMethodDispatcher: (e, t) => {
				let r = n(e);
				t ? r.props.__appMethodDispatcher = t : delete r.props.__appMethodDispatcher;
			},
			startDrag: (e, t) => this.beginDrag(n(e), t?.left, t?.top, t?.right, t?.bottom),
			stopDrag: (e) => this.stopDragClip(e ? n(e) : void 0),
			swapDepths: (e, t) => this.swapDepths(n(e), typeof t == "number" ? t : n(t))
		};
	}
	attachMovieByLinkage(e, t, n, r) {
		let i = this.linkageAssetIds.get(_c(t));
		if (!i || !this.getAsset(i) || !Number.isFinite(r)) return;
		e.dynamicInstances.set(r, {
			depth: r,
			characterId: i,
			placedFrame: e.currentFrame,
			matrix: { ...ls },
			opacity: 1,
			name: n
		}), this.hasAnyDynamicInstances = !0, e.displayListMutated = !0, e.depthNames.set(r, n);
		let a = new X(i, n, e);
		return a.scriptKey = this.clipSourceKey(this.getAsset(i), n), e.childClips.set(qs(r), a), this.enterFrame(a, 0, 0), a;
	}
	createEmptyClip(e, t, n) {
		e.dynamicInstances.set(n, {
			depth: n,
			characterId: 0,
			placedFrame: e.currentFrame,
			matrix: { ...ls },
			opacity: 1,
			name: t
		}), this.hasAnyDynamicInstances = !0, e.displayListMutated = !0, e.depthNames.set(n, t);
		let r = new X(0, t, e);
		return e.childClips.set(qs(n), r), r;
	}
	runAppClipTimelineCommand(e, t, n) {
		switch (t) {
			case "play": return e.playing = !0, this.render(), !0;
			case "stop": return e.playing = !1, this.render(), !0;
			case "nextFrame": {
				let t = this.framesFor(e);
				return t?.length ? (e.playing = !1, this.enterFrame(e, Math.min(t.length - 1, e.currentFrame + 1), 0), this.render(), !0) : !1;
			}
			case "prevFrame": return e.playing = !1, this.enterFrame(e, Math.max(0, e.currentFrame - 1), 0), this.render(), !0;
			case "gotoAndPlay":
			case "gotoAndStop": {
				let r = this.resolveClipFrame(e, n ?? 1);
				return r < 0 ? !1 : (e.playing = t === "gotoAndPlay", this.enterFrame(e, r, 0), this.render(), !0);
			}
			default: return !1;
		}
	}
	getAppClipProp(e, t) {
		if (this.shouldUseLiveClipBounds(e) && (t === "_width" && e.width === void 0 || t === "_height" && e.height === void 0)) {
			let n = this.liveClipBounds(e);
			if (t === "_width" && n) return n.width;
			if (t === "_height" && n) return n.height;
		}
		return Mc(e, t, this.getAsset(e.characterId));
	}
	getAppTextProp(e, t, n) {
		let r = this.leafDisplayProps(e, t);
		if (this.explicitLeafProps.get(r)?.has(n)) return r[n];
		if (n === "_x" || n === "_y") {
			let r = this.textLeafPlacement(e, t);
			return r ? n === "_x" ? r.matrix.tx : r.matrix.ty : void 0;
		}
		let i = this.findTextChildByName(e, t), a = i === void 0 ? void 0 : this.getAsset(i);
		if (!a || a.kind !== "text") return;
		let o = this.resolveTextField(a.id, a, e, t), s = this.liveTextMetrics(a, o, r);
		switch (n) {
			case "_width":
			case "textWidth": return s.width;
			case "_height":
			case "textHeight": return s.height;
			case "textColor": return Number.parseInt((o?.color ?? "#000000").replace(/^#/, ""), 16);
			default: return;
		}
	}
	liveClipBounds(e) {
		let t = this.framesFor(e)?.[e.currentFrame], n = [];
		for (let r of this.instancesForFrame(e, t)) {
			let t = this.getAsset(r.characterId);
			if (!t) continue;
			let i = r.name ? e.leafProps.get(r.name) : void 0, a = e.childClips.get(r.depth), o = t.origin;
			if (t.kind === "text" && e.mutatedLeaves.has(r.name ?? "")) {
				let n = this.resolveTextField(t.id, t, e, r.name), a = this.liveTextMetrics(t, n, i);
				o = {
					...o,
					width: a.width,
					height: a.height
				};
			} else if (a && this.subtreeHasMutatedContent(a)) {
				let e = this.liveClipBounds(a);
				e && (e.width || e.height) ? o = {
					...o,
					width: e.width,
					height: e.height
				} : i && (o = Ws(t, i));
			} else i && (o = Ws(t, i));
			!o.width && !o.height || n.push(Gs(o, Hs(r.matrix, a)));
		}
		if (!n.length) return;
		let r = Math.min(...n.map((e) => e.x)), i = Math.min(...n.map((e) => e.y)), a = Math.max(...n.map((e) => e.x + e.width)), o = Math.max(...n.map((e) => e.y + e.height));
		return {
			width: Math.max(0, a - r),
			height: Math.max(0, o - i)
		};
	}
	shouldUseLiveClipBounds(e) {
		return this.subtreeHasMutatedContent(e);
	}
	subtreeHasMutatedContent(e) {
		if (e.mutatedLeaves.size > 0 || e.displayListMutated) return !0;
		for (let t of e.childClips.values()) if (this.subtreeHasMutatedContent(t)) return !0;
		return !1;
	}
	setLeafDisplayProp(e, t, n, r) {
		if (n === "textColor") {
			let n = this.findTextChildByName(e, t);
			if (n !== void 0) {
				let i = this.textOverrideFor({
					id: n,
					owner: e,
					name: t
				}), a = Ps(r);
				a ? i.color = a : delete i.color, e.mutatedLeaves.add(t);
			}
			return;
		}
		let i = this.leafDisplayProps(e, t);
		r == null ? delete i[n] : i[n] = r;
		let a = this.explicitLeafProps.get(i);
		a || (a = /* @__PURE__ */ new Set(), this.explicitLeafProps.set(i, a)), r == null ? a.delete(n) : a.add(n), e.mutatedLeaves.add(t);
	}
	liveTextMetrics(e, t, n) {
		let r = e.text?.width ?? e.origin.width ?? 0, i = e.text?.height ?? e.origin.height ?? 0;
		if (!t) return {
			width: r,
			height: i
		};
		let a = Number(t.fontHeight), o = Number(t.lineHeight), s = this.lineHeightBase(t.fontId ?? e.text?.fontId, a), c = Math.max(1, Number.isFinite(o) && o > 0 ? o : Number.isFinite(s) && s > 0 ? s + Number(t.leading ?? 0) : i || 12), l = n?.autoSize === void 0 ? !1 : Is(n.autoSize), u = this.measureTextWidthPx(t.text ?? "", Number(t.fontHeight), t.fontId ?? e.text?.fontId), d = u == null ? Pc(t.text ?? "", t.fontHeight, r, l) : l ? u + 4 : Math.max(r, u), f = Math.max(1, r || d), p = Math.max(1, Math.floor(f / Math.max(1, c * .62))), m = Nc(t.text ?? "").trim(), h = m ? m.split(/\r?\n/).length : 1, g = t.wordWrap && m ? this.measureWrappedHeightPx(m, a, t.fontId ?? e.text?.fontId, Math.max(1, f - 4), c) : void 0, _;
		if (g != null && g > 0) {
			let e = Number(t.leading ?? 0);
			_ = Math.max(c, g - e);
		} else {
			let e = t.wordWrap && m ? u != null && u > 0 ? Math.max(1, Math.ceil(u / f)) : Math.ceil(m.length / p) : 1;
			_ = Math.max(c, Math.max(h, e) * c);
		}
		return {
			width: d,
			height: l ? _ + 4 : Math.max(i, _)
		};
	}
	measureDiv;
	wrappedHeightCache = /* @__PURE__ */ new Map();
	measureWrappedHeightPx(e, t, n, r, i) {
		if (typeof document > "u" || typeof document.createElement != "function" || !Number.isFinite(t) || t <= 0 || !(r > 0)) return;
		let a = this.options.resolveFontFamily?.(n);
		if (!a) return;
		let o = Nc(e);
		if (!o.trim()) return 0;
		let s = a.split(",")[0].trim().replace(/^["']|["']$/g, "");
		try {
			if (document.fonts && !document.fonts.check(`${t}px "${s}"`)) return;
		} catch {
			return;
		}
		let c = `${n}|${Math.round(r)}|${Math.round(i)}|${t}|${o}`, l = this.wrappedHeightCache.get(c);
		if (l !== void 0) return l;
		let u = this.measureDiv;
		u || (u = document.createElement("div"), u.style.cssText = "position:absolute;visibility:hidden;left:-99999px;top:0;white-space:pre-wrap;margin:0;padding:0;border:0", (document.body ?? document.documentElement).appendChild(u), this.measureDiv = u), u.style.fontFamily = a, u.style.fontSize = `${t}px`, u.style.lineHeight = `${i}px`, u.style.width = `${r}px`, u.textContent = o;
		let d = u.offsetHeight;
		return d > 0 && this.wrappedHeightCache.set(c, d), d;
	}
	measureCtx;
	measureTextWidthPx(e, t, n) {
		if (typeof document > "u" || typeof document.createElement != "function" || !Number.isFinite(t) || t <= 0) return;
		let r = this.options.resolveFontFamily?.(n);
		if (!r) return;
		let i = Nc(e);
		if (!i.trim()) return 0;
		let a = r.split(",")[0].trim().replace(/^["']|["']$/g, "");
		try {
			if (document.fonts && !document.fonts.check(`${t}px "${a}"`)) return;
		} catch {
			return;
		}
		this.measureCtx === void 0 && (this.measureCtx = document.createElement("canvas").getContext("2d"));
		let o = this.measureCtx;
		if (!o) return;
		o.font = `${t}px ${r}`;
		let s = 0;
		for (let e of i.split(/\r?\n/)) {
			let t = o.measureText(e.replace(/\s+$/, "")).width;
			t > s && (s = t);
		}
		return s;
	}
	fontLineHeightCache = /* @__PURE__ */ new Map();
	measureFontLineHeightPx(e, t) {
		if (typeof document > "u" || typeof document.createElement != "function" || !Number.isFinite(t) || t <= 0) return;
		let n = this.options.resolveFontFamily?.(e);
		if (!n) return;
		let r = n.split(",")[0].trim().replace(/^["']|["']$/g, ""), i = `${r}|${t}`, a = this.fontLineHeightCache.get(i);
		if (a !== void 0) return a ?? void 0;
		try {
			if (document.fonts && !document.fonts.check(`${t}px "${r}"`)) return;
		} catch {
			return;
		}
		this.measureCtx === void 0 && (this.measureCtx = document.createElement("canvas").getContext("2d"));
		let o = this.measureCtx;
		if (!o) return;
		o.font = `${t}px ${n}`;
		let s = o.measureText("Mg"), c = (s.fontBoundingBoxAscent ?? 0) + (s.fontBoundingBoxDescent ?? 0), l = Number.isFinite(c) && c > 0 ? c : null;
		return this.fontLineHeightCache.set(i, l), l ?? void 0;
	}
	lineHeightBase(e, t) {
		return this.hasAnyDynamicInstances ? this.measureFontLineHeightPx(e, t) ?? t : t;
	}
	get frameCount() {
		return Math.max(1, this.rootFrames.length);
	}
	get currentFrame() {
		return this.root.currentFrame;
	}
	get rootClip() {
		return this.root;
	}
	get isPlaying() {
		return this.ticker.isPlaying;
	}
	currentLabel() {
		let e = this.rootFrames[this.root.currentFrame];
		if (e?.label) return e.label;
		let t = this.timeline.labels ?? {};
		return Object.entries(t).find(([, e]) => e === this.root.currentFrame)?.[0] ?? "";
	}
	debugNodes() {
		return this.lastNodes;
	}
	play() {
		this.ticker.play();
	}
	pause() {
		this.ticker.pause();
	}
	toggle() {
		this.ticker.isPlaying ? this.pause() : this.play();
	}
	seekRootFrame(e) {
		this.ticker.pause(), this.voWaiting = !1, this.clearRuntimeTimers(), this.buttonVisualStates.clear(), this.root = this.buildRoot(xo(e, 0, this.frameCount - 1)), this.render(), this.options.onFrame?.(this.root.currentFrame, !1);
	}
	restart() {
		this.seekRootFrame(this.startFrame), this.primeAmbientSound();
	}
	destroy() {
		this.destroyed = !0, this.dataApp = null, this.ticker.destroy(), this.clearRuntimeTimers(), this.buttonVisualStates.clear(), this.renderer.clear();
	}
	handleButtonEvent(e, t, n, r) {
		this.beginRenderBatch();
		try {
			this.setButtonVisualState(r ?? `${e}:${t}`, n);
			let i = this.clipByPath.get(e) ?? this.root, a = this.buttonEventScope(i, t), o = this.buttonActionFor(i, t, n), s = this.companionButtonActions(i, t, n);
			if (this.options.onButton) {
				let r = o ? {
					command: o.command,
					target: o.target,
					label: o.label,
					swf: o.swf,
					level: o.level == null ? void 0 : Number(o.level)
				} : void 0;
				if (this.options.onButton(t, e, n, r) === !0) {
					this.render();
					return;
				}
			}
			if (!o) {
				this.dispatchMovieClipPointerEvent(i, n), this.render();
				return;
			}
			for (let e of o.assignments ?? []) {
				let t = this.resolveExpr(e.rawValue ?? String(e.value ?? ""));
				e.target && t !== void 0 && !As(e.target, t) && this.scopeSet(i, e.target, t);
			}
			let c = (e) => !e || e === "self" || e === "this" || e === "_root" || e === "_level0" || e === "_parent", l = this.buttonCallableActions(o, (e) => {
				if (e.functionName !== o.command || !c(e.target)) return !1;
				let t = (e.arguments ?? "").trim().replace(/^["']|["']$/g, "");
				if (o.label && t === o.label) return !0;
				let n = Number(t);
				return typeof o.frame == "number" && Number.isFinite(n) && (n - 1 === o.frame || n === o.frame);
			});
			if (l?.length && this.runCallFunctions({
				...o,
				functionCalls: l
			}, i, void 0, a), (o.command === "loadMovieNum" || o.command === "loadMovie") && this.options.onNavigate?.(o), o.command === "fsCommand" && this.options.onFsCommand?.(String(o.value ?? ""), o.arguments ?? ""), o.command !== "loadMovieNum" && o.command !== "loadMovie") {
				let e = o.loads?.length ? o.loads : o.swf ? [{
					swf: o.swf,
					level: o.level
				}] : [];
				for (let t of e) this.options.onNavigate?.({
					command: "loadMovie",
					swf: t.swf,
					level: t.level,
					reload: !0
				});
			}
			if (o.command === "gotoAndPlay" || o.command === "gotoAndStop") {
				let e = this.resolveTarget(i, o.target) ?? this.resolveTarget(a, o.target), t = this.resolveFrame(o, e);
				e && t >= 0 && (e.playing = o.command === "gotoAndPlay", this.enterFrame(e, t, 0));
			}
			for (let e of s) this.runCompanionButtonAction(e.owner, e.characterId, e.action);
			this.render();
		} finally {
			this.endRenderBatch();
		}
	}
	handlePointerDrag(e, t) {
		let n = this.activeDrag;
		if (!n) return;
		let r = xo(Number(n.clip.x ?? 0) + e, n.left ?? -Infinity, n.right ?? Infinity), i = xo(Number(n.clip.y ?? 0) + t, n.top ?? -Infinity, n.bottom ?? Infinity);
		Number.isFinite(r) && (n.clip.x = r), Number.isFinite(i) && (n.clip.y = i), this.render();
	}
	buttonActionFor(e, t, n) {
		if (n === "releaseOutside") return;
		let r = this.timeline.control?.buttonActions?.[String(t)]?.[n];
		if (r) return r;
		let i = this.buttonTextFieldSignature(t);
		if (!i) return;
		let a = this.framesFor(e);
		if (!a?.length) return;
		let o;
		for (let r = 0; r < a.length; r += 1) {
			let s = Math.abs(r - e.currentFrame);
			if (!(o && s > o.distance)) for (let e of a[r]?.instances ?? []) {
				if (e.characterId === t || this.buttonTextFieldSignature(e.characterId) !== i) continue;
				let r = this.timeline.control?.buttonActions?.[String(e.characterId)]?.[n];
				r && (!o || s < o.distance) && (o = {
					action: r,
					distance: s
				});
			}
		}
		return o?.action;
	}
	companionButtonActions(e, t, n) {
		if (n === "release" || n === "releaseOutside") return [];
		let r = this.timeline.control?.buttonActions ?? {}, i = r[String(t)], a = rc(i?.release);
		if (!i || !a) return [];
		let o = [], s = e.parent ?? e;
		for (let [c, l] of Object.entries(r)) {
			let r = Number(c);
			if (!Number.isFinite(r) || r === t) continue;
			let u = n, d = l[u];
			if (!d || rc(l.release) !== a || !ic(i, l) || !ac(i[u], d)) continue;
			let f = this.findButtonOwnerClip(s, r) ?? this.findButtonOwnerClip(this.root, r);
			!f || f === e || o.push({
				owner: f,
				characterId: r,
				action: d
			});
		}
		return o;
	}
	runCompanionButtonAction(e, t, n) {
		let r = this.buttonEventScope(e, t);
		for (let t of n.assignments ?? []) {
			let n = this.resolveExpr(t.rawValue ?? String(t.value ?? ""));
			t.target && n !== void 0 && !As(t.target, n) && this.scopeSet(e, t.target, n);
		}
		let i = this.buttonCallableActions(n);
		if (i?.length && this.runCallFunctions({
			...n,
			functionCalls: i
		}, e, void 0, r), n.command !== "gotoAndPlay" && n.command !== "gotoAndStop") return;
		let a = this.resolveTarget(e, n.target) ?? this.resolveTarget(r, n.target), o = this.resolveFrame(n, a);
		a && o >= 0 && (a.playing = n.command === "gotoAndPlay", this.enterFrame(a, o, 0));
	}
	buttonCallableActions(e, t = () => !1) {
		let n = e.functionCalls;
		return e.command !== "gotoAndPlay" && e.command !== "gotoAndStop" ? n : (n ?? []).filter((e) => !t(e));
	}
	findButtonOwnerClip(e, t) {
		if (this.clipOwnsButton(e, t)) return e;
		for (let n of e.childClips.values()) {
			let e = this.findButtonOwnerClip(n, t);
			if (e) return e;
		}
		return null;
	}
	clipOwnsButton(e, t) {
		return (this.framesFor(e)?.[e.currentFrame])?.instances?.some((e) => e.characterId === t && this.getAsset(e.characterId)?.kind === "button") ? !0 : this.latentButtonPlacements(e).some((e) => e.characterId === t);
	}
	buttonEventScope(e, t) {
		return new X(t, "", e);
	}
	setButtonVisualState(e, t) {
		switch (t) {
			case "rollOver":
				this.buttonVisualStates.get(e) !== "down" && this.buttonVisualStates.set(e, "over");
				break;
			case "press":
				this.buttonVisualStates.set(e, "down");
				break;
			case "release":
				this.buttonVisualStates.set(e, "over");
				break;
			case "releaseOutside":
			case "rollOut":
				this.buttonVisualStates.delete(e);
				break;
		}
	}
	buttonTextFieldSignature(e) {
		let t = this.getAsset(e);
		return t?.kind !== "button" || !t.textFields?.length ? "" : t.textFields.map((e) => e.id).sort((e, t) => e - t).join("|");
	}
	buildFunctionTable() {
		let e = this.timeline.control, t = () => ({
			parameters: [],
			actions: [],
			body: [],
			calls: []
		});
		for (let n of Object.values(e?.definedFunctions ?? {})) {
			let e = n?.functionName;
			if (!e) continue;
			let r = this.functions.get(e) ?? t();
			n.parameters?.length && (r.parameters = n.parameters), n.actions?.length && r.actions.push(...n.actions), n.body?.length && r.body.push(...n.body), n.calls?.length && r.calls.push(...n.calls), this.functions.set(e, r);
			let i = ec(n.source);
			if (i) {
				let r = $s(i, e), a = this.methodFunctions.get(r) ?? t();
				n.parameters?.length && (a.parameters = n.parameters), n.actions?.length && a.actions.push(...n.actions), n.body?.length && a.body.push(...n.body), n.calls?.length && a.calls.push(...n.calls), this.methodFunctions.set(r, a);
			}
		}
		for (let n of e?.frameActions ?? []) for (let e of n.actions ?? []) {
			if (!e.functionName) continue;
			let n = this.functions.get(e.functionName) ?? t();
			n.actions.push(e), this.functions.set(e.functionName, n);
		}
		for (let n of Object.values(e?.definedFunctions ?? {})) {
			if (n.scope !== "sprite" || typeof n.spriteId != "number" || !n.functionName) continue;
			if (n.actions?.length) {
				let e = this.spriteFunctions.get(n.spriteId);
				e || this.spriteFunctions.set(n.spriteId, e = /* @__PURE__ */ new Map());
				let r = e.get(n.functionName) ?? t();
				r.actions.push(...n.actions), e.set(n.functionName, r);
				continue;
			}
			let e = (n.body ?? []).filter((e) => e.kind === "call" && !!e.functionName?.startsWith("gotoAnd") && (!e.target || e.target === "self" || e.target === "this") || e.kind === "assign" && yo(e.target));
			if (!e.length) continue;
			let r = this.spriteFunctions.get(n.spriteId);
			r || this.spriteFunctions.set(n.spriteId, r = /* @__PURE__ */ new Map());
			let i = r.get(n.functionName) ?? t();
			for (let t of e) {
				if (t.kind === "assign") {
					i.actions.push({
						command: "setVariable",
						target: t.target,
						value: t.value,
						rawValue: t.rawValue,
						functionBranchCondition: t.branchCondition
					});
					continue;
				}
				let e = (t.arguments ?? "").trim(), n = Number(e);
				i.actions.push({
					command: t.functionName,
					target: "self",
					...Number.isFinite(n) && e !== "" ? { frame: n - 1 } : { label: e.replace(/^["']|["']$/g, "") },
					...t.branchCondition ? { functionBranchCondition: t.branchCondition } : {}
				});
			}
			r.set(n.functionName, i);
		}
		let n = this.timeline.control?.spriteActions ?? [];
		for (let e of n) if (typeof e.spriteId == "number") for (let n of e.actions ?? []) {
			if (!n.functionName) continue;
			let r = this.spriteFunctions.get(e.spriteId);
			r || this.spriteFunctions.set(e.spriteId, r = /* @__PURE__ */ new Map());
			let i = r.get(n.functionName) ?? t();
			i.actions.push(n), r.set(n.functionName, i);
		}
	}
	hasFunction(e) {
		return this.functions.has(e);
	}
	callFunction(e, t, n) {
		let r = this.functions.get(e);
		return r ? this.callFunctionDef(e, r, t, n, this.root) : !1;
	}
	callFunctionDef(e, t, n, r, i, a = i) {
		let o = this.functionReentry.get(e) ?? 0;
		if (o >= ws) return !1;
		this.functionReentry.set(e, o + 1);
		try {
			let e = this.bindParams(t.parameters, n, r, a), o = this.functionActionDecisions(t.actions, e), s = this.functionBodyDecisions(t.body, e, i), c = new Set(t.body.filter((e, t) => s[t] && e.kind === "assign").map((e) => hc(e.rawValue)).filter((e) => !!e)), l = new Set([...c, ...t.body.filter((e, t) => s[t] && e.kind === "call").map((e) => e.functionName)]);
			for (let n of t.calls) l.has(n.functionName) || this.runFunctionCall(n, i, e);
			let u = new Set(t.body.filter((e, t) => s[t] && e.kind === "call").map((t) => this.bodySoundCallKey(t, e)).filter((e) => !!e));
			return t.actions.forEach((t, n) => {
				if (!o[n]) return;
				let r = t.functionCalls ?? [];
				if (t.command === "callFunctions" && r.length > 0 && r.every((e) => l.has(e.functionName))) return;
				let a = pc(t);
				a && u.has(a) || this.runFunctionAction(t, e, i);
			}), this.runFunctionBody(t.body, e, s, i), this.render(), !0;
		} finally {
			o ? this.functionReentry.set(e, o) : this.functionReentry.delete(e);
		}
	}
	functionActionDecisions(e, t) {
		let n = e.map(() => !0);
		if (!this.store) return n;
		let r = (e) => e === "else", i = (e) => !e || this.evalGuard(bo(e, t));
		for (let t = 0; t < e.length;) {
			if (!e[t].functionBranchCondition) {
				t += 1;
				continue;
			}
			let a = t;
			for (; a < e.length && e[a].functionBranchCondition;) a += 1;
			let o = e.slice(t, a).some((e) => !r(e.functionBranchCondition) && i(e.functionBranchCondition));
			for (let s = t; s < a; s += 1) {
				let t = e[s].functionBranchCondition;
				n[s] = r(t) ? !o : i(t);
			}
			t = a;
		}
		return n;
	}
	bindParams(e, t, n, r = this.root) {
		let i = {};
		if (!e.length) return i;
		let a = this.parseArgs(t, n, r);
		return e.forEach((e, t) => {
			i[e] = a[t];
		}), i;
	}
	parseArgs(e, t, n = this.root) {
		return vo(e).map((e) => this.resolveExpr(e.trim(), t, n));
	}
	getTimer() {
		return performance.now();
	}
	resolveExpr(e, t, n = this.root) {
		let r = e.trim();
		if (r === "") return;
		for (; r.startsWith("(") && tl(r) === r.length - 1;) r = r.slice(1, -1).trim();
		if (r === "undefined") return;
		if (r === "null") return null;
		if (r === "_global.Infinity" || r === "Infinity") return Infinity;
		if (r === "NaN") return NaN;
		let i = Sc(r);
		if (i) return this.resolveExpr(this.evalRuntimeCondition(i.condition, t ?? {}, n) ? i.whenTrue : i.whenFalse, t, n);
		if (r === "getTimer()") return this.getTimer();
		if (r === "Math.random()") return Math.random();
		if (r === "new Object()") return {};
		if (r === "new Array()" || r === "[]") return [];
		if (r === "new MovieClipLoader()") return {
			__avm1Type: "MovieClipLoader",
			listeners: []
		};
		let a = Q(r, "new Array");
		if (a !== void 0) return this.parseArgs(a, t, n);
		if (r.startsWith("{") && r.endsWith("}")) return this.resolveObjectLiteral(r, t, n);
		let o = Q(r, "parseInt");
		if (o !== void 0) {
			let e = this.resolveExpr(o, t, n), r = Number.parseInt(String(e ?? ""), 10);
			return Number.isFinite(r) ? r : void 0;
		}
		let s = Q(r, "parseFloat");
		if (s !== void 0) {
			let e = this.resolveExpr(s, t, n), r = Number.parseFloat(String(e ?? ""));
			return Number.isFinite(r) ? r : void 0;
		}
		let c = Q(r, "Number");
		if (c !== void 0) return Number(this.resolveExpr(c, t, n) ?? 0);
		let l = Q(r, "String");
		if (l !== void 0) return String(this.resolveExpr(l, t, n) ?? "");
		let u = Q(r, "Boolean");
		if (u !== void 0) return Is(this.resolveExpr(u, t, n) ?? !1);
		let d = Q(r, "Math.floor");
		if (d !== void 0) return Math.floor(Number(this.resolveExpr(d, t, n) ?? 0));
		let f = Q(r, "Math.ceil");
		if (f !== void 0) return Math.ceil(Number(this.resolveExpr(f, t, n) ?? 0));
		let p = Q(r, "Math.round");
		if (p !== void 0) return Math.round(Number(this.resolveExpr(p, t, n) ?? 0));
		let m = Q(r, "Math.abs");
		if (m !== void 0) return Math.abs(Number(this.resolveExpr(m, t, n) ?? 0));
		if (r.startsWith("typeof ")) return $c(this.resolveExpr(r.slice(7).trim(), t, n));
		let h = wc(r);
		if (h) {
			let [e, r] = this.parseArgs(h.arguments, t, n);
			return h.name === "selectNodes" ? Wc(e, String(r ?? "")) : Wc(e, String(r ?? ""))[0];
		}
		let g = Tc(r);
		if (g) {
			let [e, r] = this.parseArgs(g.arguments, t, n), i = g.name === "selectNodes" ? Wc(e, String(r ?? "")) : Wc(e, String(r ?? ""))[0];
			for (let e of bc(g.memberPath)) if (i instanceof X) i = this.resolveClipMember(i, e);
			else if (Array.isArray(i)) i = e === "length" ? i.length : i[Number(this.resolveExpr(e, t, n) ?? e)];
			else if (Hc(i)) i = Gc(i, e);
			else if ($(i)) i = i[e];
			else return;
			return vc(i) ? i : void 0;
		}
		let _ = Fc(r);
		if (_) return {
			__avm1Delegate: !0,
			target: this.resolveValueTarget(n, _.target, t),
			method: _.method.split(".").pop() ?? _.method
		};
		if (r === "new XML()") return { __avm1Type: "XML" };
		let v = Ec(r);
		if (v) return this.createTweenObject(v.arguments, t, n);
		let y = Q(r, "setInterval");
		if (y !== void 0) return this.createInterval(y, t, n);
		let b = this.constructObject(r, t, n);
		if (b) return b;
		let x = Cc(r, "toUpperCase");
		if (x) {
			let e = x.target ? this.resolveValueTarget(n, x.target, t) : void 0;
			return e === void 0 ? void 0 : String(e).toUpperCase();
		}
		let S = Cc(r, "split");
		if (S) {
			let e = S.target ? this.resolveValueTarget(n, S.target, t) : void 0, [r] = this.parseArgs(S.arguments, t, n);
			return e === void 0 ? void 0 : String(e).split(String(r ?? ""));
		}
		let C = Cc(r, "substring");
		if (C) {
			let e = C.target ? this.resolveValueTarget(n, C.target, t) : void 0, [r, i] = this.parseArgs(C.arguments, t, n);
			return e === void 0 ? void 0 : String(e).substring(Number(r ?? 0), i === void 0 ? void 0 : Number(i));
		}
		let w = Cc(r, "substr");
		if (w) {
			let e = w.target ? this.resolveValueTarget(n, w.target, t) : void 0, [r, i] = this.parseArgs(w.arguments, t, n);
			return e === void 0 ? void 0 : String(e).substr(Number(r ?? 0), i === void 0 ? void 0 : Number(i));
		}
		let T = Cc(r, "charCodeAt");
		if (T) {
			let e = T.target ? this.resolveValueTarget(n, T.target, t) : void 0, [r] = this.parseArgs(T.arguments, t, n);
			return e === void 0 ? void 0 : String(e).charCodeAt(Number(r ?? 0));
		}
		let E = Cc(r, "indexOf");
		if (E) {
			let e = E.target ? this.resolveValueTarget(n, E.target, t) : void 0, [r, i] = this.parseArgs(E.arguments, t, n);
			return e === void 0 ? void 0 : String(e).indexOf(String(r ?? ""), i === void 0 ? void 0 : Number(i));
		}
		let D = Cc(r, "join");
		if (D) {
			let e = D.target ? this.resolveValueTarget(n, D.target, t) : void 0, [r] = this.parseArgs(D.arguments, t, n);
			return Array.isArray(e) ? e.map((e) => e == null ? "" : String(e)).join(String(r ?? ",")) : void 0;
		}
		let O = Cc(r, "splice");
		if (O) {
			let e = O.target ? this.resolveValueTarget(n, O.target, t) : void 0, [r, i, ...a] = this.parseArgs(O.arguments, t, n);
			return Array.isArray(e) ? e.splice(Number(r ?? 0), i === void 0 ? e.length : Number(i), ...a) : void 0;
		}
		let k = Cc(r, "pop");
		if (k) {
			let e = k.target ? this.resolveValueTarget(n, k.target, t) : void 0;
			return Array.isArray(e) ? e.pop() : void 0;
		}
		let A = Cc(r, "reverse");
		if (A) {
			let e = A.target ? this.resolveValueTarget(n, A.target, t) : void 0;
			return Array.isArray(e) ? e.reverse() : void 0;
		}
		let j = Cc(r, "concat");
		if (j) {
			let e = j.target ? this.resolveValueTarget(n, j.target, t) : void 0, r = this.parseArgs(j.arguments, t, n);
			return Array.isArray(e) ? e.concat(...r) : e === void 0 ? void 0 : String(e).concat(...r.map((e) => String(e ?? "")));
		}
		let M = Cc(r, "toString");
		if (M) {
			let e = M.target ? this.resolveValueTarget(n, M.target, t) : void 0;
			return e === void 0 ? void 0 : String(e);
		}
		let N = Cc(r, "attachMovie");
		if (N) {
			let e = N.target ? this.resolveValueTarget(n, N.target, t) : n;
			return e instanceof X ? this.attachMovie(e, N.arguments, t) : void 0;
		}
		let ee = Cc(r, "createEmptyMovieClip");
		if (ee) {
			let e = ee.target ? this.resolveValueTarget(n, ee.target, t) : n;
			return e instanceof X ? this.createEmptyMovieClip(e, ee.arguments, t) : void 0;
		}
		if (Q(r, "getNextHighestDepth") !== void 0) return this.nextHighestDepth(n);
		if (/\.getNextHighestDepth\s*\(\s*\)$/.test(r)) {
			let e = r.replace(/\.getNextHighestDepth\s*\(\s*\)$/, ""), i = this.resolveValueTarget(n, e, t);
			return i instanceof X ? this.nextHighestDepth(i) : void 0;
		}
		let te = Zc(r, "+");
		if (te.length > 1) {
			let e = te.map((e) => this.resolveExpr(e, t, n));
			if (e.some((e) => typeof e == "string")) return e.map((e) => e === void 0 ? "" : String(e)).join("");
			let r = e.reduce((e, t) => e + Number(t ?? 0), 0);
			return Number.isFinite(r) ? r : void 0;
		}
		if (r.startsWith("-") && !/^-?\d+(\.\d+)?$/.test(r)) {
			let e = Number(this.resolveExpr(r.slice(1), t, n) ?? 0);
			return Number.isFinite(e) ? -e : void 0;
		}
		if (!r.startsWith("-")) {
			let e = Zc(r, "-");
			if (e.length > 1) {
				let [r, ...i] = e.map((e) => Number(this.resolveExpr(e, t, n) ?? 0)), a = i.reduce((e, t) => e - t, r);
				return Number.isFinite(a) ? a : void 0;
			}
		}
		for (let e of [
			"*",
			"/",
			"%"
		]) {
			let i = Zc(r, e);
			if (i.length <= 1) continue;
			let a = i.map((e) => Number(this.resolveExpr(e, t, n) ?? 0)), o = a.slice(1).reduce((t, n) => e === "*" ? t * n : e === "/" ? n === 0 ? NaN : t / n : n === 0 ? NaN : t % n, a[0]);
			return Number.isFinite(o) ? o : void 0;
		}
		let ne = Q(r, "eval");
		if (ne !== void 0) {
			let e = this.resolveExpr(ne, t, n);
			return e === void 0 ? void 0 : this.store?.get(String(e)) ?? this.textVars.get(ps(String(e))) ?? void 0;
		}
		if (r.startsWith("\"") && r.endsWith("\"") || r.startsWith("'") && r.endsWith("'")) return r.slice(1, -1);
		if (r === "true") return !0;
		if (r === "false") return !1;
		if (r === "null") return null;
		if (/^-?\d+(\.\d+)?$/.test(r)) return Number(r);
		if (t && r in t) return t[r];
		let re = this.resolveObjectPath(n, r, t);
		if (re !== void 0) return re;
		if (!xc(r)) return /^[A-Za-z_$][\w$.]*$/.test(r) ? this.store?.get(r) ?? this.textVars.get(ps(r)) ?? void 0 : r;
	}
	scopeGet(e, t) {
		return yo(t) && t in e.locals ? e.locals[t] : t in e.props ? e.props[t] : this.store?.get(t);
	}
	scopeSet(e, t, n) {
		yo(t) && (e.locals[t] = n), this.store?.set(t, n);
	}
	scopeFor(e) {
		return {
			get: (t) => this.scopeGet(e, t),
			set: (t, n) => this.scopeSet(e, t, n),
			has: (t) => yo(t) && t in e.locals || (this.store?.has(t) ?? !1)
		};
	}
	evalGuard(e, t) {
		return this.store ? e ? Zo(e.replace(/[\w.]*\btimeMarkDone\s*\(([^)]*)\)/g, (e, t) => {
			let n = Number(this.resolveExpr(t.trim()) ?? 0), r = Number(this.store?.get("bkgd.timeTarg") ?? 0);
			return this.getTimer() > r + n ? "1" : "0";
		}), t ? this.scopeFor(t) : this.store) : !0 : !e;
	}
	resolveArgsString(e, t) {
		return this.parseArgs(e, t).map((e) => typeof e == "string" ? JSON.stringify(e) : String(e)).join(",");
	}
	branchPasses(e, t, n = this.root) {
		return e ? this.evalRuntimeCondition(e, t, n) : !0;
	}
	functionBodyDecisions(e, t, n = this.root) {
		let r = this.functionGuardLocals(e, t, n);
		return e.map((e) => this.branchPasses(e.branchCondition, r, n));
	}
	runFunctionBody(e, t, n = void 0, r = this.root) {
		n ??= this.functionBodyDecisions(e, t, r), e.forEach((e, i) => {
			n[i] && this.runBodyStatement(e, t, r);
		});
	}
	functionGuardLocals(e, t, n) {
		let r = { ...t };
		for (let t of e) {
			if (t.kind !== "assign" || oc(t.branchCondition, t.target) || !this.branchPasses(t.branchCondition, r, n)) continue;
			let e = this.resolveGuardExpr(t.rawValue, r);
			e !== void 0 && (r[t.target] = e);
		}
		return r;
	}
	resolveGuardExpr(e, t) {
		let n = e?.trim() ?? "";
		if (n) {
			if (n.startsWith("\"") && n.endsWith("\"") || n.startsWith("'") && n.endsWith("'")) return n.slice(1, -1);
			if (n === "true") return !0;
			if (n === "false") return !1;
			if (n === "null") return null;
			if (/^-?\d+(\.\d+)?$/.test(n)) return Number(n);
			if (n in t) return t[n];
			if (/^[A-Za-z_$][\w$.]*$/.test(n)) return this.store?.get(n) ?? void 0;
		}
	}
	runBodyStatement(e, t, n) {
		if (e.kind === "assign") {
			let r = this.resolveExpr(e.rawValue, t, n);
			if (this.trackSoundObject(e.target, e.rawValue), yo(e.target) && r !== void 0 && (t[e.target] = r), r !== void 0 && this.applyPropertyAssignment(n, e.target, r, t) || r !== void 0 && this.assignObjectPath(n, e.target, r, t)) return;
			this.store && r !== void 0 && this.store.set(e.target, r);
			return;
		}
		this.runBodyCall(e, t, n);
	}
	runBodyCall(e, t, n) {
		let r = e.functionName, i = e.target;
		if (r === "while") {
			this.runWhileBody(e.arguments, t, n);
			return;
		}
		if (r === "Tween" && i === "mx.transitions") {
			this.createTweenObject(e.arguments, t, n);
			return;
		}
		if (r === "addEventListener" && i) {
			let r = this.resolveValueTarget(n, i, t), [a, o] = this.parseArgs(e.arguments, t, n);
			r instanceof X && typeof a == "string" && Ic(o) && this.addEventListener(r, a, o);
			return;
		}
		if (r === "removeEventListener" && i) {
			let r = this.resolveValueTarget(n, i, t), [a, o] = this.parseArgs(e.arguments, t, n);
			r instanceof X && typeof a == "string" && Ic(o) && this.removeEventListener(r, a, o);
			return;
		}
		if (r === "addListener" && i) {
			let r = this.resolveValueTarget(n, i, t), [a] = this.parseArgs(e.arguments, t, n);
			if (Lc(r) && $(a)) {
				let e = Rc(r);
				e.includes(a) || e.push(a);
			}
			return;
		}
		if (r === "loadClip" && i) {
			let r = this.resolveValueTarget(n, i, t), [a, o] = this.parseArgs(e.arguments, t, n);
			Lc(r) && o instanceof X && this.loadClipInto(r, String(a ?? ""), o);
			return;
		}
		if (r === "getURL") {
			let [r, i] = this.parseArgs(e.arguments, t, n);
			r !== void 0 && this.options.onGetURL?.(String(r), i === void 0 ? void 0 : String(i));
			return;
		}
		if (r === "dispatchEvent") {
			let r = i ? this.resolveValueTarget(n, i, t) : n, [a] = this.parseArgs(e.arguments, t, n);
			r instanceof X && $(a) && this.dispatchEvent(r, a);
			return;
		}
		if (r === "setTextFormat" && i) {
			let r = this.resolveTextTarget(n, i, t), [a] = this.parseArgs(e.arguments, t, n);
			r && $(a) && Object.assign(this.textOverrideFor(r), Ns(a));
			return;
		}
		if (r !== "getNextHighestDepth") {
			if (r === "attachMovie") {
				let r = i ? this.resolveValueTarget(n, i, t) : n;
				r instanceof X && this.attachMovie(r, e.arguments, t);
				return;
			}
			if (r === "createEmptyMovieClip") {
				let r = i ? this.resolveValueTarget(n, i, t) : n;
				r instanceof X && this.createEmptyMovieClip(r, e.arguments, t);
				return;
			}
			if (r === "swapDepths" && i) {
				let r = this.resolveValueTarget(n, i, t), [a] = this.parseArgs(e.arguments, t, n);
				r instanceof X && this.swapDepths(r, a);
				return;
			}
			if (r === "setMask" && i) {
				let r = this.resolveValueTarget(n, i, t), [a] = this.parseArgs(e.arguments, t, n);
				r instanceof X && (r.maskClip = a instanceof X ? a : void 0);
				return;
			}
			if (r === "startDrag") {
				let r = i ? this.resolveValueTarget(n, i, t) : n;
				r instanceof X && this.startDrag(r, e.arguments, t, n);
				return;
			}
			if (r === "stopDrag") {
				let e = i ? this.resolveValueTarget(n, i, t) : this.activeDrag?.clip;
				(!e || e === this.activeDrag?.clip) && (this.activeDrag = void 0);
				return;
			}
			if (r === "push") {
				let r = i ? this.resolveValueTarget(n, i, t) : void 0;
				Array.isArray(r) && r.push(...this.parseArgs(e.arguments, t, n));
				return;
			}
			if (r === "reverse") {
				let e = i ? this.resolveValueTarget(n, i, t) : void 0;
				Array.isArray(e) && e.reverse();
				return;
			}
			if (r === "pop") {
				let e = i ? this.resolveValueTarget(n, i, t) : void 0;
				Array.isArray(e) && e.pop();
				return;
			}
			if (r === "shift") {
				let e = i ? this.resolveValueTarget(n, i, t) : void 0;
				Array.isArray(e) && e.shift();
				return;
			}
			if (r === "unshift") {
				let r = i ? this.resolveValueTarget(n, i, t) : void 0;
				Array.isArray(r) && r.unshift(...this.parseArgs(e.arguments, t, n));
				return;
			}
			if (r === "splice") {
				let r = i ? this.resolveValueTarget(n, i, t) : void 0, [a, o, ...s] = this.parseArgs(e.arguments, t, n);
				Array.isArray(r) && r.splice(Number(a ?? 0), o === void 0 ? r.length : Number(o), ...s);
				return;
			}
			if (r === "setInterval") {
				this.createInterval(e.arguments, t, n);
				return;
			}
			if (r === "clearInterval") {
				let [r] = this.parseArgs(e.arguments, t, n);
				this.clearRuntimeTimer(r);
				return;
			}
			if (r === "setTimeout") {
				this.createTimeout(e.arguments, t, n);
				return;
			}
			if (r === "removeMovieClip" && i) {
				let e = this.resolveValueTarget(n, i, t);
				e instanceof X && this.removeMovieClip(e);
				return;
			}
			if (r === "unloadMovie" && i) {
				let e = this.resolveValueTarget(n, i, t);
				e instanceof X && this.unloadMovieClip(e);
				return;
			}
			if (r === "load" && i) {
				let r = this.resolveValueTarget(n, i, t), [a] = this.parseArgs(e.arguments, t, n);
				$(r) && this.loadXmlObject(r, String(a ?? ""));
				return;
			}
			if (!this.runMovieLoadCall(r, e.arguments, t, n) && !this.runMovieUnloadCall(r, e.arguments, t, n) && !this.runSoundMethod(i, r, e.arguments, t)) {
				if (_s.has(r)) {
					this.options.onWaiter?.(r, this.parseArgs(e.arguments, t, n));
					return;
				}
				if (vs.has(r)) {
					let r = this.parseArgs(e.arguments, t, n)[0];
					r !== void 0 && this.runSoundMarker(i, String(r), e.arguments);
					return;
				}
				if (gs.has(r) && i) {
					let a = this.parseArgs(e.arguments, t, n)[0] ?? 0;
					/^_level\d+/i.test(i) ? this.options.onClipCommand?.(i, r, a) : this.runNamedClipCommand(n, i, r, a);
					return;
				}
				if (i && !/^_level\d+/i.test(i)) {
					let a = this.resolveValueTarget(n, i, t);
					if (a instanceof X && a !== n) {
						let i = this.methodFunctionForClip(a, r);
						if (i) {
							this.callFunctionDef(i.key, i.def, e.arguments, t, a, n);
							return;
						}
					}
				}
				if (!i || i === "self" || i === "this" || i === "_root" || i === "_level0") {
					let a = i === "self" || i === "this" ? this.methodFunctionForClip(n, r) : void 0;
					a ? this.callFunctionDef(a.key, a.def, e.arguments, t, n) : this.callFunction(r, e.arguments, t);
				} else if (/^_level\d+/i.test(i)) this.options.onCallFunction?.(i, r, this.resolveArgsString(e.arguments, t));
				else {
					let a = this.resolveTarget(n, i) ?? this.findClipByName(n, i);
					if (a === this.root) this.callFunction(r, e.arguments, t);
					else if (a) {
						let i = this.methodFunctionForClip(a, r);
						i ? this.callFunctionDef(i.key, i.def, e.arguments, t, a, n) : this.callClipFunction(a, r);
					}
				}
			}
		}
	}
	bodySoundCallKey(e, t) {
		let [n] = this.parseArgs(e.arguments, t);
		switch (e.functionName) {
			case "attachSound": return mc("attachSound", n);
			case "playVO": return mc("playVO", n);
			case "markSnd":
			case "markSndSegment": return mc("markSndSegment", n);
			case "stop": return e.target ? mc("stopSound", ps(e.target)) : void 0;
			default: return;
		}
	}
	runMovieLoadCall(e, t, n, r = this.root) {
		if (e !== "loadMovieNum" && e !== "loadMovie") return !1;
		let i = this.parseArgs(t, n, r), a = i[0] === void 0 ? "" : String(i[0]);
		return a && this.options.onNavigate?.({
			command: e,
			swf: a,
			level: e === "loadMovieNum" ? cc(i[1], sc(t, 1)) : void 0,
			executionContext: "function"
		}), !0;
	}
	runMovieUnloadCall(e, t, n, r = this.root) {
		if (e !== "unloadMovieNum" && e !== "unloadMovie") return !1;
		let i = this.parseArgs(t, n, r);
		return this.options.onNavigate?.({
			command: e,
			level: cc(i[0], sc(t, 0)),
			executionContext: "function"
		}), !0;
	}
	runSoundMarker(e, t, n, r) {
		t && (this.voWaiting = !0, this.options.onSound?.(this.soundSegmentAction({
			command: "markSndSegment",
			target: e,
			sound: r?.sound ?? t,
			segment: t,
			soundSrc: r?.soundSrc,
			soundDurationMs: r?.soundDurationMs,
			soundRole: r?.soundRole ?? "vo",
			executionContext: "function",
			...n ? { arguments: n } : {}
		})));
	}
	soundSegmentAction(e) {
		let t = e.segment ?? e.sound, n = t ? this.soundSegmentDurations.get(t) : void 0;
		return {
			...e,
			...t ? { segment: t } : {},
			soundRole: e.soundRole ?? "vo",
			soundSrc: e.soundSrc ?? n?.soundSrc,
			soundDurationMs: e.soundDurationMs ?? n?.durationMs,
			resolvedSound: e.resolvedSound ?? (n?.baseSound && n.baseSound !== t ? n.baseSound : void 0)
		};
	}
	runSoundMethod(e, t, n, r) {
		if (!e) return !1;
		let i = this.soundTargetKey(e);
		if (t === "attachSound") {
			let e = this.parseArgs(n, r)[0], t = e === void 0 ? "" : String(e);
			if (!t) return !0;
			let a = this.resolveSound(t);
			return this.soundObjectTargets.add(i), this.soundBindings.set(i, {
				sound: t,
				soundSrc: a?.src,
				soundDurationMs: a?.durationMs
			}), !0;
		}
		if (!this.isSoundTarget(e)) return !1;
		if (t === "start") {
			let t = this.soundBindings.get(i);
			if (!t) return !0;
			let a = this.parseArgs(n, r), o = Number(a[1] ?? 0) > 1 || /music/i.test(i) ? "music" : "vo", s = o === "music" ? "attachSound" : "playVO";
			return o === "vo" && (this.voWaiting = !0), this.options.onSound?.({
				command: s,
				target: e,
				sound: t.sound,
				soundSrc: t.soundSrc,
				soundDurationMs: t.soundDurationMs,
				soundRole: o,
				executionContext: "function"
			}), !0;
		}
		if (t === "stop") return this.options.onSound?.({
			command: "stopSound",
			target: e,
			executionContext: "function"
		}), !0;
		if (t === "setVolume") {
			let t = this.parseArgs(n, r)[0];
			return this.options.onSound?.({
				command: "setVolume",
				target: e,
				value: yc(typeof t == "boolean" ? Number(t) : t),
				executionContext: "function"
			}), !0;
		}
		return t === "getVolume";
	}
	soundTargetKey(e) {
		return ps(e);
	}
	trackSoundObject(e, t) {
		!e || !t || !/\bnew\s+Sound\s*\(/.test(t) || this.soundObjectTargets.add(this.soundTargetKey(e));
	}
	isSoundTarget(e) {
		return this.soundObjectTargets.has(this.soundTargetKey(e)) || this.soundBindings.has(this.soundTargetKey(e));
	}
	resolveSound(e) {
		let t = this.timeline.control?.soundLibrary, n = t?.[e] ?? t?.[e.toLowerCase()] ?? this.findSoundByAlias(t, e);
		return typeof n == "string" ? { src: n } : n;
	}
	findSoundByAlias(e, t) {
		if (!e) return;
		let n = t.toLowerCase();
		for (let t of Object.values(e)) if (typeof t != "string" && (t.name?.toLowerCase() === n || t.aliases?.some((e) => e.toLowerCase() === n))) return t;
	}
	buildSoundSegmentDurations() {
		let e = ve(this.timeline.control);
		for (let [t, n] of Object.entries(e)) this.soundSegmentDurations.set(t, {
			baseSound: t,
			durationMs: n.durationMs
		});
		let t = /* @__PURE__ */ new Map(), n = (e) => {
			let n = e?.trim();
			if (!n) return;
			let r = this.soundSegmentBase(n);
			if (!r) return;
			let i = t.get(r);
			i || t.set(r, i = /* @__PURE__ */ new Set()), i.add(n);
		}, r = (e) => {
			if (!e) return;
			e.command === "markSndSegment" && n(e.segment ?? e.sound);
			let t = e.soundAction;
			t?.command === "markSndSegment" && n(t.segment ?? t.sound), t?.command === "playVO" && n(t.segment);
			for (let t of e.functionCalls ?? []) {
				let e = vo(t.arguments);
				(t.functionName === "markSnd" || t.functionName === "markSndSegment") && n(gc(e[0])), t.functionName === "playVO" && n(gc(e[2]));
			}
		};
		for (let e of this.timeline.control?.frameActions ?? []) for (let t of e.actions ?? []) r(t);
		for (let e of this.timeline.control?.spriteActions ?? []) for (let t of e.actions ?? []) r(t);
		for (let e of Object.values(this.timeline.control?.definedFunctions ?? {})) for (let t of e.actions ?? []) r(t);
		for (let e of Object.values(this.timeline.control?.buttonActions ?? {})) r(e.release), r(e.rollOver), r(e.rollOut), r(e.press);
		for (let [n, r] of t) {
			let t = this.resolveSound(n), i = t?.durationMs && r.size > 0 ? t.durationMs / r.size : void 0;
			for (let a of r) {
				let r = e[a]?.durationMs ?? i;
				this.soundSegmentDurations.set(a, {
					baseSound: t?.name ?? n,
					soundSrc: t?.src,
					durationMs: r
				});
			}
		}
	}
	soundSegmentBase(e) {
		let t = e.match(/^(.+\d)([a-z]+)$/i);
		if (t) return this.resolveSound(t[1])?.name ?? t[1];
	}
	runNamedClipCommand(e, t, n, r) {
		let i = t.split(".").filter(Boolean).pop() ?? t, a = this.resolveTarget(e, t) ?? this.findClipByName(e, i) ?? this.findClipByName(this.root, i);
		if (!a) return this.pendingClipCommands.set(i, {
			command: n,
			frame: r
		}), !1;
		this.pendingClipCommands.delete(i), a.name && this.pendingClipCommands.delete(a.name);
		let o = this.resolveClipFrame(a, r);
		return o < 0 ? !1 : (a.playing = n === "gotoAndPlay", this.enterFrame(a, o, 0), this.render(), !0);
	}
	resolveClipFrame(e, t) {
		if (typeof t == "number") return t > 0 ? t - 1 : 0;
		let n = this.framesFor(e)?.findIndex((e) => e.label === t) ?? -1;
		if (n >= 0) return n;
		let r = Number(t);
		return Number.isFinite(r) ? Math.max(0, r - 1) : -1;
	}
	runFunctionAction(e, t, n = this.root) {
		switch (e.command) {
			case "stop":
				ks(e.target) && (n.playing = !1);
				break;
			case "play":
				ks(e.target) && (n.playing = !0);
				break;
			case "gotoAndPlay":
			case "gotoAndStop": {
				let t = this.resolveTarget(n, e.target), r = this.resolveFrame(e, t);
				t && r >= 0 && (t.playing = e.command === "gotoAndPlay", this.enterFrame(t, r, 0));
				break;
			}
			case "attachSound":
			case "playVO":
			case "markSndSegment":
			case "stopSound":
				e.command === "playVO" && (this.voWaiting = !0), e.command === "markSndSegment" && (this.voWaiting = !0), this.options.onSound?.(e.command === "markSndSegment" ? this.soundSegmentAction(e) : e);
				break;
			case "loadMovieNum":
			case "loadMovie":
				this.options.onNavigate?.(e);
				break;
			case "unloadMovieNum":
			case "unloadMovie":
				this.options.onNavigate?.(e);
				break;
			case "doRelease":
				e.swf && this.options.onNavigate?.({
					command: "loadMovie",
					swf: e.swf,
					level: e.level,
					reload: !0
				});
				break;
			case "fsCommand":
				this.options.onFsCommand?.(String(e.value ?? ""), e.arguments ?? "");
				break;
			case "loadVariables":
				this.options.onLoadVariables?.(e);
				break;
			case "setVariable": {
				let r = this.resolveExpr(e.rawValue ?? String(e.value ?? ""));
				if (this.trackSoundObject(e.target, e.rawValue), this.store && e.target && r !== void 0) {
					if (this.applyPropertyAssignment(n, e.target, r, t)) break;
					this.scopeSet(n, e.target, r);
					let i = ps(e.target);
					this.boundTextVars.has(i) && this.textVars.set(i, String(r));
				}
				break;
			}
			case "callFunctions":
				this.runCallFunctions(e, n, t);
				break;
			default: break;
		}
	}
	runCallFunctions(e, t = this.root, n, r) {
		let i = !1;
		for (let a of e.functionCalls ?? []) {
			let o = this.runFunctionCall(a, t, n, r);
			fc(a, e.soundAction) && o && (i = !0);
		}
		e.soundAction && !i && this.runSoundMetadataFallback(e.soundAction);
	}
	runFunctionCall(e, t, n, r) {
		let i = e.target ?? "self", a = e.functionName;
		if (this.runSoundMethod(i, a, e.arguments, n)) return !0;
		if (_s.has(a)) return this.options.onWaiter?.(a, this.parseArgs(e.arguments, n)), !0;
		if (vs.has(a)) {
			let t = this.parseArgs(e.arguments, n)[0];
			if (t !== void 0) return this.runSoundMarker(i, String(t), e.arguments), !0;
		}
		if (gs.has(a) && i !== "self" && i !== "this" && i !== "_root") {
			let o = this.parseArgs(e.arguments, n)[0] ?? 0;
			return /^_level\d+/i.test(i) ? (this.options.onClipCommand?.(i, a, o), !0) : this.runNamedClipCommand(t, i, a, o) ? !0 : r ? this.runNamedClipCommand(r, i, a, o) : !1;
		}
		if (i === "self" || i === "this" || i === "_root") {
			if (i !== "_root" && this.runAppClipMethod(t, a, this.parseArgs(e.arguments, n))) return !0;
			if (i !== "_root" && this.spriteFunctions.get(t.characterId)?.has(a)) return this.callClipFunction(t, a);
			let r = i === "_root" ? void 0 : this.methodFunctionForClip(t, a);
			return r ? this.callFunctionDef(r.key, r.def, e.arguments, n, t) : this.callFunction(a, e.arguments);
		}
		if (/^_level\d+/i.test(i)) return this.options.onCallFunction?.(i, a, this.resolveArgsString(e.arguments, n)), !0;
		let o = i.split(".").filter(Boolean).pop() ?? i, s = this.resolveTarget(t, i) ?? this.findClipByName(t, o) ?? (r ? this.resolveTarget(r, i) ?? this.findClipByName(r, o) : null);
		if (s === this.root) return this.callFunction(a, e.arguments, n);
		if (s) {
			if (this.runAppClipMethod(s, a, this.parseArgs(e.arguments, n))) return !0;
			let r = this.methodFunctionForClip(s, a);
			return r ? this.callFunctionDef(r.key, r.def, e.arguments, n, s, t) : this.callClipFunction(s, a);
		}
		return this.functions.has(a) && Qs(i, a) ? this.callFunction(a, e.arguments, n) : !1;
	}
	runAppClipMethod(e, t, n) {
		let r = e.props.__appMethodDispatcher;
		return typeof r == "function" ? !!r(t, n) : !1;
	}
	methodFunctionForClip(e, t) {
		let n = e.scriptKey ?? this.clipSourceKey(this.getAsset(e.characterId), e.name);
		if (!n) return;
		let r = $s(n, t), i = this.methodFunctions.get(r);
		return i ? {
			key: r,
			def: i
		} : void 0;
	}
	constructorFunctionForClip(e) {
		let t = e.scriptKey ?? this.clipSourceKey(this.getAsset(e.characterId), e.name);
		if (t) {
			for (let [e, n] of this.methodFunctions) if (e.startsWith(`${t}:`) && nc(e.slice(t.length + 1)) === t) return {
				key: e,
				def: n
			};
		}
	}
	runClipConstructor(e) {
		if (e.constructorRun) return;
		let t = this.constructorFunctionForClip(e);
		t && (e.constructorRun = !0, this.callFunctionDef(t.key, t.def, void 0, void 0, e));
	}
	runSoundMetadataFallback(e) {
		if (e.command === "markSndSegment") {
			let t = e.segment ?? e.sound;
			t && this.runSoundMarker(e.target, t, e.arguments, e);
			return;
		}
		e.command !== "playVO" || !e.soundSrc || (this.voWaiting = !0, this.options.onSound?.({
			command: "playVO",
			target: e.target,
			sound: e.sound,
			soundSrc: e.soundSrc,
			soundDurationMs: e.soundDurationMs,
			soundRole: e.soundRole ?? "vo",
			executionContext: "metadata-fallback"
		}));
	}
	callClipFunction(e, t) {
		let n = this.spriteFunctions.get(e.characterId)?.get(t);
		if (!n) return !1;
		let r = this.scopeFor(e), i = (e) => e === "else", a = n.actions.some((e) => e.functionBranchCondition && !i(e.functionBranchCondition) && Zo(e.functionBranchCondition, r)), o = n.actions.map((e) => {
			let t = e.functionBranchCondition;
			return i(t) ? !a : !t || Zo(t, r);
		});
		for (let t = 0; t < n.actions.length; t += 1) this.store && !o[t] || this.runClipAction(e, n.actions[t]);
		return this.render(), !0;
	}
	runClipAction(e, t) {
		switch (t.command) {
			case "stop":
				ks(t.target) && (e.playing = !1);
				break;
			case "play":
				ks(t.target) && (e.playing = !0);
				break;
			case "gotoAndPlay":
			case "gotoAndStop": {
				let n = !t.target || t.target === "self" || t.target === "this" ? e : this.resolveTarget(e, t.target) ?? e, r = this.resolveFrame(t, n);
				r >= 0 && (n.playing = t.command === "gotoAndPlay", this.enterFrame(n, r, 0));
				break;
			}
			case "callFunctions":
				this.runCallFunctions(t, e);
				break;
			case "setVariable": {
				let n = this.resolveExpr(t.rawValue ?? String(t.value ?? ""));
				this.trackSoundObject(t.target, t.rawValue), t.target && n !== void 0 && !this.applyPropertyAssignment(e, t.target, n) && this.scopeSet(e, t.target, n);
				break;
			}
			default: break;
		}
	}
	findClipByName(e, t) {
		let n = [], r = (e) => {
			if (e.name === t) return e;
			dc(e.name, t) && n.push(e);
			for (let t of e.childClips.values()) {
				let e = r(t);
				if (e) return e;
			}
			return null;
		};
		return r(e) || (n.length === 1 ? n[0] : null);
	}
	buildRoot(e) {
		let t = new X(Ss, "_root", null);
		return this.root = t, this.enterFrame(t, e, 0), t;
	}
	onTick() {
		this.tickClip(this.root), this.dataApp?.enterFrame(1e3 / this.ticker.fps), this.render(), this.options.onFrame?.(this.root.currentFrame, this.ticker.isPlaying);
	}
	tickClip(e) {
		this.tickLoadedTimeline(e);
		let t = this.frameCountFor(e);
		if (e.playing && t > 1) {
			let n = e.currentFrame + 1 >= t ? 0 : e.currentFrame + 1;
			this.enterFrame(e, n, 0);
		} else e.enteredFrame < 0 && this.enterFrame(e, e.currentFrame, 0);
		this.runAssignedEnterFrame(e);
		for (let t of e.childClips.values()) this.tickClip(t);
	}
	tickLoadedTimeline(e) {
		let t = e.loadedTimeline;
		if (!t || !e.loadedPlaying) return;
		let n = Math.max(1, t.frameCount ?? t.frames?.length ?? t.frameSvgs?.length ?? 1);
		n <= 1 || (e.loadedFrame = e.loadedFrame + 1 >= n ? 0 : e.loadedFrame + 1);
	}
	enterFrame(e, t, n) {
		e.currentFrame = xo(t, 0, Math.max(0, this.frameCountFor(e) - 1)), this.reconcile(e), e.enteredFrame !== e.currentFrame && (e.enteredFrame = e.currentFrame, this.stopFramesFor(e).has(e.currentFrame) && (e.playing = !1), n < Cs && this.runScript(e, n));
	}
	reconcile(e) {
		let t = this.framesFor(e);
		if (!t) return;
		let n = this.instancesForFrame(e, t[e.currentFrame]), r = /* @__PURE__ */ new Set();
		for (let t of n) {
			let n = this.getAsset(t.characterId);
			if (!n || !Co(n)) continue;
			r.add(t.depth), t.name && e.depthNames.set(t.depth, t.name);
			let i = t.name || e.depthNames.get(t.depth) || "", a = e.childClips.get(t.depth);
			if (!a || a.characterId !== t.characterId) {
				let r = new X(t.characterId, i, e);
				r.scriptKey = this.clipSourceKey(n, i), r.placedX = t.matrix.tx, r.placedY = t.matrix.ty, e.childClips.set(t.depth, r), this.enterFrame(r, 0, 0), this.runClipConstructor(r);
				let a = i ? this.pendingClipCommandKey(i) : void 0, o = a ? this.pendingClipCommands.get(a) : void 0;
				if (o && a) {
					this.pendingClipCommands.delete(a);
					let e = this.resolveClipFrame(r, o.frame);
					e >= 0 && (r.playing = o.command === "gotoAndPlay", this.enterFrame(r, e, 0));
				}
			} else i && a.name !== i && (a.name = i, a.scriptKey = a.scriptKey ?? this.clipSourceKey(n, i));
			let o = e.childClips.get(t.depth);
			o && (o.placedX = t.matrix.tx, o.placedY = t.matrix.ty);
		}
		for (let [t] of e.childClips) r.has(t) || e.childClips.delete(t);
	}
	pendingClipCommandKey(e) {
		if (this.pendingClipCommands.has(e)) return e;
		let t = Array.from(this.pendingClipCommands.keys()).filter((t) => dc(e, t));
		return t.length === 1 ? t[0] : void 0;
	}
	runScript(e, t) {
		let n = this.actionsFor(e), r = n.map(() => !0);
		for (let t = 0; t < n.length;) {
			if (n[t].executionContext !== "branch") {
				t += 1;
				continue;
			}
			let i = t;
			for (; i < n.length && n[i].executionContext === "branch";) i += 1;
			let a = (e) => !e.branchCondition || e.branchCondition === "else", o = n.slice(t, i).some((t) => !a(t) && this.evalGuard(t.branchCondition, e));
			for (let s = t; s < i; s += 1) r[s] = a(n[s]) ? !o : this.evalGuard(n[s].branchCondition, e);
			t = i;
		}
		for (let i = 0; i < n.length; i += 1) {
			if (!r[i]) continue;
			let a = n[i];
			switch (a.command) {
				case "stop":
					ks(a.target) && (e.playing = !1);
					break;
				case "play":
					ks(a.target) && (e.playing = !0);
					break;
				case "gotoAndPlay":
				case "gotoAndStop": {
					if (a.target && /^_level[1-9]\d*\b/i.test(a.target)) {
						this.options.onClipCommand?.(a.target, a.command, a.label ?? a.frame ?? 0);
						break;
					}
					let n = this.resolveTarget(e, a.target), r = this.resolveFrame(a, n);
					if (!n || r < 0) break;
					if (a.branchCondition?.includes("sndDonePlaying") && a.command === "gotoAndPlay" && n === e && r < e.currentFrame) {
						let t = e.currentFrame - r, n = this.options.isVoiceDone?.() ?? !0, i = this.voWaiting && n || e !== this.root && !this.voWaiting;
						if (t <= Ts && i) {
							this.voWaiting = !1;
							break;
						}
					}
					n.playing = a.command === "gotoAndPlay", (n !== e || r !== e.currentFrame) && this.enterFrame(n, r, t + 1);
					break;
				}
				case "attachSound":
				case "playVO":
				case "markSndSegment":
				case "stopSound":
					a.command === "playVO" && (this.voWaiting = !0), a.command === "markSndSegment" && (this.voWaiting = !0), this.options.onSound?.(a.command === "markSndSegment" ? this.soundSegmentAction(a) : a);
					break;
				case "loadMovieNum":
				case "loadMovie":
					this.options.onNavigate?.(a);
					break;
				case "unloadMovieNum":
				case "unloadMovie":
					this.options.onNavigate?.(a);
					break;
				case "doRelease":
					a.swf && this.options.onNavigate?.({
						command: "loadMovie",
						swf: a.swf,
						level: a.level,
						reload: !0
					});
					break;
				case "loadVariables":
					this.options.onLoadVariables?.(a);
					break;
				case "callFunctions":
					this.runCallFunctions(a, e);
					break;
				case "setVariable": {
					let t = this.resolveExpr(a.rawValue ?? String(a.value ?? ""));
					if (this.trackSoundObject(a.target, a.rawValue), this.store && a.target && t !== void 0) {
						if (this.applyPropertyAssignment(e, a.target, t)) break;
						this.scopeSet(e, a.target, t);
						let n = ps(a.target);
						this.boundTextVars.has(n) && this.textVars.set(n, String(t));
					}
					break;
				}
				default: break;
			}
		}
	}
	resolveTarget(e, t) {
		if (!t || t === "self" || t === "this") return e;
		let n = t.split(".").filter(Boolean), r = e;
		for (let e = 0; e < n.length; e += 1) {
			let t = n[e];
			if (!(e === 0 && (t === "this" || t === "self"))) {
				if (e === 0 && (t === "_root" || t === "_level0" || t === "root")) {
					r = this.root;
					continue;
				}
				if (e === 0 && /^_level\d+$/i.test(t)) {
					r = t.toLowerCase() === "_level0" ? this.root : null;
					continue;
				}
				if (t === "_parent") {
					r = r?.parent ?? r;
					continue;
				}
				if (!r) return null;
				r = So(r, t) ?? this.findClipByName(r, t);
			}
		}
		return r;
	}
	applyPropertyAssignment(e, t, n, r) {
		let i = js(t);
		if (!i) return !1;
		if (i.property === "text" || i.property === "htmlText") {
			let t = this.resolveTextTarget(e, i.owner, r);
			if (!t) return !1;
			let a = this.textOverrideFor(t);
			return a.text = String(n), a.html = i.property === "htmlText", t.owner && t.name && t.owner.mutatedLeaves.add(t.name), !0;
		}
		let a = this.resolveValueTarget(e, i.owner, r);
		if (a instanceof X) return Fs(a, i.property, n);
		let o = this.resolveLeafTarget(e, i.owner, r);
		return o ? (this.setLeafDisplayProp(o.owner, o.name, i.property, n), !0) : !1;
	}
	resolveTextTarget(e, t, n) {
		let r = t.split(".").filter(Boolean), i = e;
		for (let e = 0; e < r.length; e += 1) {
			let t = r[e];
			if (!(e === 0 && (t === "this" || t === "self"))) {
				if (e === 0 && n && t in n) {
					let e = n[t];
					i = e instanceof X ? e : null;
					continue;
				}
				if (e === 0 && (t === "_root" || t === "_level0" || t === "root")) {
					i = this.root;
					continue;
				}
				if (t === "_parent") {
					i = i?.parent ?? i;
					continue;
				}
				if (!i) return;
				if (e === r.length - 1) {
					let e = this.findTextChildByName(i, t);
					if (e !== void 0) return {
						id: e,
						owner: i,
						name: t
					};
				}
				i = So(i, t) ?? this.findClipByName(i, t);
			}
		}
	}
	textOverrideFor(e) {
		if (e.owner && e.name) {
			let t = this.clipTextOverrides.get(e.owner);
			t || (t = /* @__PURE__ */ new Map(), this.clipTextOverrides.set(e.owner, t));
			let n = t.get(e.name);
			return n || (n = {}, t.set(e.name, n)), n;
		}
		let t = this.textOverrides.get(e.id);
		return t || (t = {}, this.textOverrides.set(e.id, t)), t;
	}
	findTextChildByName(e, t) {
		let n = this.framesFor(e)?.[e.currentFrame];
		for (let e of n?.instances ?? []) {
			if (e.name !== t) continue;
			let n = this.getAsset(e.characterId);
			if (n?.kind === "text") return n.id;
		}
	}
	textLeafPlacement(e, t) {
		let n = this.framesFor(e)?.[e.currentFrame];
		for (let e of n?.instances ?? []) if (e.name === t && this.getAsset(e.characterId)?.kind === "text") return e;
	}
	resolveLeafTarget(e, t, n) {
		let r = t.split(".").filter(Boolean);
		if (!r.length) return;
		let i = r[r.length - 1], a = r.slice(0, -1).join(".") || "this", o = this.resolveValueTarget(e, a, n);
		if (o instanceof X && this.findLeafChild(o, i)) return {
			owner: o,
			name: i,
			props: this.leafDisplayProps(o, i)
		};
	}
	attachMovie(e, t, n) {
		let [r, i, a] = this.parseArgs(t, n, e), o = String(r ?? "").trim(), s = this.linkageAssetIds.get(_c(o));
		if (!s || !this.getAsset(s)) return;
		let c = Number(a ?? this.nextHighestDepth(e));
		if (!Number.isFinite(c)) return;
		let l = String(i ?? `instance${c}`), u = {
			depth: c,
			characterId: s,
			placedFrame: e.currentFrame,
			matrix: { ...ls },
			opacity: 1,
			name: l
		};
		e.dynamicInstances.set(c, u), this.hasAnyDynamicInstances = !0, e.displayListMutated = !0, e.depthNames.set(c, l);
		let d = new X(s, l, e);
		return d.scriptKey = this.clipSourceKey(this.getAsset(s), l), d.placedX = u.matrix.tx, d.placedY = u.matrix.ty, e.childClips.set(qs(c), d), this.enterFrame(d, 0, 0), this.runClipConstructor(d), d;
	}
	createEmptyMovieClip(e, t, n) {
		let [r, i] = this.parseArgs(t, n, e), a = Number(i ?? this.nextHighestDepth(e));
		if (!Number.isFinite(a)) return;
		let o = String(r ?? `instance${a}`);
		e.dynamicInstances.set(a, {
			depth: a,
			characterId: 0,
			placedFrame: e.currentFrame,
			matrix: { ...ls },
			opacity: 1,
			name: o
		}), this.hasAnyDynamicInstances = !0, e.displayListMutated = !0, e.depthNames.set(a, o);
		let s = new X(0, o, e);
		return s.placedX = 0, s.placedY = 0, e.childClips.set(qs(a), s), s;
	}
	clipSourceKey(e, t) {
		for (let t of e?.linkageNames ?? []) {
			let e = this.linkageClassKeys.get(_c(t));
			if (e) return e;
		}
		return tc(e, t);
	}
	constructObject(e, t, n) {
		let r = e.match(/^new\s+([\w$.]+)\s*\((.*)\)$/s);
		if (!r) return;
		let i = r[1], a = i.split(".").pop() ?? i, o = nc(a);
		if (!o) return;
		let s = this.methodFunctions.get($s(o, a)) ?? this.functions.get(a);
		if (!s) return { __avm1Class: i };
		let c = new X(Ss, a, null);
		return c.scriptKey = o, this.callFunctionDef($s(o, a), s, r[2], t, c, n), c;
	}
	loadXmlObject(e, t) {
		if (!t || typeof fetch > "u" || typeof DOMParser > "u") return;
		let n = t.startsWith("/") ? t : `/${t}`;
		fetch(n).then((e) => e.ok ? e.text() : "").then((t) => {
			if (!t) return;
			let n = new DOMParser().parseFromString(t, "application/xml");
			e.document = n, e.documentElement = n.documentElement;
			let r = e.onLoad;
			if (Ic(r) && r.target instanceof X) {
				if (!qc(e, r.target)) return;
				let t = this.methodFunctionForClip(r.target, r.method);
				t && this.callFunctionDef(t.key, t.def, "true", void 0, r.target);
			}
			this.render();
		}).catch(() => {});
	}
	loadClipInto(e, t, n) {
		let r = zc(t);
		if (r) {
			if (this.dispatchMovieClipLoader(e, "onLoadStart", n), Vc(r) && this.options.loadTimeline) {
				this.options.loadTimeline(r).then((t) => {
					if (!t) {
						this.fetchLoadedClip(e, r, n);
						return;
					}
					n.loadedTimeline = t, n.loadedFrame = xo(t.entryFrame ?? 0, 0, Math.max(0, (t.frameCount ?? 1) - 1)), n.loadedPlaying = !0, n.props.__loadedSrc = r, n.props.__loadedWidth = t.dimensions.width, n.props.__loadedHeight = t.dimensions.height, this.dispatchMovieClipLoader(e, "onLoadComplete", n), this.dispatchMovieClipLoader(e, "onLoadInit", n), this.render();
				}).catch(() => this.fetchLoadedClip(e, r, n));
				return;
			}
			this.fetchLoadedClip(e, r, n);
		}
	}
	fetchLoadedClip(e, t, n) {
		if (Bc(t) && typeof Image < "u") {
			let r = new Image();
			r.onload = () => {
				n.props.__loadedSrc = t, n.props.__loadedWidth = r.naturalWidth || r.width || 0, n.props.__loadedHeight = r.naturalHeight || r.height || 0, this.dispatchMovieClipLoader(e, "onLoadComplete", n), this.dispatchMovieClipLoader(e, "onLoadInit", n), this.render();
			}, r.onerror = () => {
				this.dispatchMovieClipLoader(e, "onLoadError", n);
			}, r.src = P(t);
			return;
		}
		if (typeof fetch > "u") {
			this.dispatchMovieClipLoader(e, "onLoadError", n);
			return;
		}
		fetch(P(t), { method: "GET" }).then((r) => {
			if (!r.ok) {
				this.dispatchMovieClipLoader(e, "onLoadError", n);
				return;
			}
			n.props.__loadedSrc = t, n.props.__loadedWidth = 0, n.props.__loadedHeight = 0, this.dispatchMovieClipLoader(e, "onLoadComplete", n), this.dispatchMovieClipLoader(e, "onLoadInit", n), this.render();
		}).catch(() => {
			this.dispatchMovieClipLoader(e, "onLoadError", n);
		});
	}
	dispatchMovieClipLoader(e, t, n) {
		for (let r of Rc(e)) {
			let e = r[t];
			if (Ic(e) && e.target instanceof X) {
				let t = this.methodFunctionForClip(e.target, e.method);
				t && this.callFunctionDef(t.key, t.def, "__loadedClip", { __loadedClip: n }, e.target);
			}
		}
	}
	createTweenObject(e, t, n) {
		let [r, i, , a, o, s, c] = this.parseArgs(e, t, n), l = typeof i == "string" ? go(i) : "", u = {
			__avm1Type: "Tween",
			target: r,
			property: l,
			begin: a,
			finish: o,
			duration: s
		}, d = Rs(s, c, this.timeline.fps || 30), f = () => {
			r instanceof X && l && Fs(r, l, o);
			let e = u.onMotionFinished;
			if (Ic(e) && e.target instanceof X) {
				let t = this.methodFunctionForClip(e.target, e.method);
				t && this.callFunctionDef(t.key, t.def, "__tween", { __tween: u }, e.target);
			}
			this.render();
		}, p = Number(a), m = Number(o);
		if (!(r instanceof X) || !l || !Number.isFinite(p) || !Number.isFinite(m) || d <= 16) {
			let e = setTimeout(() => {
				this.runtimeTimers.delete(e), f();
			}, d);
			return this.runtimeTimers.add(e), u;
		}
		Fs(r, l, p);
		let h = Date.now(), g = setInterval(() => {
			let e = Math.min(1, (Date.now() - h) / d);
			Fs(r, l, p + (m - p) * e), e >= 1 ? (this.runtimeTimers.delete(g), clearInterval(g), f()) : this.render();
		}, 33);
		return this.runtimeTimers.add(g), u;
	}
	createInterval(e, t, n) {
		let [r, i, a] = this.parseArgs(e, t, n);
		if (!(r instanceof X)) return;
		let o = typeof i == "string" ? i : "";
		if (!o) return;
		let s = Number(a), c = setInterval(() => {
			let e = this.methodFunctionForClip(r, o);
			e && this.callFunctionDef(e.key, e.def, void 0, void 0, r);
		}, Number.isFinite(s) && s > 0 ? s : 1);
		return this.runtimeTimers.add(c), Number(c);
	}
	createTimeout(e, t, n) {
		let [r, i, a] = this.parseArgs(e, t, n);
		if (!(r instanceof X)) return;
		let o = typeof i == "string" ? i : "";
		if (!o) return;
		let s = Number(a), c = setTimeout(() => {
			this.runtimeTimers.delete(c);
			let e = this.methodFunctionForClip(r, o);
			e && this.callFunctionDef(e.key, e.def, void 0, void 0, r);
		}, Number.isFinite(s) && s >= 0 ? s : 1);
		return this.runtimeTimers.add(c), Number(c);
	}
	clearRuntimeTimer(e) {
		let t = Number(e);
		if (Number.isFinite(t)) {
			for (let e of this.runtimeTimers) if (Number(e) === t) {
				clearTimeout(e), clearInterval(e), this.runtimeTimers.delete(e);
				return;
			}
		}
	}
	clearRuntimeTimers() {
		for (let e of this.runtimeTimers) clearTimeout(e), clearInterval(e);
		this.runtimeTimers.clear();
	}
	removeMovieClip(e) {
		let t = e.parent;
		if (t) {
			for (let [n, r] of t.childClips) {
				if (r !== e) continue;
				t.childClips.delete(n);
				let i = Ys(n);
				t.dynamicInstances.delete(i), t.depthNames.delete(i), t.depthNames.delete(n), t.displayListMutated = !0;
				return;
			}
			e.visible = !1;
		}
	}
	swapDepths(e, t) {
		let n = e.parent;
		if (!n) return;
		let r = this.depthOfChild(n, e);
		if (r === void 0) return;
		if (t instanceof X) {
			let i = this.depthOfChild(n, t);
			if (i === void 0) return;
			e.depthOverride = Zs(n, i), t.depthOverride = Zs(n, r);
			return;
		}
		let i = Number(t);
		if (!Number.isFinite(i)) return;
		let a = Ys(r), o = n.dynamicInstances.get(a);
		if (o && n.childClips.get(r) === e) {
			n.dynamicInstances.delete(a), n.childClips.delete(r), o.depth = i, n.dynamicInstances.set(i, o), n.childClips.set(qs(i), e), n.displayListMutated = !0, e.depthOverride = void 0;
			return;
		}
		e.depthOverride = i >= 0 ? qs(i) : i, n.displayListMutated = !0;
	}
	startDrag(e, t, n, r) {
		let [, i, a, o, s] = this.parseArgs(t, n, r);
		this.beginDrag(e, Number(i), Number(a), Number(o), Number(s));
	}
	beginDrag(e, t, n, r, i) {
		e.x = e.x ?? e.placedX, e.y = e.y ?? e.placedY, this.activeDrag = {
			clip: e,
			left: Number.isFinite(t) ? t : void 0,
			top: Number.isFinite(n) ? n : void 0,
			right: Number.isFinite(r) ? r : void 0,
			bottom: Number.isFinite(i) ? i : void 0
		};
	}
	stopDragClip(e) {
		(!e || e === this.activeDrag?.clip) && (this.activeDrag = void 0);
	}
	depthOfChild(e, t) {
		for (let [n, r] of e.childClips) if (r === t) return n;
	}
	unloadMovieClip(e) {
		e.childClips.clear(), e.dynamicInstances.clear(), e.depthNames.clear(), e.displayListMutated = !0, e.loadedTimeline = void 0, e.loadedFrame = 0, e.loadedPlaying = !1, e.visible = !1;
	}
	nextHighestDepth(e) {
		let t = -1, n = this.framesFor(e);
		for (let r of n?.[e.currentFrame]?.instances ?? []) t = Math.max(t, r.depth);
		for (let n of e.dynamicInstances.keys()) t = Math.max(t, n);
		return t + 1;
	}
	resolveValueTarget(e, t, n) {
		let r = t.trim();
		return !r || r === "this" || r === "self" ? e : n && r in n ? n[r] : this.resolveTarget(e, r) || this.resolveObjectPath(e, r, n);
	}
	resolveObjectPath(e, t, n) {
		if (!/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\[[^\]]+\])*$/.test(t)) return;
		let r = bc(t);
		if (!r.length) return;
		let i, [a] = r;
		i = a === "this" || a === "self" ? e : a === "_root" || a === "_level0" || a === "root" ? this.root : n && a in n ? n[a] : a in e.props ? e.props[a] : this.store?.get(a);
		for (let t of r.slice(1)) if (i instanceof X) i = this.resolveClipMember(i, t);
		else if (Array.isArray(i)) i = t === "length" ? i.length : i[Number(this.resolveExpr(t, n, e) ?? t)];
		else if (Hc(i)) i = Gc(i, t);
		else if ($(i)) i = i[t];
		else return;
		return vc(i) ? i : void 0;
	}
	assignObjectPath(e, t, n, r) {
		let i = bc(t ?? "");
		if (i.length < 2) return !1;
		let a = i[i.length - 1], o = i.slice(0, -1).join("."), s = this.resolveValueTarget(e, o, r);
		if (s instanceof X) {
			let t = this.methodFunctionForClip(s, `set ${a}`);
			return t && this.callFunctionDef(t.key, t.def, "__setterValue", { __setterValue: n }, s, e), s.props[a] = n, Kc(n, s, a), !0;
		}
		return $(s) ? (s[a] = n, !0) : !1;
	}
	resolveClipMember(e, t) {
		let n = Mc(e, t, this.getAsset(e.characterId));
		return n === void 0 ? t in e.props ? e.props[t] : this.findClipByName(e, t) || this.namedLeafObject(e, t) : n;
	}
	namedLeafObject(e, t) {
		let n = this.framesFor(e)?.[e.currentFrame];
		for (let r of this.instancesForFrame(e, n)) {
			if (r.name !== t) continue;
			let n = this.getAsset(r.characterId);
			if (!n) continue;
			let i = n.kind === "text" ? this.resolveTextField(n.id, n, e, t) : void 0, a = this.leafDisplayProps(e, t);
			return a._width === void 0 && (a._width = i ? Pc(i.text ?? "", i.fontHeight, n.text?.width ?? n.origin.width ?? 0) : n.text?.width ?? n.origin.width ?? 0), a._height === void 0 && (a._height = i ? Math.max(i.height ?? 0, i.lineHeight ?? i.fontHeight + (i.leading ?? 0)) : n.text?.height ?? n.origin.height ?? 0), a._x === void 0 && (a._x = r.matrix.tx), a._y === void 0 && (a._y = r.matrix.ty), a;
		}
	}
	findLeafChild(e, t) {
		let n = this.framesFor(e)?.[e.currentFrame];
		for (let r of this.instancesForFrame(e, n)) {
			if (r.name !== t) continue;
			let e = this.getAsset(r.characterId);
			if (e && e.kind !== "sprite" && e.kind !== "button") return r;
		}
	}
	leafDisplayProps(e, t) {
		let n = e.leafProps.get(t);
		return n || (n = {}, e.leafProps.set(t, n)), n;
	}
	resolveObjectLiteral(e, t, n) {
		let r = {};
		for (let i of vo(e.slice(1, -1))) {
			let e = i.indexOf(":");
			if (e < 0) continue;
			let a = i.slice(0, e).trim().replace(/^["']|["']$/g, "");
			a && (r[a] = this.resolveExpr(i.slice(e + 1), t, n));
		}
		return r;
	}
	addEventListener(e, t, n) {
		let r = Jc(e), i = r[t] ?? (r[t] = []);
		i.some((e) => e.target === n.target && e.method === n.method) || i.push(n);
	}
	removeEventListener(e, t, n) {
		let r = Jc(e), i = r[t];
		i?.length && (r[t] = i.filter((e) => e.target !== n.target || e.method !== n.method));
	}
	dispatchEvent(e, t) {
		let n = String(t.type ?? "");
		if (n) for (let r of Jc(e)[n] ?? []) {
			if (!(r.target instanceof X)) continue;
			let e = this.methodFunctionForClip(r.target, r.method);
			e && this.callFunctionDef(e.key, e.def, "__event", { __event: t }, r.target);
		}
	}
	dispatchMovieClipPointerEvent(e, t) {
		let n = Yc(t), r = Xc(t), i = {
			target: e,
			type: n
		}, a = e.props.__appPointerDispatcher;
		if (typeof a == "function" && a(n), r) {
			let t = e.props[r];
			if (Ic(t) && t.target instanceof X) {
				let e = this.methodFunctionForClip(t.target, t.method);
				e && this.callFunctionDef(e.key, e.def, "__event", { __event: i }, t.target);
			}
		}
		this.dispatchEvent(e, i);
	}
	runAssignedEnterFrame(e) {
		let t = e.props.onEnterFrame;
		if (Ic(t) && t.target instanceof X) {
			let n = this.methodFunctionForClip(t.target, t.method);
			n && this.callFunctionDef(n.key, n.def, "__event", { __event: {
				target: e,
				type: "enterFrame"
			} }, t.target);
			return;
		}
		if (typeof t == "string") {
			let n = this.methodFunctionForClip(e, t);
			n && this.callFunctionDef(n.key, n.def, void 0, void 0, e);
		}
	}
	runWhileBody(e, t, n) {
		let r = Dc(e);
		if (r) {
			for (let e = 0; e < 100 && this.evalSimpleCondition(r.condition, t, n); e += 1) if (this.runRuntimeStatements(r.body, t, n) === "break") return;
		}
	}
	evalSimpleCondition(e, t, n) {
		for (let r of [
			"<=",
			">=",
			"==",
			"!=",
			"<",
			">"
		]) {
			let i = Zc(e, r);
			if (i.length !== 2) continue;
			let a = this.resolveExpr(i[0], t, n), o = this.resolveExpr(i[1], t, n), s = Number(a), c = Number(o);
			switch (r) {
				case "<=": return s <= c;
				case ">=": return s >= c;
				case "==": return String(a ?? "") === String(o ?? "");
				case "!=": return String(a ?? "") !== String(o ?? "");
				case "<": return s < c;
				case ">": return s > c;
			}
		}
		return Is(this.resolveExpr(e, t, n) ?? !1);
	}
	evalRuntimeCondition(e, t, n) {
		let r = e.trim();
		if (!r || r === "else" || r === "true") return !0;
		if (r === "false") return !1;
		for (; r.startsWith("(") && tl(r) === r.length - 1;) r = r.slice(1, -1).trim();
		let i = Zc(r, "||");
		if (i.length > 1) return i.some((e) => this.evalRuntimeCondition(e, t, n));
		let a = Zc(r, "&&");
		if (a.length > 1) return a.every((e) => this.evalRuntimeCondition(e, t, n));
		if (r.startsWith("!")) return !this.evalRuntimeCondition(r.slice(1), t, n);
		let o = Qc(r, "instanceof");
		if (o.length === 2) return el(this.resolveExpr(o[0], t, n), o[1]);
		for (let e of [
			"<=",
			">=",
			"==",
			"!=",
			"<",
			">"
		]) {
			let i = Zc(r, e);
			if (i.length === 2) return Ls(this.resolveExpr(i[0], t, n), this.resolveExpr(i[1], t, n), e);
		}
		return Is(this.resolveExpr(r, t, n) ?? !1);
	}
	runRuntimeStatements(e, t, n) {
		for (let r of Ac(e)) {
			let e = this.runRuntimeStatement(r, t, n);
			if (e) return e;
		}
	}
	runRuntimeStatement(e, t, n) {
		let r = e.trim();
		if (!r || r.startsWith("trace(")) return;
		if (r === "break" || r === "break;") return "break";
		if (r === "continue" || r === "continue;") return "continue";
		if (r.startsWith("var ")) return this.runRuntimeStatement(r.slice(4).trim(), t, n);
		let i = r.match(/^(.+?)(\+\+|--)$/s);
		if (i) {
			let e = i[1].trim(), r = Number(this.resolveExpr(e, t, n) ?? 0);
			this.assignRuntimeValue(e, r + (i[2] === "++" ? 1 : -1), t, n);
			return;
		}
		let a = Oc(r);
		if (a) {
			let e = this.evalRuntimeCondition(a.condition, t, n) ? a.thenBody : a.elseBody;
			return (e === void 0 ? void 0 : this.runRuntimeStatements(e, t, n)) || (a.tail === void 0 ? void 0 : this.runRuntimeStatements(a.tail, t, n));
		}
		let o = Dc(r);
		if (o) {
			for (let e = 0; e < 100 && this.evalSimpleCondition(o.condition, t, n); e += 1) if (this.runRuntimeStatements(o.body, t, n) === "break") return;
			return;
		}
		let s = r.match(/^(.+?)\s*\+=\s*(.+)$/s);
		if (s) {
			let e = this.resolveExpr(s[1].trim(), t, n), r = this.resolveExpr(s[2].trim(), t, n), i = typeof e == "string" || typeof r == "string" ? `${e ?? ""}${r ?? ""}` : Number(e ?? 0) + Number(r ?? 0);
			this.assignRuntimeValue(s[1].trim(), i, t, n);
			return;
		}
		let c = r.match(/^(.+?)\s*=\s*(.+)$/s);
		if (c && !/[!<>]=?$/.test(c[1].trim())) {
			this.assignRuntimeValue(c[1].trim(), this.resolveExpr(c[2].trim(), t, n), t, n);
			return;
		}
		if (Ec(r)) {
			this.resolveExpr(r, t, n);
			return;
		}
		let l = jc(r);
		l && this.runBodyCall({
			kind: "call",
			target: l.target,
			functionName: l.name,
			arguments: l.arguments
		}, t, n);
	}
	assignRuntimeValue(e, t, n, r) {
		t !== void 0 && (yo(e) && (n[e] = t), !this.applyPropertyAssignment(r, e, t, n) && (this.assignObjectPath(r, e, t, n) || this.scopeSet(r, e, t)));
	}
	resolveFrame(e, t) {
		if (e.label) {
			let n = (t ? this.framesFor(t) : null)?.findIndex((t) => t.label === e.label) ?? -1;
			if (n >= 0) return n;
			let r = this.timeline.labels ?? {};
			if (e.label in r) return r[e.label];
		}
		if (typeof e.frame == "number") return e.frame;
		let n = e.frameExpression?.match(/^_currentframe\s*([+-])\s*(\d+)$/);
		if (n && t) {
			let e = Number(n[2]) * (n[1] === "-" ? -1 : 1);
			return xo(t.currentFrame + e, 0, Math.max(0, this.frameCountFor(t) - 1));
		}
		return -1;
	}
	framesFor(e) {
		return e.characterId === Ss ? this.rootFrames : this.assets[String(e.characterId)]?.timeline ?? null;
	}
	frameCountFor(e) {
		if (e.characterId === Ss) return Math.max(1, this.rootFrames.length);
		let t = this.assets[String(e.characterId)];
		return Math.max(1, t?.timeline?.length ?? t?.frames?.length ?? 1);
	}
	stopFramesFor(e) {
		if (e.characterId === Ss) return this.rootStop;
		let t = this.spriteStop.get(e.characterId);
		return t || (t = new Set(this.timeline.control?.spriteStopFrames?.[String(e.characterId)] ?? []), this.spriteStop.set(e.characterId, t)), t;
	}
	actionsFor(e) {
		return e.characterId === Ss ? this.rootActions.get(e.currentFrame) ?? [] : this.spriteActions.get(`${e.characterId}:${e.currentFrame}`) ?? [];
	}
	instancesForFrame(e, t) {
		let n = (t, n) => Xs(e, t) - Xs(e, n), r = [...e.dynamicInstances.values()].map((e) => ({
			...e,
			depth: qs(e.depth)
		}));
		if (!t) return r.sort(n);
		let i = [...e.childClips.values()].some((e) => e.depthOverride !== void 0);
		return !r.length && !i ? t.instances : [...t.instances, ...r].sort(n);
	}
	getAsset(e) {
		return this.assets[String(e)] ?? this.assets[`button:${e}`];
	}
	renderBatchDepth = 0;
	renderBatchDirty = !1;
	beginRenderBatch() {
		this.renderBatchDepth += 1;
	}
	endRenderBatch() {
		--this.renderBatchDepth, this.renderBatchDepth === 0 && this.renderBatchDirty && (this.renderBatchDirty = !1, this.render());
	}
	render() {
		if (this.renderBatchDepth > 0) {
			this.renderBatchDirty = !0;
			return;
		}
		let e = [];
		this.clipByPath = /* @__PURE__ */ new Map(), this.clipByPath.set("0", this.root), this.flatten(this.root, ls, 1, void 0, "0", { n: 0 }, e);
		let t = new Set(e.filter((e) => e.kind === "button").map((e) => e.key));
		for (let e of this.buttonVisualStates.keys()) t.has(e) || this.buttonVisualStates.delete(e);
		this.renderer.apply(e), this.lastNodes = e;
	}
	subtreeHasDynamicInstances(e) {
		if (e.dynamicInstances.size > 0) return !0;
		for (let t of e.childClips.values()) if (this.subtreeHasDynamicInstances(t)) return !0;
		return !1;
	}
	subtreeHasHiddenChild(e) {
		for (let t of e.childClips.values()) if (t.visible === !1 || this.subtreeHasHiddenChild(t)) return !0;
		return !1;
	}
	subtreeHasTransformedChild(e) {
		for (let t of e.childClips.values()) if (t.width !== void 0 || t.height !== void 0 || t.xscale !== void 0 && t.xscale !== 100 || t.yscale !== void 0 && t.yscale !== 100 || this.subtreeHasTransformedChild(t)) return !0;
		return !1;
	}
	placedAlpha(e, t) {
		return this.dataApp && t?.alpha !== void 0 ? zs(t) : e * zs(t);
	}
	flatten(e, t, n, r, i, a, o) {
		let s = this.framesFor(e)?.[e.currentFrame], c = this.instancesForFrame(e, s), l = yc(e.props.__loadedSrc);
		if (typeof l == "string" && Bc(l) && o.push({
			key: `${i}#loaded`,
			order: a.n++,
			characterId: 0,
			kind: "image",
			name: e.name,
			src: l,
			origin: {
				x: 0,
				y: 0,
				width: Number(e.props.__loadedWidth ?? 0),
				height: Number(e.props.__loadedHeight ?? 0)
			},
			matrix: t,
			opacity: n * zs(e),
			colorTransform: r
		}), e.loadedTimeline) {
			let s = xo(e.loadedFrame, 0, Math.max(0, (e.loadedTimeline.frameCount ?? 1) - 1)), c = e.loadedTimeline.frameSvgs?.[s] ?? (e.loadedTimeline.frameSvgsOmitted ? "" : `generated/${e.loadedTimeline.scene}/frames/${s + 1}.svg`);
			c && o.push({
				key: `${i}#loaded-swf`,
				order: a.n++,
				characterId: 0,
				kind: "sprite",
				name: e.name,
				src: c,
				origin: {
					x: 0,
					y: 0,
					width: e.loadedTimeline.dimensions.width,
					height: e.loadedTimeline.dimensions.height
				},
				matrix: t,
				opacity: n * zs(e),
				colorTransform: r,
				spriteFrame: s
			});
		}
		if (!c.length) return;
		let u = new Set(c.map((e) => e.depth)), d = /* @__PURE__ */ new Set();
		for (let t of e.childClips.values()) t.maskClip && d.add(t.maskClip);
		let f = [], p = (e) => {
			for (; f.length && e > f[f.length - 1].clipDepth;) {
				let e = f.pop();
				o.push({
					key: e.key,
					order: e.order,
					characterId: 0,
					kind: "shape",
					name: "",
					src: "",
					origin: Es,
					matrix: t,
					opacity: 1,
					maskGroup: e.group
				});
			}
		};
		for (let s of c) {
			p(s.depth);
			let c = this.getAsset(s.characterId), l = e.childClips.get(s.depth);
			if (l && d.has(l) || l?.visible === !1) continue;
			let u = us(t, Hs(s.matrix, l, c?.origin)), m = n * this.placedAlpha(s.opacity, l), h = Eo(r, s.colorTransform), g = `${i}/${s.depth}`;
			if (!c) {
				l && this.flatten(l, u, m, h, g, a, o);
				continue;
			}
			if (l?.maskClip) {
				let n = this.runtimeMaskGroup(e, l, t, u, m, h, g, a);
				if (n) {
					o.push(n);
					continue;
				}
			}
			if (s.clipDepth) {
				let e = this.resolveMaskVisual(c, l, u, h, s);
				e && f.push({
					key: `${g}#mask`,
					order: a.n++,
					clipDepth: s.clipDepth,
					group: {
						mask: e,
						items: []
					}
				});
				continue;
			}
			let _ = f[f.length - 1];
			if (_ && s.depth <= _.clipDepth) {
				if (c.kind === "sprite" && l && l.characterId === c.id && (c.timeline?.length || this.hasAnyDynamicInstances && this.subtreeHasDynamicInstances(l))) {
					let e = [];
					this.flatten(l, u, m, h, g, a, e), _.group.items.push(...this.maskVisualsFromNodes(e));
				} else {
					let e = wo(c, l);
					e && _.group.items.push({
						characterId: c.id,
						src: e,
						origin: c.origin,
						matrix: u,
						opacity: m,
						colorTransform: h,
						...To(s)
					});
				}
				continue;
			}
			if (c.kind === "sprite" && c.frames?.length && !c.overflowsBounds && !(this.hasAnyDynamicInstances && l && this.subtreeHasDynamicInstances(l)) && !(this.hasAnyDynamicInstances && l && this.subtreeHasHiddenChild(l)) && !(this.hasAnyDynamicInstances && l && this.subtreeHasTransformedChild(l))) {
				let e = l ? xo(l.currentFrame, 0, c.frames.length - 1) : 0;
				o.push(Do(g, a.n++, c, c.frames[e], u, m, s, l?.currentFrame, h)), l && c.timeline?.length && this.collectButtons(l, u, h, g, a, o, m), l && this.clipHasPointerEvents(l) && o.push(this.movieClipHitNode(`${g}#hit`, a.n++, c, u, s, g, h));
				continue;
			}
			if (c.kind === "sprite" && l && l.characterId === c.id && (c.timeline?.length || this.hasAnyDynamicInstances && l.dynamicInstances.size)) {
				this.clipByPath.set(g, l), this.clipHasPointerEvents(l) && o.push(this.movieClipHitNode(`${g}#hit`, a.n++, c, u, s, g, h)), this.flatten(l, u, m, h, g, a, o);
				continue;
			}
			if (c.kind === "button") {
				o.push(Oo(g, a.n++, c, u, s, i, !0, m, this.buttonVisualStates.get(g), h)), this.collectButtonText(c, u, h, g, a, o, s);
				continue;
			}
			let v = s.name ? e.leafProps.get(s.name) : void 0;
			v?._visible === !1 || v?._visible === 0 || o.push(this.leafNode(g, a.n++, c, c.src ?? "", Us(t, s.matrix, c, v), m * Bs(v), s, h, e, v));
		}
		this.collectLatentButtons(e, t, r, i, a, o, u, n), p(Infinity);
	}
	collectButtons(e, t, n, r, i, a, o = 1) {
		this.clipByPath.set(r, e);
		let s = this.framesFor(e);
		if (!s) return;
		let c = s[e.currentFrame];
		if (!c) return;
		let l = this.instancesForFrame(e, c), u = new Set(l.map((e) => e.depth));
		for (let s of l) {
			if (s.clipDepth) continue;
			let c = this.getAsset(s.characterId);
			if (!c) continue;
			let l = e.childClips.get(s.depth);
			if (l?.visible === !1) continue;
			let u = us(t, Hs(s.matrix, l, c.origin)), d = o * this.placedAlpha(s.opacity, l), f = Eo(n, s.colorTransform), p = `${r}/${s.depth}`;
			if (c.kind === "button") a.push(Oo(p, i.n++, c, u, s, r, !1, d, this.buttonVisualStates.get(p), f)), this.collectButtonText(c, u, f, p, i, a, s, d);
			else if (c.kind === "text") {
				let n = this.resolveTextField(c.id, c, e, s.name);
				if (n?.normalizedVariableName ? this.textVars.has(n.normalizedVariableName) : n?.text && String(n.text).trim()) {
					let n = s.name ? e.leafProps.get(s.name) : void 0;
					if (n?._visible === !1 || n?._visible === 0) continue;
					a.push(this.leafNode(p, i.n++, c, c.src ?? "", Us(t, s.matrix, c, n), d * Bs(n), s, f, e, n));
				}
			} else if (c.kind === "sprite" && l) {
				if (Js(s.depth) && c.frames?.length) {
					let e = xo(l.currentFrame, 0, c.frames.length - 1);
					a.push(Do(p, i.n++, c, c.frames[e], u, d, s, l.currentFrame, f));
				}
				this.clipHasPointerEvents(l) && a.push(this.movieClipHitNode(`${p}#hit`, i.n++, c, u, s, p, f)), this.collectButtons(l, u, f, p, i, a, d);
			}
		}
		this.collectLatentButtons(e, t, n, r, i, a, u, o);
	}
	collectLatentButtons(e, t, n, r, i, a, o, s = 1) {
		if (!(e.characterId === Ss || e.playing)) for (let c of this.latentButtonPlacements(e)) {
			if (o.has(c.depth)) continue;
			let e = this.getAsset(c.characterId);
			if (!e || e.kind !== "button") continue;
			let l = us(t, c.matrix), u = Eo(n, c.colorTransform), d = `${r}/${c.depth}`;
			a.push(Oo(d, i.n++, e, l, c, r, !1, s, this.buttonVisualStates.get(d), u));
		}
	}
	latentButtonPlacements(e) {
		let t = e.characterId, n = this.latentButtonPlacementsCache.get(t);
		if (n) return n;
		let r = this.framesFor(e);
		if (!r?.length) return this.latentButtonPlacementsCache.set(t, []), [];
		let i = /* @__PURE__ */ new Map();
		for (let e of r) for (let t of e.instances ?? []) i.has(t.depth) || this.getAsset(t.characterId)?.kind !== "button" || !this.buttonControlsOwnerTimeline(t.characterId) || i.set(t.depth, t);
		let a = [...i.values()];
		return this.latentButtonPlacementsCache.set(t, a), a;
	}
	resolveMaskVisual(e, t, n, r, i, a = 0) {
		let o = wo(e, t);
		if (o) return {
			characterId: e.id,
			src: o,
			origin: e.origin,
			matrix: n,
			opacity: 1,
			colorTransform: r,
			...To(i)
		};
		if (e.kind !== "sprite" || a > 6) return;
		let s = t ? this.framesFor(t) : e.timeline ?? null, c = t ? t.currentFrame : 0, l = s?.[c] ?? s?.[0], u = t ? this.instancesForFrame(t, l) : l?.instances ?? [];
		for (let e of u) {
			let i = this.getAsset(e.characterId);
			if (!i) continue;
			let o = t?.childClips.get(e.depth), s = us(n, Hs(e.matrix, o, i.origin)), c = this.resolveMaskVisual(i, o, s, r, e, a + 1);
			if (c) return c;
		}
	}
	runtimeMaskGroup(e, t, n, r, i, a, o, s) {
		let c = t.maskClip;
		if (!c) return;
		let l = this.placementForChild(e, c);
		if (!l) return;
		let u = this.getAsset(l.characterId);
		if (!u) return;
		let d = us(n, Hs(l.matrix, c)), f = this.resolveMaskVisual(u, c, d, void 0, l);
		if (!f) return;
		let p = [];
		this.flatten(t, r, i, a, o, s, p);
		let m = this.maskVisualsFromNodes(p);
		if (m.length) return {
			key: `${o}#runtime-mask`,
			order: s.n++,
			characterId: 0,
			kind: "shape",
			name: "",
			src: "",
			origin: Es,
			matrix: n,
			opacity: 1,
			maskGroup: {
				mask: f,
				items: m
			}
		};
	}
	maskVisualsFromNodes(e) {
		return e.filter((e) => e.kind !== "button" && (!!e.maskGroup || !!e.src || e.kind === "text" && !!e.text)).map((e) => ({
			key: e.key,
			characterId: e.characterId,
			kind: e.kind,
			src: e.src,
			origin: e.origin,
			matrix: e.matrix,
			opacity: e.opacity,
			colorTransform: e.colorTransform,
			text: e.text,
			maskGroup: e.maskGroup,
			...Ms(e)
		}));
	}
	placementForChild(e, t) {
		let n = this.framesFor(e)?.[e.currentFrame];
		for (let r of this.instancesForFrame(e, n)) if (e.childClips.get(r.depth) === t) return r;
	}
	buttonControlsOwnerTimeline(e) {
		let t = this.timeline.control?.buttonActions?.[String(e)];
		return t ? [
			"rollOver",
			"press",
			"release",
			"rollOut"
		].some((e) => {
			let n = t[e];
			return !!(n && (n.command === "gotoAndPlay" || n.command === "gotoAndStop") && ks(n.target));
		}) : !1;
	}
	collectButtonText(e, t, n, r, i, a, o, s = o.opacity) {
		for (let c of e.textFields ?? []) {
			let e = this.getAsset(c.id);
			if (!e) continue;
			let l = this.resolveTextField(c.id, e);
			if (!l?.normalizedVariableName || !this.textVars.has(l.normalizedVariableName)) continue;
			let u = us(t, c.matrix);
			a.push(this.leafNode(`${r}/txt:${c.id}`, i.n++, e, e.src ?? "", u, s, o, n));
		}
	}
	clipHasPointerEvents(e) {
		let t = e.props.__eventListeners;
		if ($(t)) {
			for (let e of [
				"release",
				"releaseoutside",
				"rollover",
				"rollout",
				"press"
			]) if (Array.isArray(t[e]) && t[e].length) return !0;
		}
		return e.props.__appPointerEvents || typeof e.props.__appPointerDispatcher == "function" ? !0 : Ic(e.props.onRelease) || Ic(e.props.onReleaseOutside) || Ic(e.props.onRollOver) || Ic(e.props.onRollOut) || Ic(e.props.onPress);
	}
	movieClipHitNode(e, t, n, r, i, a, o) {
		return {
			key: e,
			order: t,
			characterId: n.id,
			kind: "button",
			name: i.name,
			src: "",
			origin: n.origin,
			matrix: r,
			opacity: 1,
			colorTransform: o,
			...To(i),
			buttonOwnerPath: a
		};
	}
	leafNode(e, t, n, r, i, a, o, s = o.colorTransform, c, l) {
		let u = Ws(n, l), d = n.kind === "text" ? this.resolveTextField(n.id, n, c, o.name) : void 0;
		if (d) {
			let e = this.autoSizeTextLayout(n, d, l);
			if (e && ({text: d, origin: u} = {
				text: e.text,
				origin: {
					...u,
					x: e.x,
					width: e.width
				}
			}), d && !(Number(d.lineHeight) > 0)) {
				let e = this.lineHeightBase(d.fontId ?? n.text?.fontId, Number(d.fontHeight));
				e !== Number(d.fontHeight) && (d = {
					...d,
					lineHeight: Math.max(1, e + Number(d.leading ?? 0))
				});
			}
		}
		return {
			key: e,
			order: t,
			characterId: n.id,
			kind: n.kind,
			name: o.name,
			src: r,
			origin: u,
			matrix: i,
			opacity: a,
			colorTransform: s,
			...To(o),
			clipDepth: o.clipDepth,
			text: d
		};
	}
	autoSizeTextLayout(e, t, n) {
		let r = n?.autoSize === void 0 ? t.autoSize ? "left" : void 0 : n.autoSize;
		if (r == null) return;
		let i = typeof r == "string" ? r.toLowerCase() : "";
		if (!(i ? i !== "none" : Is(r)) || t.wordWrap || t.multiline || t.staticLines?.length) return;
		let a = i === "center" ? "center" : i === "right" ? "right" : "left", o = (t.text ?? "").replace(/<[^>]+>/g, "");
		if (!o.trim() || o.includes("\n")) return;
		let s = this.measureTextWidthPx(o, Number(t.fontHeight), t.fontId ?? e.text?.fontId);
		if (s == null || s <= 0) return;
		let c = s + 4, l = t.x ?? e.text?.x ?? e.origin.x ?? 0, u = t.width ?? e.text?.width ?? e.origin.width ?? 0, d = a === "center" ? l + (u - c) / 2 : a === "right" ? l + (u - c) : l;
		return {
			text: {
				...t,
				x: d,
				width: c
			},
			x: d,
			width: c
		};
	}
	setTextVars(e) {
		for (let [t, n] of Object.entries(e)) this.textVars.set(t, n);
		this.render();
	}
	setTextTranslator(e) {
		this.textTranslator = e, this.render();
	}
	resolveTextField(e, t, n, r) {
		let i = t.text, a = this.timeline.control?.dynamicTexts?.[String(e)], o = i && a ? {
			...i,
			...a
		} : i ?? a, s = n && r ? this.clipTextOverrides.get(n)?.get(r) : void 0;
		if (s && o) return this.translateResolvedText(e, {
			...o,
			...s,
			html: s.html ?? o.html
		}, r, "runtime");
		let c = this.textOverrides.get(e);
		if (c && o) return this.translateResolvedText(e, {
			...o,
			...c,
			html: c.html ?? o.html
		}, r, "runtime");
		if (!o) return o;
		let l = o.normalizedVariableName;
		if (l && this.textVars.has(l)) {
			let t = this.textVars.get(l) ?? "";
			return this.translateResolvedText(e, {
				...o,
				text: t,
				align: uc(t, o.align, !!o.html)
			}, r, "variable");
		}
		return this.translateResolvedText(e, o, r, "timeline");
	}
	translateResolvedText(e, t, n, r) {
		if (!this.textTranslator) return t;
		let i = String(t.text ?? ""), a = this.textTranslator(i, {
			scene: this.timeline.scene,
			characterId: e,
			variableName: t.normalizedVariableName,
			instanceName: n || void 0,
			source: r
		});
		return a === void 0 || a === i ? t : {
			...t,
			text: a,
			staticLines: Os(t.staticLines, a),
			align: r === "variable" ? uc(a, t.align, !!t.html) : t.align
		};
	}
	primeAmbientSound() {
		if (!this.options.onSound) return;
		let e;
		for (let t = 0; t < this.root.currentFrame; t += 1) for (let n of this.rootActions.get(t) ?? []) n.command === "attachSound" && n.soundRole === "music" && (e = n);
		e && this.options.onSound(e);
	}
};
function Os(e, t) {
	if (!e?.length) return e;
	let n = t.split(/\r?\n/);
	if (n.length === e.length) return e.map((e, t) => ({
		...e,
		text: n[t] ?? ""
	}));
	if (e.length === 1) return [{
		...e[0],
		text: t
	}];
}
function ks(e) {
	return !e || e === "self" || e === "this" || e === "_root" || e === "_level0" || e === "root";
}
function As(e, t) {
	return t === "" && ys.test(e);
}
function js(e) {
	let t = e?.trim();
	if (!t) return null;
	let n = t.split(".");
	if (n.length < 2) return null;
	let r = go(n[n.length - 1]);
	return r ? {
		owner: n.slice(0, -1).join(".") || "this",
		property: r
	} : null;
}
function Ms(e) {
	return {
		visible: e.visible,
		blendMode: e.blendMode,
		filters: e.filters,
		cacheAsBitmap: e.cacheAsBitmap,
		className: e.className,
		clipActions: e.clipActions
	};
}
function Ns(e) {
	let t = {}, n = Ps(e.color);
	n && (t.color = n);
	let r = Number(e.leading);
	Number.isFinite(r) && (t.leading = r);
	let i = Number(e.size);
	Number.isFinite(i) && i > 0 && (t.fontHeight = i);
	let a = typeof e.align == "string" ? e.align.toLowerCase() : "";
	return (a === "left" || a === "right" || a === "center" || a === "justify") && (t.align = a), t;
}
function Ps(e) {
	if (typeof e == "string" && /^#[0-9a-f]{6}$/i.test(e)) return e;
	let t = Number(e);
	if (Number.isFinite(t)) return `#${Math.max(0, Math.min(16777215, Math.round(t))).toString(16).padStart(6, "0")}`;
}
function Fs(e, t, n) {
	switch (t) {
		case "_name": return e.name = String(n ?? ""), !0;
		case "_visible": return e.visible = Is(n), !0;
		case "_alpha": {
			let t = Number(n);
			return Number.isFinite(t) ? (e.alpha = t, !0) : !1;
		}
		case "_x": {
			let t = Number(n);
			return Number.isFinite(t) ? (e.x = t, !0) : !1;
		}
		case "_y": {
			let t = Number(n);
			return Number.isFinite(t) ? (e.y = t, !0) : !1;
		}
		case "_rotation": {
			let t = Number(n);
			return Number.isFinite(t) ? (e.rotation = t, !0) : !1;
		}
		case "_width": {
			let t = Number(n);
			return Number.isFinite(t) ? (e.width = t, !0) : !1;
		}
		case "_height": {
			let t = Number(n);
			return Number.isFinite(t) ? (e.height = t, !0) : !1;
		}
		case "_xscale": {
			let t = Number(n);
			return Number.isFinite(t) ? (e.xscale = t, !0) : !1;
		}
		case "_yscale": {
			let t = Number(n);
			return Number.isFinite(t) ? (e.yscale = t, !0) : !1;
		}
		default: return !1;
	}
}
function Is(e) {
	return e === null ? !1 : typeof e == "boolean" ? e : typeof e == "number" ? e !== 0 && !Number.isNaN(e) : typeof e == "string" ? e !== "" && e !== "0" && e.toLowerCase() !== "false" : !0;
}
function Ls(e, t, n) {
	if (e == null && t == null) {
		if (n === "==") return !0;
		if (n === "!=") return !1;
	}
	let r = typeof e == "number" || typeof e == "boolean" || typeof e == "string" && /^-?\d+(\.\d+)?$/.test(e.trim()) ? Number(e) : void 0, i = typeof t == "number" || typeof t == "boolean" || typeof t == "string" && /^-?\d+(\.\d+)?$/.test(t.trim()) ? Number(t) : void 0;
	if (r !== void 0 && i !== void 0 && Number.isFinite(r) && Number.isFinite(i)) switch (n) {
		case "==": return r === i;
		case "!=": return r !== i;
		case "<": return r < i;
		case ">": return r > i;
		case "<=": return r <= i;
		case ">=": return r >= i;
	}
	let a = e === void 0 ? "" : String(e), o = t === void 0 ? "" : String(t);
	switch (n) {
		case "==": return a === o;
		case "!=": return a !== o;
		case "<": return a < o;
		case ">": return a > o;
		case "<=": return a <= o;
		case ">=": return a >= o;
		default: return !1;
	}
}
function Rs(e, t, n) {
	let r = Number(e);
	return !Number.isFinite(r) || r <= 0 ? 0 : Is(t ?? !1) ? r * 1e3 : 1e3 / Math.max(1, n) * r;
}
function zs(e) {
	return e?.alpha === void 0 ? 1 : xo(e.alpha / 100, 0, 1);
}
function Bs(e) {
	let t = Number(e?._alpha);
	return Number.isFinite(t) ? xo(t / 100, 0, 1) : 1;
}
var Vs = 2;
function Hs(e, t, n) {
	if (!t || t.x === void 0 && t.y === void 0 && t.rotation === void 0 && t.xscale === void 0 && t.yscale === void 0 && t.width === void 0 && t.height === void 0) return e;
	let r = { ...e }, i = t.xscale === void 0 ? 1 : t.xscale / 100, a = t.yscale === void 0 ? 1 : t.yscale / 100;
	if (t.xscale === void 0 && t.width !== void 0 && n && n.width > 0 && (i = (t.width + Vs) / n.width), t.yscale === void 0 && t.height !== void 0 && n && n.height > 0 && (a = t.height / n.height), i !== 1 && (r.a *= i, r.b *= i), a !== 1 && (r.c *= a, r.d *= a), t.x !== void 0 && (r.tx = t.x), t.y !== void 0 && (r.ty = t.y), t.rotation !== void 0) {
		let n = t.rotation * Math.PI / 180, i = Math.cos(n), a = Math.sin(n), o = Math.hypot(e.a, e.b) || 1, s = Math.hypot(e.c, e.d) || 1;
		r.a = i * o, r.b = a * o, r.c = -a * s, r.d = i * s;
	}
	return r;
}
function Us(e, t, n, r) {
	if (!r) return us(e, t);
	let i = { ...t }, a = Number(r._xscale) / 100, o = Number(r._yscale) / 100, s = Number(r._width), c = Number(r._height), l = Math.max(1, n.text?.width ?? n.origin.width ?? Math.hypot(t.a, t.b)), u = Math.max(1, n.text?.height ?? n.origin.height ?? Math.hypot(t.c, t.d)), d = Number.isFinite(a) ? a : Number.isFinite(s) ? s / l : 1, f = Number.isFinite(o) ? o : Number.isFinite(c) ? c / u : 1;
	d !== 1 && (i.a *= d, i.b *= d), f !== 1 && (i.c *= f, i.d *= f);
	let p = Number(r._x), m = Number(r._y);
	return Number.isFinite(p) && (i.tx = p), Number.isFinite(m) && (i.ty = m), us(e, i);
}
function Ws(e, t) {
	let n = Number(t?._width), r = Number(t?._height);
	return !Number.isFinite(n) && !Number.isFinite(r) ? e.origin : {
		...e.origin,
		width: Number.isFinite(n) ? n : e.origin.width,
		height: Number.isFinite(r) ? r : e.origin.height
	};
}
function Gs(e, t) {
	let n = Infinity, r = Infinity, i = -Infinity, a = -Infinity;
	for (let [o, s] of [
		[e.x, e.y],
		[e.x + e.width, e.y],
		[e.x, e.y + e.height],
		[e.x + e.width, e.y + e.height]
	]) {
		let e = t.a * o + t.c * s + t.tx, c = t.b * o + t.d * s + t.ty;
		n = Math.min(n, e), r = Math.min(r, c), i = Math.max(i, e), a = Math.max(a, c);
	}
	return {
		x: n,
		y: r,
		width: i - n,
		height: a - r
	};
}
var Ks = 1 << 20;
function qs(e) {
	return e + Ks;
}
function Js(e) {
	return e >= Ks;
}
function Ys(e) {
	return Js(e) ? e - Ks : e;
}
function Xs(e, t) {
	return Zs(e, t.depth);
}
function Zs(e, t) {
	return e.childClips.get(t)?.depthOverride ?? t;
}
function Qs(e, t) {
	return e.includes(".") ? t === "main" || t === "init" || /^[A-Z]/.test(t) : !1;
}
function $s(e, t) {
	return `${e}:${t}`;
}
function ec(e) {
	let t = e?.split("/").pop()?.replace(/\.as$/i, "");
	return nc(t);
}
function tc(e, t) {
	let n = (e?.frames?.[0])?.match(/\/DefineSprite_\d+_([^/]+)\//)?.[1];
	return nc(n) ?? nc(t);
}
function nc(e) {
	return e?.replace(/%20/g, " ").replace(/[^A-Za-z0-9]+/g, "").toLowerCase() || void 0;
}
function rc(e) {
	if (!e) return "";
	let t = e.exitNavigation;
	return t ? [
		"exit",
		t.variable,
		t.value,
		t.swf,
		t.level ?? "",
		t.exitLabel ?? "",
		t.exitFrame
	].join("|") : !e.swf && e.frame === void 0 && !e.label ? "" : [
		"release",
		e.command ?? "",
		e.target ?? "",
		e.swf ?? "",
		e.level ?? "",
		e.label ?? "",
		e.frame ?? ""
	].join("|");
}
function ic(e, t) {
	let n = new Set((e.ownerSpriteIds ?? []).map(String));
	return (t.ownerSpriteIds ?? []).some((e) => n.has(String(e)));
}
function ac(e, t) {
	return !(!e || !t || e.command !== t.command || (e.target ?? "self") !== (t.target ?? "self") || (e.label ?? "") !== (t.label ?? "") || (e.frame ?? "") !== (t.frame ?? "") || (e.frameExpression ?? "") !== (t.frameExpression ?? ""));
}
function oc(e, t) {
	if (!e) return !1;
	let n = ps(t), r = new Set([
		t,
		n,
		n.replace(/^_root\./i, ""),
		n.replace(/^_level0\./i, "")
	].filter(Boolean));
	for (let t of r) {
		let n = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		if (RegExp(`(^|[^\\w$])${n}([^\\w$]|$)`).test(e)) return !0;
	}
	return !1;
}
function sc(e, t) {
	return vo(e)[t]?.trim();
}
function cc(e, t) {
	return lc(e) ?? lc(t);
}
function lc(e) {
	if (e == null) return;
	let t = String(e).replace(/^["']|["']$/g, "").trim(), n = /^_level(\d+)$/i.exec(t), r = Number(n?.[1] ?? t);
	return Number.isFinite(r) ? r : void 0;
}
function uc(e, t, n) {
	if (!n) return t;
	let r = e.match(/<p\b[^>]*\balign\s*=\s*["']?(left|center|right|justify)\b/i) ?? e.match(/\btext-align\s*:\s*(left|center|right|justify)\b/i);
	return r?.[1] ? r[1].toLowerCase() : "left";
}
function dc(e, t) {
	return !e || !t || e === t || !e.startsWith(t) ? !1 : /^[A-Z0-9_$]/.test(e.slice(t.length));
}
function fc(e, t) {
	return t ? t.command === "markSndSegment" ? e.functionName === "markSnd" || e.functionName === "markSndSegment" : e.functionName === t.command : !1;
}
function pc(e) {
	switch (e.command) {
		case "attachSound": return mc("attachSound", e.sound ?? e.resolvedSound);
		case "playVO": return mc("playVO", e.sound ?? e.resolvedSound);
		case "markSndSegment": return mc("markSndSegment", e.segment ?? e.sound ?? e.resolvedSound);
		case "stopSound": return e.target ? mc("stopSound", ps(e.target)) : void 0;
		default: return;
	}
}
function mc(e, t) {
	if (!(t == null || t === "")) return `${e}:${String(t)}`;
}
function hc(e) {
	return (e?.trim().match(/^new\s+([\w$.]+)\s*\(/))?.[1]?.split(".").pop();
}
function gc(e) {
	let t = e?.trim();
	if (t && (t.startsWith("\"") && t.endsWith("\"") || t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
}
function Q(e, t) {
	let n = `${t}(`;
	if (!e.startsWith(n) || !e.endsWith(")")) return;
	let r = 0, i = "";
	for (let n = t.length; n < e.length; n += 1) {
		let t = e[n];
		if (i) {
			t === i && e[n - 1] !== "\\" && (i = "");
			continue;
		}
		if (t === "\"" || t === "'") i = t;
		else if (t === "(") r += 1;
		else if (t === ")" && (--r, r === 0 && n !== e.length - 1)) return;
	}
	return r === 0 ? e.slice(n.length, -1).trim() : void 0;
}
function _c(e) {
	return e.trim().toLowerCase();
}
function $(e) {
	return typeof e == "object" && !!e && !(e instanceof X);
}
function vc(e) {
	return e === null || typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "object" && !!e;
}
function yc(e) {
	return typeof e == "string" || typeof e == "number" || typeof e == "boolean" ? e : void 0;
}
function bc(e) {
	let t = [], n = "", r = "", i = "";
	for (let a = 0; a < e.length; a += 1) {
		let o = e[a];
		if (i) {
			o === i && e[a - 1] !== "\\" ? i = "" : n += o;
			continue;
		}
		if (r) {
			o === "\"" || o === "'" ? i = o : o === "]" ? (t.push(n.trim().replace(/^["']|["']$/g, "")), n = "", r = "") : n += o;
			continue;
		}
		o === "." ? (n && t.push(n), n = "") : o === "[" ? (n && t.push(n), n = "", r = o) : n += o;
	}
	return n && t.push(n), t.filter(Boolean);
}
function xc(e) {
	return /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\[[^\]]+\])+$/.test(e.trim());
}
function Sc(e) {
	let t = 0, n = "", r = -1;
	for (let i = 0; i < e.length; i += 1) {
		let a = e[i];
		if (n) {
			a === n && e[i - 1] !== "\\" && (n = "");
			continue;
		}
		if (a === "\"" || a === "'") n = a;
		else if (a === "(" || a === "[") t += 1;
		else if (a === ")" || a === "]") --t;
		else if (a === "?" && t === 0) {
			r = i;
			break;
		}
	}
	if (!(r < 0)) {
		t = 0, n = "";
		for (let i = r + 1; i < e.length; i += 1) {
			let a = e[i];
			if (n) {
				a === n && e[i - 1] !== "\\" && (n = "");
				continue;
			}
			if (a === "\"" || a === "'") n = a;
			else if (a === "(" || a === "[") t += 1;
			else if (a === ")" || a === "]") --t;
			else if (a === ":" && t === 0) return {
				condition: e.slice(0, r).trim(),
				whenTrue: e.slice(r + 1, i).trim(),
				whenFalse: e.slice(i + 1).trim()
			};
		}
	}
}
function Cc(e, t) {
	let n = Q(e, t);
	if (n !== void 0) return { arguments: n };
	let r = `.${t}(`, i = e.indexOf(r);
	if (i < 0 || !e.endsWith(")")) return;
	let a = e.slice(i + r.length - 1);
	if (tl(a) === a.length - 1) return {
		target: e.slice(0, i),
		arguments: a.slice(1, -1)
	};
}
function wc(e) {
	let t = e.match(/^com\.xfactorstudio\.xml\.xpath\.XPath\.(selectSingleNode|selectNodes)\((.*)\)$/s);
	return t ? {
		name: t[1],
		arguments: t[2]
	} : void 0;
}
function Tc(e) {
	if (!e.startsWith("com.xfactorstudio.xml.xpath.XPath.")) return;
	let t = e.slice(34).match(/^(selectSingleNode|selectNodes)\(/);
	if (!t) return;
	let n = t[1], r = 34 + n.length, i = e.slice(r), a = tl(i);
	if (!(a < 0 || i[a + 1] !== ".")) return {
		name: n,
		arguments: i.slice(1, a),
		memberPath: i.slice(a + 2)
	};
}
function Ec(e) {
	let t = e.match(/^new\s+mx\.transitions\.Tween\s*\((.*)\)$/s);
	return t ? { arguments: t[1] } : void 0;
}
function Dc(e) {
	if (!e) return;
	let t = e.indexOf("{");
	if (t < 0) return;
	let n = e.slice(0, t).replace(/\)\s*$/, "").trim(), r = 0, i = "";
	for (let a = t; a < e.length; a += 1) {
		let o = e[a];
		if (i) {
			o === i && e[a - 1] !== "\\" && (i = "");
			continue;
		}
		if (o === "\"" || o === "'") i = o;
		else if (o === "{") r += 1;
		else if (o === "}" && (--r, r === 0)) return {
			condition: n,
			body: e.slice(t + 1, a)
		};
	}
}
function Oc(e) {
	let t = e.trim();
	if (!/^if\s*\(/.test(t)) return;
	let n = t.indexOf("("), r = tl(t.slice(n));
	if (r < 0) return;
	let i = n + r, a = t.slice(n + 1, i).trim(), o = t.indexOf("{", i + 1);
	if (o < 0) return;
	let s = kc(t, o);
	if (s < 0) return;
	let c = t.slice(o + 1, s), l = t.slice(s + 1).trim();
	if (!l) return {
		condition: a,
		thenBody: c
	};
	if (!l.startsWith("else")) return {
		condition: a,
		thenBody: c,
		tail: l
	};
	let u = l.slice(4).trim();
	if (u.startsWith("if")) return {
		condition: a,
		thenBody: c,
		elseBody: u
	};
	if (!u.startsWith("{")) return;
	let d = kc(u, 0);
	if (!(d < 0)) return {
		condition: a,
		thenBody: c,
		elseBody: u.slice(1, d)
	};
}
function kc(e, t) {
	let n = 0, r = "";
	for (let i = t; i < e.length; i += 1) {
		let t = e[i];
		if (r) {
			t === r && e[i - 1] !== "\\" && (r = "");
			continue;
		}
		if (t === "\"" || t === "'") r = t;
		else if (t === "{") n += 1;
		else if (t === "}" && (--n, n === 0)) return i;
	}
	return -1;
}
function Ac(e) {
	let t = [], n = 0, r = "", i = 0;
	for (let a = 0; a < e.length; a += 1) {
		let o = e[a];
		if (r) {
			o === r && e[a - 1] !== "\\" && (r = "");
			continue;
		}
		o === "\"" || o === "'" ? r = o : o === "(" || o === "{" || o === "[" ? n += 1 : o === ")" || o === "}" || o === "]" ? --n : o === ";" && n === 0 && (t.push(e.slice(i, a).trim()), i = a + 1);
	}
	return t.push(e.slice(i).trim()), t.filter(Boolean);
}
function jc(e) {
	let t = e.match(/^(.+?)\s*\((.*)\)$/s);
	if (!t) return;
	let n = t[1].trim(), r = n.lastIndexOf(".");
	return r >= 0 ? {
		target: n.slice(0, r),
		name: n.slice(r + 1),
		arguments: t[2]
	} : {
		name: n,
		arguments: t[2]
	};
}
function Mc(e, t, n) {
	switch (t) {
		case "_name": return e.name;
		case "_currentframe": return e.currentFrame + 1;
		case "_totalframes": return Math.max(1, n?.timeline?.length ?? n?.frames?.length ?? 1);
		case "_width": return e.width ?? n?.origin.width ?? 0;
		case "_height": return e.height ?? n?.origin.height ?? 0;
		case "_xscale": return e.xscale ?? 100;
		case "_yscale": return e.yscale ?? 100;
		case "_x": return e.x ?? e.placedX;
		case "_y": return e.y ?? e.placedY;
		case "_alpha": return e.alpha ?? 100;
		case "_visible": return e.visible ?? !0;
		default: return;
	}
}
function Nc(e) {
	return e.replace(/<\s*(?:s?br)\b[^>]*>/gi, "\n").replace(/<\s*\/\s*p\s*>/gi, "\n").replace(/<[^>]+>/g, "").replace(/\r/g, "\n");
}
function Pc(e, t, n, r = !1) {
	let i = e.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
	if (!i) return r ? 0 : n;
	let a = Number(t);
	if (!Number.isFinite(a) || a <= 0) return n;
	let o = Math.max(1, i.length * a * .62);
	return r ? o : Math.max(n || 1, o);
}
function Fc(e) {
	let t = Q(e, "mx.utils.Delegate.create");
	if (t === void 0) return;
	let [n, r] = vo(t);
	if (!(!n || !r)) return {
		target: n.trim(),
		method: r.trim()
	};
}
function Ic(e) {
	return $(e) && e.__avm1Delegate === !0 && typeof e.method == "string";
}
function Lc(e) {
	return $(e) && e.__avm1Type === "MovieClipLoader";
}
function Rc(e) {
	return Array.isArray(e.listeners) || (e.listeners = []), Array.isArray(e.listeners) ? e.listeners.filter($) : [];
}
function zc(e) {
	return e.trim().replace(/^\/+/, "");
}
function Bc(e) {
	return /\.(?:png|jpe?g|gif|webp)$/i.test(e.split(/[?#]/, 1)[0] ?? "");
}
function Vc(e) {
	return /\.swf$/i.test(e.split(/[?#]/, 1)[0] ?? "");
}
function Hc(e) {
	return typeof Node < "u" && e instanceof Node;
}
function Uc(e) {
	if (Hc(e) && (e.nodeType === Node.DOCUMENT_NODE || e.nodeType === Node.ELEMENT_NODE)) return e;
	if ($(e)) {
		let t = e.document;
		if (Hc(t) && t.nodeType === Node.DOCUMENT_NODE) return t;
		let n = e.documentElement;
		if (Hc(n) && n.nodeType === Node.ELEMENT_NODE) return n;
	}
}
function Wc(e, t) {
	let n = Uc(e);
	if (!n) return [];
	let r = t.trim().replace(/^\/\//, "").replace(/^\.\//, "").split("/").filter(Boolean).pop();
	return !r || !/^[A-Za-z_][\w.-]*$/.test(r) ? [] : Array.from(n.querySelectorAll(r));
}
function Gc(e, t) {
	if (t === "firstChild") {
		let t = e.firstChild;
		return t ? { nodeValue: t.nodeValue ?? "" } : void 0;
	}
	if (t === "nodeValue") return e.nodeValue ?? "";
	if (t === "attributes" && e instanceof Element) return Object.fromEntries(Array.from(e.attributes).map((e) => [e.name, e.value]));
	if (t === "length" && "length" in e) return Number(e.length);
}
function Kc(e, t, n) {
	if ($(e)) try {
		Object.defineProperty(e, bs, {
			value: t,
			configurable: !0
		}), Object.defineProperty(e, xs, {
			value: n,
			configurable: !0
		});
	} catch {}
}
function qc(e, t) {
	let n = e[bs], r = e[xs];
	return !(n instanceof X) || typeof r != "string" || n !== t ? !0 : n.props[r] === e;
}
function Jc(e) {
	let t = "__eventListeners", n = e.props[t];
	if ($(n)) return n;
	let r = {};
	return e.props[t] = r, r;
}
function Yc(e) {
	switch (e) {
		case "rollOver": return "rollover";
		case "rollOut": return "rollout";
		case "press": return "press";
		case "release": return "release";
		case "releaseOutside": return "releaseoutside";
	}
}
function Xc(e) {
	switch (e) {
		case "rollOver": return "onRollOver";
		case "rollOut": return "onRollOut";
		case "press": return "onPress";
		case "release": return "onRelease";
		case "releaseOutside": return "onReleaseOutside";
	}
}
function Zc(e, t) {
	let n = [], r = 0, i = "", a = 0;
	for (let o = 0; o < e.length; o += 1) {
		let s = e[o];
		if (i) {
			s === i && e[o - 1] !== "\\" && (i = "");
			continue;
		}
		s === "\"" || s === "'" ? i = s : s === "(" || s === "[" ? r += 1 : s === ")" || s === "]" ? --r : r === 0 && e.startsWith(t, o) && (n.push(e.slice(a, o).trim()), a = o + t.length, o += t.length - 1);
	}
	return n.push(e.slice(a).trim()), n.filter(Boolean);
}
function Qc(e, t) {
	let n = 0, r = "";
	for (let i = 0; i < e.length; i += 1) {
		let a = e[i];
		if (r) {
			a === r && e[i - 1] !== "\\" && (r = "");
			continue;
		}
		if (a === "\"" || a === "'") r = a;
		else if (a === "(" || a === "[") n += 1;
		else if (a === ")" || a === "]") --n;
		else if (n === 0 && e.slice(i, i + t.length) === t) {
			let n = e[i - 1] ?? " ", r = e[i + t.length] ?? " ";
			if (!/[\w$]/.test(n) && !/[\w$]/.test(r)) return [e.slice(0, i).trim(), e.slice(i + t.length).trim()];
		}
	}
	return [e];
}
function $c(e) {
	return e === void 0 ? "undefined" : e === null || Array.isArray(e) ? "object" : e instanceof X ? "movieclip" : typeof e;
}
function el(e, t) {
	let n = t.trim().replace(/^_global\./, "");
	return n === "Array" ? Array.isArray(e) : n === "MovieClip" ? e instanceof X : n === "Object" ? typeof e == "object" && !!e : $(e) ? String(e.__avm1Class ?? "").split(".").pop() === n : !1;
}
function tl(e) {
	let t = 0, n = "";
	for (let r = 0; r < e.length; r += 1) {
		let i = e[r];
		if (n) {
			i === n && e[r - 1] !== "\\" && (n = "");
			continue;
		}
		if (i === "\"" || i === "'") n = i;
		else if (i === "(") t += 1;
		else if (i === ")" && (--t, t === 0)) return r;
	}
	return -1;
}
//#endregion
//#region src/audio/SoundController.ts
var nl = class e {
	music = null;
	musicSrc = "";
	musicOwner;
	musicTarget = "";
	voice = null;
	voiceOwner;
	voiceTarget = "";
	voiceStartedAt = 0;
	voiceDurationMs = 0;
	pendingVoiceSegmentDurationMs = 0;
	timings = /* @__PURE__ */ new Map();
	pendingPlayback = /* @__PURE__ */ new Set();
	targetVolumes = /* @__PURE__ */ new Map();
	muted = !1;
	suspended = !1;
	listening = !1;
	pendingMusicStop = 0;
	static FALLBACK_VO_MS = 5e3;
	static FALLBACK_SEGMENT_MS = 2500;
	static UNLOCK_EVENTS = [
		"pointerdown",
		"click",
		"keydown",
		"touchstart"
	];
	constructor() {
		this.addUnlockListeners();
	}
	handle(e, t) {
		switch (this.addUnlockListeners(), e.command) {
			case "attachSound":
				if (this.muted || !e.soundSrc) break;
				e.soundRole === "music" ? this.playMusic(e, t) : e.soundRole === "vo" && this.playVoice(e, t);
				break;
			case "playVO":
				!this.muted && e.soundSrc && this.playVoice(e, t);
				break;
			case "markSndSegment":
				this.markVoiceSegment(this.durationFor(e));
				break;
			case "stopSound":
				this.pendingVoiceSegmentDurationMs = 0, this.stopForAction(e);
				break;
			case "setVolume":
				this.setVolume(e);
				break;
			default: break;
		}
	}
	registerTimings(e) {
		for (let [t, n] of Object.entries(e ?? {})) {
			let e = Number(n.durationMs);
			t && Number.isFinite(e) && e > 0 && this.timings.set(t, e);
		}
	}
	durationFor(e) {
		let t = e.segment ?? e.sound;
		return (t ? this.timings.get(t) : void 0) ?? e.soundDurationMs;
	}
	playMusic(e, t) {
		let n = e.soundSrc;
		if (!n) return;
		this.cancelPendingMusicStop();
		let r = this.volumeFor(e.target, .5);
		if (this.musicSrc === n && this.music) {
			this.musicOwner = t, this.musicTarget = rl(e.target), this.music.loop = !0, this.music.volume = r, this.tryPlay(this.music);
			return;
		}
		this.stopMusic();
		let i = new Audio(P(n));
		i.preload = "auto", i.loop = !0, i.volume = r, this.music = i, this.musicSrc = n, this.musicOwner = t, this.musicTarget = rl(e.target), this.tryPlay(i);
	}
	playVoice(e, t) {
		let n = e.soundSrc;
		if (!n) return;
		let r = this.durationFor(e), i = this.pendingVoiceSegmentDurationMs;
		this.pendingVoiceSegmentDurationMs = 0, this.stopVoice();
		let a = new Audio(P(n));
		a.preload = "auto", a.volume = this.volumeFor(e.target, 1), this.voiceStartedAt = performance.now(), this.voiceDurationMs = i || (r && Number.isFinite(r) ? r : 0), a.addEventListener("loadedmetadata", () => {
			!this.voiceDurationMs && Number.isFinite(a.duration) && (this.voiceDurationMs = a.duration * 1e3);
		}), this.voice = a, this.voiceOwner = t, this.voiceTarget = rl(e.target), this.tryPlay(a);
	}
	markVoiceSegment(t) {
		let n = t && Number.isFinite(t) ? t : e.FALLBACK_SEGMENT_MS;
		if (!this.voice) {
			this.pendingVoiceSegmentDurationMs = n;
			return;
		}
		this.voiceStartedAt = performance.now(), this.voiceDurationMs = n;
	}
	isVoiceDone() {
		if (!this.voice || this.voice.ended) return !0;
		let t = this.voiceDurationMs || e.FALLBACK_VO_MS;
		return performance.now() - this.voiceStartedAt >= t;
	}
	stopMusic() {
		this.cancelPendingMusicStop();
		let e = this.music;
		e && (this.pendingPlayback.delete(e), e.pause(), il(e)), this.music = null, this.musicSrc = "", this.musicOwner = void 0, this.musicTarget = "";
	}
	stopVoice() {
		let e = this.voice;
		e && (this.pendingPlayback.delete(e), e.pause(), il(e)), this.voice = null, this.voiceOwner = void 0, this.voiceTarget = "", this.voiceStartedAt = 0, this.voiceDurationMs = 0;
	}
	stopForAction(e) {
		let t = rl(e.target), n = e.soundRole === "music" || t && t === this.musicTarget, r = e.soundRole === "vo" || !t || t === this.voiceTarget;
		n && this.scheduleMusicStop(), r && this.stopVoice();
	}
	setVolume(e) {
		let t = rl(e.target);
		if (!t) return;
		let n = al(e.value);
		this.targetVolumes.set(t, n), this.music && t === this.musicTarget && (this.music.volume = n), this.voice && t === this.voiceTarget && (this.voice.volume = n);
	}
	volumeFor(e, t) {
		let n = rl(e);
		return n ? this.targetVolumes.get(n) ?? t : t;
	}
	scheduleMusicStop() {
		let e = this.pendingMusicStop + 1;
		this.pendingMusicStop = e, queueMicrotask(() => {
			this.pendingMusicStop === e && (this.pendingMusicStop = 0, this.stopMusic());
		});
	}
	cancelPendingMusicStop() {
		this.pendingMusicStop = 0;
	}
	stopOwner(e) {
		let t = this.voiceOwner === e;
		this.musicOwner === e && this.stopMusic(), t && (this.pendingVoiceSegmentDurationMs = 0, this.stopVoice());
	}
	suspend() {
		this.suspended = !0, this.music?.pause(), this.voice?.pause();
	}
	resume() {
		this.suspended = !1, this.music && this.tryPlay(this.music), this.voice && this.tryPlay(this.voice);
	}
	destroy() {
		this.removeUnlockListeners(), this.pendingPlayback.clear(), this.stopMusic(), this.stopVoice(), this.timings.clear(), this.targetVolumes.clear();
	}
	retryPendingPlayback = () => {
		if (!(this.suspended || this.muted || !this.pendingPlayback.size)) for (let e of [...this.pendingPlayback]) this.tryPlay(e);
	};
	tryPlay(e) {
		if (this.suspended || this.muted) return;
		let t = e.play();
		t?.then && t.then(() => this.pendingPlayback.delete(e), () => {
			this.isCurrentAudio(e) && !this.suspended && !this.muted ? this.pendingPlayback.add(e) : this.pendingPlayback.delete(e);
		});
	}
	isCurrentAudio(e) {
		return e === this.music || e === this.voice;
	}
	addUnlockListeners() {
		if (!(this.listening || typeof document > "u")) {
			for (let t of e.UNLOCK_EVENTS) document.addEventListener(t, this.retryPendingPlayback, {
				capture: !0,
				passive: !0
			});
			this.listening = !0;
		}
	}
	removeUnlockListeners() {
		if (!(!this.listening || typeof document > "u")) {
			for (let t of e.UNLOCK_EVENTS) document.removeEventListener(t, this.retryPendingPlayback, { capture: !0 });
			this.listening = !1;
		}
	}
};
function rl(e) {
	return (e ?? "").replace(/^_root\./i, "").replace(/^_level0\./i, "").replace(/^this\./i, "").replace(/^self\./i, "");
}
function il(e) {
	try {
		e.currentTime = 0;
	} catch {}
}
function al(e) {
	let t = Number(e);
	return Number.isFinite(t) ? Math.max(0, Math.min(1, t / 100)) : 1;
}
//#endregion
//#region src/app/Avm2NativeRuntime.ts
var ol = class {
	frame = null;
	animations = /* @__PURE__ */ new Set();
	pausedAnimations = /* @__PURE__ */ new Set();
	pausedVideos = /* @__PURE__ */ new Set();
	pendingLoaderInits = [];
	playing = !1;
	constructor(e, t) {
		this.container = e, this.timeline = t;
	}
	get active() {
		return this.frame !== null;
	}
	get isPlaying() {
		return this.playing;
	}
	async activate(e) {
		let t = this.timeline.control?.avm2Runtime;
		if (!t || t.engine !== "native-gsap") throw Error("mmtour: this AVM2 movie has not been through the native AS3/GSAP build");
		this.destroy();
		let n = document.createElement("iframe");
		n.className = "player-avm2-native", n.title = this.timeline.source || "ActionScript web player", n.srcdoc = ml(this.timeline), this.container.replaceChildren(n), this.frame = n, await gl(n);
		let r = n.contentWindow;
		if (!r) throw Error("mmtour: native AVM2 document did not initialize");
		this.installWebAdapters(r), await _l(r, hl(t.program)), this.bootstrap(r, t.expose), e ? this.play() : this.pause();
	}
	play() {
		if (this.frame) {
			for (let e of this.pausedAnimations) e.resume();
			this.pausedAnimations.clear();
			for (let e of this.pausedVideos) e.play().catch(() => {});
			this.pausedVideos.clear(), this.pendingLoaderInits = [], this.playing = !0;
		}
	}
	pause() {
		let e = this.frame?.contentDocument;
		for (let e of this.animations) e.isActive() && (e.pause(), this.pausedAnimations.add(e));
		for (let t of e?.querySelectorAll("video") ?? []) t.paused || (t.pause(), this.pausedVideos.add(t));
		this.playing = !1;
	}
	async restart() {
		let e = this.playing;
		await this.activate(e);
	}
	destroy() {
		for (let e of this.animations) e.kill();
		this.animations.clear(), this.pausedAnimations.clear(), this.pausedVideos.clear(), this.frame?.remove(), this.frame = null, this.playing = !1;
	}
	installWebAdapters(e) {
		e.__mmtourResolveAsset = (e) => fl(e, this.timeline.control?.externalAssets ?? []), e.__mmtourPlayVideo = (e) => {
			e.currentTime = 0, e.muted = !1, e.play().catch(() => (e.muted = !0, e.play().catch(() => {})));
		}, e.__mmtourAttachSymbol = (t, n) => cl(e, t, this.timeline.assets[Number(n)], this.timeline), e.__mmtourOnLoaderInit = (e, t) => this.pendingLoaderInits.push({
			target: e,
			handler: t
		}), e.__mmtourGsapKill = (e) => va.killTweensOf(e), e.__mmtourGsapDelayedCall = (e, t, n = [], r = void 0) => {
			let i = va.delayedCall(e, () => t.apply(r, n));
			return this.track(i);
		}, e.__mmtourGsapTween = (e, t, n, r) => {
			let i = dl(e, t, n);
			return this.track(r ? va.from(e, i) : va.to(e, i));
		}, e.__mmtourGsapFromTo = (e, t, n, r) => this.track(va.fromTo(e, dl(e, 0, n), dl(e, t, r)));
	}
	track(e) {
		return this.animations.add(e), e.eventCallback("onComplete", vl(e.eventCallback("onComplete"), () => this.animations.delete(e))), e;
	}
	bootstrap(e, t) {
		let n = e.$es4, r = e[t], i = n?.$$?.player?.Player, a = n?.$$?.["flash.events"]?.Event;
		if (!r || !i || !a) throw Error("mmtour: transpiled AS3 program exposes no web player entry point");
		i.$__init("mmtour-avm2-stage", Math.max(1, Math.round(this.timeline.fps)), {}), i.$__getStage().$__internalAddChild(r), ll(e, r, this.timeline.frames[this.timeline.entryFrame ?? 0]?.instances ?? [], this.timeline, !1);
		let o = r.loaderInfo?.$__properties?.()?.LoaderInfoScope;
		o && (o.$_loader = null);
		let s = new a(a.INIT);
		for (let { target: e, handler: t } of this.pendingLoaderInits.splice(0)) t.call(e, s);
		for (let t of [
			0,
			250,
			1e3,
			2500
		]) e.setTimeout(() => sl(e.document), t);
	}
};
function sl(e) {
	for (let t of e.querySelectorAll("[role='presentation']")) {
		if (getComputedStyle(t).cursor !== "pointer") continue;
		let e = t.getBoundingClientRect(), n = e.width, r = e.height;
		for (let i of t.querySelectorAll("svg, img, video, [contenteditable]")) {
			let t = i.getBoundingClientRect();
			n = Math.max(n, t.right - e.left), r = Math.max(r, t.bottom - e.top);
		}
		n > 0 && (t.style.width = `${n}px`), r > 0 && (t.style.height = `${r}px`);
	}
}
function cl(e, t, n, r) {
	if (!n) return;
	let i = t?.$__properties?.()?.DisplayObjectScope, a = i?.$_domView, o = n.frames?.[0] ?? n.src;
	if (!a || !o) return;
	let s = a.ownerDocument.createElement("img");
	s.src = hl(o), s.draggable = !1, s.style.position = "absolute", s.style.pointerEvents = "none", s.style.left = `${-n.origin.x}px`, s.style.top = `${-n.origin.y}px`, s.style.width = `${n.origin.width}px`, s.style.height = `${n.origin.height}px`, a.prepend(s), a.style.overflow = "visible", i.$_setExplicitBounds(n.origin.width, n.origin.height), ll(e, t, n.timeline?.[0]?.instances ?? [], r, !0);
}
function ll(e, t, n, r, i) {
	let a = r.control?.avm2Runtime;
	for (let r of n) {
		if (!r.name || !a || t[r.name]) continue;
		let n = Object.entries(a.symbolClasses ?? {}).find(([, e]) => e === r.characterId)?.[0], o = n ? ul(e, n, a.compiledClass) : void 0;
		if (!o) continue;
		let s = new o();
		s.name = r.name, s.x = r.matrix.tx, s.y = r.matrix.ty, s.scaleX = Math.hypot(r.matrix.a, r.matrix.b), s.scaleY = s.scaleX ? (r.matrix.a * r.matrix.d - r.matrix.b * r.matrix.c) / s.scaleX : 1, s.rotation = Math.atan2(r.matrix.b, r.matrix.a) * 180 / Math.PI;
		let c = s.$__properties?.()?.DisplayObjectScope?.$_domView;
		c && i && (c.style.visibility = "hidden"), t.addChild(s), t[r.name] = s;
	}
}
function ul(e, t, n) {
	let r = n.includes(".") ? n.slice(0, n.lastIndexOf(".")) : "", i = t.includes(".") ? t : r ? `${r}.${t}` : t, a = i.lastIndexOf("."), o = a >= 0 ? i.slice(0, a) : "", s = a >= 0 ? i.slice(a + 1) : i;
	return e.$es4?.$$?.[o]?.[s];
}
function dl(e, t, n) {
	let r = {
		...n,
		duration: t
	};
	if (typeof r.ease == "function") {
		let e = r.ease;
		r.ease = (t) => e(t, 0, 1, 1);
	}
	r.overwrite === 0 ? r.overwrite = !1 : typeof r.overwrite == "number" && (r.overwrite = "auto");
	let i = r.autoAlpha;
	if (delete r.autoAlpha, i !== void 0) {
		r.alpha = i;
		let t = r.onUpdate;
		r.onUpdate = () => {
			try {
				e.visible = Number(e.alpha) > .001;
			} catch {}
			t?.apply(r.onUpdateScope, r.onUpdateParams ?? []);
		};
	}
	for (let e of [
		"onStart",
		"onUpdate",
		"onComplete",
		"onReverseComplete"
	]) {
		let t = r[e], n = r[`${e}Scope`], i = r[`${e}Params`];
		typeof t == "function" && (n || i) && (r[e] = () => t.apply(n, i ?? [])), delete r[`${e}Scope`], delete r[`${e}Params`];
	}
	return r;
}
function fl(e, t) {
	let n = pl(e), r = t.filter((e) => e.src).flatMap((e) => [e.ref, ...e.aliases ?? []].map((t) => ({
		alias: pl(t),
		src: e.src
	}))).sort((e, t) => t.alias.length - e.alias.length).find(({ alias: e }) => n === e || n.endsWith(`/${e}`) || e.endsWith(`/${n}`));
	return r ? hl(r.src) : e;
}
function pl(e) {
	return e.replace(/\\/g, "/").replace(/[?#].*$/, "").replace(/^https?:\/\/[^/]+\//i, "").replace(/^\/+/, "").toLowerCase();
}
function ml(e) {
	let { width: t, height: n } = e.dimensions;
	return `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:${yl(e.backgroundColor ?? "#fff")}}
#mmtour-avm2-stage{position:relative;width:${t}px;height:${n}px;overflow:hidden;transform-origin:0 0}
body{transform-origin:0 0}
</style></head><body><div id="mmtour-avm2-stage"></div></body></html>`;
}
function hl(e) {
	let t = ce(e);
	return /^(?:blob:|data:|https?:)/i.test(t) ? t : new URL(t, window.location.href).href;
}
function gl(e) {
	return new Promise((t, n) => {
		e.addEventListener("load", () => t(), { once: !0 }), e.addEventListener("error", () => n(/* @__PURE__ */ Error("mmtour: failed to create native AVM2 document")), { once: !0 });
	});
}
function _l(e, t) {
	return new Promise((n, r) => {
		let i = e.document.createElement("script");
		i.src = t, i.onload = () => n(), i.onerror = () => r(/* @__PURE__ */ Error(`mmtour: failed to load transpiled AS3 program ${t}`)), e.document.head.append(i);
	});
}
function vl(e, t) {
	return () => {
		e?.(), t();
	};
}
function yl(e) {
	return e.replace(/[;{}]/g, "");
}
//#endregion
//#region src/app/PlayerController.ts
var bl = /^_level(\d+)/, xl = class {
	container;
	options;
	textTranslator;
	fonts = new oo();
	sound = new nl();
	levels = /* @__PURE__ */ new Map();
	store = new ms();
	loadBurst = /* @__PURE__ */ new Set();
	pendingCalls = [];
	waiters = [];
	prefetched = /* @__PURE__ */ new Set();
	mainSwf = "";
	playing = !1;
	avm2Runtime = null;
	avm2FrameCount = 0;
	constructor(e, t = {}) {
		this.container = e, this.options = t, this.textTranslator = t.translateText;
	}
	get main() {
		return this.levels.get(0)?.player ?? null;
	}
	get active() {
		return this.levels.size > 0 || this.avm2Runtime?.active === !0;
	}
	get frameCount() {
		return this.avm2Runtime ? this.avm2FrameCount : this.main?.frameCount ?? 0;
	}
	get currentFrame() {
		return this.main?.currentFrame ?? 0;
	}
	get isPlaying() {
		return this.avm2Runtime?.isPlaying ?? this.main?.isPlaying ?? !1;
	}
	async activate(e, t, n) {
		if (this.deactivate(), this.container.hidden = !1, this.mainSwf = t, this.container.style.background = e.backgroundColor ?? "#ffffff", this.container.style.width = `${e.dimensions.width}px`, this.container.style.height = `${e.dimensions.height}px`, e.control?.avmKind === "AVM2" || e.control?.avm2Runtime) {
			this.avm2FrameCount = e.frameCount, this.avm2Runtime = new ol(this.container, e), await this.avm2Runtime.activate(!1), this.emitFrame();
			return;
		}
		this.createLevel(0, t, e), typeof n == "number" && this.main?.seekRootFrame(n), this.emitFrame();
	}
	deactivate() {
		this.avm2Runtime?.destroy(), this.avm2Runtime = null, this.avm2FrameCount = 0;
		for (let e of this.levels.values()) e.player.destroy(), e.layer.remove();
		this.levels.clear(), this.store.reset(), this.pendingCalls = [], this.waiters = [], this.loadBurst.clear(), this.prefetched.clear(), this.sound.destroy(), this.container.style.background = "", this.container.style.width = "", this.container.style.height = "", this.container.hidden = !0, this.container.replaceChildren();
	}
	play() {
		this.playing = !0, this.avm2Runtime?.play();
		for (let e of this.levels.values()) e.player.play();
		this.sound.resume();
	}
	pause() {
		this.playing = !1, this.avm2Runtime?.pause();
		for (let e of this.levels.values()) e.player.pause();
		this.sound.suspend(), this.emitFrame();
	}
	toggle() {
		this.isPlaying ? this.pause() : this.play();
	}
	seekRootFrame(e) {
		this.main?.seekRootFrame(e), this.emitFrame();
	}
	restart() {
		if (this.avm2Runtime) {
			this.avm2Runtime.restart();
			return;
		}
		for (let e of this.levels.values()) e.player.restart();
		this.emitFrame();
	}
	setTextTranslator(e) {
		this.textTranslator = e;
		for (let t of this.levels.values()) t.player.setTextTranslator(e);
	}
	createLevel(e, t, n) {
		this.levels.get(e) && this.destroyLevel(e), this.store.seed(n.control?.globalDefaults), this.sound.registerTimings(ve(n.control)), this.fonts.register(n);
		let r = document.createElement("div");
		r.className = "player-level", r.style.zIndex = String(e), this.container.append(r);
		let i = new Ds(n, new Ha(r, {
			resolveFontFamily: (e) => this.fonts.resolveFamily(e),
			stageDimensions: n.dimensions,
			onButtonEvent: (t, n, r, i) => this.levels.get(e)?.player.handleButtonEvent(t, n, r, i),
			onPointerDrag: (t, n) => this.levels.get(e)?.player.handlePointerDrag(t, n)
		}), {
			onFrame: e === 0 ? (e, t) => {
				this.checkWaiters(), this.options.onFrame?.(e, t, this.main?.currentLabel() ?? "");
			} : void 0,
			onSound: (t) => this.sound.handle(t, e),
			onNavigate: (t) => this.handleNavigate(t, e),
			onButton: this.options.onButton ? (e, t, r, i) => this.options.onButton({
				characterId: e,
				ownerPath: t,
				event: r,
				scene: n.scene,
				action: i
			}) : void 0,
			onFsCommand: this.options.onFsCommand,
			onGetURL: this.options.onGetURL,
			loadTimeline: (e) => pe(e.split("/").pop() ?? e),
			store: this.store,
			onCallFunction: (e, t, n) => this.dispatchCall(e, t, n),
			onClipCommand: (e, t, n) => this.dispatchClipCommand(e, t, n),
			onWaiter: (t, n) => this.registerWaiter(e, t, n),
			onLoadVariables: (t) => this.handleLoadVariables(e, t),
			isVoiceDone: () => this.sound.isVoiceDone(),
			startFrame: e > 0 ? 0 : void 0,
			resolveFontFamily: (e) => this.fonts.resolveFamily(e),
			awaitFonts: () => this.fonts.ready(),
			translateText: this.textTranslator
		});
		if (this.levels.set(e, {
			player: i,
			layer: r,
			swf: t
		}), this.playing && i.play(), this.flushPendingCalls(e), this.prefetchReferenced(n), this.options.debug && e > 0) {
			let n = this.store.get("bkgd.doAttractLoop");
			console.log(`[FLASHDBG] load ${t} → _level${e}  doAttractLoop=${JSON.stringify(n)}`), this.watchBottom(t);
		}
	}
	watchBottom(e) {
		let t = performance.now(), n = 0, r = () => {
			let i = performance.now() - t;
			if (i > 6e3 || n > 4 || !this.active) return;
			let a = this.container.getBoundingClientRect(), o = a.left + a.width / 2, s = a.bottom - 12, c = (e) => e.left <= o && e.right >= o && e.top <= s && e.bottom >= s, l = [...this.levels.entries()].map(([e, t]) => {
				let n = [...t.layer.querySelectorAll("img.player-media")].filter((e) => e.getAttribute("src")).find((e) => c(e.getBoundingClientRect()));
				return {
					lvl: e,
					str: `_lvl${e}(${t.swf.replace(".swf", "")},f${t.player.currentFrame}):${n ? "BAR" : "-"}`
				};
			}), u = l.map((e) => e.str);
			l.some((e) => e.lvl > 0 && e.str.endsWith("BAR")) || (n++, console.log(`[FLASHDBG] !!! WHITE-BOTTOM @${Math.round(i)}ms after ${e}: ${u.join("  ")}`)), requestAnimationFrame(r);
		};
		requestAnimationFrame(r);
	}
	prefetchReferenced(e) {
		for (let t of he(e)) {
			let e = t.toLowerCase();
			e === this.mainSwf.toLowerCase() || this.prefetched.has(e) || (this.prefetched.add(e), ge(t));
		}
	}
	flushPendingCalls(e) {
		let t = this.pendingCalls.filter((t) => t.level === e);
		if (!t.length) return;
		this.pendingCalls = this.pendingCalls.filter((t) => t.level !== e);
		let n = this.levels.get(e)?.player;
		for (let e of t) n?.callFunction(e.name, e.args);
	}
	registerWaiter(e, t, n) {
		if (t !== "waitForVal") return;
		let [r, i, a] = n;
		typeof r != "string" || i === void 0 || (this.waiters.push({
			level: e,
			obj: r,
			val: i,
			cb: Number(a ?? 0)
		}), this.checkWaiters());
	}
	checkWaiters() {
		if (!this.waiters.length) return;
		let e = [];
		for (let t of this.waiters) String(this.store.get(t.obj) ?? "") === String(t.val) ? this.dispatchCall(`_level${t.level}`, "callBack", String(t.cb)) : e.push(t);
		this.waiters = e;
	}
	dispatchClipCommand(e, t, n) {
		let r = bl.exec(e);
		if (!r) return;
		let i = this.levels.get(Number(r[1]))?.player;
		if (!i) return;
		let a = e.replace(/^_level\d+\.?/i, "");
		i.runNamedClipCommand(i.rootClip, a, t, n);
	}
	async handleLoadVariables(e, t) {
		let n = t.variableSource ?? (t.swf && !/\.swf$/i.test(t.swf) ? t.swf : void 0) ?? t.target;
		if (n) try {
			let t = await fetch(P(n));
			if (!t.ok || this.container.hidden) return;
			this.levels.get(e)?.player.setTextVars(Sl(await t.text()));
		} catch {}
	}
	dispatchCall(e, t, n) {
		let r = bl.exec(e);
		if (!r) return;
		let i = Number(r[1]), a = this.levels.get(i)?.player;
		a ? a.callFunction(t, n) : this.pendingCalls.push({
			level: i,
			name: t,
			args: n
		});
	}
	handleNavigate(e, t = 0) {
		if (this.options.onNavigate?.({
			command: e.command ?? "",
			swf: e.swf,
			level: e.level == null ? void 0 : Number(e.level),
			reload: e.reload
		}), e.command === "unloadMovieNum" || e.command === "unloadMovie") {
			let n = Number(e.level ?? this.inferLoadLevel(t) ?? 0);
			n > 0 && this.destroyLevel(n);
			return;
		}
		if (e.command !== "loadMovieNum" && e.command !== "loadMovie" || !e.swf) return;
		let n = Number(e.level ?? this.inferLoadLevel(t) ?? 0), r = this.levels.get(n);
		if (n > 0 && r && (e.reload || r.swf.toLowerCase() !== e.swf.toLowerCase()) && this.sound.stopOwner(n), !e.reload) {
			if (this.loadBurst.has(n)) return;
			this.loadBurst.size === 0 && queueMicrotask(() => this.loadBurst.clear()), this.loadBurst.add(n);
		}
		this.loadLevel(n, e.swf, !!e.reload);
	}
	inferLoadLevel(e) {
		if (e <= 0) return;
		let t = [...this.levels.keys()].filter((t) => t > 0 && t < e);
		return t.length ? Math.max(...t) : void 0;
	}
	async loadLevel(e, n, r = !1) {
		if (e <= 0) return;
		let i = this.levels.get(e);
		if (!r && i && i.swf.toLowerCase() === n.toLowerCase() || n.toLowerCase() === this.mainSwf.toLowerCase()) return;
		let a = t(n);
		this.options.onLoadStart?.({
			source: "level",
			level: e,
			swf: n,
			scene: a
		});
		try {
			let t = await pe(n);
			if (!t) {
				this.options.onLoadError?.({
					source: "level",
					level: e,
					swf: n,
					scene: a,
					error: /* @__PURE__ */ Error(`mmtour: failed to load level ${e} scene "${n}"`)
				});
				return;
			}
			if (this.container.hidden) return;
			this.createLevel(e, n, t), this.options.onLoadComplete?.({
				source: "level",
				level: e,
				swf: n,
				scene: t.scene,
				timeline: t
			});
		} catch (t) {
			this.options.onLoadError?.({
				source: "level",
				level: e,
				swf: n,
				scene: a,
				error: t
			});
		}
	}
	destroyLevel(e) {
		let t = this.levels.get(e);
		t && (this.sound.stopOwner(e), t.player.destroy(), t.layer.remove(), this.levels.delete(e));
	}
	emitFrame() {
		if (this.avm2Runtime) {
			this.options.onFrame?.(0, this.avm2Runtime.isPlaying, "");
			return;
		}
		let e = this.main;
		e && this.options.onFrame?.(e.currentFrame, e.isPlaying, e.currentLabel());
	}
};
function Sl(e) {
	let t = {};
	for (let n of e.split("&")) {
		let e = n.indexOf("=");
		if (e <= 0) continue;
		let r = n.slice(0, e).trim(), i = n.slice(e + 1).replace(/\r?\n$/, "");
		try {
			i = decodeURIComponent(i.replace(/\+/g, " "));
		} catch {}
		t[r] = i;
	}
	return t;
}
//#endregion
//#region src/index.ts
async function Cl(e, n = {}) {
	let { assetsBaseUrl: r = "", assetSource: i = "files", archiveUrl: a, scene: o = "A-tour.swf", autoplay: s = !0, debug: c = !1, onFrame: l, onButton: u, onNavigate: d, onFsCommand: f, onGetURL: p, translateText: m, onLoadStart: h, onLoadComplete: g, onLoadError: _ } = n;
	Tl({
		assetsBaseUrl: r,
		assetSource: i,
		archiveUrl: a
	});
	let v = Dl(o), y = t(o);
	h?.({
		source: "initial",
		level: 0,
		swf: v,
		scene: y
	});
	let b;
	try {
		let e = await pe(o);
		if (!e) throw Error(`mmtour: failed to load tour scene "${o}" from "${r || "/"}"`);
		b = e;
	} catch (e) {
		throw _?.({
			source: "initial",
			level: 0,
			swf: v,
			scene: y,
			error: e
		}), e;
	}
	let x = new xl(e, {
		debug: c,
		onFrame: l,
		onButton: u,
		onNavigate: d,
		onFsCommand: f,
		onGetURL: p,
		translateText: m,
		onLoadStart: h,
		onLoadComplete: g,
		onLoadError: _
	});
	return await x.activate(b, v), g?.({
		source: "initial",
		level: 0,
		swf: v,
		scene: b.scene,
		timeline: b
	}), s && x.play(), Ol(x);
}
async function wl(e, n) {
	let { assetsBaseUrl: r = "", assetSource: i = "files", archiveUrl: a, autoplay: o = !0, debug: s = !1, onFrame: c, onButton: l, onNavigate: u, onFsCommand: d, onGetURL: f, translateText: p, onLoadStart: m, onLoadComplete: h, onLoadError: g } = n;
	Tl({
		assetsBaseUrl: r,
		assetSource: i,
		archiveUrl: a
	});
	let _ = "timeline" in n ? n.timeline : void 0, v = "scene" in n ? n.scene : void 0, y, b, x;
	if (_) b = El(_, n.swf), x = _.scene;
	else {
		if (!v) throw Error("mmtour: createDecompiledPlayer requires either a scene or a timeline");
		y = v, b = Dl(v), x = t(v);
	}
	m?.({
		source: "initial",
		level: 0,
		swf: b,
		scene: x
	});
	let S;
	try {
		if (_) S = _;
		else {
			if (!y) throw Error("mmtour: createDecompiledPlayer requires either a scene or a timeline");
			let e = await pe(y);
			if (!e) throw Error(`mmtour: failed to load scene "${y}" from "${r || "/"}"`);
			S = e;
		}
	} catch (e) {
		throw g?.({
			source: "initial",
			level: 0,
			swf: b,
			scene: x,
			error: e
		}), e;
	}
	let C = new xl(e, {
		debug: s,
		onFrame: c,
		onButton: l,
		onNavigate: u,
		onFsCommand: d,
		onGetURL: f,
		translateText: p,
		onLoadStart: m,
		onLoadComplete: h,
		onLoadError: g
	});
	return await C.activate(S, b), h?.({
		source: "initial",
		level: 0,
		swf: b,
		scene: S.scene,
		timeline: S
	}), o && C.play(), Ol(C);
}
function Tl(e) {
	let { assetsBaseUrl: t, assetSource: n, archiveUrl: r } = e;
	E(t), k(n), n === "archive" && w(r ?? `${t.replace(/\/+$/, "")}/xp-tour.pack`), fe();
}
function El(e, t) {
	return t || Dl(e.scene);
}
function Dl(e) {
	return /\.swf$/i.test(e) ? e : `${e}.swf`;
}
function Ol(e) {
	return {
		play: () => e.play(),
		pause: () => e.pause(),
		toggle: () => e.toggle(),
		restart: () => e.restart(),
		seek: (t) => e.seekRootFrame(t),
		get frameCount() {
			return e.frameCount;
		},
		get currentFrame() {
			return e.currentFrame;
		},
		get isPlaying() {
			return e.isPlaying;
		},
		setTextTranslator: (t) => e.setTextTranslator(t),
		destroy: () => e.deactivate()
	};
}
//#endregion
export { xl as PlayerController, wl as createDecompiledPlayer, Cl as createTourPlayer, O as getAssetSource, D as getAssetsBaseUrl, pe as loadTimeline, t as sceneNameFromSwf, e as scenes, w as setArchiveUrl, k as setAssetSource, E as setAssetsBaseUrl };
