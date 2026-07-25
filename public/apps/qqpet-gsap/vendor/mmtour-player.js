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
function me(e) {
	return ce(e);
}
//#endregion
//#region src/data/prefetch.ts
var he = /\.swf$/i;
function ge(e) {
	let t = /* @__PURE__ */ new Set(), n = (e) => {
		if (e) {
			e.swf && he.test(e.swf) && t.add(e.swf), e.exitNavigation?.swf && he.test(e.exitNavigation.swf) && t.add(e.exitNavigation.swf);
			for (let n of e.loads ?? []) he.test(n.swf) && t.add(n.swf);
		}
	};
	for (let t of Object.values(e.control?.buttonActions ?? {})) n(t.release), n(t.rollOver), n(t.rollOut), n(t.press);
	for (let t of e.control?.frameActions ?? []) for (let e of t.actions ?? []) n(e);
	return [...t];
}
async function _e(e) {
	let t = await pe(e);
	t && ve(t, 0);
}
function ve(e, t) {
	for (let n of e.frames[t]?.instances ?? []) {
		let t = e.assets[String(n.characterId)], r = t?.src ?? t?.frames?.[0] ?? t?.states?.up?.src;
		r && fetch(me(r)).catch(() => {});
	}
}
//#endregion
//#region src/data/soundTimings.ts
function ye(e) {
	let t = /* @__PURE__ */ new Map();
	for (let [n, r] of Object.entries(e?.soundTimings ?? {})) {
		let e = typeof r == "number" ? r : Number(r?.durationMs);
		n && Number.isFinite(e) && e > 0 && t.set(n, { durationMs: e });
	}
	let n = (e) => {
		for (let n of e?.functionCalls ?? []) {
			let e = be(n);
			e && t.set(e.name, { durationMs: e.durationMs });
		}
	};
	for (let t of e?.frameActions ?? []) for (let e of t.actions ?? []) n(e);
	for (let t of e?.spriteActions ?? []) for (let e of t.actions ?? []) n(e);
	for (let t of Object.values(e?.definedFunctions ?? {})) for (let e of t?.actions ?? []) n(e);
	for (let t of Object.values(e?.buttonActions ?? {})) n(t.release), n(t.rollOver), n(t.rollOut), n(t.press);
	return Object.fromEntries([...t.entries()].sort(([e], [t]) => e.localeCompare(t, void 0, { numeric: !0 })));
}
function be(e) {
	if (e.functionName !== "push" || !xe(e.target)) return;
	let t = Ce(e.arguments), n = t.length === 1 && t[0]?.trim().startsWith("[") ? Se(t[0]) : t, r = we(n[0]), i = Number(n[1]);
	if (!(!r || !Number.isFinite(i) || i <= 0)) return {
		name: r,
		durationMs: i
	};
}
function xe(e) {
	let t = String(e ?? "").replace(/[^a-z]/gi, "").toLowerCase();
	return !!(t && /(?:snd|sound).*(?:time|duration|lib)|(?:time|duration).*(?:snd|sound)/.test(t));
}
function Se(e) {
	let t = e.trim();
	return !t.startsWith("[") || !t.endsWith("]") ? [] : Ce(t.slice(1, -1));
}
function Ce(e) {
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
function we(e) {
	let t = e?.trim();
	if (t && (t.startsWith("\"") && t.endsWith("\"") || t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
}
//#endregion
//#region node_modules/gsap/gsap-core.js
function Te(e) {
	if (e === void 0) throw ReferenceError("this hasn't been initialised - super() hasn't been called");
	return e;
}
function Ee(e, t) {
	e.prototype = Object.create(t.prototype), e.prototype.constructor = e, e.__proto__ = t;
}
var De = {
	autoSleep: 120,
	force3D: "auto",
	nullTargetWarn: 1,
	units: { lineHeight: "" }
}, Oe = {
	duration: .5,
	overwrite: !1,
	delay: 0
}, ke, P, F, Ae = 1e8, I = 1 / Ae, je = Math.PI * 2, Me = je / 4, Ne = 0, Pe = Math.sqrt, Fe = Math.cos, Ie = Math.sin, L = function(e) {
	return typeof e == "string";
}, R = function(e) {
	return typeof e == "function";
}, Le = function(e) {
	return typeof e == "number";
}, Re = function(e) {
	return e === void 0;
}, ze = function(e) {
	return typeof e == "object";
}, Be = function(e) {
	return e !== !1;
}, Ve = function() {
	return typeof window < "u";
}, He = function(e) {
	return R(e) || L(e);
}, Ue = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {}, z = Array.isArray, We = /random\([^)]+\)/g, Ge = /,\s*/g, Ke = /(?:-?\.?\d|\.)+/gi, qe = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, Je = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, Ye = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, Xe = /[+-]=-?[.\d]+/, Ze = /[^,'"\[\]\s]+/gi, Qe = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, B, $e, et, tt, nt = {}, rt = {}, it, at = function(e) {
	return (rt = Ft(e, nt)) && Zr;
}, ot = function(e, t) {
	return console.warn("Invalid property", e, "set to", t, "Missing plugin? gsap.registerPlugin()");
}, st = function(e, t) {
	return !t && console.warn(e);
}, ct = function(e, t) {
	return e && (nt[e] = t) && rt && (rt[e] = t) || nt;
}, lt = function() {
	return 0;
}, ut = {
	suppressEvents: !0,
	isStart: !0,
	kill: !1
}, dt = {
	suppressEvents: !0,
	kill: !1
}, ft = { suppressEvents: !0 }, pt = {}, mt = [], ht = {}, gt, _t = {}, vt = {}, yt = 30, bt = [], xt = "", St = function(e) {
	var t = e[0], n, r;
	if (ze(t) || R(t) || (e = [e]), !(n = (t._gsap || {}).harness)) {
		for (r = bt.length; r-- && !bt[r].targetTest(t););
		n = bt[r];
	}
	for (r = e.length; r--;) e[r] && (e[r]._gsap || (e[r]._gsap = new cr(e[r], n))) || e.splice(r, 1);
	return e;
}, Ct = function(e) {
	return e._gsap || St(vn(e))[0]._gsap;
}, wt = function(e, t, n) {
	return (n = e[t]) && R(n) ? e[t]() : Re(n) && e.getAttribute && e.getAttribute(t) || n;
}, Tt = function(e, t) {
	return (e = e.split(",")).forEach(t) || e;
}, V = function(e) {
	return Math.round(e * 1e5) / 1e5 || 0;
}, H = function(e) {
	return Math.round(e * 1e7) / 1e7 || 0;
}, Et = function(e, t) {
	var n = t.charAt(0), r = parseFloat(t.substr(2));
	return e = parseFloat(e), n === "+" ? e + r : n === "-" ? e - r : n === "*" ? e * r : e / r;
}, Dt = function(e, t) {
	for (var n = t.length, r = 0; e.indexOf(t[r]) < 0 && ++r < n;);
	return r < n;
}, Ot = function() {
	var e = mt.length, t = mt.slice(0), n, r;
	for (ht = {}, mt.length = 0, n = 0; n < e; n++) r = t[n], r && r._lazy && (r.render(r._lazy[0], r._lazy[1], !0)._lazy = 0);
}, kt = function(e) {
	return !!(e._initted || e._startAt || e.add);
}, At = function(e, t, n, r) {
	mt.length && !P && Ot(), e.render(t, n, r || !!(P && t < 0 && kt(e))), mt.length && !P && Ot();
}, jt = function(e) {
	var t = parseFloat(e);
	return (t || t === 0) && (e + "").match(Ze).length < 2 ? t : L(e) ? e.trim() : e;
}, Mt = function(e) {
	return e;
}, Nt = function(e, t) {
	for (var n in t) n in e || (e[n] = t[n]);
	return e;
}, Pt = function(e) {
	return function(t, n) {
		for (var r in n) r in t || r === "duration" && e || r === "ease" || (t[r] = n[r]);
	};
}, Ft = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, It = function e(t, n) {
	for (var r in n) r !== "__proto__" && r !== "constructor" && r !== "prototype" && (t[r] = ze(n[r]) ? e(t[r] || (t[r] = {}), n[r]) : n[r]);
	return t;
}, Lt = function(e, t) {
	var n = {}, r;
	for (r in e) r in t || (n[r] = e[r]);
	return n;
}, Rt = function(e) {
	var t = e.parent || B, n = e.keyframes ? Pt(z(e.keyframes)) : Nt;
	if (Be(e.inherit)) for (; t;) n(e, t.vars.defaults), t = t.parent || t._dp;
	return e;
}, zt = function(e, t) {
	for (var n = e.length, r = n === t.length; r && n-- && e[n] === t[n];);
	return n < 0;
}, Bt = function(e, t, n, r, i) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var a = e[r], o;
	if (i) for (o = t[i]; a && a[i] > o;) a = a._prev;
	return a ? (t._next = a._next, a._next = t) : (t._next = e[n], e[n] = t), t._next ? t._next._prev = t : e[r] = t, t._prev = a, t.parent = t._dp = e, t;
}, Vt = function(e, t, n, r) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var i = t._prev, a = t._next;
	i ? i._next = a : e[n] === t && (e[n] = a), a ? a._prev = i : e[r] === t && (e[r] = i), t._next = t._prev = t.parent = null;
}, Ht = function(e, t) {
	e.parent && (!t || e.parent.autoRemoveChildren) && e.parent.remove && e.parent.remove(e), e._act = 0;
}, Ut = function(e, t) {
	if (e && (!t || t._end > e._dur || t._start < 0)) for (var n = e; n;) n._dirty = 1, n = n.parent;
	return e;
}, Wt = function(e) {
	for (var t = e.parent; t && t.parent;) t._dirty = 1, t.totalDuration(), t = t.parent;
	return e;
}, Gt = function(e, t, n, r) {
	return e._startAt && (P ? e._startAt.revert(dt) : e.vars.immediateRender && !e.vars.autoRevert || e._startAt.render(t, !0, r));
}, Kt = function e(t) {
	return !t || t._ts && e(t.parent);
}, qt = function(e) {
	return e._repeat ? Jt(e._tTime, e = e.duration() + e._rDelay) * e : 0;
}, Jt = function(e, t) {
	var n = Math.floor(e = H(e / t));
	return e && n === e ? n - 1 : n;
}, Yt = function(e, t) {
	return (e - t._start) * t._ts + (t._ts >= 0 ? 0 : t._dirty ? t.totalDuration() : t._tDur);
}, Xt = function(e) {
	return e._end = H(e._start + (e._tDur / Math.abs(e._ts || e._rts || I) || 0));
}, Zt = function(e, t) {
	var n = e._dp;
	return n && n.smoothChildTiming && e._ts && (e._start = H(n._time - (e._ts > 0 ? t / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - t) / -e._ts)), Xt(e), n._dirty || Ut(n, e)), e;
}, Qt = function(e, t) {
	var n;
	if ((t._time || !t._dur && t._initted || t._start < e._time && (t._dur || !t.add)) && (n = Yt(e.rawTime(), t), (!t._dur || pn(0, t.totalDuration(), n) - t._tTime > I) && t.render(n, !0)), Ut(e, t)._dp && e._initted && e._time >= e._dur && e._ts) {
		if (e._dur < e.duration()) for (n = e; n._dp;) n.rawTime() >= 0 && n.totalTime(n._tTime), n = n._dp;
		e._zTime = -I;
	}
}, $t = function(e, t, n, r) {
	return t.parent && Ht(t), t._start = H((Le(n) ? n : n || e !== B ? un(e, n, t) : e._time) + t._delay), t._end = H(t._start + (t.totalDuration() / Math.abs(t.timeScale()) || 0)), Bt(e, t, "_first", "_last", e._sort ? "_start" : 0), rn(t) || (e._recent = t), r || Qt(e, t), e._ts < 0 && Zt(e, e._tTime), e;
}, en = function(e, t) {
	return (nt.ScrollTrigger || ot("scrollTrigger", t)) && nt.ScrollTrigger.create(t, e);
}, tn = function(e, t, n, r, i) {
	if (_r(e, t, i), !e._initted) return 1;
	if (!n && e._pt && !P && (e._dur && e.vars.lazy !== !1 || !e._dur && e.vars.lazy) && gt !== Yn.frame) return mt.push(e), e._lazy = [i, r], 1;
}, nn = function e(t) {
	var n = t.parent;
	return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || e(n));
}, rn = function(e) {
	var t = e.data;
	return t === "isFromStart" || t === "isStart";
}, an = function(e, t, n, r) {
	var i = e.ratio, a = t < 0 || !t && (!e._start && nn(e) && !(!e._initted && rn(e)) || (e._ts < 0 || e._dp._ts < 0) && !rn(e)) ? 0 : 1, o = e._rDelay, s = 0, c, l, u;
	if (o && e._repeat && (s = pn(0, e._tDur, t), l = Jt(s, o), e._yoyo && l & 1 && (a = 1 - a), l !== Jt(e._tTime, o) && (i = 1 - a, e.vars.repeatRefresh && e._initted && e.invalidate())), a !== i || P || r || e._zTime === I || !t && e._zTime) {
		if (!e._initted && tn(e, t, r, n, s)) return;
		for (u = e._zTime, e._zTime = t || (n ? I : 0), n ||= t && !u, e.ratio = a, e._from && (a = 1 - a), e._time = 0, e._tTime = s, c = e._pt; c;) c.r(a, c.d), c = c._next;
		t < 0 && Gt(e, t, n, !0), e._onUpdate && !n && Fn(e, "onUpdate"), s && e._repeat && !n && e.parent && Fn(e, "onRepeat"), (t >= e._tDur || t < 0) && e.ratio === a && (a && Ht(e, 1), !n && !P && (Fn(e, a ? "onComplete" : "onReverseComplete", !0), e._prom && e._prom()));
	} else e._zTime ||= t;
}, on = function(e, t, n) {
	var r;
	if (n > t) for (r = e._first; r && r._start <= n;) {
		if (r.data === "isPause" && r._start > t) return r;
		r = r._next;
	}
	else for (r = e._last; r && r._start >= n;) {
		if (r.data === "isPause" && r._start < t) return r;
		r = r._prev;
	}
}, sn = function(e, t, n, r) {
	var i = e._repeat, a = H(t) || 0, o = e._tTime / e._tDur;
	return o && !r && (e._time *= a / e._dur), e._dur = a, e._tDur = i ? i < 0 ? 1e10 : H(a * (i + 1) + e._rDelay * i) : a, o > 0 && !r && Zt(e, e._tTime = e._tDur * o), e.parent && Xt(e), n || Ut(e.parent, e), e;
}, cn = function(e) {
	return e instanceof ur ? Ut(e) : sn(e, e._dur);
}, ln = {
	_start: 0,
	endTime: lt,
	totalDuration: lt
}, un = function e(t, n, r) {
	var i = t.labels, a = t._recent || ln, o = t.duration() >= Ae ? a.endTime(!1) : t._dur, s, c, l;
	return L(n) && (isNaN(n) || n in i) ? (c = n.charAt(0), l = n.substr(-1) === "%", s = n.indexOf("="), c === "<" || c === ">" ? (s >= 0 && (n = n.replace(/=/, "")), (c === "<" ? a._start : a.endTime(a._repeat >= 0)) + (parseFloat(n.substr(1)) || 0) * (l ? (s < 0 ? a : r).totalDuration() / 100 : 1)) : s < 0 ? (n in i || (i[n] = o), i[n]) : (c = parseFloat(n.charAt(s - 1) + n.substr(s + 1)), l && r && (c = c / 100 * (z(r) ? r[0] : r).totalDuration()), s > 1 ? e(t, n.substr(0, s - 1), r) + c : o + c)) : n == null ? o : +n;
}, dn = function(e, t, n) {
	var r = Le(t[1]), i = (r ? 2 : 1) + (e < 2 ? 0 : 1), a = t[i], o, s;
	if (r && (a.duration = t[1]), a.parent = n, e) {
		for (o = a, s = n; s && !("immediateRender" in o);) o = s.vars.defaults || {}, s = Be(s.vars.inherit) && s.parent;
		a.immediateRender = Be(o.immediateRender), e < 2 ? a.runBackwards = 1 : a.startAt = t[i - 1];
	}
	return new K(t[0], a, t[i + 1]);
}, fn = function(e, t) {
	return e || e === 0 ? t(e) : t;
}, pn = function(e, t, n) {
	return n < e ? e : n > t ? t : n;
}, U = function(e, t) {
	return !L(e) || !(t = Qe.exec(e)) ? "" : t[1];
}, mn = function(e, t, n) {
	return fn(n, function(n) {
		return pn(e, t, n);
	});
}, hn = [].slice, gn = function(e, t) {
	return e && ze(e) && "length" in e && (!t && !e.length || e.length - 1 in e && ze(e[0])) && !e.nodeType && e !== $e;
}, _n = function(e, t, n) {
	return n === void 0 && (n = []), e.forEach(function(e) {
		var r;
		return L(e) && !t || gn(e, 1) ? (r = n).push.apply(r, vn(e)) : n.push(e);
	}) || n;
}, vn = function(e, t, n) {
	return F && !t && F.selector ? F.selector(e) : L(e) && !n && (et || !Xn()) ? hn.call((t || tt).querySelectorAll(e), 0) : z(e) ? _n(e, n) : gn(e) ? hn.call(e, 0) : e ? [e] : [];
}, yn = function(e) {
	return e = vn(e)[0] || st("Invalid scope") || {}, function(t) {
		var n = e.current || e.nativeElement || e;
		return vn(t, n.querySelectorAll ? n : n === e ? st("Invalid scope") || tt.createElement("div") : e);
	};
}, bn = function(e) {
	return e.sort(function() {
		return .5 - Math.random();
	});
}, xn = function(e) {
	if (R(e)) return e;
	var t = ze(e) ? e : { each: e }, n = rr(t.ease), r = t.from || 0, i = parseFloat(t.base) || 0, a = {}, o = r > 0 && r < 1, s = isNaN(r) || o, c = t.axis, l = r, u = r;
	return L(r) ? l = u = {
		center: .5,
		edges: .5,
		end: 1
	}[r] || 0 : !o && s && (l = r[0], u = r[1]), function(e, o, d) {
		var f = (d || t).length, p = a[f], m, h, g, _, v, y, b, x, S;
		if (!p) {
			if (S = t.grid === "auto" ? 0 : (t.grid || [1, Ae])[1], !S) {
				for (b = -Ae; b < (b = d[S++].getBoundingClientRect().left) && S < f;);
				S < f && S--;
			}
			for (p = a[f] = [], m = s ? Math.min(S, f) * l - .5 : r % S, h = S === Ae ? 0 : s ? f * u / S - .5 : r / S | 0, b = 0, x = Ae, y = 0; y < f; y++) g = y % S - m, _ = h - (y / S | 0), p[y] = v = c ? Math.abs(c === "y" ? _ : g) : Pe(g * g + _ * _), v > b && (b = v), v < x && (x = v);
			r === "random" && bn(p), p.max = b - x, p.min = x, p.v = f = (parseFloat(t.amount) || parseFloat(t.each) * (S > f ? f - 1 : c ? c === "y" ? f / S : S : Math.max(S, f / S)) || 0) * (r === "edges" ? -1 : 1), p.b = f < 0 ? i - f : i, p.u = U(t.amount || t.each) || 0, n = n && f < 0 ? nr(n) : n;
		}
		return f = (p[e] - p.min) / p.max || 0, H(p.b + (n ? n(f) : f) * p.v) + p.u;
	};
}, Sn = function(e) {
	var t = 10 ** ((e + "").split(".")[1] || "").length;
	return function(n) {
		var r = H(Math.round(parseFloat(n) / e) * e * t);
		return (r - r % 1) / t + (Le(n) ? 0 : U(n));
	};
}, Cn = function(e, t) {
	var n = z(e), r, i;
	return !n && ze(e) && (r = n = e.radius || Ae, e.values ? (e = vn(e.values), (i = !Le(e[0])) && (r *= r)) : e = Sn(e.increment)), fn(t, n ? R(e) ? function(t) {
		return i = e(t), Math.abs(i - t) <= r ? i : t;
	} : function(t) {
		for (var n = parseFloat(i ? t.x : t), a = parseFloat(i ? t.y : 0), o = Ae, s = 0, c = e.length, l, u; c--;) i ? (l = e[c].x - n, u = e[c].y - a, l = l * l + u * u) : l = Math.abs(e[c] - n), l < o && (o = l, s = c);
		return s = !r || o <= r ? e[s] : t, i || s === t || Le(t) ? s : s + U(t);
	} : Sn(e));
}, wn = function(e, t, n, r) {
	return fn(z(e) ? !t : n === !0 ? !!(n = 0) : !r, function() {
		return z(e) ? e[~~(Math.random() * e.length)] : (n ||= 1e-5) && (r = n < 1 ? 10 ** ((n + "").length - 2) : 1) && Math.floor(Math.round((e - n / 2 + Math.random() * (t - e + n * .99)) / n) * n * r) / r;
	});
}, Tn = function() {
	var e = [...arguments];
	return function(t) {
		return e.reduce(function(e, t) {
			return t(e);
		}, t);
	};
}, En = function(e, t) {
	return function(n) {
		return e(parseFloat(n)) + (t || U(n));
	};
}, Dn = function(e, t, n) {
	return Mn(e, t, 0, 1, n);
}, On = function(e, t, n) {
	return fn(n, function(n) {
		return e[~~t(n)];
	});
}, kn = function e(t, n, r) {
	var i = n - t;
	return z(t) ? On(t, e(0, t.length), n) : fn(r, function(e) {
		return (i + (e - t) % i) % i + t;
	});
}, An = function e(t, n, r) {
	var i = n - t, a = i * 2;
	return z(t) ? On(t, e(0, t.length - 1), n) : fn(r, function(e) {
		return e = (a + (e - t) % a) % a || 0, t + (e > i ? a - e : e);
	});
}, jn = function(e) {
	return e.replace(We, function(e) {
		var t = e.indexOf("[") + 1, n = e.substring(t || 7, t ? e.indexOf("]") : e.length - 1).split(Ge);
		return wn(t ? n : +n[0], t ? 0 : +n[1], +n[2] || 1e-5);
	});
}, Mn = function(e, t, n, r, i) {
	var a = t - e, o = r - n;
	return fn(i, function(t) {
		return n + ((t - e) / a * o || 0);
	});
}, Nn = function e(t, n, r, i) {
	var a = isNaN(t + n) ? 0 : function(e) {
		return (1 - e) * t + e * n;
	};
	if (!a) {
		var o = L(t), s = {}, c, l, u, d, f;
		if (r === !0 && (i = 1) && (r = null), o) t = { p: t }, n = { p: n };
		else if (z(t) && !z(n)) {
			for (u = [], d = t.length, f = d - 2, l = 1; l < d; l++) u.push(e(t[l - 1], t[l]));
			d--, a = function(e) {
				e *= d;
				var t = Math.min(f, ~~e);
				return u[t](e - t);
			}, r = n;
		} else i || (t = Ft(z(t) ? [] : {}, t));
		if (!u) {
			for (c in n) fr.call(s, t, c, "get", n[c]);
			a = function(e) {
				return Mr(e, s) || (o ? t.p : t);
			};
		}
	}
	return fn(r, a);
}, Pn = function(e, t, n) {
	var r = e.labels, i = Ae, a, o, s;
	for (a in r) o = r[a] - t, o < 0 == !!n && o && i > (o = Math.abs(o)) && (s = a, i = o);
	return s;
}, Fn = function(e, t, n) {
	var r = e.vars, i = r[t], a = F, o = e._ctx, s, c, l;
	if (i) return s = r[t + "Params"], c = r.callbackScope || e, n && mt.length && Ot(), o && (F = o), l = s ? i.apply(c, s) : i.call(c), F = a, l;
}, In = function(e) {
	return Ht(e), e.scrollTrigger && e.scrollTrigger.kill(!!P), e.progress() < 1 && Fn(e, "onInterrupt"), e;
}, Ln, Rn = [], zn = function(e) {
	if (e) if (e = !e.name && e.default || e, Ve() || e.headless) {
		var t = e.name, n = R(e), r = t && !n && e.init ? function() {
			this._props = [];
		} : e, i = {
			init: lt,
			render: Mr,
			add: fr,
			kill: Pr,
			modifier: Nr,
			rawVars: 0
		}, a = {
			targetTest: 0,
			get: 0,
			getSetter: Or,
			aliases: {},
			register: 0
		};
		if (Xn(), e !== r) {
			if (_t[t]) return;
			Nt(r, Nt(Lt(e, i), a)), Ft(r.prototype, Ft(i, Lt(e, a))), _t[r.prop = t] = r, e.targetTest && (bt.push(r), pt[t] = 1), t = (t === "css" ? "CSS" : t.charAt(0).toUpperCase() + t.substr(1)) + "Plugin";
		}
		ct(t, r), e.register && e.register(Zr, r, Lr);
	} else Rn.push(e);
}, W = 255, Bn = {
	aqua: [
		0,
		W,
		W
	],
	lime: [
		0,
		W,
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
		W
	],
	navy: [
		0,
		0,
		128
	],
	white: [
		W,
		W,
		W
	],
	olive: [
		128,
		128,
		0
	],
	yellow: [
		W,
		W,
		0
	],
	orange: [
		W,
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
		W,
		0,
		0
	],
	pink: [
		W,
		192,
		203
	],
	cyan: [
		0,
		W,
		W
	],
	transparent: [
		W,
		W,
		W,
		0
	]
}, Vn = function(e, t, n) {
	return e += e < 0 ? 1 : e > 1 ? -1 : 0, (e * 6 < 1 ? t + (n - t) * e * 6 : e < .5 ? n : e * 3 < 2 ? t + (n - t) * (2 / 3 - e) * 6 : t) * W + .5 | 0;
}, Hn = function(e, t, n) {
	var r = e ? Le(e) ? [
		e >> 16,
		e >> 8 & W,
		e & W
	] : 0 : Bn.black, i, a, o, s, c, l, u, d, f, p;
	if (!r) {
		if (e.substr(-1) === "," && (e = e.substr(0, e.length - 1)), Bn[e]) r = Bn[e];
		else if (e.charAt(0) === "#") {
			if (e.length < 6 && (i = e.charAt(1), a = e.charAt(2), o = e.charAt(3), e = "#" + i + i + a + a + o + o + (e.length === 5 ? e.charAt(4) + e.charAt(4) : "")), e.length === 9) return r = parseInt(e.substr(1, 6), 16), [
				r >> 16,
				r >> 8 & W,
				r & W,
				parseInt(e.substr(7), 16) / 255
			];
			e = parseInt(e.substr(1), 16), r = [
				e >> 16,
				e >> 8 & W,
				e & W
			];
		} else if (e.substr(0, 3) === "hsl") {
			if (r = p = e.match(Ke), !t) s = r[0] % 360 / 360, c = r[1] / 100, l = r[2] / 100, a = l <= .5 ? l * (c + 1) : l + c - l * c, i = l * 2 - a, r.length > 3 && (r[3] *= 1), r[0] = Vn(s + 1 / 3, i, a), r[1] = Vn(s, i, a), r[2] = Vn(s - 1 / 3, i, a);
			else if (~e.indexOf("=")) return r = e.match(qe), n && r.length < 4 && (r[3] = 1), r;
		} else r = e.match(Ke) || Bn.transparent;
		r = r.map(Number);
	}
	return t && !p && (i = r[0] / W, a = r[1] / W, o = r[2] / W, u = Math.max(i, a, o), d = Math.min(i, a, o), l = (u + d) / 2, u === d ? s = c = 0 : (f = u - d, c = l > .5 ? f / (2 - u - d) : f / (u + d), s = u === i ? (a - o) / f + (a < o ? 6 : 0) : u === a ? (o - i) / f + 2 : (i - a) / f + 4, s *= 60), r[0] = ~~(s + .5), r[1] = ~~(c * 100 + .5), r[2] = ~~(l * 100 + .5)), n && r.length < 4 && (r[3] = 1), r;
}, Un = function(e) {
	var t = [], n = [], r = -1;
	return e.split(Gn).forEach(function(e) {
		var i = e.match(Je) || [];
		t.push.apply(t, i), n.push(r += i.length + 1);
	}), t.c = n, t;
}, Wn = function(e, t, n) {
	var r = "", i = (e + r).match(Gn), a = t ? "hsla(" : "rgba(", o = 0, s, c, l, u;
	if (!i) return e;
	if (i = i.map(function(e) {
		return (e = Hn(e, t, 1)) && a + (t ? e[0] + "," + e[1] + "%," + e[2] + "%," + e[3] : e.join(",")) + ")";
	}), n && (l = Un(e), s = n.c, s.join(r) !== l.c.join(r))) for (c = e.replace(Gn, "1").split(Je), u = c.length - 1; o < u; o++) r += c[o] + (~s.indexOf(o) ? i.shift() || a + "0,0,0,0)" : (l.length ? l : i.length ? i : n).shift());
	if (!c) for (c = e.split(Gn), u = c.length - 1; o < u; o++) r += c[o] + i[o];
	return r + c[u];
}, Gn = function() {
	var e = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", t;
	for (t in Bn) e += "|" + t + "\\b";
	return RegExp(e + ")", "gi");
}(), Kn = /hsl[a]?\(/, qn = function(e) {
	var t = e.join(" "), n;
	if (Gn.lastIndex = 0, Gn.test(t)) return n = Kn.test(t), e[1] = Wn(e[1], n), e[0] = Wn(e[0], n, Un(e[1])), !0;
}, Jn, Yn = function() {
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
			it && (!et && Ve() && ($e = et = window, tt = $e.document || {}, nt.gsap = Zr, ($e.gsapVersions ||= []).push(Zr.version), at(rt || $e.GreenSockGlobals || !$e.gsap && $e || {}), Rn.forEach(zn)), u = typeof requestAnimationFrame < "u" && requestAnimationFrame, c && d.sleep(), l = u || function(e) {
				return setTimeout(e, o - d.time * 1e3 + 1 | 0);
			}, Jn = 1, m(2));
		},
		sleep: function() {
			(u ? cancelAnimationFrame : clearTimeout)(c), Jn = 0, l = lt;
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
			return d.remove(e), s[n ? "unshift" : "push"](r), Xn(), r;
		},
		remove: function(e, t) {
			~(t = s.indexOf(e)) && s.splice(t, 1) && p >= t && p--;
		},
		_listeners: s
	}, d;
}(), Xn = function() {
	return !Jn && Yn.wake();
}, G = {}, Zn = /^[\d.\-M][\d.\-,\s]/, Qn = /["']/g, $n = function(e) {
	for (var t = {}, n = e.substr(1, e.length - 3).split(":"), r = n[0], i = 1, a = n.length, o, s, c; i < a; i++) s = n[i], o = i === a - 1 ? s.length : s.lastIndexOf(","), c = s.substr(0, o), t[r] = isNaN(c) ? c.replace(Qn, "").trim() : +c, r = s.substr(o + 1).trim();
	return t;
}, er = function(e) {
	var t = e.indexOf("(") + 1, n = e.indexOf(")"), r = e.indexOf("(", t);
	return e.substring(t, ~r && r < n ? e.indexOf(")", n + 1) : n);
}, tr = function(e) {
	var t = (e + "").split("("), n = G[t[0]];
	return n && t.length > 1 && n.config ? n.config.apply(null, ~e.indexOf("{") ? [$n(t[1])] : er(e).split(",").map(jt)) : G._CE && Zn.test(e) ? G._CE("", e) : n;
}, nr = function(e) {
	return function(t) {
		return 1 - e(1 - t);
	};
}, rr = function(e, t) {
	return e && (R(e) ? e : G[e] || tr(e)) || t;
}, ir = function(e, t, n, r) {
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
	return Tt(e, function(e) {
		for (var t in G[e] = nt[e] = i, G[a = e.toLowerCase()] = n, i) G[a + (t === "easeIn" ? ".in" : t === "easeOut" ? ".out" : ".inOut")] = G[e + "." + t] = i[t];
	}), i;
}, ar = function(e) {
	return function(t) {
		return t < .5 ? (1 - e(1 - t * 2)) / 2 : .5 + e((t - .5) * 2) / 2;
	};
}, or = function e(t, n, r) {
	var i = n >= 1 ? n : 1, a = (r || (t ? .3 : .45)) / (n < 1 ? n : 1), o = a / je * (Math.asin(1 / i) || 0), s = function(e) {
		return e === 1 ? 1 : i * 2 ** (-10 * e) * Ie((e - o) * a) + 1;
	}, c = t === "out" ? s : t === "in" ? function(e) {
		return 1 - s(1 - e);
	} : ar(s);
	return a = je / a, c.config = function(n, r) {
		return e(t, n, r);
	}, c;
}, sr = function e(t, n) {
	n === void 0 && (n = 1.70158);
	var r = function(e) {
		return e ? --e * e * ((n + 1) * e + n) + 1 : 0;
	}, i = t === "out" ? r : t === "in" ? function(e) {
		return 1 - r(1 - e);
	} : ar(r);
	return i.config = function(n) {
		return e(t, n);
	}, i;
};
Tt("Linear,Quad,Cubic,Quart,Quint,Strong", function(e, t) {
	var n = t < 5 ? t + 1 : t;
	ir(e + ",Power" + (n - 1), t ? function(e) {
		return e ** +n;
	} : function(e) {
		return e;
	}, function(e) {
		return 1 - (1 - e) ** n;
	}, function(e) {
		return e < .5 ? (e * 2) ** n / 2 : 1 - ((1 - e) * 2) ** n / 2;
	});
}), G.Linear.easeNone = G.none = G.Linear.easeIn, ir("Elastic", or("in"), or("out"), or()), (function(e, t) {
	var n = 1 / t, r = 2 * n, i = 2.5 * n, a = function(a) {
		return a < n ? e * a * a : a < r ? e * (a - 1.5 / t) ** 2 + .75 : a < i ? e * (a -= 2.25 / t) * a + .9375 : e * (a - 2.625 / t) ** 2 + .984375;
	};
	ir("Bounce", function(e) {
		return 1 - a(1 - e);
	}, a);
})(7.5625, 2.75), ir("Expo", function(e) {
	return 2 ** (10 * (e - 1)) * e + e * e * e * e * e * e * (1 - e);
}), ir("Circ", function(e) {
	return -(Pe(1 - e * e) - 1);
}), ir("Sine", function(e) {
	return e === 1 ? 1 : -Fe(e * Me) + 1;
}), ir("Back", sr("in"), sr("out"), sr()), G.SteppedEase = G.steps = nt.SteppedEase = { config: function(e, t) {
	e === void 0 && (e = 1);
	var n = 1 / e, r = e + +!t, i = +!!t, a = 1 - I;
	return function(e) {
		return ((r * pn(0, a, e) | 0) + i) * n;
	};
} }, Oe.ease = G["quad.out"], Tt("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(e) {
	return xt += e + "," + e + "Params,";
});
var cr = function(e, t) {
	this.id = Ne++, e._gsap = this, this.target = e, this.harness = t, this.get = t ? t.get : wt, this.set = t ? t.getSetter : Or;
}, lr = /* @__PURE__ */ function() {
	function e(e) {
		this.vars = e, this._delay = +e.delay || 0, (this._repeat = e.repeat === Infinity ? -2 : e.repeat || 0) && (this._rDelay = e.repeatDelay || 0, this._yoyo = !!e.yoyo || !!e.yoyoEase), this._ts = 1, sn(this, +e.duration, 1, 1), this.data = e.data, F && (this._ctx = F, F.data.push(this)), Jn || Yn.wake();
	}
	var t = e.prototype;
	return t.delay = function(e) {
		return e || e === 0 ? (this.parent && this.parent.smoothChildTiming && this.startTime(this._start + e - this._delay), this._delay = e, this) : this._delay;
	}, t.duration = function(e) {
		return arguments.length ? this.totalDuration(this._repeat > 0 ? e + (e + this._rDelay) * this._repeat : e) : this.totalDuration() && this._dur;
	}, t.totalDuration = function(e) {
		return arguments.length ? (this._dirty = 0, sn(this, this._repeat < 0 ? e : (e - this._repeat * this._rDelay) / (this._repeat + 1))) : this._tDur;
	}, t.totalTime = function(e, t) {
		if (Xn(), !arguments.length) return this._tTime;
		var n = this._dp;
		if (n && n.smoothChildTiming && this._ts) {
			for (Zt(this, e), !n._dp || n.parent || Qt(n, this); n && n.parent;) n.parent._time !== n._start + (n._ts >= 0 ? n._tTime / n._ts : (n.totalDuration() - n._tTime) / -n._ts) && n.totalTime(n._tTime, !0), n = n.parent;
			!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && e < this._tDur || this._ts < 0 && e > 0 || !this._tDur && !e) && $t(this._dp, this, this._start - this._delay);
		}
		return (this._tTime !== e || !this._dur && !t || this._initted && Math.abs(this._zTime) === I || !this._initted && this._dur && e || !e && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = e), At(this, e, t)), this;
	}, t.time = function(e, t) {
		return arguments.length ? this.totalTime(Math.min(this.totalDuration(), e + qt(this)) % (this._dur + this._rDelay) || (e ? this._dur : 0), t) : this._time;
	}, t.totalProgress = function(e, t) {
		return arguments.length ? this.totalTime(this.totalDuration() * e, t) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
	}, t.progress = function(e, t) {
		return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - e : e) + qt(this), t) : this.duration() ? Math.min(1, this._time / this._dur) : +(this.rawTime() > 0);
	}, t.iteration = function(e, t) {
		var n = this.duration() + this._rDelay;
		return arguments.length ? this.totalTime(this._time + (e - 1) * n, t) : this._repeat ? Jt(this._tTime, n) + 1 : 1;
	}, t.timeScale = function(e, t) {
		if (!arguments.length) return this._rts === -I ? 0 : this._rts;
		if (this._rts === e) return this;
		var n = this.parent && this._ts ? Yt(this.parent._time, this) : this._tTime;
		return this._rts = +e || 0, this._ts = this._ps || e === -I ? 0 : this._rts, this.totalTime(pn(-Math.abs(this._delay), this.totalDuration(), n), t !== !1), Xt(this), Wt(this);
	}, t.paused = function(e) {
		return arguments.length ? (this._ps !== e && (this._ps = e, e ? (this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()), this._ts = this._act = 0) : (Xn(), this._ts = this._rts, this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== I && (this._tTime -= I)))), this) : this._ps;
	}, t.startTime = function(e) {
		if (arguments.length) {
			this._start = H(e);
			var t = this.parent || this._dp;
			return t && (t._sort || !this.parent) && $t(t, this, this._start - this._delay), this;
		}
		return this._start;
	}, t.endTime = function(e) {
		return this._start + (Be(e) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
	}, t.rawTime = function(e) {
		var t = this.parent || this._dp;
		return t ? e && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : this._ts ? Yt(t.rawTime(e), this) : this._tTime : this._tTime;
	}, t.revert = function(e) {
		e === void 0 && (e = ft);
		var t = P;
		return P = e, kt(this) && (this.timeline && this.timeline.revert(e), this.totalTime(-.01, e.suppressEvents)), this.data !== "nested" && e.kill !== !1 && this.kill(), P = t, this;
	}, t.globalTime = function(e) {
		for (var t = this, n = arguments.length ? e : t.rawTime(); t;) n = t._start + n / (Math.abs(t._ts) || 1), t = t._dp;
		return !this.parent && this._sat ? this._sat.globalTime(e) : n;
	}, t.repeat = function(e) {
		return arguments.length ? (this._repeat = e === Infinity ? -2 : e, cn(this)) : this._repeat === -2 ? Infinity : this._repeat;
	}, t.repeatDelay = function(e) {
		if (arguments.length) {
			var t = this._time;
			return this._rDelay = e, cn(this), t ? this.time(t) : this;
		}
		return this._rDelay;
	}, t.yoyo = function(e) {
		return arguments.length ? (this._yoyo = e, this) : this._yoyo;
	}, t.seek = function(e, t) {
		return this.totalTime(un(this, e), Be(t));
	}, t.restart = function(e, t) {
		return this.play().totalTime(e ? -this._delay : 0, Be(t)), this._dur || (this._zTime = -I), this;
	}, t.play = function(e, t) {
		return e != null && this.seek(e, t), this.reversed(!1).paused(!1);
	}, t.reverse = function(e, t) {
		return e != null && this.seek(e || this.totalDuration(), t), this.reversed(!0).paused(!1);
	}, t.pause = function(e, t) {
		return e != null && this.seek(e, t), this.paused(!0);
	}, t.resume = function() {
		return this.paused(!1);
	}, t.reversed = function(e) {
		return arguments.length ? (!!e !== this.reversed() && this.timeScale(-this._rts || (e ? -I : 0)), this) : this._rts < 0;
	}, t.invalidate = function() {
		return this._initted = this._act = 0, this._zTime = -I, this;
	}, t.isActive = function() {
		var e = this.parent || this._dp, t = this._start, n;
		return !!(!e || this._ts && this._initted && e.isActive() && (n = e.rawTime(!0)) >= t && n < this.endTime(!0) - I);
	}, t.eventCallback = function(e, t, n) {
		var r = this.vars;
		return arguments.length > 1 ? (t ? (r[e] = t, n && (r[e + "Params"] = n), e === "onUpdate" && (this._onUpdate = t)) : delete r[e], this) : r[e];
	}, t.then = function(e) {
		var t = this, n = t._prom;
		return new Promise(function(r) {
			var i = R(e) ? e : Mt, a = function() {
				var e = t.then;
				t.then = null, n && n(), R(i) && (i = i(t)) && (i.then || i === t) && (t.then = e), r(i), t.then = e;
			};
			t._initted && t.totalProgress() === 1 && t._ts >= 0 || !t._tTime && t._ts < 0 ? a() : t._prom = a;
		});
	}, t.kill = function() {
		In(this);
	}, e;
}();
Nt(lr.prototype, {
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
	_zTime: -I,
	_prom: 0,
	_ps: !1,
	_rts: 1
});
var ur = /* @__PURE__ */ function(e) {
	Ee(t, e);
	function t(t, n) {
		var r;
		return t === void 0 && (t = {}), r = e.call(this, t) || this, r.labels = {}, r.smoothChildTiming = !!t.smoothChildTiming, r.autoRemoveChildren = !!t.autoRemoveChildren, r._sort = Be(t.sortChildren), B && $t(t.parent || B, Te(r), n), t.reversed && r.reverse(), t.paused && r.paused(!0), t.scrollTrigger && en(Te(r), t.scrollTrigger), r;
	}
	var n = t.prototype;
	return n.to = function(e, t, n) {
		return dn(0, arguments, this), this;
	}, n.from = function(e, t, n) {
		return dn(1, arguments, this), this;
	}, n.fromTo = function(e, t, n, r) {
		return dn(2, arguments, this), this;
	}, n.set = function(e, t, n) {
		return t.duration = 0, t.parent = this, Rt(t).repeatDelay || (t.repeat = 0), t.immediateRender = !!t.immediateRender, new K(e, t, un(this, n), 1), this;
	}, n.call = function(e, t, n) {
		return $t(this, K.delayedCall(0, e, t), n);
	}, n.staggerTo = function(e, t, n, r, i, a, o) {
		return n.duration = t, n.stagger = n.stagger || r, n.onComplete = a, n.onCompleteParams = o, n.parent = this, new K(e, n, un(this, i)), this;
	}, n.staggerFrom = function(e, t, n, r, i, a, o) {
		return n.runBackwards = 1, Rt(n).immediateRender = Be(n.immediateRender), this.staggerTo(e, t, n, r, i, a, o);
	}, n.staggerFromTo = function(e, t, n, r, i, a, o, s) {
		return r.startAt = n, Rt(r).immediateRender = Be(r.immediateRender), this.staggerTo(e, t, r, i, a, o, s);
	}, n.render = function(e, t, n) {
		var r = this._time, i = this._dirty ? this.totalDuration() : this._tDur, a = this._dur, o = e <= 0 ? 0 : H(e), s = this._zTime < 0 != e < 0 && (this._initted || !a), c, l, u, d, f, p, m, h, g, _, v, y;
		if (this !== B && o > i && e >= 0 && (o = i), o !== this._tTime || n || s) {
			if (r !== this._time && a && (o += this._time - r, e += this._time - r), c = o, g = this._start, h = this._ts, p = !h, s && (a || (r = this._zTime), (e || !t) && (this._zTime = e)), this._repeat) {
				if (v = this._yoyo, f = a + this._rDelay, this._repeat < -1 && e < 0) return this.totalTime(f * 100 + e, t, n);
				if (c = H(o % f), o === i ? (d = this._repeat, c = a) : (_ = H(o / f), d = ~~_, d && d === _ && (c = a, d--), c > a && (c = a)), _ = Jt(this._tTime, f), !r && this._tTime && _ !== d && this._tTime - _ * f - this._dur <= 0 && (_ = d), v && d & 1 && (c = a - c, y = 1), d !== _ && !this._lock) {
					var b = v && _ & 1, x = b === (v && d & 1);
					if (d < _ && (b = !b), r = b ? 0 : o % a ? a : o, this._lock = 1, this.render(r || (y ? 0 : H(d * f)), t, !a)._lock = 0, this._tTime = o, !t && this.parent && Fn(this, "onRepeat"), this.vars.repeatRefresh && !y && (this.invalidate()._lock = 1, _ = d), r && r !== this._time || p !== !this._ts || this.vars.onRepeat && !this.parent && !this._act || (a = this._dur, i = this._tDur, x && (this._lock = 2, r = b ? a : -1e-4, this.render(r, !0), this.vars.repeatRefresh && !y && this.invalidate()), this._lock = 0, !this._ts && !p)) return this;
				}
			}
			if (this._hasPause && !this._forcing && this._lock < 2 && (m = on(this, H(r), H(c)), m && (o -= c - (c = m._start))), this._tTime = o, this._time = c, this._act = !!h, this._initted || (this._onUpdate = this.vars.onUpdate, this._initted = 1, this._zTime = e, r = 0), !r && o && a && !t && !_ && (Fn(this, "onStart"), this._tTime !== o)) return this;
			if (c >= r && e >= 0) for (l = this._first; l;) {
				if (u = l._next, (l._act || c >= l._start) && l._ts && m !== l) {
					if (l.parent !== this) return this.render(e, t, n);
					if (l.render(l._ts > 0 ? (c - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (c - l._start) * l._ts, t, n), c !== this._time || !this._ts && !p) {
						m = 0, u && (o += this._zTime = -I);
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
						if (l.render(l._ts > 0 ? (S - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (S - l._start) * l._ts, t, n || P && kt(l)), c !== this._time || !this._ts && !p) {
							m = 0, u && (o += this._zTime = S ? -I : I);
							break;
						}
					}
					l = u;
				}
			}
			if (m && !t && (this.pause(), m.render(c >= r ? 0 : -I)._zTime = c >= r ? 1 : -1, this._ts)) return this._start = g, Xt(this), this.render(e, t, n);
			this._onUpdate && !t && Fn(this, "onUpdate", !0), (o === i && this._tTime >= this.totalDuration() || !o && r) && (g === this._start || Math.abs(h) !== Math.abs(this._ts)) && (this._lock || ((e || !a) && (o === i && this._ts > 0 || !o && this._ts < 0) && Ht(this, 1), !t && !(e < 0 && !r) && (o || r || !i) && (Fn(this, o === i && e >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(o < i && this.timeScale() > 0) && this._prom())));
		}
		return this;
	}, n.add = function(e, t) {
		var n = this;
		if (Le(t) || (t = un(this, t, e)), !(e instanceof lr)) {
			if (z(e)) return e.forEach(function(e) {
				return n.add(e, t);
			}), this;
			if (L(e)) return this.addLabel(e, t);
			if (R(e)) e = K.delayedCall(0, e);
			else return this;
		}
		return this === e ? this : $t(this, e, t);
	}, n.getChildren = function(e, t, n, r) {
		e === void 0 && (e = !0), t === void 0 && (t = !0), n === void 0 && (n = !0), r === void 0 && (r = -Ae);
		for (var i = [], a = this._first; a;) a._start >= r && (a instanceof K ? t && i.push(a) : (n && i.push(a), e && i.push.apply(i, a.getChildren(!0, t, n)))), a = a._next;
		return i;
	}, n.getById = function(e) {
		for (var t = this.getChildren(1, 1, 1), n = t.length; n--;) if (t[n].vars.id === e) return t[n];
	}, n.remove = function(e) {
		return L(e) ? this.removeLabel(e) : R(e) ? this.killTweensOf(e) : (e.parent === this && Vt(this, e), e === this._recent && (this._recent = this._last), Ut(this));
	}, n.totalTime = function(t, n) {
		return arguments.length ? (this._forcing = 1, !this._dp && this._ts && (this._start = H(Yn.time - (this._ts > 0 ? t / this._ts : (this.totalDuration() - t) / -this._ts))), e.prototype.totalTime.call(this, t, n), this._forcing = 0, this) : this._tTime;
	}, n.addLabel = function(e, t) {
		return this.labels[e] = un(this, t), this;
	}, n.removeLabel = function(e) {
		return delete this.labels[e], this;
	}, n.addPause = function(e, t, n) {
		var r = K.delayedCall(0, t || lt, n);
		return r.data = "isPause", this._hasPause = 1, $t(this, r, un(this, e));
	}, n.removePause = function(e) {
		var t = this._first;
		for (e = un(this, e); t;) t._start === e && t.data === "isPause" && Ht(t), t = t._next;
	}, n.killTweensOf = function(e, t, n) {
		for (var r = this.getTweensOf(e, n), i = r.length; i--;) hr !== r[i] && r[i].kill(e, t);
		return this;
	}, n.getTweensOf = function(e, t) {
		for (var n = [], r = vn(e), i = this._first, a = Le(t), o; i;) i instanceof K ? Dt(i._targets, r) && (a ? (!hr || i._initted && i._ts) && i.globalTime(0) <= t && i.globalTime(i.totalDuration()) > t : !t || i.isActive()) && n.push(i) : (o = i.getTweensOf(r, t)).length && n.push.apply(n, o), i = i._next;
		return n;
	}, n.tweenTo = function(e, t) {
		t ||= {};
		var n = this, r = un(n, e), i = t, a = i.startAt, o = i.onStart, s = i.onStartParams, c = i.immediateRender, l, u = K.to(n, Nt({
			ease: t.ease || "none",
			lazy: !1,
			immediateRender: !1,
			time: r,
			overwrite: "auto",
			duration: t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale()) || I,
			onStart: function() {
				if (n.pause(), !l) {
					var e = t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale());
					u._dur !== e && sn(u, e, 0, 1).render(u._time, !0, !0), l = 1;
				}
				o && o.apply(u, s || []);
			}
		}, t));
		return c ? u.render(0) : u;
	}, n.tweenFromTo = function(e, t, n) {
		return this.tweenTo(t, Nt({ startAt: { time: un(this, e) } }, n));
	}, n.recent = function() {
		return this._recent;
	}, n.nextLabel = function(e) {
		return e === void 0 && (e = this._time), Pn(this, un(this, e));
	}, n.previousLabel = function(e) {
		return e === void 0 && (e = this._time), Pn(this, un(this, e), 1);
	}, n.currentLabel = function(e) {
		return arguments.length ? this.seek(e, !0) : this.previousLabel(this._time + I);
	}, n.shiftChildren = function(e, t, n) {
		n === void 0 && (n = 0);
		var r = this._first, i = this.labels, a;
		for (e = H(e); r;) r._start >= n && (r._start += e, r._end += e), r = r._next;
		if (t) for (a in i) i[a] >= n && (i[a] += e);
		return Ut(this);
	}, n.invalidate = function(t) {
		var n = this._first;
		for (this._lock = 0; n;) n.invalidate(t), n = n._next;
		return e.prototype.invalidate.call(this, t);
	}, n.clear = function(e) {
		e === void 0 && (e = !0);
		for (var t = this._first, n; t;) n = t._next, this.remove(t), t = n;
		return this._dp && (this._time = this._tTime = this._pTime = 0), e && (this.labels = {}), Ut(this);
	}, n.totalDuration = function(e) {
		var t = 0, n = this, r = n._last, i = Ae, a, o, s;
		if (arguments.length) return n.timeScale((n._repeat < 0 ? n.duration() : n.totalDuration()) / (n.reversed() ? -e : e));
		if (n._dirty) {
			for (s = n.parent; r;) a = r._prev, r._dirty && r.totalDuration(), o = r._start, o > i && n._sort && r._ts && !n._lock ? (n._lock = 1, $t(n, r, o - r._delay, 1)._lock = 0) : i = o, o < 0 && r._ts && (t -= o, (!s && !n._dp || s && s.smoothChildTiming) && (n._start += H(o / n._ts), n._time -= o, n._tTime -= o), n.shiftChildren(-o, !1, -Infinity), i = 0), r._end > t && r._ts && (t = r._end), r = a;
			sn(n, n === B && n._time > t ? n._time : t, 1, 1), n._dirty = 0;
		}
		return n._tDur;
	}, t.updateRoot = function(e) {
		if (B._ts && (At(B, Yt(e, B)), gt = Yn.frame), Yn.frame >= yt) {
			yt += De.autoSleep || 120;
			var t = B._first;
			if ((!t || !t._ts) && De.autoSleep && Yn._listeners.length < 2) {
				for (; t && !t._ts;) t = t._next;
				t || Yn.sleep();
			}
		}
	}, t;
}(lr);
Nt(ur.prototype, {
	_lock: 0,
	_hasPause: 0,
	_forcing: 0
});
var dr = function(e, t, n, r, i, a, o) {
	var s = new Lr(this._pt, e, t, 0, 1, jr, null, i), c = 0, l = 0, u, d, f, p, m, h, g, _;
	for (s.b = n, s.e = r, n += "", r += "", (g = ~r.indexOf("random(")) && (r = jn(r)), a && (_ = [n, r], a(_, e, t), n = _[0], r = _[1]), d = n.match(Ye) || []; u = Ye.exec(r);) p = u[0], m = r.substring(c, u.index), f ? f = (f + 1) % 5 : m.substr(-5) === "rgba(" && (f = 1), p !== d[l++] && (h = parseFloat(d[l - 1]) || 0, s._pt = {
		_next: s._pt,
		p: m || l === 1 ? m : ",",
		s: h,
		c: p.charAt(1) === "=" ? Et(h, p) - h : parseFloat(p) - h,
		m: f && f < 4 ? Math.round : 0
	}, c = Ye.lastIndex);
	return s.c = c < r.length ? r.substring(c, r.length) : "", s.fp = o, (Xe.test(r) || g) && (s.e = 0), this._pt = s, s;
}, fr = function(e, t, n, r, i, a, o, s, c, l) {
	R(r) && (r = r(i || 0, e, a));
	var u = e[t], d = n === "get" ? R(u) ? c ? e[t.indexOf("set") || !R(e["get" + t.substr(3)]) ? t : "get" + t.substr(3)](c) : e[t]() : u : n, f = R(u) ? c ? Er : Tr : wr, p;
	if (L(r) && (~r.indexOf("random(") && (r = jn(r)), r.charAt(1) === "=" && (p = Et(d, r) + (U(d) || 0), (p || p === 0) && (r = p))), !l || d !== r || gr) return !isNaN(d * r) && r !== "" ? (p = new Lr(this._pt, e, t, +d || 0, r - (d || 0), typeof u == "boolean" ? Ar : kr, 0, f), c && (p.fp = c), o && p.modifier(o, this, e), this._pt = p) : (!u && !(t in e) && ot(t, r), dr.call(this, e, t, d, r, f, s || De.stringFilter, c));
}, pr = function(e, t, n, r, i) {
	if (R(e) && (e = xr(e, i, t, n, r)), !ze(e) || e.style && e.nodeType || z(e) || Ue(e)) return L(e) ? xr(e, i, t, n, r) : e;
	var a = {}, o;
	for (o in e) a[o] = xr(e[o], i, t, n, r);
	return a;
}, mr = function(e, t, n, r, i, a) {
	var o, s, c, l;
	if (_t[e] && (o = new _t[e]()).init(i, o.rawVars ? t[e] : pr(t[e], r, i, a, n), n, r, a) !== !1 && (n._pt = s = new Lr(n._pt, i, e, 0, 1, o.render, o, 0, o.priority), n !== Ln)) for (c = n._ptLookup[n._targets.indexOf(i)], l = o._props.length; l--;) c[o._props[l]] = s;
	return o;
}, hr, gr, _r = function e(t, n, r) {
	var i = t.vars, a = i.ease, o = i.startAt, s = i.immediateRender, c = i.lazy, l = i.onUpdate, u = i.runBackwards, d = i.yoyoEase, f = i.keyframes, p = i.autoRevert, m = t._dur, h = t._startAt, g = t._targets, _ = t.parent, v = _ && _.data === "nested" ? _.vars.targets : g, y = t._overwrite === "auto" && !ke, b = t.timeline, x = i.easeReverse || d, S, C, w, T, E, D, O, k, A, j, M, N, ee;
	if (b && (!f || !a) && (a = "none"), t._ease = rr(a, Oe.ease), t._rEase = x && (rr(x) || t._ease), t._from = !b && !!i.runBackwards, t._from && (t.ratio = 1), !b || f && !i.stagger) {
		if (k = g[0] ? Ct(g[0]).harness : 0, N = k && i[k.prop], S = Lt(i, pt), h && (h._zTime < 0 && h.progress(1), n < 0 && u && s && !p ? h.render(-1, !0) : h.revert(u && m ? dt : ut), h._lazy = 0), o) {
			if (Ht(t._startAt = K.set(g, Nt({
				data: "isStart",
				overwrite: !1,
				parent: _,
				immediateRender: !0,
				lazy: !h && Be(c),
				startAt: null,
				delay: 0,
				onUpdate: l && function() {
					return Fn(t, "onUpdate");
				},
				stagger: 0
			}, o))), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (P || !s && !p) && t._startAt.revert(dt), s && m && n <= 0 && r <= 0) {
				n && (t._zTime = n);
				return;
			}
		} else if (u && m && !h) {
			if (n && (s = !1), w = Nt({
				overwrite: !1,
				data: "isFromStart",
				lazy: s && !h && Be(c),
				immediateRender: s,
				stagger: 0,
				parent: _
			}, S), N && (w[k.prop] = N), Ht(t._startAt = K.set(g, w)), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (P ? t._startAt.revert(dt) : t._startAt.render(-1, !0)), t._zTime = n, !s) e(t._startAt, I, I);
			else if (!n) return;
		}
		for (t._pt = t._ptCache = 0, c = m && Be(c) || c && !m, C = 0; C < g.length; C++) {
			if (E = g[C], O = E._gsap || St(g)[C]._gsap, t._ptLookup[C] = j = {}, ht[O.id] && mt.length && Ot(), M = v === g ? C : v.indexOf(E), k && (A = new k()).init(E, N || S, t, M, v) !== !1 && (t._pt = T = new Lr(t._pt, E, A.name, 0, 1, A.render, A, 0, A.priority), A._props.forEach(function(e) {
				j[e] = T;
			}), A.priority && (D = 1)), !k || N) for (w in S) _t[w] && (A = mr(w, S, t, M, E, v)) ? A.priority && (D = 1) : j[w] = T = fr.call(t, E, w, "get", S[w], M, v, 0, i.stringFilter);
			t._op && t._op[C] && t.kill(E, t._op[C]), y && t._pt && (hr = t, B.killTweensOf(E, j, t.globalTime(n)), ee = !t.parent, hr = 0), t._pt && c && (ht[O.id] = 1);
		}
		D && Ir(t), t._onInit && t._onInit(t);
	}
	t._onUpdate = l, t._initted = (!t._op || t._pt) && !ee, f && n <= 0 && b.render(Ae, !0, !0);
}, vr = function(e, t, n, r, i, a, o, s) {
	var c = (e._pt && e._ptCache || (e._ptCache = {}))[t], l, u, d, f;
	if (!c) for (c = e._ptCache[t] = [], d = e._ptLookup, f = e._targets.length; f--;) {
		if (l = d[f][t], l && l.d && l.d._pt) for (l = l.d._pt; l && l.p !== t && l.fp !== t;) l = l._next;
		if (!l) return gr = 1, e.vars[t] = "+=0", _r(e, o), gr = 0, s ? st(t + " not eligible for reset. Try splitting into individual properties") : 1;
		c.push(l);
	}
	for (f = c.length; f--;) u = c[f], l = u._pt || u, l.s = (r || r === 0) && !i ? r : l.s + (r || 0) + a * l.c, l.c = n - l.s, u.e &&= V(n) + U(u.e), u.b &&= l.s + U(u.b);
}, yr = function(e, t) {
	var n = e[0] ? Ct(e[0]).harness : 0, r = n && n.aliases, i, a, o, s;
	if (!r) return t;
	for (a in i = Ft({}, t), r) if (a in i) for (s = r[a].split(","), o = s.length; o--;) i[s[o]] = i[a];
	return i;
}, br = function(e, t, n, r) {
	var i = t.ease || r || "power1.inOut", a, o;
	if (z(t)) o = n[e] || (n[e] = []), t.forEach(function(e, n) {
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
}, xr = function(e, t, n, r, i) {
	return R(e) ? e.call(t, n, r, i) : L(e) && ~e.indexOf("random(") ? jn(e) : e;
}, Sr = xt + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert", Cr = {};
Tt(Sr + ",id,stagger,delay,duration,paused,scrollTrigger", function(e) {
	return Cr[e] = 1;
});
var K = /* @__PURE__ */ function(e) {
	Ee(t, e);
	function t(t, n, r, i) {
		var a;
		typeof n == "number" && (r.duration = n, n = r, r = null), a = e.call(this, i ? n : Rt(n)) || this;
		var o = a.vars, s = o.duration, c = o.delay, l = o.immediateRender, u = o.stagger, d = o.overwrite, f = o.keyframes, p = o.defaults, m = o.scrollTrigger, h = n.parent || B, g = (z(t) || Ue(t) ? Le(t[0]) : "length" in n) ? [t] : vn(t), _, v, y, b, x, S, C, w;
		if (a._targets = g.length ? St(g) : st("GSAP target " + t + " not found. https://gsap.com", !De.nullTargetWarn) || [], a._ptLookup = [], a._overwrite = d, f || u || He(s) || He(c)) {
			n = a.vars;
			var T = n.easeReverse || n.yoyoEase;
			if (_ = a.timeline = new ur({
				data: "nested",
				defaults: p || {},
				targets: h && h.data === "nested" ? h.vars.targets : g
			}), _.kill(), _.parent = _._dp = Te(a), _._start = 0, u || He(s) || He(c)) {
				if (b = g.length, C = u && xn(u), ze(u)) for (x in u) ~Sr.indexOf(x) && (w ||= {}, w[x] = u[x]);
				for (v = 0; v < b; v++) y = Lt(n, Cr), y.stagger = 0, T && (y.easeReverse = T), w && Ft(y, w), S = g[v], y.duration = +xr(s, Te(a), v, S, g), y.delay = (+xr(c, Te(a), v, S, g) || 0) - a._delay, !u && b === 1 && y.delay && (a._delay = c = y.delay, a._start += c, y.delay = 0), _.to(S, y, C ? C(v, S, g) : 0), _._ease = G.none;
				_.duration() ? s = c = 0 : a.timeline = 0;
			} else if (f) {
				Rt(Nt(_.vars.defaults, { ease: "none" })), _._ease = rr(f.ease || n.ease || "none");
				var E = 0, D, O, k;
				if (z(f)) f.forEach(function(e) {
					return _.to(g, e, ">");
				}), _.duration();
				else {
					for (x in y = {}, f) x === "ease" || x === "easeEach" || br(x, f[x], y, f.easeEach);
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
		return d === !0 && !ke && (hr = Te(a), B.killTweensOf(g), hr = 0), $t(h, Te(a), r), n.reversed && a.reverse(), n.paused && a.paused(!0), (l || !s && !f && a._start === H(h._time) && Be(l) && Kt(Te(a)) && h.data !== "nested") && (a._tTime = -I, a.render(Math.max(0, -c) || 0)), m && en(Te(a), m), a;
	}
	var n = t.prototype;
	return n.render = function(e, t, n) {
		var r = this._time, i = this._tDur, a = this._dur, o = e < 0, s = e > i - I && !o ? i : e < I ? 0 : e, c, l, u, d, f, p, m, h;
		if (!a) an(this, e, t, n);
		else if (s !== this._tTime || !e || n || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== o || this._lazy) {
			if (c = s, h = this.timeline, this._repeat) {
				if (d = a + this._rDelay, this._repeat < -1 && o) return this.totalTime(d * 100 + e, t, n);
				if (c = H(s % d), s === i ? (u = this._repeat, c = a) : (f = H(s / d), u = ~~f, u && u === f ? (c = a, u--) : c > a && (c = a)), p = this._yoyo && u & 1, p && (c = a - c), f = Jt(this._tTime, d), c === r && !n && this._initted && u === f) return this._tTime = s, this;
				u !== f && this.vars.repeatRefresh && !p && !this._lock && c !== d && this._initted && (this._lock = n = 1, this.render(H(d * u), !0).invalidate()._lock = 0);
			}
			if (!this._initted) {
				if (tn(this, o ? e : c, n, t, s)) return this._tTime = 0, this;
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
			if (this._from && (this.ratio = m = 1 - m), this._tTime = s, this._time = c, !this._act && this._ts && (this._act = 1, this._lazy = 0), !r && s && !t && !f && (Fn(this, "onStart"), this._tTime !== s)) return this;
			for (l = this._pt; l;) l.r(m, l.d), l = l._next;
			h && h.render(e < 0 ? e : h._dur * h._ease(c / this._dur), t, n) || this._startAt && (this._zTime = e), this._onUpdate && !t && (o && Gt(this, e, t, n), Fn(this, "onUpdate")), this._repeat && u !== f && this.vars.onRepeat && !t && this.parent && Fn(this, "onRepeat"), (s === this._tDur || !s) && this._tTime === s && (o && !this._onUpdate && Gt(this, e, !0, !0), (e || !a) && (s === this._tDur && this._ts > 0 || !s && this._ts < 0) && Ht(this, 1), !t && !(o && !r) && (s || r || p) && (Fn(this, s === i ? "onComplete" : "onReverseComplete", !0), this._prom && !(s < i && this.timeScale() > 0) && this._prom()));
		}
		return this;
	}, n.targets = function() {
		return this._targets;
	}, n.invalidate = function(t) {
		return (!t || !this.vars.runBackwards) && (this._startAt = 0), this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0, this._ptLookup = [], this.timeline && this.timeline.invalidate(t), e.prototype.invalidate.call(this, t);
	}, n.resetTo = function(e, t, n, r, i) {
		Jn || Yn.wake(), this._ts || this.play();
		var a = Math.min(this._dur, (this._dp._time - this._start) * this._ts), o;
		return this._initted || _r(this, a), o = this._ease(a / this._dur), vr(this, e, t, n, r, o, a, i) ? this.resetTo(e, t, n, r, 1) : (Zt(this, 0), this.parent || Bt(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0), this.render(0));
	}, n.kill = function(e, t) {
		if (t === void 0 && (t = "all"), !e && (!t || t === "all")) return this._lazy = this._pt = 0, this.parent ? In(this) : this.scrollTrigger && this.scrollTrigger.kill(!!P), this;
		if (this.timeline) {
			var n = this.timeline.totalDuration();
			return this.timeline.killTweensOf(e, t, hr && hr.vars.overwrite !== !0)._first || In(this), this.parent && n !== this.timeline.totalDuration() && sn(this, this._dur * this.timeline._tDur / n, 0, 1), this;
		}
		var r = this._targets, i = e ? vn(e) : r, a = this._ptLookup, o = this._pt, s, c, l, u, d, f, p;
		if ((!t || t === "all") && zt(r, i)) return t === "all" && (this._pt = 0), In(this);
		for (s = this._op = this._op || [], t !== "all" && (L(t) && (d = {}, Tt(t, function(e) {
			return d[e] = 1;
		}), t = d), t = yr(r, t)), p = r.length; p--;) if (~i.indexOf(r[p])) for (d in c = a[p], t === "all" ? (s[p] = t, u = c, l = {}) : (l = s[p] = s[p] || {}, u = t), u) f = c && c[d], f && ((!("kill" in f.d) || f.d.kill(d) === !0) && Vt(this, f, "_pt"), delete c[d]), l !== "all" && (l[d] = 1);
		return this._initted && !this._pt && o && In(this), this;
	}, t.to = function(e, n) {
		return new t(e, n, arguments[2]);
	}, t.from = function(e, t) {
		return dn(1, arguments);
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
		return dn(2, arguments);
	}, t.set = function(e, n) {
		return n.duration = 0, n.repeatDelay || (n.repeat = 0), new t(e, n);
	}, t.killTweensOf = function(e, t, n) {
		return B.killTweensOf(e, t, n);
	}, t;
}(lr);
Nt(K.prototype, {
	_targets: [],
	_lazy: 0,
	_startAt: 0,
	_op: 0,
	_onInit: 0
}), Tt("staggerTo,staggerFrom,staggerFromTo", function(e) {
	K[e] = function() {
		var t = new ur(), n = hn.call(arguments, 0);
		return n.splice(e === "staggerFromTo" ? 5 : 4, 0, 0), t[e].apply(t, n);
	};
});
var wr = function(e, t, n) {
	return e[t] = n;
}, Tr = function(e, t, n) {
	return e[t](n);
}, Er = function(e, t, n, r) {
	return e[t](r.fp, n);
}, Dr = function(e, t, n) {
	return e.setAttribute(t, n);
}, Or = function(e, t) {
	return R(e[t]) ? Tr : Re(e[t]) && e.setAttribute ? Dr : wr;
}, kr = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e6) / 1e6, t);
}, Ar = function(e, t) {
	return t.set(t.t, t.p, !!(t.s + t.c * e), t);
}, jr = function(e, t) {
	var n = t._pt, r = "";
	if (!e && t.b) r = t.b;
	else if (e === 1 && t.e) r = t.e;
	else {
		for (; n;) r = n.p + (n.m ? n.m(n.s + n.c * e) : Math.round((n.s + n.c * e) * 1e4) / 1e4) + r, n = n._next;
		r += t.c;
	}
	t.set(t.t, t.p, r, t);
}, Mr = function(e, t) {
	for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
}, Nr = function(e, t, n, r) {
	for (var i = this._pt, a; i;) a = i._next, i.p === r && i.modifier(e, t, n), i = a;
}, Pr = function(e) {
	for (var t = this._pt, n, r; t;) r = t._next, t.p === e && !t.op || t.op === e ? Vt(this, t, "_pt") : t.dep || (n = 1), t = r;
	return !n;
}, Fr = function(e, t, n, r) {
	r.mSet(e, t, r.m.call(r.tween, n, r.mt), r);
}, Ir = function(e) {
	for (var t = e._pt, n, r, i, a; t;) {
		for (n = t._next, r = i; r && r.pr > t.pr;) r = r._next;
		(t._prev = r ? r._prev : a) ? t._prev._next = t : i = t, (t._next = r) ? r._prev = t : a = t, t = n;
	}
	e._pt = i;
}, Lr = /* @__PURE__ */ function() {
	function e(e, t, n, r, i, a, o, s, c) {
		this.t = t, this.s = r, this.c = i, this.p = n, this.r = a || kr, this.d = o || this, this.set = s || wr, this.pr = c || 0, this._next = e, e && (e._prev = this);
	}
	var t = e.prototype;
	return t.modifier = function(e, t, n) {
		this.mSet = this.mSet || this.set, this.set = Fr, this.m = e, this.mt = n, this.tween = t;
	}, e;
}();
Tt(xt + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse", function(e) {
	return pt[e] = 1;
}), nt.TweenMax = nt.TweenLite = K, nt.TimelineLite = nt.TimelineMax = ur, B = new ur({
	sortChildren: !1,
	defaults: Oe,
	autoRemoveChildren: !0,
	id: "root",
	smoothChildTiming: !0
}), De.stringFilter = qn;
var Rr = [], zr = {}, Br = [], Vr = 0, Hr = 0, Ur = function(e) {
	return (zr[e] || Br).map(function(e) {
		return e();
	});
}, Wr = function() {
	var e = Date.now(), t = [];
	e - Vr > 2 && (Ur("matchMediaInit"), Rr.forEach(function(e) {
		var n = e.queries, r = e.conditions, i, a, o, s;
		for (a in n) i = $e.matchMedia(n[a]).matches, i && (o = 1), i !== r[a] && (r[a] = i, s = 1);
		s && (e.revert(), o && t.push(e));
	}), Ur("matchMediaRevert"), t.forEach(function(e) {
		return e.onMatch(e, function(t) {
			return e.add(null, t);
		});
	}), Vr = e, Ur("matchMedia"));
}, Gr = /* @__PURE__ */ function() {
	function e(e, t) {
		this.selector = t && yn(t), this.data = [], this._r = [], this.isReverted = !1, this.id = Hr++, e && this.add(e);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		R(e) && (n = t, t = e, e = R);
		var r = this, i = function() {
			var e = F, i = r.selector, a;
			return e && e !== r && e.data.push(r), n && (r.selector = yn(n)), F = r, a = t.apply(r, arguments), R(a) && r._r.push(a), F = e, r.selector = i, r.isReverted = !1, a;
		};
		return r.last = i, e === R ? i(r, function(e) {
			return r.add(null, e);
		}) : e ? r[e] = i : i;
	}, t.ignore = function(e) {
		var t = F;
		F = null, e(this), F = t;
	}, t.getTweens = function() {
		var t = [];
		return this.data.forEach(function(n) {
			return n instanceof e ? t.push.apply(t, n.getTweens()) : n instanceof K && !(n.parent && n.parent.data === "nested") && t.push(n);
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
			}), r = n.data.length; r--;) i = n.data[r], i instanceof ur ? i.data !== "nested" && (i.scrollTrigger && i.scrollTrigger.revert(), i.kill()) : !(i instanceof K) && i.revert && i.revert(e);
			n._r.forEach(function(t) {
				return t(e, n);
			}), n.isReverted = !0;
		})() : this.data.forEach(function(e) {
			return e.kill && e.kill();
		}), this.clear(), t) for (var r = Rr.length; r--;) Rr[r].id === this.id && Rr.splice(r, 1);
	}, t.revert = function(e) {
		this.kill(e || {});
	}, e;
}(), Kr = /* @__PURE__ */ function() {
	function e(e) {
		this.contexts = [], this.scope = e, F && F.data.push(this);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		ze(e) || (e = { matches: e });
		var r = new Gr(0, n || this.scope), i = r.conditions = {}, a, o, s;
		for (o in F && !r.selector && (r.selector = F.selector), this.contexts.push(r), t = r.add("onMatch", t), r.queries = e, e) o === "all" ? s = 1 : (a = $e.matchMedia(e[o]), a && (Rr.indexOf(r) < 0 && Rr.push(r), (i[o] = a.matches) && (s = 1), a.addListener ? a.addListener(Wr) : a.addEventListener("change", Wr)));
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
}(), qr = {
	registerPlugin: function() {
		[...arguments].forEach(function(e) {
			return zn(e);
		});
	},
	timeline: function(e) {
		return new ur(e);
	},
	getTweensOf: function(e, t) {
		return B.getTweensOf(e, t);
	},
	getProperty: function(e, t, n, r) {
		L(e) && (e = vn(e)[0]);
		var i = Ct(e || {}).get, a = n ? Mt : jt;
		return n === "native" && (n = ""), e && (t ? a((_t[t] && _t[t].get || i)(e, t, n, r)) : function(t, n, r) {
			return a((_t[t] && _t[t].get || i)(e, t, n, r));
		});
	},
	quickSetter: function(e, t, n) {
		if (e = vn(e), e.length > 1) {
			var r = e.map(function(e) {
				return Zr.quickSetter(e, t, n);
			}), i = r.length;
			return function(e) {
				for (var t = i; t--;) r[t](e);
			};
		}
		e = e[0] || {};
		var a = _t[t], o = Ct(e), s = o.harness && (o.harness.aliases || {})[t] || t, c = a ? function(t) {
			var r = new a();
			Ln._pt = 0, r.init(e, n ? t + n : t, Ln, 0, [e]), r.render(1, r), Ln._pt && Mr(1, Ln);
		} : o.set(e, s);
		return a ? c : function(t) {
			return c(e, s, n ? t + n : t, o, 1);
		};
	},
	quickTo: function(e, t, n) {
		var r, i = Zr.to(e, Nt((r = {}, r[t] = "+=0.1", r.paused = !0, r.stagger = 0, r), n || {})), a = function(e, n, r) {
			return i.resetTo(t, e, n, r);
		};
		return a.tween = i, a;
	},
	isTweening: function(e) {
		return B.getTweensOf(e, !0).length > 0;
	},
	defaults: function(e) {
		return e && e.ease && (e.ease = rr(e.ease, Oe.ease)), It(Oe, e || {});
	},
	config: function(e) {
		return It(De, e || {});
	},
	registerEffect: function(e) {
		var t = e.name, n = e.effect, r = e.plugins, i = e.defaults, a = e.extendTimeline;
		(r || "").split(",").forEach(function(e) {
			return e && !_t[e] && !nt[e] && st(t + " effect requires " + e + " plugin.");
		}), vt[t] = function(e, t, r) {
			return n(vn(e), Nt(t || {}, i), r);
		}, a && (ur.prototype[t] = function(e, n, r) {
			return this.add(vt[t](e, ze(n) ? n : (r = n) && {}, this), r);
		});
	},
	registerEase: function(e, t) {
		G[e] = rr(t);
	},
	parseEase: function(e, t) {
		return arguments.length ? rr(e, t) : G;
	},
	getById: function(e) {
		return B.getById(e);
	},
	exportRoot: function(e, t) {
		e === void 0 && (e = {});
		var n = new ur(e), r, i;
		for (n.smoothChildTiming = Be(e.smoothChildTiming), B.remove(n), n._dp = 0, n._time = n._tTime = B._time, r = B._first; r;) i = r._next, (t || !(!r._dur && r instanceof K && r.vars.onComplete === r._targets[0])) && $t(n, r, r._start - r._delay), r = i;
		return $t(B, n, 0), n;
	},
	context: function(e, t) {
		return e ? new Gr(e, t) : F;
	},
	matchMedia: function(e) {
		return new Kr(e);
	},
	matchMediaRefresh: function() {
		return Rr.forEach(function(e) {
			var t = e.conditions, n, r;
			for (r in t) t[r] && (t[r] = !1, n = 1);
			n && e.revert();
		}) || Wr();
	},
	addEventListener: function(e, t) {
		var n = zr[e] || (zr[e] = []);
		~n.indexOf(t) || n.push(t);
	},
	removeEventListener: function(e, t) {
		var n = zr[e], r = n && n.indexOf(t);
		r >= 0 && n.splice(r, 1);
	},
	utils: {
		wrap: kn,
		wrapYoyo: An,
		distribute: xn,
		random: wn,
		snap: Cn,
		normalize: Dn,
		getUnit: U,
		clamp: mn,
		splitColor: Hn,
		toArray: vn,
		selector: yn,
		mapRange: Mn,
		pipe: Tn,
		unitize: En,
		interpolate: Nn,
		shuffle: bn
	},
	install: at,
	effects: vt,
	ticker: Yn,
	updateRoot: ur.updateRoot,
	plugins: _t,
	globalTimeline: B,
	core: {
		PropTween: Lr,
		globals: ct,
		Tween: K,
		Timeline: ur,
		Animation: lr,
		getCache: Ct,
		_removeLinkedListItem: Vt,
		reverting: function() {
			return P;
		},
		context: function(e) {
			return e && F && (F.data.push(e), e._ctx = F), F;
		},
		suppressOverwrites: function(e) {
			return ke = e;
		}
	}
};
Tt("to,from,fromTo,delayedCall,set,killTweensOf", function(e) {
	return qr[e] = K[e];
}), Yn.add(ur.updateRoot), Ln = qr.to({}, { duration: 0 });
var Jr = function(e, t) {
	for (var n = e._pt; n && n.p !== t && n.op !== t && n.fp !== t;) n = n._next;
	return n;
}, Yr = function(e, t) {
	var n = e._targets, r, i, a;
	for (r in t) for (i = n.length; i--;) a = e._ptLookup[i][r], (a &&= a.d) && (a._pt && (a = Jr(a, r)), a && a.modifier && a.modifier(t[r], e, n[i], r));
}, Xr = function(e, t) {
	return {
		name: e,
		headless: 1,
		rawVars: 1,
		init: function(e, n, r) {
			r._onInit = function(e) {
				var r, i;
				if (L(n) && (r = {}, Tt(n, function(e) {
					return r[e] = 1;
				}), n = r), t) {
					for (i in r = {}, n) r[i] = t(n[i]);
					n = r;
				}
				Yr(e, n);
			};
		}
	};
}, Zr = qr.registerPlugin({
	name: "attr",
	init: function(e, t, n, r, i) {
		var a, o, s;
		for (a in this.tween = n, t) s = e.getAttribute(a) || "", o = this.add(e, "setAttribute", (s || 0) + "", t[a], r, i, 0, 0, a), o.op = a, o.b = s, this._props.push(a);
	},
	render: function(e, t) {
		for (var n = t._pt; n;) P ? n.set(n.t, n.p, n.b, n) : n.r(e, n.d), n = n._next;
	}
}, {
	name: "endArray",
	headless: 1,
	init: function(e, t) {
		for (var n = t.length; n--;) this.add(e, n, e[n] || 0, t[n], 0, 0, 0, 0, 0, 1);
	}
}, Xr("roundProps", Sn), Xr("modifiers"), Xr("snap", Cn)) || qr;
K.version = ur.version = Zr.version = "3.15.0", it = 1, Ve() && Xn(), G.Power0, G.Power1, G.Power2, G.Power3, G.Power4, G.Linear, G.Quad, G.Cubic, G.Quart, G.Quint, G.Strong, G.Elastic, G.Back, G.SteppedEase, G.Bounce, G.Sine, G.Expo, G.Circ;
//#endregion
//#region node_modules/gsap/CSSPlugin.js
var Qr, $r, ei, ti, ni, ri, ii, ai = function() {
	return typeof window < "u";
}, oi = {}, si = 180 / Math.PI, ci = Math.PI / 180, li = Math.atan2, ui = 1e8, di = /([A-Z])/g, fi = /(left|right|width|margin|padding|x)/i, pi = /[\s,\(]\S/, mi = {
	autoAlpha: "opacity,visibility",
	scale: "scaleX,scaleY",
	alpha: "opacity"
}, hi = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, gi = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, _i = function(e, t) {
	return t.set(t.t, t.p, e ? Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u : t.b, t);
}, vi = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : e ? Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u : t.b, t);
}, yi = function(e, t) {
	var n = t.s + t.c * e;
	t.set(t.t, t.p, ~~(n + (n < 0 ? -.5 : .5)) + t.u, t);
}, bi = function(e, t) {
	return t.set(t.t, t.p, e ? t.e : t.b, t);
}, xi = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : t.b, t);
}, Si = function(e, t, n) {
	return e.style[t] = n;
}, Ci = function(e, t, n) {
	return e.style.setProperty(t, n);
}, wi = function(e, t, n) {
	return e._gsap[t] = n;
}, Ti = function(e, t, n) {
	return e._gsap.scaleX = e._gsap.scaleY = n;
}, Ei = function(e, t, n, r, i) {
	var a = e._gsap;
	a.scaleX = a.scaleY = n, a.renderTransform(i, a);
}, Di = function(e, t, n, r, i) {
	var a = e._gsap;
	a[t] = n, a.renderTransform(i, a);
}, q = "transform", Oi = q + "Origin", ki = function e(t, n) {
	var r = this, i = this.target, a = i.style, o = i._gsap;
	if (t in oi && a) {
		if (this.tfm = this.tfm || {}, t !== "transform") t = mi[t] || t, ~t.indexOf(",") ? t.split(",").forEach(function(e) {
			return r.tfm[e] = Ji(i, e);
		}) : this.tfm[t] = o.x ? o[t] : Ji(i, t), t === Oi && (this.tfm.zOrigin = o.zOrigin);
		else return mi.transform.split(",").forEach(function(t) {
			return e.call(r, t, n);
		});
		if (this.props.indexOf(q) >= 0) return;
		o.svg && (this.svgo = i.getAttribute("data-svg-origin"), this.props.push(Oi, n, "")), t = q;
	}
	(a || n) && this.props.push(t, n, a[t]);
}, Ai = function(e) {
	e.translate && (e.removeProperty("translate"), e.removeProperty("scale"), e.removeProperty("rotate"));
}, ji = function() {
	var e = this.props, t = this.target, n = t.style, r = t._gsap, i, a;
	for (i = 0; i < e.length; i += 3) e[i + 1] ? e[i + 1] === 2 ? t[e[i]](e[i + 2]) : t[e[i]] = e[i + 2] : e[i + 2] ? n[e[i]] = e[i + 2] : n.removeProperty(e[i].substr(0, 2) === "--" ? e[i] : e[i].replace(di, "-$1").toLowerCase());
	if (this.tfm) {
		for (a in this.tfm) r[a] = this.tfm[a];
		r.svg && (r.renderTransform(), t.setAttribute("data-svg-origin", this.svgo || "")), i = ii(), (!i || !i.isStart) && !n[q] && (Ai(n), r.zOrigin && n[Oi] && (n[Oi] += " " + r.zOrigin + "px", r.zOrigin = 0, r.renderTransform()), r.uncache = 1);
	}
}, Mi = function(e, t) {
	var n = {
		target: e,
		props: [],
		revert: ji,
		save: ki
	};
	return e._gsap || Zr.core.getCache(e), t && e.style && e.nodeType && t.split(",").forEach(function(e) {
		return n.save(e);
	}), n;
}, Ni, Pi = function(e, t) {
	var n = $r.createElementNS ? $r.createElementNS((t || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), e) : $r.createElement(e);
	return n && n.style ? n : $r.createElement(e);
}, Fi = function e(t, n, r) {
	var i = getComputedStyle(t);
	return i[n] || i.getPropertyValue(n.replace(di, "-$1").toLowerCase()) || i.getPropertyValue(n) || !r && e(t, Li(n) || n, 1) || "";
}, Ii = "O,Moz,ms,Ms,Webkit".split(","), Li = function(e, t, n) {
	var r = (t || ni).style, i = 5;
	if (e in r && !n) return e;
	for (e = e.charAt(0).toUpperCase() + e.substr(1); i-- && !(Ii[i] + e in r););
	return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? Ii[i] : "") + e;
}, Ri = function() {
	ai() && window.document && (Qr = window, $r = Qr.document, ei = $r.documentElement, ni = Pi("div") || { style: {} }, Pi("div"), q = Li(q), Oi = q + "Origin", ni.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0", Ni = !!Li("perspective"), ii = Zr.core.reverting, ti = 1);
}, zi = function(e) {
	var t = e.ownerSVGElement, n = Pi("svg", t && t.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), r = e.cloneNode(!0), i;
	r.style.display = "block", n.appendChild(r), ei.appendChild(n);
	try {
		i = r.getBBox();
	} catch {}
	return n.removeChild(r), ei.removeChild(n), i;
}, Bi = function(e, t) {
	for (var n = t.length; n--;) if (e.hasAttribute(t[n])) return e.getAttribute(t[n]);
}, Vi = function(e) {
	var t, n;
	try {
		t = e.getBBox();
	} catch {
		t = zi(e), n = 1;
	}
	return t && (t.width || t.height) || n || (t = zi(e)), t && !t.width && !t.x && !t.y ? {
		x: +Bi(e, [
			"x",
			"cx",
			"x1"
		]) || 0,
		y: +Bi(e, [
			"y",
			"cy",
			"y1"
		]) || 0,
		width: 0,
		height: 0
	} : t;
}, Hi = function(e) {
	return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && Vi(e));
}, Ui = function(e, t) {
	if (t) {
		var n = e.style, r;
		t in oi && t !== Oi && (t = q), n.removeProperty ? (r = t.substr(0, 2), (r === "ms" || t.substr(0, 6) === "webkit") && (t = "-" + t), n.removeProperty(r === "--" ? t : t.replace(di, "-$1").toLowerCase())) : n.removeAttribute(t);
	}
}, Wi = function(e, t, n, r, i, a) {
	var o = new Lr(e._pt, t, n, 0, 1, a ? xi : bi);
	return e._pt = o, o.b = r, o.e = i, e._props.push(n), o;
}, Gi = {
	deg: 1,
	rad: 1,
	turn: 1
}, Ki = {
	grid: 1,
	flex: 1
}, qi = function e(t, n, r, i) {
	var a = parseFloat(r) || 0, o = (r + "").trim().substr((a + "").length) || "px", s = ni.style, c = fi.test(n), l = t.tagName.toLowerCase() === "svg", u = (l ? "client" : "offset") + (c ? "Width" : "Height"), d = 100, f = i === "px", p = i === "%", m, h, g, _;
	if (i === o || !a || Gi[i] || Gi[o]) return a;
	if (o !== "px" && !f && (a = e(t, n, r, "px")), _ = t.getCTM && Hi(t), (p || o === "%") && (oi[n] || ~n.indexOf("adius"))) return m = _ ? t.getBBox()[c ? "width" : "height"] : t[u], V(p ? a / m * d : a / 100 * m);
	if (s[c ? "width" : "height"] = d + (f ? o : i), h = i !== "rem" && ~n.indexOf("adius") || i === "em" && t.appendChild && !l ? t : t.parentNode, _ && (h = (t.ownerSVGElement || {}).parentNode), (!h || h === $r || !h.appendChild) && (h = $r.body), g = h._gsap, g && p && g.width && c && g.time === Yn.time && !g.uncache) return V(a / g.width * d);
	if (p && (n === "height" || n === "width")) {
		var v = t.style[n];
		t.style[n] = d + i, m = t[u], v ? t.style[n] = v : Ui(t, n);
	} else (p || o === "%") && !Ki[Fi(h, "display")] && (s.position = Fi(t, "position")), h === t && (s.position = "static"), h.appendChild(ni), m = ni[u], h.removeChild(ni), s.position = "absolute";
	return c && p && (g = Ct(h), g.time = Yn.time, g.width = h[u]), V(f ? m * a / d : m && a ? d / m * a : 0);
}, Ji = function(e, t, n, r) {
	var i;
	return ti || Ri(), t in mi && t !== "transform" && (t = mi[t], ~t.indexOf(",") && (t = t.split(",")[0])), oi[t] && t !== "transform" ? (i = oa(e, r), i = t === "transformOrigin" ? i.svg ? i.origin : sa(Fi(e, Oi)) + " " + i.zOrigin + "px" : i[t]) : (i = e.style[t], (!i || i === "auto" || r || ~(i + "").indexOf("calc(")) && (i = $i[t] && $i[t](e, t, n) || Fi(e, t) || wt(e, t) || +(t === "opacity"))), n && !~(i + "").trim().indexOf(" ") ? qi(e, t, i, n) + n : i;
}, Yi = function(e, t, n, r) {
	if (!n || n === "none") {
		var i = Li(t, e, 1), a = i && Fi(e, i, 1);
		a && a !== n ? (t = i, n = a) : t === "borderColor" && (n = Fi(e, "borderTopColor"));
	}
	var o = new Lr(this._pt, e.style, t, 0, 1, jr), s = 0, c = 0, l, u, d, f, p, m, h, g, _, v, y, b;
	if (o.b = n, o.e = r, n += "", r += "", r.substring(0, 6) === "var(--" && (r = Fi(e, r.substring(4, r.indexOf(")")))), r === "auto" && (m = e.style[t], e.style[t] = r, r = Fi(e, t) || r, m ? e.style[t] = m : Ui(e, t)), l = [n, r], qn(l), n = l[0], r = l[1], d = n.match(Je) || [], b = r.match(Je) || [], b.length) {
		for (; u = Je.exec(r);) h = u[0], _ = r.substring(s, u.index), p ? p = (p + 1) % 5 : (_.substr(-5) === "rgba(" || _.substr(-5) === "hsla(") && (p = 1), h !== (m = d[c++] || "") && (f = parseFloat(m) || 0, y = m.substr((f + "").length), h.charAt(1) === "=" && (h = Et(f, h) + y), g = parseFloat(h), v = h.substr((g + "").length), s = Je.lastIndex - v.length, v || (v = v || De.units[t] || y, s === r.length && (r += v, o.e += v)), y !== v && (f = qi(e, t, m, v) || 0), o._pt = {
			_next: o._pt,
			p: _ || c === 1 ? _ : ",",
			s: f,
			c: g - f,
			m: p && p < 4 || t === "zIndex" ? Math.round : 0
		});
		o.c = s < r.length ? r.substring(s, r.length) : "";
	} else o.r = t === "display" && r === "none" ? xi : bi;
	return Xe.test(r) && (o.e = 0), this._pt = o, o;
}, Xi = {
	top: "0%",
	bottom: "100%",
	left: "0%",
	right: "100%",
	center: "50%"
}, Zi = function(e) {
	var t = e.split(" "), n = t[0], r = t[1] || "50%";
	return (n === "top" || n === "bottom" || r === "left" || r === "right") && (e = n, n = r, r = e), t[0] = Xi[n] || n, t[1] = Xi[r] || r, t.join(" ");
}, Qi = function(e, t) {
	if (t.tween && t.tween._time === t.tween._dur) {
		var n = t.t, r = n.style, i = t.u, a = n._gsap, o, s, c;
		if (i === "all" || i === !0) r.cssText = "", s = 1;
		else for (i = i.split(","), c = i.length; --c > -1;) o = i[c], oi[o] && (s = 1, o = o === "transformOrigin" ? Oi : q), Ui(n, o);
		s && (Ui(n, q), a && (a.svg && n.removeAttribute("transform"), r.scale = r.rotate = r.translate = "none", oa(n, 1), a.uncache = 1, Ai(r)));
	}
}, $i = { clearProps: function(e, t, n, r, i) {
	if (i.data !== "isFromStart") {
		var a = e._pt = new Lr(e._pt, t, n, 0, 0, Qi);
		return a.u = r, a.pr = -10, a.tween = i, e._props.push(n), 1;
	}
} }, ea = [
	1,
	0,
	0,
	1,
	0,
	0
], ta = {}, na = function(e) {
	return e === "matrix(1, 0, 0, 1, 0, 0)" || e === "none" || !e;
}, ra = function(e) {
	var t = Fi(e, q);
	return na(t) ? ea : t.substr(7).match(qe).map(V);
}, ia = function(e, t) {
	var n = e._gsap || Ct(e), r = e.style, i = ra(e), a, o, s, c;
	return n.svg && e.getAttribute("transform") ? (s = e.transform.baseVal.consolidate().matrix, i = [
		s.a,
		s.b,
		s.c,
		s.d,
		s.e,
		s.f
	], i.join(",") === "1,0,0,1,0,0" ? ea : i) : (i === ea && !e.offsetParent && e !== ei && !n.svg && (s = r.display, r.display = "block", a = e.parentNode, (!a || !e.offsetParent && !e.getBoundingClientRect().width) && (c = 1, o = e.nextElementSibling, ei.appendChild(e)), i = ra(e), s ? r.display = s : Ui(e, "display"), c && (o ? a.insertBefore(e, o) : a ? a.appendChild(e) : ei.removeChild(e))), t && i.length > 6 ? [
		i[0],
		i[1],
		i[4],
		i[5],
		i[12],
		i[13]
	] : i);
}, aa = function(e, t, n, r, i, a) {
	var o = e._gsap, s = i || ia(e, !0), c = o.xOrigin || 0, l = o.yOrigin || 0, u = o.xOffset || 0, d = o.yOffset || 0, f = s[0], p = s[1], m = s[2], h = s[3], g = s[4], _ = s[5], v = t.split(" "), y = parseFloat(v[0]) || 0, b = parseFloat(v[1]) || 0, x, S, C, w;
	n ? s !== ea && (S = f * h - p * m) && (C = h / S * y + b * (-m / S) + (m * _ - h * g) / S, w = y * (-p / S) + f / S * b - (f * _ - p * g) / S, y = C, b = w) : (x = Vi(e), y = x.x + (~v[0].indexOf("%") ? y / 100 * x.width : y), b = x.y + (~(v[1] || v[0]).indexOf("%") ? b / 100 * x.height : b)), r || r !== !1 && o.smooth ? (g = y - c, _ = b - l, o.xOffset = u + (g * f + _ * m) - g, o.yOffset = d + (g * p + _ * h) - _) : o.xOffset = o.yOffset = 0, o.xOrigin = y, o.yOrigin = b, o.smooth = !!r, o.origin = t, o.originIsAbsolute = !!n, e.style[Oi] = "0px 0px", a && (Wi(a, o, "xOrigin", c, y), Wi(a, o, "yOrigin", l, b), Wi(a, o, "xOffset", u, o.xOffset), Wi(a, o, "yOffset", d, o.yOffset)), e.setAttribute("data-svg-origin", y + " " + b);
}, oa = function(e, t) {
	var n = e._gsap || new cr(e);
	if ("x" in n && !t && !n.uncache) return n;
	var r = e.style, i = n.scaleX < 0, a = "px", o = "deg", s = getComputedStyle(e), c = Fi(e, Oi) || "0", l = u = d = m = h = g = _ = v = y = 0, u, d, f = p = 1, p, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, A, j, M, N, ee, te, ne, re, ie, ae, oe;
	return n.svg = !!(e.getCTM && Hi(e)), s.translate && ((s.translate !== "none" || s.scale !== "none" || s.rotate !== "none") && (r[q] = (s.translate === "none" ? "" : "translate3d(" + (s.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") ") + (s.rotate === "none" ? "" : "rotate(" + s.rotate + ") ") + (s.scale === "none" ? "" : "scale(" + s.scale.split(" ").join(",") + ") ") + (s[q] === "none" ? "" : s[q])), r.scale = r.rotate = r.translate = "none"), S = ia(e, n.svg), n.svg && (n.uncache ? (N = e.getBBox(), c = n.xOrigin - N.x + "px " + (n.yOrigin - N.y) + "px", M = "") : M = !t && e.getAttribute("data-svg-origin"), aa(e, M || c, !!M || n.originIsAbsolute, n.smooth !== !1, S)), b = n.xOrigin || 0, x = n.yOrigin || 0, S !== ea && (E = S[0], D = S[1], O = S[2], k = S[3], l = A = S[4], u = j = S[5], S.length === 6 ? (f = Math.sqrt(E * E + D * D), p = Math.sqrt(k * k + O * O), m = E || D ? li(D, E) * si : 0, _ = O || k ? li(O, k) * si + m : 0, _ && (p *= Math.abs(Math.cos(_ * ci))), n.svg && (l -= b - (b * E + x * O), u -= x - (b * D + x * k))) : (oe = S[6], ie = S[7], te = S[8], ne = S[9], re = S[10], ae = S[11], l = S[12], u = S[13], d = S[14], C = li(oe, re), h = C * si, C && (w = Math.cos(-C), T = Math.sin(-C), M = A * w + te * T, N = j * w + ne * T, ee = oe * w + re * T, te = A * -T + te * w, ne = j * -T + ne * w, re = oe * -T + re * w, ae = ie * -T + ae * w, A = M, j = N, oe = ee), C = li(-O, re), g = C * si, C && (w = Math.cos(-C), T = Math.sin(-C), M = E * w - te * T, N = D * w - ne * T, ee = O * w - re * T, ae = k * T + ae * w, E = M, D = N, O = ee), C = li(D, E), m = C * si, C && (w = Math.cos(C), T = Math.sin(C), M = E * w + D * T, N = A * w + j * T, D = D * w - E * T, j = j * w - A * T, E = M, A = N), h && Math.abs(h) + Math.abs(m) > 359.9 && (h = m = 0, g = 180 - g), f = V(Math.sqrt(E * E + D * D + O * O)), p = V(Math.sqrt(j * j + oe * oe)), C = li(A, j), _ = Math.abs(C) > 2e-4 ? C * si : 0, y = ae ? 1 / (ae < 0 ? -ae : ae) : 0), n.svg && (M = e.getAttribute("transform"), n.forceCSS = e.setAttribute("transform", "") || !na(Fi(e, q)), M && e.setAttribute("transform", M))), Math.abs(_) > 90 && Math.abs(_) < 270 && (i ? (f *= -1, _ += m <= 0 ? 180 : -180, m += m <= 0 ? 180 : -180) : (p *= -1, _ += _ <= 0 ? 180 : -180)), t ||= n.uncache, n.x = l - ((n.xPercent = l && (!t && n.xPercent || (Math.round(e.offsetWidth / 2) === Math.round(-l) ? -50 : 0))) ? e.offsetWidth * n.xPercent / 100 : 0) + a, n.y = u - ((n.yPercent = u && (!t && n.yPercent || (Math.round(e.offsetHeight / 2) === Math.round(-u) ? -50 : 0))) ? e.offsetHeight * n.yPercent / 100 : 0) + a, n.z = d + a, n.scaleX = V(f), n.scaleY = V(p), n.rotation = V(m) + o, n.rotationX = V(h) + o, n.rotationY = V(g) + o, n.skewX = _ + o, n.skewY = v + o, n.transformPerspective = y + a, (n.zOrigin = parseFloat(c.split(" ")[2]) || !t && n.zOrigin || 0) && (r[Oi] = sa(c)), n.xOffset = n.yOffset = 0, n.force3D = De.force3D, n.renderTransform = n.svg ? ma : Ni ? pa : la, n.uncache = 0, n;
}, sa = function(e) {
	return (e = e.split(" "))[0] + " " + e[1];
}, ca = function(e, t, n) {
	var r = U(t);
	return V(parseFloat(t) + parseFloat(qi(e, "x", n + "px", r))) + r;
}, la = function(e, t) {
	t.z = "0px", t.rotationY = t.rotationX = "0deg", t.force3D = 0, pa(e, t);
}, ua = "0deg", da = "0px", fa = ") ", pa = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.z, c = n.rotation, l = n.rotationY, u = n.rotationX, d = n.skewX, f = n.skewY, p = n.scaleX, m = n.scaleY, h = n.transformPerspective, g = n.force3D, _ = n.target, v = n.zOrigin, y = "", b = g === "auto" && e && e !== 1 || g === !0;
	if (v && (u !== ua || l !== ua)) {
		var x = parseFloat(l) * ci, S = Math.sin(x), C = Math.cos(x), w;
		x = parseFloat(u) * ci, w = Math.cos(x), a = ca(_, a, S * w * -v), o = ca(_, o, -Math.sin(x) * -v), s = ca(_, s, C * w * -v + v);
	}
	h !== da && (y += "perspective(" + h + fa), (r || i) && (y += "translate(" + r + "%, " + i + "%) "), (b || a !== da || o !== da || s !== da) && (y += s !== da || b ? "translate3d(" + a + ", " + o + ", " + s + ") " : "translate(" + a + ", " + o + fa), c !== ua && (y += "rotate(" + c + fa), l !== ua && (y += "rotateY(" + l + fa), u !== ua && (y += "rotateX(" + u + fa), (d !== ua || f !== ua) && (y += "skew(" + d + ", " + f + fa), (p !== 1 || m !== 1) && (y += "scale(" + p + ", " + m + fa), _.style[q] = y || "translate(0, 0)";
}, ma = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.rotation, c = n.skewX, l = n.skewY, u = n.scaleX, d = n.scaleY, f = n.target, p = n.xOrigin, m = n.yOrigin, h = n.xOffset, g = n.yOffset, _ = n.forceCSS, v = parseFloat(a), y = parseFloat(o), b, x, S, C, w;
	s = parseFloat(s), c = parseFloat(c), l = parseFloat(l), l && (l = parseFloat(l), c += l, s += l), s || c ? (s *= ci, c *= ci, b = Math.cos(s) * u, x = Math.sin(s) * u, S = Math.sin(s - c) * -d, C = Math.cos(s - c) * d, c && (l *= ci, w = Math.tan(c - l), w = Math.sqrt(1 + w * w), S *= w, C *= w, l && (w = Math.tan(l), w = Math.sqrt(1 + w * w), b *= w, x *= w)), b = V(b), x = V(x), S = V(S), C = V(C)) : (b = u, C = d, x = S = 0), (v && !~(a + "").indexOf("px") || y && !~(o + "").indexOf("px")) && (v = qi(f, "x", a, "px"), y = qi(f, "y", o, "px")), (p || m || h || g) && (v = V(v + p - (p * b + m * S) + h), y = V(y + m - (p * x + m * C) + g)), (r || i) && (w = f.getBBox(), v = V(v + r / 100 * w.width), y = V(y + i / 100 * w.height)), w = "matrix(" + b + "," + x + "," + S + "," + C + "," + v + "," + y + ")", f.setAttribute("transform", w), _ && (f.style[q] = w);
}, ha = function(e, t, n, r, i) {
	var a = 360, o = L(i), s = parseFloat(i) * (o && ~i.indexOf("rad") ? si : 1) - r, c = r + s + "deg", l, u;
	return o && (l = i.split("_")[1], l === "short" && (s %= a, s !== s % (a / 2) && (s += s < 0 ? a : -a)), l === "cw" && s < 0 ? s = (s + a * ui) % a - ~~(s / a) * a : l === "ccw" && s > 0 && (s = (s - a * ui) % a - ~~(s / a) * a)), e._pt = u = new Lr(e._pt, t, n, r, s, gi), u.e = c, u.u = "deg", e._props.push(n), u;
}, ga = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, _a = function(e, t, n) {
	var r = ga({}, n._gsap), i = "perspective,force3D,transformOrigin,svgOrigin", a = n.style, o, s, c, l, u, d, f, p;
	for (s in r.svg ? (c = n.getAttribute("transform"), n.setAttribute("transform", ""), a[q] = t, o = oa(n, 1), Ui(n, q), n.setAttribute("transform", c)) : (c = getComputedStyle(n)[q], a[q] = t, o = oa(n, 1), a[q] = c), oi) c = r[s], l = o[s], c !== l && i.indexOf(s) < 0 && (f = U(c), p = U(l), u = f === p ? parseFloat(c) : qi(n, s, c, p), d = parseFloat(l), e._pt = new Lr(e._pt, o, s, u, d - u, hi), e._pt.u = p || 0, e._props.push(s));
	ga(o, r);
};
Tt("padding,margin,Width,Radius", function(e, t) {
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
	$i[t > 1 ? "border" + e : e] = function(e, t, n, r, i) {
		var a, s;
		if (arguments.length < 4) return a = o.map(function(t) {
			return Ji(e, t, n);
		}), s = a.join(" "), s.split(a[0]).length === 5 ? a[0] : s;
		a = (r + "").split(" "), s = {}, o.forEach(function(e, t) {
			return s[e] = a[t] = a[t] || a[(t - 1) / 2 | 0];
		}), e.init(t, s, i);
	};
});
var va = {
	name: "css",
	register: Ri,
	targetTest: function(e) {
		return e.style && e.nodeType;
	},
	init: function(e, t, n, r, i) {
		var a = this._props, o = e.style, s = n.vars.startAt, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w;
		for (m in ti || Ri(), this.styles = this.styles || Mi(e), C = this.styles.props, this.tween = n, t) if (m !== "autoRound" && (l = t[m], !(_t[m] && mr(m, t, n, r, e, i)))) {
			if (f = typeof l, p = $i[m], f === "function" && (l = l.call(n, r, e, i), f = typeof l), f === "string" && ~l.indexOf("random(") && (l = jn(l)), p) p(this, e, m, l, n) && (S = 1);
			else if (m.substr(0, 2) === "--") c = (getComputedStyle(e).getPropertyValue(m) + "").trim(), l += "", Gn.lastIndex = 0, Gn.test(c) || (h = U(c), g = U(l), g ? h !== g && (c = qi(e, m, c, g) + g) : h && (l += h)), this.add(o, "setProperty", c, l, r, i, 0, 0, m), a.push(m), C.push(m, 0, o[m]);
			else if (f !== "undefined") {
				if (s && m in s ? (c = typeof s[m] == "function" ? s[m].call(n, r, e, i) : s[m], L(c) && ~c.indexOf("random(") && (c = jn(c)), U(c + "") || c === "auto" || (c += De.units[m] || U(Ji(e, m)) || ""), (c + "").charAt(1) === "=" && (c = Ji(e, m))) : c = Ji(e, m), d = parseFloat(c), _ = f === "string" && l.charAt(1) === "=" && l.substr(0, 2), _ && (l = l.substr(2)), u = parseFloat(l), m in mi && (m === "autoAlpha" && (d === 1 && Ji(e, "visibility") === "hidden" && u && (d = 0), C.push("visibility", 0, o.visibility), Wi(this, o, "visibility", d ? "inherit" : "hidden", u ? "inherit" : "hidden", !u)), m !== "scale" && m !== "transform" && (m = mi[m], ~m.indexOf(",") && (m = m.split(",")[0]))), v = m in oi, v) {
					if (this.styles.save(m), w = l, f === "string" && l.substring(0, 6) === "var(--") {
						if (l = Fi(e, l.substring(4, l.indexOf(")"))), l.substring(0, 5) === "calc(") {
							var T = e.style.perspective;
							e.style.perspective = l, l = Fi(e, "perspective"), T ? e.style.perspective = T : Ui(e, "perspective");
						}
						u = parseFloat(l);
					}
					if (y || (b = e._gsap, b.renderTransform && !t.parseTransform || oa(e, t.parseTransform), x = t.smoothOrigin !== !1 && b.smooth, y = this._pt = new Lr(this._pt, o, q, 0, 1, b.renderTransform, b, 0, -1), y.dep = 1), m === "scale") this._pt = new Lr(this._pt, b, "scaleY", b.scaleY, (_ ? Et(b.scaleY, _ + u) : u) - b.scaleY || 0, hi), this._pt.u = 0, a.push("scaleY", m), m += "X";
					else if (m === "transformOrigin") {
						C.push(Oi, 0, o[Oi]), l = Zi(l), b.svg ? aa(e, l, 0, x, 0, this) : (g = parseFloat(l.split(" ")[2]) || 0, g !== b.zOrigin && Wi(this, b, "zOrigin", b.zOrigin, g), Wi(this, o, m, sa(c), sa(l)));
						continue;
					} else if (m === "svgOrigin") {
						aa(e, l, 1, x, 0, this);
						continue;
					} else if (m in ta) {
						ha(this, b, m, d, _ ? Et(d, _ + l) : l);
						continue;
					} else if (m === "smoothOrigin") {
						Wi(this, b, "smooth", b.smooth, l);
						continue;
					} else if (m === "force3D") {
						b[m] = l;
						continue;
					} else if (m === "transform") {
						_a(this, l, e);
						continue;
					}
				} else m in o || (m = Li(m) || m);
				if (v || (u || u === 0) && (d || d === 0) && !pi.test(l) && m in o) h = (c + "").substr((d + "").length), u ||= 0, g = U(l) || (m in De.units ? De.units[m] : h), h !== g && (d = qi(e, m, c, g)), this._pt = new Lr(this._pt, v ? b : o, m, d, (_ ? Et(d, _ + u) : u) - d, !v && (g === "px" || m === "zIndex") && t.autoRound !== !1 ? yi : hi), this._pt.u = g || 0, v && w !== l ? (this._pt.b = c, this._pt.e = w, this._pt.r = vi) : h !== g && g !== "%" && (this._pt.b = c, this._pt.r = _i);
				else if (m in o) Yi.call(this, e, m, c, _ ? _ + l : l);
				else if (m in e) this.add(e, m, c || e[m], _ ? _ + l : l, r, i);
				else if (m !== "parseTransform") {
					ot(m, l);
					continue;
				}
				v || (m in o ? C.push(m, 0, o[m]) : typeof e[m] == "function" ? C.push(m, 2, e[m]()) : C.push(m, 1, c || e[m])), a.push(m);
			}
		}
		S && Ir(this);
	},
	render: function(e, t) {
		if (t.tween._time || !ii()) for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
		else t.styles.revert();
	},
	get: Ji,
	aliases: mi,
	getSetter: function(e, t, n) {
		var r = mi[t];
		return r && r.indexOf(",") < 0 && (t = r), t in oi && t !== Oi && (e._gsap.x || Ji(e, "x")) ? n && ri === n ? t === "scale" ? Ti : wi : (ri = n || {}) && (t === "scale" ? Ei : Di) : e.style && !Re(e.style[t]) ? Si : ~t.indexOf("-") ? Ci : Or(e, t);
	},
	core: {
		_removeProperty: Ui,
		_getMatrix: ia
	}
};
Zr.utils.checkPrefix = Li, Zr.core.getStyleSaver = Mi, (function(e, t, n, r) {
	var i = Tt(e + "," + t + "," + n, function(e) {
		oi[e] = 1;
	});
	Tt(t, function(e) {
		De.units[e] = "deg", ta[e] = 1;
	}), mi[i[13]] = e + "," + t, Tt(r, function(e) {
		var t = e.split(":");
		mi[t[1]] = i[t[0]];
	});
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY"), Tt("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(e) {
	De.units[e] = "px";
}), Zr.registerPlugin(va);
//#endregion
//#region node_modules/gsap/index.js
var ya = Zr.registerPlugin(va) || Zr;
ya.core.Tween;
//#endregion
//#region src/render/colorTransform.ts
var ba = "http://www.w3.org/2000/svg", xa = "mmtour-color-transform-filters";
function Sa(e, t) {
	let n = t?.rm ?? 1, r = t?.gm ?? 1, i = t?.bm ?? 1, a = t?.am ?? 1, o = t?.ra ?? 0, s = t?.ga ?? 0, c = t?.ba ?? 0, l = t?.aa ?? 0;
	if (n === 1 && r === 1 && i === 1 && a === 1 && o === 0 && s === 0 && c === 0 && l === 0) {
		e.style.removeProperty("filter");
		return;
	}
	e.style.filter = `url(#${Ca(n, r, i, a, o, s, c, l)})`;
}
function Ca(e, t, n, r, i, a, o, s) {
	let c = Ta(e, t, n, r, i, a, o, s);
	if (document.getElementById(c)) return c;
	let l = document.getElementById(xa);
	l || (l = document.createElementNS(ba, "svg"), l.id = xa, l.setAttribute("width", "0"), l.setAttribute("height", "0"), l.setAttribute("aria-hidden", "true"), l.style.position = "absolute", l.style.width = "0", l.style.height = "0", l.style.overflow = "hidden", document.body.append(l));
	let u = document.createElementNS(ba, "filter");
	u.id = c, u.setAttribute("color-interpolation-filters", "sRGB");
	let d = document.createElementNS(ba, "feComponentTransfer");
	return d.append(wa("feFuncR", e, i), wa("feFuncG", t, a), wa("feFuncB", n, o), wa("feFuncA", r, s)), u.append(d), l.append(u), c;
}
function wa(e, t, n) {
	let r = document.createElementNS(ba, e);
	return r.setAttribute("type", "linear"), r.setAttribute("slope", String(t)), r.setAttribute("intercept", String(n)), r;
}
function Ta(...e) {
	return `mmtour-ct-${e.map((e) => String(Math.round(e * 1e5)).replace("-", "n")).join("-")}`;
}
//#endregion
//#region src/render/DomRenderer.ts
var Ea = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", Da = 2, Oa = /* @__PURE__ */ new Map(), ka = /* @__PURE__ */ new Set(), Aa = {
	a: 1,
	b: 0,
	c: 0,
	d: 1,
	tx: 0,
	ty: 0
};
function ja(e, t) {
	return {
		a: e.a * t.a + e.c * t.b,
		b: e.b * t.a + e.d * t.b,
		c: e.a * t.c + e.c * t.d,
		d: e.b * t.c + e.d * t.d,
		tx: e.a * t.tx + e.c * t.ty + e.tx,
		ty: e.b * t.tx + e.d * t.ty + e.ty
	};
}
function Ma(e) {
	if (Oa.has(e)) return Oa.get(e);
	ka.has(e) || (ka.add(e), fetch(me(e)).then((e) => e.ok ? e.text() : "").then((t) => {
		let n = t.replace(/<\?xml[^>]*\?>/i, "").replace(/<svg[^>]*>/i, "").replace(/<\/svg>\s*$/i, ""), r = n.match(/<g\s+transform="matrix\(([^)]+)\)"\s*>([\s\S]*)<\/g>\s*$/i), i = Aa, a = n;
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
		a = a.replace(/fill="[^"]*"/g, "fill=\"#ffffff\"").replace(/stroke="[^"]*"/g, "stroke=\"none\""), Oa.set(e, {
			gMatrix: i,
			body: a
		});
	}).catch(() => Oa.set(e, null)));
}
function Na(e, t = "", n, r, i) {
	if (e.maskGroup) return `<g${t}>${Fa(e.maskGroup, r, n, i)}</g>`;
	if (e.text) return Pa(e, t, i);
	let a = e.matrix, o = me(e.src), s = e.colorTransform ? ` filter="url(#${La(e.colorTransform)})"` : "";
	return `<image href="${o}" xlink:href="${o}" x="${-e.origin.x}" y="${-e.origin.y}" width="${e.origin.width}" height="${e.origin.height}" transform="matrix(${a.a},${a.b},${a.c},${a.d},${a.tx},${a.ty})"${s}${t}/>`;
}
function Pa(e, t = "", n) {
	let r = e.text, i = e.matrix, a = r.x ?? e.origin.x, o = r.y ?? e.origin.y, s = Math.max(1, r.width ?? e.origin.width), c = Math.max(1, r.height ?? e.origin.height), l = `${r.lineHeight ?? r.fontHeight + (r.leading ?? 0)}px`, u = r.wordWrap ? "pre-wrap" : "pre", d = r.align ?? "left", f = r.staticLines?.length ? Ja(r, s) : "", p = r.html ? Ua(Wa(r.text ?? "")) : to(Wa(r.text ?? "")), m = [
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
function Fa(e, t, n, r) {
	let i = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${n.width}" height="${n.height}" style="position:absolute;left:0;top:0;overflow:visible">`, a = Ia(e.items), o = Ma(e.mask.src);
	if (!o) return `${i}${a ? `<defs>${a}</defs>` : ""}${e.items.map((e, i) => Na(e, "", n, `${t}_${e.key ?? i}`, r)).join("")}</svg>`;
	let s = e.mask.matrix, c = e.mask.origin, l = ja(ja(s, {
		a: 1,
		b: 0,
		c: 0,
		d: 1,
		tx: -c.x,
		ty: -c.y
	}), o.gMatrix), u = `c${t.replace(/\W/g, "_")}`, d = `matrix(${l.a},${l.b},${l.c},${l.d},${l.tx},${l.ty})`;
	return `${i}<defs>${a}<clipPath id="${u}" clipPathUnits="userSpaceOnUse">${o.body.replace(/<(path|polygon|rect|ellipse|circle)\b/g, `<$1 transform="${d}"`)}</clipPath></defs><g clip-path="url(#${u})">${e.items.map((e, i) => Na(e, e.opacity === 1 ? "" : ` opacity="${e.opacity}"`, n, `${t}_${e.key ?? i}`, r)).join("")}</g></svg>`;
}
function Ia(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) n.colorTransform && t.set(La(n.colorTransform), n.colorTransform);
	return [...t.entries()].map(([e, t]) => {
		let n = t.rm ?? 1, r = t.gm ?? 1, i = t.bm ?? 1;
		return `<filter id="${e}" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="${n}" intercept="${t.ra ?? 0}"/><feFuncG type="linear" slope="${r}" intercept="${t.ga ?? 0}"/><feFuncB type="linear" slope="${i}" intercept="${t.ba ?? 0}"/></feComponentTransfer></filter>`;
	}).join("");
}
function La(e) {
	return `mc${[
		e.rm ?? 1,
		e.gm ?? 1,
		e.bm ?? 1,
		e.ra ?? 0,
		e.ga ?? 0,
		e.ba ?? 0
	].map((e) => String(Math.round(e * 1e5)).replace("-", "n")).join("_")}`;
}
var Ra = class {
	layer;
	options;
	nodes = /* @__PURE__ */ new Map();
	hoveredButtonKeys = /* @__PURE__ */ new Set();
	pointerX = -1;
	pointerY = -1;
	pointerTracking = !1;
	hoverDepth = 0;
	currentHover = null;
	constructor(e, t = {}) {
		this.layer = e, this.options = t, t.onButtonEvent && this.ensurePointerTracking();
	}
	trackPointer = (e) => {
		this.pointerX = e.clientX, this.pointerY = e.clientY, this.updateHover();
	};
	ensurePointerTracking() {
		this.pointerTracking || typeof window > "u" || (this.pointerTracking = !0, window.addEventListener("pointermove", this.trackPointer, !0), window.addEventListener("pointerdown", this.trackPointer, !0));
	}
	clear() {
		this.nodes.clear(), this.hoveredButtonKeys.clear(), this.currentHover = null, this.pointerTracking && typeof window < "u" && (window.removeEventListener("pointermove", this.trackPointer, !0), window.removeEventListener("pointerdown", this.trackPointer, !0), this.pointerTracking = !1), this.layer.replaceChildren();
	}
	apply(e) {
		e = Xa(e);
		let t = /* @__PURE__ */ new Set();
		for (let n of e) {
			if (n.maskGroup) {
				t.add(n.key), this.applyMaskGroup(n);
				continue;
			}
			if (!n.src && n.kind !== "text" && n.kind !== "button") continue;
			t.add(n.key);
			let e = this.nodes.get(n.key);
			(!e || e.characterId !== n.characterId || e.kind !== n.kind) && (e?.element.remove(), e = this.createNode(n), this.nodes.set(n.key, e)), this.updateMedia(e, n), this.placeNode(e, n);
		}
		for (let [e, n] of this.nodes) t.has(e) || (n.element.remove(), this.nodes.delete(e), this.hoveredButtonKeys.delete(e));
		this.scheduleStaticFit(), this.updateHover();
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
			this.staticFitQueued = !1, Ya(this.layer);
		}), document.fonts?.ready.then(() => Ya(this.layer)).catch(() => {}));
	}
	applyMaskGroup(e) {
		let t = this.nodes.get(e.key);
		if (!t) {
			let n = document.createElement("div");
			n.className = "player-instance", this.layer.append(n), t = {
				element: n,
				media: n,
				characterId: -1,
				kind: e.kind,
				src: ""
			}, this.nodes.set(e.key, t);
		}
		t.element.style.zIndex = String(e.order), t.element.style.transform = "none", t.element.innerHTML = Fa(e.maskGroup, e.key, this.options.stageDimensions ?? {
			width: 640,
			height: 480
		}, this.options.resolveFontFamily);
	}
	createNode(e) {
		let t = document.createElement("div");
		t.className = "player-instance", t.dataset.key = e.key, t.dataset.character = String(e.characterId);
		let n = this.createMedia(e);
		return n.classList.add("player-media"), t.append(n), this.layer.append(t), e.kind === "button" && e.buttonOwnerPath !== void 0 && this.wireButton(n, e.buttonOwnerPath, e.characterId, e.key), {
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
			return t.className = "player-hit", t.decoding = "async", t.draggable = !1, t.src = e.src ? me(e.src) : Ea, t;
		}
		let t = document.createElement("img");
		return t.decoding = "async", t.draggable = !1, t;
	}
	updateMedia(e, t) {
		if (e.kind === "text") {
			t.text ? this.styleText(e.media, t) : e.src !== t.src && t.src && this.loadPlainText(e.media, t.src), e.src = t.src;
			return;
		}
		e.src !== t.src && e.media instanceof HTMLImageElement && (e.media.src = t.src ? me(t.src) : Ea, e.src = t.src);
	}
	loadPlainText(e, t) {
		fetch(me(t)).then((e) => e.ok ? e.text() : "").then((t) => {
			e.textContent = Wa(t).trim();
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
		if (a > 0 && (e.style.height = `${a}px`), n.staticLines?.length || (e.style.boxSizing = "border-box", e.style.padding = `${Da}px`), e.style.fontSize = `${n.fontHeight}px`, e.style.lineHeight = `${n.lineHeight ?? n.fontHeight + (n.leading ?? 0)}px`, e.style.color = n.color ?? "#000", e.style.textAlign = n.align ?? "left", e.style.whiteSpace = n.wordWrap ? "pre-wrap" : "pre", r && (e.style.fontFamily = r), n.staticLines?.length) {
			e.innerHTML = Ja(n, i);
			return;
		}
		n.html ? e.innerHTML = Ua(Wa(n.text ?? "")) : Ga(e, Wa(n.text ?? ""), n, i);
	}
	placeNode(e, t) {
		e.kind !== "text" && ya.set(e.media, {
			position: "absolute",
			left: -t.origin.x,
			top: -t.origin.y,
			width: t.origin.width || "auto",
			height: t.origin.height || "auto"
		});
		let { a: n, b: r, c: i, d: a, tx: o, ty: s } = t.matrix, c = i, l = a, u = Math.hypot(i, a);
		if (e.kind !== "text" && u >= Va && t.origin.height > 0 && t.origin.height <= Ha) {
			let e = (u * t.origin.height + Ba) / (u * t.origin.height);
			c = i * e, l = a * e;
		}
		ya.set(e.element, {
			zIndex: t.order,
			opacity: t.opacity,
			transform: `matrix(${n}, ${r}, ${c}, ${l}, ${o}, ${s})`
		});
		let d = e.kind === "text" ? 0 : Math.max(Math.hypot(n, r), Math.hypot(i, a));
		e.element.style.willChange = d >= za ? "auto" : "transform, opacity", Sa(e.media, t.colorTransform);
	}
}, za = 2, Ba = 2, Va = 4, Ha = 64;
function Ua(e) {
	let t = document.createElement("template");
	t.innerHTML = e.replace(/<sbr\b[^>]*\/?>/gi, "<br>");
	let n = (e) => {
		if (e.nodeType === Node.TEXT_NODE) return to(e.textContent ?? "");
		if (!(e instanceof Element)) return "";
		let t = e.tagName.toLowerCase(), r = [...e.childNodes].map(n).join("");
		if (t === "sbr" || t === "br") return "<br>";
		if (t === "p") {
			let t = $a(e.getAttribute("align"));
			return `<div style="margin:0${t ? `;text-align:${t}` : ""}">${r}</div>`;
		}
		if (t === "font") {
			let t = Qa(e);
			return t ? `<span style="${t}">${r}</span>` : `<span>${r}</span>`;
		}
		if (t === "a") {
			let t = eo(e.getAttribute("href"));
			return t ? `<a href="${to(t)}" target="_blank" rel="noreferrer">${r}</a>` : `<span>${r}</span>`;
		}
		return t === "b" || t === "strong" ? `<strong>${r}</strong>` : t === "i" || t === "em" ? `<em>${r}</em>` : t === "u" ? `<u>${r}</u>` : r;
	};
	return [...t.content.childNodes].map(n).join("");
}
function Wa(e) {
	return e.replace(/\s*--- RECORDSEPARATOR ---\s*/g, "\n").replace(/\r/g, "\n").split("\n").filter((e) => e.trim() !== "--- RECORDSEPARATOR ---").join("\n");
}
function Ga(e, t, n, r) {
	if (n.wordWrap || n.multiline || t.includes("\n") || r <= 0) {
		e.textContent = t;
		return;
	}
	let i = document.createElement("span");
	i.className = "player-text-fit", i.textContent = t, i.style.display = "inline-block", i.style.whiteSpace = "pre", i.style.transformOrigin = n.align === "right" ? "right top" : n.align === "center" ? "center top" : "left top", e.replaceChildren(i), Ka(e, i, r);
}
function Ka(e, t, n) {
	let r = () => qa(e, t, n);
	requestAnimationFrame(r), requestAnimationFrame(() => requestAnimationFrame(r)), document.fonts?.ready.then(r).catch(() => {});
}
function qa(e, t, n) {
	if (!t.isConnected || t.parentElement !== e) return;
	t.style.transform = "";
	let r = t.scrollWidth || t.offsetWidth || t.getBoundingClientRect().width;
	if (!Number.isFinite(r) || r <= 0 || r <= n) return;
	let i = Math.max(.1, n / r);
	t.style.transform = `scaleX(${i})`;
}
function Ja(e, t) {
	let n = Math.max(1, t), r = e.baselineRatio ?? 1;
	return (e.staticLines ?? []).map((t) => {
		let i = Math.max(1, t.width ?? n), a = e.align === "center" ? t.x + (n - i) / 2 : t.x, o = t.y - e.fontHeight * r, s = e.align ?? "left";
		return `<span class="player-static-line" data-sw="${i}" style="position:absolute;left:${a}px;top:${o}px;width:${i}px;height:${e.fontHeight}px;line-height:${e.fontHeight}px;white-space:pre;transform-origin:left top;color:${e.color ?? "#000"};text-align:${s}">${to(t.text.trimEnd())}</span>`;
	}).join("");
}
function Ya(e) {
	let t = e.querySelectorAll("span.player-static-line");
	for (let e of t) {
		let t = parseFloat(e.dataset.sw ?? "");
		if (!Number.isFinite(t) || t <= 0) continue;
		e.style.transform = "";
		let n = e.scrollWidth || e.getBoundingClientRect().width;
		Number.isFinite(n) && n > t + .5 && (e.style.transform = `scaleX(${t / n})`);
	}
}
function Xa(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map();
	for (let i of e) {
		if (i.kind !== "text" || !i.text) continue;
		let e = Za(i);
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
function Za(e) {
	let t = e.text;
	return t ? (t.staticLines?.length ? t.staticLines.map((e) => e.text.trim()).join("\n") : Wa(t.text ?? "")).replace(/\s+/g, " ").trim() : "";
}
function Qa(e) {
	let t = [], n = e.getAttribute("color"), r = e.getAttribute("face"), i = Number.parseFloat(e.getAttribute("size") ?? ""), a = Number.parseFloat(e.getAttribute("letterSpacing") ?? "");
	return n && /^#[0-9a-f]{6}$/i.test(n) && t.push(`color:${n}`), r && t.push(`font-family:${r.split(",").map((e) => `"${e.trim().replaceAll("\"", "\\\"")}"`).join(",")}`), Number.isFinite(i) && i > 0 && t.push(`font-size:${i}px`), Number.isFinite(a) && t.push(`letter-spacing:${a}px`), t.join(";");
}
function $a(e) {
	let t = String(e ?? "").toLowerCase();
	return t === "left" || t === "right" || t === "center" || t === "justify" ? t : "";
}
function eo(e) {
	let t = String(e ?? "");
	return /^(https?:|mailto:)/i.test(t) ? t : "";
}
function to(e) {
	return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");
}
//#endregion
//#region src/render/TextRenderer.ts
var no = class {
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
			e.fontLoadable !== !1 && (io(n, i, `swf-font-${e.id}`, e.byteLength), io(r, ao(i), `swf-font-${e.id}`, e.byteLength));
		}
		for (let e of t) {
			if (e.kind !== "font" || !e.src) continue;
			let t = e.src.split("/").pop() ?? "", i = e.fontName ?? t.replace(/\.ttf$/i, "").replace(/^\d+_/, "").trim(), a = `swf-font-${e.id}`, o = e.fontLoadable === !1 ? (r.get(ao(i)) ?? n.get(i))?.family : void 0;
			if (this.families.set(e.id, `${o ? `"${o}", ` : ""}"${a}", "${i}", Arial, Helvetica, sans-serif`), e.fontLoadable === !1 || this.registered.has(e.id)) continue;
			this.registered.add(e.id);
			let s = encodeURI(me(e.src));
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
		this.style || (this.style = document.createElement("style"), this.style.dataset.mmtourFonts = "true", document.head.append(this.style)), !this.cssRules.has(e) && (this.cssRules.add(e), this.style.append(`\n@font-face{font-family:"${ro(e)}";src:url("${t}") format("truetype");font-weight:400;font-style:normal;font-display:block;}`));
	}
};
function ro(e) {
	return e.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}
function io(e, t, n, r = 0) {
	let i = e.get(t);
	(!i || r > i.byteLength) && e.set(t, {
		family: n,
		byteLength: r
	});
}
function ao(e) {
	return e.toLowerCase().replace(/\b(lt|std|regular|medium|book|roman)\b/g, "").replace(/[^a-z0-9]+/g, "");
}
//#endregion
//#region src/player/avm1Properties.ts
var oo = [
	J("_x", 0, "display", "readwrite", "number"),
	J("_y", 1, "display", "readwrite", "number"),
	J("_xscale", 2, "display", "readwrite", "number"),
	J("_yscale", 3, "display", "readwrite", "number"),
	J("_currentframe", 4, "movieclip", "read", "number"),
	J("_totalframes", 5, "movieclip", "read", "number"),
	J("_alpha", 6, "display", "readwrite", "number"),
	J("_visible", 7, "display", "readwrite", "boolean"),
	J("_width", 8, "display", "readwrite", "number"),
	J("_height", 9, "display", "readwrite", "number"),
	J("_rotation", 10, "display", "readwrite", "number"),
	J("_target", 11, "movieclip", "read", "string"),
	J("_framesloaded", 12, "movieclip", "read", "number"),
	J("_name", 13, "display", "readwrite", "string"),
	J("_droptarget", 14, "movieclip", "read", "string"),
	J("_url", 15, "movieclip", "read", "string"),
	J("_highquality", 16, "global", "readwrite", "number"),
	J("_focusrect", 17, "global", "readwrite", "boolean"),
	J("_soundbuftime", 18, "global", "readwrite", "number"),
	J("_quality", 19, "global", "readwrite", "string"),
	J("_xmouse", 20, "movieclip", "read", "number"),
	J("_ymouse", 21, "movieclip", "read", "number")
], so = [
	J("enabled", void 0, "button", "readwrite", "boolean"),
	J("text", void 0, "textfield", "readwrite", "string"),
	J("htmlText", void 0, "textfield", "readwrite", "string", ["htmltext"]),
	J("html", void 0, "textfield", "readwrite", "boolean"),
	J("textColor", void 0, "textfield", "readwrite", "number", ["textcolor"]),
	J("variable", void 0, "textfield", "readwrite", "string"),
	J("selectable", void 0, "textfield", "readwrite", "boolean"),
	J("type", void 0, "textfield", "readwrite", "string"),
	J("wordWrap", void 0, "textfield", "readwrite", "boolean", ["wordwrap"]),
	J("multiline", void 0, "textfield", "readwrite", "boolean")
], co = [...oo, ...so];
new Map(co.filter((e) => e.index !== void 0).map((e) => [e.index, e]));
var lo = new Map(co.flatMap((e) => [[po(e.canonicalName), e], ...e.aliases.map((t) => [po(t), e])]));
function uo(e) {
	return lo.get(po(e));
}
function fo(e) {
	return uo(e)?.canonicalName;
}
function po(e) {
	return e.trim().toLowerCase();
}
function J(e, t, n, r, i, a = []) {
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
function mo(e) {
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
function ho(e) {
	let t = e.trim();
	return /^[A-Za-z_$][\w$]*$/.test(t) && !/^(true|false|null|undefined|this|_root|_global|_parent|_level\d+)$/.test(t);
}
function go(e, t) {
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
function _o(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
//#endregion
//#region src/player/renderNodes.ts
function vo(e, t) {
	for (let n of e.childClips.values()) if (n.name === t) return n;
	return null;
}
function yo(e) {
	return e.kind === "sprite" && !!(e.timeline?.length || e.frames?.length);
}
function bo(e, t) {
	if (e.kind === "sprite" && e.frames?.length) {
		let n = t ? _o(t.currentFrame, 0, e.frames.length - 1) : 0;
		return e.frames[n] ?? "";
	}
	return e.kind === "button" ? e.states?.up?.src ?? e.src ?? "" : e.src ?? "";
}
function xo(e) {
	let t = {};
	return e.visible !== void 0 && (t.visible = e.visible), e.blendMode !== void 0 && (t.blendMode = e.blendMode), e.filters !== void 0 && (t.filters = e.filters), e.cacheAsBitmap !== void 0 && (t.cacheAsBitmap = e.cacheAsBitmap), e.className !== void 0 && (t.className = e.className), e.clipActions !== void 0 && (t.clipActions = e.clipActions), t;
}
function So(e, t) {
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
function Co(e, t, n, r, i, a, o, s, c = o.colorTransform) {
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
		...xo(o),
		clipDepth: o.clipDepth,
		spriteFrame: s
	};
}
function wo(e, t, n, r, i, a, o, s = 1, c, l = i.colorTransform) {
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
		...xo(i),
		buttonOwnerPath: a
	};
}
//#endregion
//#region src/player/ClipInstance.ts
var Y = class {
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
}, To = void 0, Eo = class {
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
			label: Mo(e)
		});
	}
	exec(e, t) {
		let n = [], r = /* @__PURE__ */ new Map(), i = 0;
		for (; i < e.length;) {
			if (++this.steps > this.budget) throw Error(this.branchError("avm1 budget exceeded", t, i, void 0, n));
			let a = e[i];
			switch (a.op) {
				case "ConstantPool": break;
				case "End": return To;
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
					n.push(this.host.deleteMember?.(t, e) ?? No(t, e));
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
					e in t.locals || (t.locals[e] = To);
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
					let e = String(n.pop()), t = jo(n);
					n.push(this.host.construct(e, t));
					break;
				}
				case "NewMethod": {
					let e = n.pop(), t = n.pop(), r = jo(n);
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
					n.push(!ko(n.pop()));
					break;
				case "And": {
					let e = n.pop(), t = n.pop();
					n.push(ko(t) && ko(e));
					break;
				}
				case "Or": {
					let e = n.pop(), t = n.pop();
					n.push(ko(t) || ko(e));
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
					n.push(typeof t == "string" || typeof e == "string" ? Oo(t) + Oo(e) : Number(t) + Number(e));
					break;
				}
				case "StringAdd": {
					let e = n.pop(), t = n.pop();
					n.push(Oo(t) + Oo(e));
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
					n.push(Oo(n.pop()));
					break;
				case "TypeOf":
					n.push(Ao(n.pop()));
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
					Fo(n.pop(), e);
					break;
				}
				case "InstanceOf": {
					let e = n.pop(), t = n.pop();
					n.push(Io(t, e));
					break;
				}
				case "CallFunction": {
					let e = String(n.pop()), r = jo(n);
					n.push(this.callNamed(t, e, r));
					break;
				}
				case "CallMethod": {
					let e = n.pop(), t = n.pop(), r = jo(n), i = e === To || e === null || e === "" ? void 0 : String(e);
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
					if (ko(n.pop())) {
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
		return To;
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
		return X(r) ? this.callFunction(r, n, e.thisObj) : this.host.callNamed(t, n, e.thisObj);
	}
	callMethod(e, t, n) {
		if (X(e) && (t === "apply" || t === "call")) {
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
			if (X(r)) return this.callFunction(r, n, e);
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
		return `${e}: function=${t.label}, opcode=${n}, target=${r ?? "n/a"}, stackTop=${Po(i)}`;
	}
};
function X(e) {
	return !!e && typeof e == "object" && e.__avm1fn === !0;
}
function Do(e) {
	if (!e || typeof e != "object") return;
	let t = e;
	return t.prototype ||= Object.create(null), t.prototype;
}
function Oo(e) {
	if (e == null) return "";
	if (typeof e == "object") try {
		return String(e);
	} catch {
		return "[object Object]";
	}
	return String(e);
}
function ko(e) {
	return !(e == null || e === !1 || e === 0 || e === "" || typeof e == "number" && isNaN(e));
}
function Ao(e) {
	return e === void 0 ? "undefined" : e === null ? "null" : X(e) || typeof e == "function" ? "function" : Array.isArray(e) ? "object" : typeof e;
}
function jo(e) {
	let t = Number(e.pop()) | 0, n = [];
	for (let r = 0; r < t; r++) n.push(e.pop());
	return n;
}
function Mo(e) {
	let t = e.debugName || e.__fqn;
	return typeof t == "string" && t ? t : "<anonymous>";
}
function No(e, t) {
	if (e == null || typeof e != "object" && typeof e != "function") return !1;
	try {
		return delete e[t];
	} catch {
		return !1;
	}
}
function Po(e) {
	return JSON.stringify(e.slice(-5).map((e) => e === void 0 ? "undefined" : e === null || typeof e == "string" || typeof e == "number" || typeof e == "boolean" ? e : X(e) ? `[Function ${Mo(e)}]` : Array.isArray(e) ? `[Array(${e.length})]` : typeof e == "object" ? e.__appClip ? "[MovieClip]" : e.__appText ? "[TextField]" : "[Object]" : String(e)));
}
function Fo(e, t) {
	let n = Do(e), r = Do(t);
	if (!(!n || !r)) {
		Object.getPrototypeOf(n) !== r && Object.setPrototypeOf(n, r), n.__constructor ||= e, r.__constructor ||= t;
		try {
			e.__super = t;
		} catch {}
	}
}
function Io(e, t) {
	if (t?.__nativeCtor === "Array") return Array.isArray(e);
	if (t?.__nativeCtor === "Object") return e !== null && (typeof e == "object" || typeof e == "function");
	if (!e || typeof e != "object" || !t || typeof t != "object") return !1;
	let n = Do(t);
	if (!n) return !1;
	let r = Object.getPrototypeOf(e);
	for (; r;) {
		if (r === n) return !0;
		r = Object.getPrototypeOf(r);
	}
	let i = e.__class, a = 0;
	for (; i && a++ < 40;) {
		if (i === t) return !0;
		let e = Do(i);
		if (!e) break;
		let n = Object.getPrototypeOf(e);
		if (!n) break;
		i = n.__constructor;
	}
	return !1;
}
//#endregion
//#region src/player/avm1App.ts
function Lo(e) {
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
var Ro = (e) => !!e && e.__xmlNode === !0;
function zo(e, t) {
	let n = [], r = (e) => {
		for (let i of e?.childNodes || []) i.nodeName === t && n.push(i), r(i);
	};
	return r(e), n;
}
function Bo(e, t) {
	return zo(e, String(t).replace(/^\/+/, ""));
}
var Vo = (e) => {
	if (e == null) return "";
	if (typeof e == "object") try {
		return String(e);
	} catch {
		return "";
	}
	return String(e);
}, Ho = (e) => !!e && e.__appClip === !0, Uo = (e) => !!e && e.__appText === !0, Wo = new Set([
	"release",
	"releaseoutside",
	"rollover",
	"rollout",
	"press"
]), Go = new Map([
	["onRelease", "release"],
	["onReleaseOutside", "releaseoutside"],
	["onRollOver", "rollover"],
	["onRollOut", "rollout"],
	["onPress", "press"]
]);
function Ko(e, t) {
	let n = e.initActions ?? [], r = e.frameBytecode ?? [], i = e.registeredClasses ?? {};
	if (!n.length || !r.length) return null;
	let a = Object.create(null), o = Object.create(null), s = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakSet(), l = /* @__PURE__ */ new WeakSet(), u = /* @__PURE__ */ new WeakMap(), d = t.root(), f = 1, p = 0, m = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Set(), _ = /* @__PURE__ */ new Set(), v = !1, y = () => {
		v || t.render();
	}, b = {}, x = (e, t, n) => {
		if (e && X(e)) return b.vm.callFunction(e, t, n);
	}, S = (e) => {
		let t = Do(e);
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
		return X(t) ? t : void 0;
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
		if (Ho(e)) {
			let r = A(e), i = r ? C(r, t) : void 0;
			return i ? (x(i, n, e), y(), !0) : !1;
		}
		let r = e[t] ?? e.props?.[t];
		return X(r) ? (x(r, n, e), y(), !0) : !1;
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
		X(t) && x(t, [e], e);
		let n = e.onMotionFinished;
		X(n) && (e.completed = !1, x(n, [e], e)), y();
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
		if (X(e.easing)) {
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
		X(o) && x(o, [e], e), e.elapsed >= n && te(e);
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
				X(n) ? x(n, [], e) : _.delete(e);
			}
		} finally {
			v = !1;
		}
	}, ae = (e) => {
		for (let [n] of Go) if (t.clipField(e, n)) return !0;
		let n = j(e);
		return Object.keys(n).some((e) => Wo.has(e.toLowerCase()) && n[e]?.length);
	}, oe = (e, n) => {
		let r = [...Go.entries()].find(([, e]) => e === n)?.[0], i = r ? t.clipField(e, r) : void 0;
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
				if (X(e)) return n === "prototype" ? S(e) : n in e ? e[n] : void 0;
				if (Uo(e)) return n === "text" || n === "htmlText" ? t.getText(e) : t.getTextProp?.(e, n) ?? e[n];
				if (Ho(e)) {
					let r = A(e), i = r ? T(r, n) : void 0;
					if (i) return x(i, [], e);
					if (t.hasClipField(e, n)) return t.clipField(e, n);
					let a = t.child(e, n);
					if (a !== void 0) return Ho(a) && !s.has(a) && A(a), a;
					if (r) {
						let e = C(r, n);
						if (e !== void 0) return e;
					}
					return t.getClipProp(e, n);
				}
				if (Ro(e)) return e[n];
				if (typeof e == "string" || e instanceof String) {
					if (n === "length") return Vo(e).length;
					let t = String.prototype[n];
					return typeof t == "function" ? (...n) => t.apply(Vo(e), n) : void 0;
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
				if (X(e)) {
					e[n] = r;
					return;
				}
				if (Uo(e)) {
					if (n === "text" || n === "htmlText") {
						t.setText(e, Vo(r), n === "htmlText");
						return;
					}
					t.setTextProp?.(e, n, r), e[n] = r;
					return;
				}
				if (Ho(e)) {
					let i = A(e), a = i ? E(i, n) : void 0;
					if (a) {
						x(a, [r], e);
						return;
					}
					if (n.startsWith("_")) {
						t.setClipProp(e, n, r);
						return;
					}
					t.setClipField(e, n, r), n === "onEnterFrame" && (X(r) ? _.add(e) : _.delete(e)), Go.has(n) && se(e);
					return;
				}
				try {
					e[n] = r;
				} catch {}
			}
		},
		deleteMember(e, n) {
			if (e == null) return !1;
			if (X(e)) try {
				return delete e[n];
			} catch {
				return !1;
			}
			if (Uo(e)) try {
				return delete e[n];
			} catch {
				return !1;
			}
			if (Ho(e)) return t.setClipField(e, n, void 0), n === "onEnterFrame" && _.delete(e), Go.has(n) && se(e), !0;
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
			if (Ro(e)) return Object.keys(e).filter((t) => e[t] !== void 0);
			if (Ho(e)) {
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
			if (!X(e)) return Object.create(null);
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
				n[t] = [...n[t] || [], r[1]], Ho(e) && Wo.has(t.toLowerCase()) && se(e);
				return;
			}
			if (n === "removeEventListener") {
				let t = String(r[0]), n = j(e);
				n[t]?.length && (n[t] = n[t].filter((e) => e !== r[1])), Ho(e) && Wo.has(t.toLowerCase()) && se(e);
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
				let r = n == null ? null : Lo(n);
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
				let e = Bo(r[0], String(r[1]));
				return n === "selectNodes" ? e : e[0];
			}
			if (Ro(e)) {
				if (n === "selectNodes") return Bo(e, String(r[0]));
				if (n === "selectSingleNode") return Bo(e, String(r[0]))[0];
			}
			if (Uo(e) && n === "setTextFormat") {
				let n = r[0], i = n && typeof n == "object" ? {
					...n,
					...n.props ?? {}
				} : {};
				t.setTextFormat?.(e, i), y();
				return;
			}
			if (typeof e == "string" || e instanceof String) {
				let t = Vo(e);
				switch (n) {
					case "split": return t.split(Vo(r[0]), r[1] === void 0 ? void 0 : Number(r[1]));
					case "substr": return t.substr(Number(r[0] ?? 0), r[1] === void 0 ? void 0 : Number(r[1]));
					case "substring": return t.substring(Number(r[0] ?? 0), r[1] === void 0 ? void 0 : Number(r[1]));
					case "indexOf": return t.indexOf(Vo(r[0]), r[1] === void 0 ? void 0 : Number(r[1]));
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
			if (Ho(e)) switch (n) {
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
			if (X(i)) return x(i, r, e);
		},
		getProperty() {
			return 0;
		},
		setProperty() {}
	}, le = new Eo(ce, 6e7);
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
					X(i) && !i.__fqn && (i.__fqn = e), de(i, e, n + 1);
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
function qo(e, t) {
	if (!e) return !0;
	let n = e.trim();
	return n === "" || n === "else" || n === "true" ? !0 : n === "false" ? !1 : Jo(n, t);
}
function Jo(e, t) {
	let n = ns(e, "||");
	return n.length > 1 ? n.some((e) => Yo(e, t)) : Yo(e, t);
}
function Yo(e, t) {
	let n = ns(e, "&&");
	return n.length > 1 ? n.every((e) => Xo(e, t)) : Xo(e, t);
}
function Xo(e, t) {
	let n = e.trim();
	for (; n.startsWith("(") && is(n) === n.length - 1;) n = n.slice(1, -1).trim();
	if (ns(n, "||").length > 1) return Jo(n, t);
	if (ns(n, "&&").length > 1) return Yo(n, t);
	if (n.startsWith("!")) return !Xo(n.slice(1), t);
	for (let e of [
		"==",
		"!=",
		"<=",
		">=",
		"<",
		">"
	]) {
		let r = rs(n, e);
		if (r >= 0) return Zo(Qo(n.slice(0, r), t), Qo(n.slice(r + e.length), t), e);
	}
	return es(Qo(n, t));
}
function Zo(e, t, n) {
	if (e == null && t == null) {
		if (n === "==") return !0;
		if (n === "!=") return !1;
	}
	let r = ts(e), i = ts(t);
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
function Qo(e, t) {
	let n = e.trim();
	if (n === "") return;
	let r = $o(n, "eval");
	if (r !== void 0) {
		let e = Qo(r, t);
		return e === void 0 ? void 0 : t.get(String(e));
	}
	return n.startsWith("\"") && n.endsWith("\"") || n.startsWith("'") && n.endsWith("'") ? n.slice(1, -1) : n === "true" ? !0 : n === "false" ? !1 : n === "null" ? null : /^-?\d+(\.\d+)?$/.test(n) ? Number(n) : t.get(n);
}
function $o(e, t) {
	let n = `${t}(`;
	if (!e.startsWith(n) || !e.endsWith(")")) return;
	let r = e.slice(t.length);
	if (is(r) === r.length - 1) return r.slice(1, -1).trim();
}
function es(e) {
	return e != null && e !== !1 && e !== 0 && e !== "" && e !== "0";
}
function ts(e) {
	if (typeof e == "number") return e;
	if (typeof e == "boolean") return +!!e;
	if (typeof e == "string" && /^-?\d+(\.\d+)?$/.test(e.trim())) return Number(e);
}
function ns(e, t) {
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
function rs(e, t) {
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
function is(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(") t++;
	else if (e[n] === ")" && (t--, t === 0)) return n;
	return -1;
}
//#endregion
//#region src/player/matrix.ts
var as = {
	a: 1,
	b: 0,
	c: 0,
	d: 1,
	tx: 0,
	ty: 0
};
function os(e, t) {
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
var ss = class e {
	fps;
	state = { t: 0 };
	tween;
	lastTick = -1;
	onTick;
	static HORIZON = 1e7;
	constructor(t, n) {
		this.fps = t, this.onTick = n, this.tween = ya.to(this.state, {
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
}, cs = /^_(?:level\d+|root|parent)\./;
function ls(e) {
	let t = e.trim();
	for (; cs.test(t);) t = t.replace(cs, "");
	return t;
}
var us = class {
	values = /* @__PURE__ */ new Map();
	seed(e) {
		if (e) for (let [t, n] of Object.entries(e)) {
			let e = ls(t);
			!this.values.has(e) && ds(n) && this.values.set(e, n);
		}
	}
	get(e) {
		return this.values.get(ls(e));
	}
	set(e, t) {
		this.values.set(ls(e), t);
	}
	has(e) {
		return this.values.has(ls(e));
	}
	reset() {
		this.values.clear();
	}
};
function ds(e) {
	return e === null || typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "object";
}
//#endregion
//#region src/player/Player.ts
var fs = new Set([
	"gotoAndPlay",
	"gotoAndStop",
	"play",
	"stop",
	"nextFrame",
	"prevFrame"
]), ps = new Set(["waitForVal", "startTimer"]), ms = new Set(["markSnd", "markSndSegment"]), hs = /^_level[1-9]\d*\b/i, gs = "__avm1OwnerClip", _s = "__avm1OwnerProperty", vs = -1, ys = 24, bs = 8, xs = 3, Ss = {
	x: 0,
	y: 0,
	width: 0,
	height: 0
}, Cs = class {
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
		for (let e of Object.values(this.assets)) for (let t of e.linkageNames ?? []) this.linkageAssetIds.set(pc(t), e.id);
		for (let [t, n] of Object.entries(e.control?.registeredClasses ?? {})) {
			let e = Qs(n.split(".").pop() ?? n);
			e && this.linkageClassKeys.set(pc(t), e);
		}
		for (let e of Object.values(this.assets)) {
			let t = e?.text?.normalizedVariableName;
			t && this.boundTextVars.add(ls(t));
		}
		for (let t of Object.values(e.control?.dynamicTexts ?? {})) {
			let e = t?.normalizedVariableName;
			e && this.boundTextVars.add(ls(e));
		}
		this.rootFrames = e.frames ?? [], this.rootStop = new Set(e.control?.stopFrames ?? []), this.startFrame = _o(n.startFrame ?? e.entryFrame ?? 0, 0, Math.max(0, this.rootFrames.length - 1));
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
		this.store = n.store, this.buildFunctionTable(), this.buildSoundSegmentDurations(), this.ticker = new ss(e.fps || 20, () => this.onTick()), this.root = this.buildRoot(this.startFrame), this.primeAmbientSound(), this.render(), this.tryRunDataDrivenApp();
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
			this.dataApp = Ko(e, this.makeAppBridge(n));
		} catch (e) {
			console.warn("[avm1App] data-driven app bootstrap failed", e);
		}
	}
	makeAppBridge(e) {
		let t = (e) => (e.__appClip = !0, e), n = (e) => e;
		return {
			root: () => t(this.root),
			child: (e, r) => {
				let i = n(e), a = vo(i, r) ?? this.findClipByName(i, r);
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
			getTextProp: (e, t) => this.getAppTextProp(n(e.clip), e.field, fo(t) ?? t),
			setTextProp: (e, t, r) => {
				let i = n(e.clip);
				this.setLeafDisplayProp(i, e.field, fo(t) ?? t, r);
			},
			setTextFormat: (e, t) => {
				let r = n(e.clip), i = this.findTextChildByName(r, e.field);
				i !== void 0 && (Object.assign(this.textOverrideFor({
					id: i,
					owner: r,
					name: e.field
				}), ks(t)), r.mutatedLeaves.add(e.field));
			},
			getClipProp: (e, t) => this.getAppClipProp(n(e), fo(t) ?? t),
			setClipProp: (e, t, r) => {
				js(n(e), fo(t) ?? t, r);
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
				fetch(me(e)).then((e) => e.ok && !/\btext\/html\b/i.test(e.headers.get("content-type") ?? "") ? e.text() : null).then(t).catch(() => t(null));
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
		let i = this.linkageAssetIds.get(pc(t));
		if (!i || !this.getAsset(i) || !Number.isFinite(r)) return;
		e.dynamicInstances.set(r, {
			depth: r,
			characterId: i,
			placedFrame: e.currentFrame,
			matrix: { ...as },
			opacity: 1,
			name: n
		}), this.hasAnyDynamicInstances = !0, e.displayListMutated = !0, e.depthNames.set(r, n);
		let a = new Y(i, n, e);
		return a.scriptKey = this.clipSourceKey(this.getAsset(i), n), e.childClips.set(Us(r), a), this.enterFrame(a, 0, 0), a;
	}
	createEmptyClip(e, t, n) {
		e.dynamicInstances.set(n, {
			depth: n,
			characterId: 0,
			placedFrame: e.currentFrame,
			matrix: { ...as },
			opacity: 1,
			name: t
		}), this.hasAnyDynamicInstances = !0, e.displayListMutated = !0, e.depthNames.set(n, t);
		let r = new Y(0, t, e);
		return e.childClips.set(Us(n), r), r;
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
		return Dc(e, t, this.getAsset(e.characterId));
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
				} : i && (o = Bs(t, i));
			} else i && (o = Bs(t, i));
			!o.width && !o.height || n.push(Vs(o, Rs(r.matrix, a)));
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
				}), a = As(r);
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
		let a = Number(t.fontHeight), o = Number(t.lineHeight), s = this.lineHeightBase(t.fontId ?? e.text?.fontId, a), c = Math.max(1, Number.isFinite(o) && o > 0 ? o : Number.isFinite(s) && s > 0 ? s + Number(t.leading ?? 0) : i || 12), l = n?.autoSize === void 0 ? !1 : Ms(n.autoSize), u = this.measureTextWidthPx(t.text ?? "", Number(t.fontHeight), t.fontId ?? e.text?.fontId), d = u == null ? kc(t.text ?? "", t.fontHeight, r, l) : l ? u + 4 : Math.max(r, u), f = Math.max(1, r || d), p = Math.max(1, Math.floor(f / Math.max(1, c * .62))), m = Oc(t.text ?? "").trim(), h = m ? m.split(/\r?\n/).length : 1, g = t.wordWrap && m ? this.measureWrappedHeightPx(m, a, t.fontId ?? e.text?.fontId, Math.max(1, f - 4), c) : void 0, _;
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
		let o = Oc(e);
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
		let i = Oc(e);
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
		this.ticker.pause(), this.voWaiting = !1, this.clearRuntimeTimers(), this.buttonVisualStates.clear(), this.root = this.buildRoot(_o(e, 0, this.frameCount - 1)), this.render(), this.options.onFrame?.(this.root.currentFrame, !1);
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
				e.target && t !== void 0 && !Es(e.target, t) && this.scopeSet(i, e.target, t);
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
		let r = _o(Number(n.clip.x ?? 0) + e, n.left ?? -Infinity, n.right ?? Infinity), i = _o(Number(n.clip.y ?? 0) + t, n.top ?? -Infinity, n.bottom ?? Infinity);
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
		let r = this.timeline.control?.buttonActions ?? {}, i = r[String(t)], a = $s(i?.release);
		if (!i || !a) return [];
		let o = [], s = e.parent ?? e;
		for (let [c, l] of Object.entries(r)) {
			let r = Number(c);
			if (!Number.isFinite(r) || r === t) continue;
			let u = n, d = l[u];
			if (!d || $s(l.release) !== a || !ec(i, l) || !tc(i[u], d)) continue;
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
			t.target && n !== void 0 && !Es(t.target, n) && this.scopeSet(e, t.target, n);
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
		return new Y(t, "", e);
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
			let i = Xs(n.source);
			if (i) {
				let r = Ys(i, e), a = this.methodFunctions.get(r) ?? t();
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
			let e = (n.body ?? []).filter((e) => e.kind === "call" && !!e.functionName?.startsWith("gotoAnd") && (!e.target || e.target === "self" || e.target === "this") || e.kind === "assign" && ho(e.target));
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
		if (o >= bs) return !1;
		this.functionReentry.set(e, o + 1);
		try {
			let e = this.bindParams(t.parameters, n, r, a), o = this.functionActionDecisions(t.actions, e), s = this.functionBodyDecisions(t.body, e, i), c = new Set(t.body.filter((e, t) => s[t] && e.kind === "assign").map((e) => dc(e.rawValue)).filter((e) => !!e)), l = new Set([...c, ...t.body.filter((e, t) => s[t] && e.kind === "call").map((e) => e.functionName)]);
			for (let n of t.calls) l.has(n.functionName) || this.runFunctionCall(n, i, e);
			let u = new Set(t.body.filter((e, t) => s[t] && e.kind === "call").map((t) => this.bodySoundCallKey(t, e)).filter((e) => !!e));
			return t.actions.forEach((t, n) => {
				if (!o[n]) return;
				let r = t.functionCalls ?? [];
				if (t.command === "callFunctions" && r.length > 0 && r.every((e) => l.has(e.functionName))) return;
				let a = lc(t);
				a && u.has(a) || this.runFunctionAction(t, e, i);
			}), this.runFunctionBody(t.body, e, s, i), this.render(), !0;
		} finally {
			o ? this.functionReentry.set(e, o) : this.functionReentry.delete(e);
		}
	}
	functionActionDecisions(e, t) {
		let n = e.map(() => !0);
		if (!this.store) return n;
		let r = (e) => e === "else", i = (e) => !e || this.evalGuard(go(e, t));
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
		return mo(e).map((e) => this.resolveExpr(e.trim(), t, n));
	}
	getTimer() {
		return performance.now();
	}
	resolveExpr(e, t, n = this.root) {
		let r = e.trim();
		if (r === "") return;
		for (; r.startsWith("(") && Xc(r) === r.length - 1;) r = r.slice(1, -1).trim();
		if (r === "undefined") return;
		if (r === "null") return null;
		if (r === "_global.Infinity" || r === "Infinity") return Infinity;
		if (r === "NaN") return NaN;
		let i = vc(r);
		if (i) return this.resolveExpr(this.evalRuntimeCondition(i.condition, t ?? {}, n) ? i.whenTrue : i.whenFalse, t, n);
		if (r === "getTimer()") return this.getTimer();
		if (r === "Math.random()") return Math.random();
		if (r === "new Object()") return {};
		if (r === "new Array()" || r === "[]") return [];
		if (r === "new MovieClipLoader()") return {
			__avm1Type: "MovieClipLoader",
			listeners: []
		};
		let a = Z(r, "new Array");
		if (a !== void 0) return this.parseArgs(a, t, n);
		if (r.startsWith("{") && r.endsWith("}")) return this.resolveObjectLiteral(r, t, n);
		let o = Z(r, "parseInt");
		if (o !== void 0) {
			let e = this.resolveExpr(o, t, n), r = Number.parseInt(String(e ?? ""), 10);
			return Number.isFinite(r) ? r : void 0;
		}
		let s = Z(r, "parseFloat");
		if (s !== void 0) {
			let e = this.resolveExpr(s, t, n), r = Number.parseFloat(String(e ?? ""));
			return Number.isFinite(r) ? r : void 0;
		}
		let c = Z(r, "Number");
		if (c !== void 0) return Number(this.resolveExpr(c, t, n) ?? 0);
		let l = Z(r, "String");
		if (l !== void 0) return String(this.resolveExpr(l, t, n) ?? "");
		let u = Z(r, "Boolean");
		if (u !== void 0) return Ms(this.resolveExpr(u, t, n) ?? !1);
		let d = Z(r, "Math.floor");
		if (d !== void 0) return Math.floor(Number(this.resolveExpr(d, t, n) ?? 0));
		let f = Z(r, "Math.ceil");
		if (f !== void 0) return Math.ceil(Number(this.resolveExpr(f, t, n) ?? 0));
		let p = Z(r, "Math.round");
		if (p !== void 0) return Math.round(Number(this.resolveExpr(p, t, n) ?? 0));
		let m = Z(r, "Math.abs");
		if (m !== void 0) return Math.abs(Number(this.resolveExpr(m, t, n) ?? 0));
		if (r.startsWith("typeof ")) return Jc(this.resolveExpr(r.slice(7).trim(), t, n));
		let h = yc(r);
		if (h) {
			let [e, r] = this.parseArgs(h.arguments, t, n);
			return h.name === "selectNodes" ? zc(e, String(r ?? "")) : zc(e, String(r ?? ""))[0];
		}
		let g = bc(r);
		if (g) {
			let [e, r] = this.parseArgs(g.arguments, t, n), i = g.name === "selectNodes" ? zc(e, String(r ?? "")) : zc(e, String(r ?? ""))[0];
			for (let e of gc(g.memberPath)) if (i instanceof Y) i = this.resolveClipMember(i, e);
			else if (Array.isArray(i)) i = e === "length" ? i.length : i[Number(this.resolveExpr(e, t, n) ?? e)];
			else if (Lc(i)) i = Bc(i, e);
			else if (Q(i)) i = i[e];
			else return;
			return mc(i) ? i : void 0;
		}
		let _ = Ac(r);
		if (_) return {
			__avm1Delegate: !0,
			target: this.resolveValueTarget(n, _.target, t),
			method: _.method.split(".").pop() ?? _.method
		};
		if (r === "new XML()") return { __avm1Type: "XML" };
		let v = xc(r);
		if (v) return this.createTweenObject(v.arguments, t, n);
		let y = Z(r, "setInterval");
		if (y !== void 0) return this.createInterval(y, t, n);
		let b = this.constructObject(r, t, n);
		if (b) return b;
		let x = $(r, "toUpperCase");
		if (x) {
			let e = x.target ? this.resolveValueTarget(n, x.target, t) : void 0;
			return e === void 0 ? void 0 : String(e).toUpperCase();
		}
		let S = $(r, "split");
		if (S) {
			let e = S.target ? this.resolveValueTarget(n, S.target, t) : void 0, [r] = this.parseArgs(S.arguments, t, n);
			return e === void 0 ? void 0 : String(e).split(String(r ?? ""));
		}
		let C = $(r, "substring");
		if (C) {
			let e = C.target ? this.resolveValueTarget(n, C.target, t) : void 0, [r, i] = this.parseArgs(C.arguments, t, n);
			return e === void 0 ? void 0 : String(e).substring(Number(r ?? 0), i === void 0 ? void 0 : Number(i));
		}
		let w = $(r, "substr");
		if (w) {
			let e = w.target ? this.resolveValueTarget(n, w.target, t) : void 0, [r, i] = this.parseArgs(w.arguments, t, n);
			return e === void 0 ? void 0 : String(e).substr(Number(r ?? 0), i === void 0 ? void 0 : Number(i));
		}
		let T = $(r, "charCodeAt");
		if (T) {
			let e = T.target ? this.resolveValueTarget(n, T.target, t) : void 0, [r] = this.parseArgs(T.arguments, t, n);
			return e === void 0 ? void 0 : String(e).charCodeAt(Number(r ?? 0));
		}
		let E = $(r, "indexOf");
		if (E) {
			let e = E.target ? this.resolveValueTarget(n, E.target, t) : void 0, [r, i] = this.parseArgs(E.arguments, t, n);
			return e === void 0 ? void 0 : String(e).indexOf(String(r ?? ""), i === void 0 ? void 0 : Number(i));
		}
		let D = $(r, "join");
		if (D) {
			let e = D.target ? this.resolveValueTarget(n, D.target, t) : void 0, [r] = this.parseArgs(D.arguments, t, n);
			return Array.isArray(e) ? e.map((e) => e == null ? "" : String(e)).join(String(r ?? ",")) : void 0;
		}
		let O = $(r, "splice");
		if (O) {
			let e = O.target ? this.resolveValueTarget(n, O.target, t) : void 0, [r, i, ...a] = this.parseArgs(O.arguments, t, n);
			return Array.isArray(e) ? e.splice(Number(r ?? 0), i === void 0 ? e.length : Number(i), ...a) : void 0;
		}
		let k = $(r, "pop");
		if (k) {
			let e = k.target ? this.resolveValueTarget(n, k.target, t) : void 0;
			return Array.isArray(e) ? e.pop() : void 0;
		}
		let A = $(r, "reverse");
		if (A) {
			let e = A.target ? this.resolveValueTarget(n, A.target, t) : void 0;
			return Array.isArray(e) ? e.reverse() : void 0;
		}
		let j = $(r, "concat");
		if (j) {
			let e = j.target ? this.resolveValueTarget(n, j.target, t) : void 0, r = this.parseArgs(j.arguments, t, n);
			return Array.isArray(e) ? e.concat(...r) : e === void 0 ? void 0 : String(e).concat(...r.map((e) => String(e ?? "")));
		}
		let M = $(r, "toString");
		if (M) {
			let e = M.target ? this.resolveValueTarget(n, M.target, t) : void 0;
			return e === void 0 ? void 0 : String(e);
		}
		let N = $(r, "attachMovie");
		if (N) {
			let e = N.target ? this.resolveValueTarget(n, N.target, t) : n;
			return e instanceof Y ? this.attachMovie(e, N.arguments, t) : void 0;
		}
		let ee = $(r, "createEmptyMovieClip");
		if (ee) {
			let e = ee.target ? this.resolveValueTarget(n, ee.target, t) : n;
			return e instanceof Y ? this.createEmptyMovieClip(e, ee.arguments, t) : void 0;
		}
		if (Z(r, "getNextHighestDepth") !== void 0) return this.nextHighestDepth(n);
		if (/\.getNextHighestDepth\s*\(\s*\)$/.test(r)) {
			let e = r.replace(/\.getNextHighestDepth\s*\(\s*\)$/, ""), i = this.resolveValueTarget(n, e, t);
			return i instanceof Y ? this.nextHighestDepth(i) : void 0;
		}
		let te = Kc(r, "+");
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
			let e = Kc(r, "-");
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
			let i = Kc(r, e);
			if (i.length <= 1) continue;
			let a = i.map((e) => Number(this.resolveExpr(e, t, n) ?? 0)), o = a.slice(1).reduce((t, n) => e === "*" ? t * n : e === "/" ? n === 0 ? NaN : t / n : n === 0 ? NaN : t % n, a[0]);
			return Number.isFinite(o) ? o : void 0;
		}
		let ne = Z(r, "eval");
		if (ne !== void 0) {
			let e = this.resolveExpr(ne, t, n);
			return e === void 0 ? void 0 : this.store?.get(String(e)) ?? this.textVars.get(ls(String(e))) ?? void 0;
		}
		if (r.startsWith("\"") && r.endsWith("\"") || r.startsWith("'") && r.endsWith("'")) return r.slice(1, -1);
		if (r === "true") return !0;
		if (r === "false") return !1;
		if (r === "null") return null;
		if (/^-?\d+(\.\d+)?$/.test(r)) return Number(r);
		if (t && r in t) return t[r];
		let re = this.resolveObjectPath(n, r, t);
		if (re !== void 0) return re;
		if (!_c(r)) return /^[A-Za-z_$][\w$.]*$/.test(r) ? this.store?.get(r) ?? this.textVars.get(ls(r)) ?? void 0 : r;
	}
	scopeGet(e, t) {
		return ho(t) && t in e.locals ? e.locals[t] : t in e.props ? e.props[t] : this.store?.get(t);
	}
	scopeSet(e, t, n) {
		ho(t) && (e.locals[t] = n), this.store?.set(t, n);
	}
	scopeFor(e) {
		return {
			get: (t) => this.scopeGet(e, t),
			set: (t, n) => this.scopeSet(e, t, n),
			has: (t) => ho(t) && t in e.locals || (this.store?.has(t) ?? !1)
		};
	}
	evalGuard(e, t) {
		return this.store ? e ? qo(e.replace(/[\w.]*\btimeMarkDone\s*\(([^)]*)\)/g, (e, t) => {
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
			if (t.kind !== "assign" || nc(t.branchCondition, t.target) || !this.branchPasses(t.branchCondition, r, n)) continue;
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
			if (this.trackSoundObject(e.target, e.rawValue), ho(e.target) && r !== void 0 && (t[e.target] = r), r !== void 0 && this.applyPropertyAssignment(n, e.target, r, t) || r !== void 0 && this.assignObjectPath(n, e.target, r, t)) return;
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
			r instanceof Y && typeof a == "string" && jc(o) && this.addEventListener(r, a, o);
			return;
		}
		if (r === "removeEventListener" && i) {
			let r = this.resolveValueTarget(n, i, t), [a, o] = this.parseArgs(e.arguments, t, n);
			r instanceof Y && typeof a == "string" && jc(o) && this.removeEventListener(r, a, o);
			return;
		}
		if (r === "addListener" && i) {
			let r = this.resolveValueTarget(n, i, t), [a] = this.parseArgs(e.arguments, t, n);
			if (Mc(r) && Q(a)) {
				let e = Nc(r);
				e.includes(a) || e.push(a);
			}
			return;
		}
		if (r === "loadClip" && i) {
			let r = this.resolveValueTarget(n, i, t), [a, o] = this.parseArgs(e.arguments, t, n);
			Mc(r) && o instanceof Y && this.loadClipInto(r, String(a ?? ""), o);
			return;
		}
		if (r === "getURL") {
			let [r, i] = this.parseArgs(e.arguments, t, n);
			r !== void 0 && this.options.onGetURL?.(String(r), i === void 0 ? void 0 : String(i));
			return;
		}
		if (r === "dispatchEvent") {
			let r = i ? this.resolveValueTarget(n, i, t) : n, [a] = this.parseArgs(e.arguments, t, n);
			r instanceof Y && Q(a) && this.dispatchEvent(r, a);
			return;
		}
		if (r === "setTextFormat" && i) {
			let r = this.resolveTextTarget(n, i, t), [a] = this.parseArgs(e.arguments, t, n);
			r && Q(a) && Object.assign(this.textOverrideFor(r), ks(a));
			return;
		}
		if (r !== "getNextHighestDepth") {
			if (r === "attachMovie") {
				let r = i ? this.resolveValueTarget(n, i, t) : n;
				r instanceof Y && this.attachMovie(r, e.arguments, t);
				return;
			}
			if (r === "createEmptyMovieClip") {
				let r = i ? this.resolveValueTarget(n, i, t) : n;
				r instanceof Y && this.createEmptyMovieClip(r, e.arguments, t);
				return;
			}
			if (r === "swapDepths" && i) {
				let r = this.resolveValueTarget(n, i, t), [a] = this.parseArgs(e.arguments, t, n);
				r instanceof Y && this.swapDepths(r, a);
				return;
			}
			if (r === "setMask" && i) {
				let r = this.resolveValueTarget(n, i, t), [a] = this.parseArgs(e.arguments, t, n);
				r instanceof Y && (r.maskClip = a instanceof Y ? a : void 0);
				return;
			}
			if (r === "startDrag") {
				let r = i ? this.resolveValueTarget(n, i, t) : n;
				r instanceof Y && this.startDrag(r, e.arguments, t, n);
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
				e instanceof Y && this.removeMovieClip(e);
				return;
			}
			if (r === "unloadMovie" && i) {
				let e = this.resolveValueTarget(n, i, t);
				e instanceof Y && this.unloadMovieClip(e);
				return;
			}
			if (r === "load" && i) {
				let r = this.resolveValueTarget(n, i, t), [a] = this.parseArgs(e.arguments, t, n);
				Q(r) && this.loadXmlObject(r, String(a ?? ""));
				return;
			}
			if (!this.runMovieLoadCall(r, e.arguments, t, n) && !this.runMovieUnloadCall(r, e.arguments, t, n) && !this.runSoundMethod(i, r, e.arguments, t)) {
				if (ps.has(r)) {
					this.options.onWaiter?.(r, this.parseArgs(e.arguments, t, n));
					return;
				}
				if (ms.has(r)) {
					let r = this.parseArgs(e.arguments, t, n)[0];
					r !== void 0 && this.runSoundMarker(i, String(r), e.arguments);
					return;
				}
				if (fs.has(r) && i) {
					let a = this.parseArgs(e.arguments, t, n)[0] ?? 0;
					/^_level\d+/i.test(i) ? this.options.onClipCommand?.(i, r, a) : this.runNamedClipCommand(n, i, r, a);
					return;
				}
				if (i && !/^_level\d+/i.test(i)) {
					let a = this.resolveValueTarget(n, i, t);
					if (a instanceof Y && a !== n) {
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
			case "attachSound": return uc("attachSound", n);
			case "playVO": return uc("playVO", n);
			case "markSnd":
			case "markSndSegment": return uc("markSndSegment", n);
			case "stop": return e.target ? uc("stopSound", ls(e.target)) : void 0;
			default: return;
		}
	}
	runMovieLoadCall(e, t, n, r = this.root) {
		if (e !== "loadMovieNum" && e !== "loadMovie") return !1;
		let i = this.parseArgs(t, n, r), a = i[0] === void 0 ? "" : String(i[0]);
		return a && this.options.onNavigate?.({
			command: e,
			swf: a,
			level: e === "loadMovieNum" ? ic(i[1], rc(t, 1)) : void 0,
			executionContext: "function"
		}), !0;
	}
	runMovieUnloadCall(e, t, n, r = this.root) {
		if (e !== "unloadMovieNum" && e !== "unloadMovie") return !1;
		let i = this.parseArgs(t, n, r);
		return this.options.onNavigate?.({
			command: e,
			level: ic(i[0], rc(t, 0)),
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
				value: hc(typeof t == "boolean" ? Number(t) : t),
				executionContext: "function"
			}), !0;
		}
		return t === "getVolume";
	}
	soundTargetKey(e) {
		return ls(e);
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
		let e = ye(this.timeline.control);
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
				let e = mo(t.arguments);
				(t.functionName === "markSnd" || t.functionName === "markSndSegment") && n(fc(e[0])), t.functionName === "playVO" && n(fc(e[2]));
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
				Ts(e.target) && (n.playing = !1);
				break;
			case "play":
				Ts(e.target) && (n.playing = !0);
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
					let i = ls(e.target);
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
			cc(a, e.soundAction) && o && (i = !0);
		}
		e.soundAction && !i && this.runSoundMetadataFallback(e.soundAction);
	}
	runFunctionCall(e, t, n, r) {
		let i = e.target ?? "self", a = e.functionName;
		if (this.runSoundMethod(i, a, e.arguments, n)) return !0;
		if (ps.has(a)) return this.options.onWaiter?.(a, this.parseArgs(e.arguments, n)), !0;
		if (ms.has(a)) {
			let t = this.parseArgs(e.arguments, n)[0];
			if (t !== void 0) return this.runSoundMarker(i, String(t), e.arguments), !0;
		}
		if (fs.has(a) && i !== "self" && i !== "this" && i !== "_root") {
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
		return this.functions.has(a) && Js(i, a) ? this.callFunction(a, e.arguments, n) : !1;
	}
	runAppClipMethod(e, t, n) {
		let r = e.props.__appMethodDispatcher;
		return typeof r == "function" ? !!r(t, n) : !1;
	}
	methodFunctionForClip(e, t) {
		let n = e.scriptKey ?? this.clipSourceKey(this.getAsset(e.characterId), e.name);
		if (!n) return;
		let r = Ys(n, t), i = this.methodFunctions.get(r);
		return i ? {
			key: r,
			def: i
		} : void 0;
	}
	constructorFunctionForClip(e) {
		let t = e.scriptKey ?? this.clipSourceKey(this.getAsset(e.characterId), e.name);
		if (t) {
			for (let [e, n] of this.methodFunctions) if (e.startsWith(`${t}:`) && Qs(e.slice(t.length + 1)) === t) return {
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
		let r = this.scopeFor(e), i = (e) => e === "else", a = n.actions.some((e) => e.functionBranchCondition && !i(e.functionBranchCondition) && qo(e.functionBranchCondition, r)), o = n.actions.map((e) => {
			let t = e.functionBranchCondition;
			return i(t) ? !a : !t || qo(t, r);
		});
		for (let t = 0; t < n.actions.length; t += 1) this.store && !o[t] || this.runClipAction(e, n.actions[t]);
		return this.render(), !0;
	}
	runClipAction(e, t) {
		switch (t.command) {
			case "stop":
				Ts(t.target) && (e.playing = !1);
				break;
			case "play":
				Ts(t.target) && (e.playing = !0);
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
			sc(e.name, t) && n.push(e);
			for (let t of e.childClips.values()) {
				let e = r(t);
				if (e) return e;
			}
			return null;
		};
		return r(e) || (n.length === 1 ? n[0] : null);
	}
	buildRoot(e) {
		let t = new Y(vs, "_root", null);
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
		e.currentFrame = _o(t, 0, Math.max(0, this.frameCountFor(e) - 1)), this.reconcile(e), e.enteredFrame !== e.currentFrame && (e.enteredFrame = e.currentFrame, this.stopFramesFor(e).has(e.currentFrame) && (e.playing = !1), n < ys && this.runScript(e, n));
	}
	reconcile(e) {
		let t = this.framesFor(e);
		if (!t) return;
		let n = this.instancesForFrame(e, t[e.currentFrame]), r = /* @__PURE__ */ new Set();
		for (let t of n) {
			let n = this.getAsset(t.characterId);
			if (!n || !yo(n)) continue;
			r.add(t.depth), t.name && e.depthNames.set(t.depth, t.name);
			let i = t.name || e.depthNames.get(t.depth) || "", a = e.childClips.get(t.depth);
			if (!a || a.characterId !== t.characterId) {
				let r = new Y(t.characterId, i, e);
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
		let t = Array.from(this.pendingClipCommands.keys()).filter((t) => sc(e, t));
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
					Ts(a.target) && (e.playing = !1);
					break;
				case "play":
					Ts(a.target) && (e.playing = !0);
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
						if (t <= xs && i) {
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
						let n = ls(a.target);
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
				r = vo(r, t) ?? this.findClipByName(r, t);
			}
		}
		return r;
	}
	applyPropertyAssignment(e, t, n, r) {
		let i = Ds(t);
		if (!i) return !1;
		if (i.property === "text" || i.property === "htmlText") {
			let t = this.resolveTextTarget(e, i.owner, r);
			if (!t) return !1;
			let a = this.textOverrideFor(t);
			return a.text = String(n), a.html = i.property === "htmlText", t.owner && t.name && t.owner.mutatedLeaves.add(t.name), !0;
		}
		let a = this.resolveValueTarget(e, i.owner, r);
		if (a instanceof Y) return js(a, i.property, n);
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
					i = e instanceof Y ? e : null;
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
				i = vo(i, t) ?? this.findClipByName(i, t);
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
		if (o instanceof Y && this.findLeafChild(o, i)) return {
			owner: o,
			name: i,
			props: this.leafDisplayProps(o, i)
		};
	}
	attachMovie(e, t, n) {
		let [r, i, a] = this.parseArgs(t, n, e), o = String(r ?? "").trim(), s = this.linkageAssetIds.get(pc(o));
		if (!s || !this.getAsset(s)) return;
		let c = Number(a ?? this.nextHighestDepth(e));
		if (!Number.isFinite(c)) return;
		let l = String(i ?? `instance${c}`), u = {
			depth: c,
			characterId: s,
			placedFrame: e.currentFrame,
			matrix: { ...as },
			opacity: 1,
			name: l
		};
		e.dynamicInstances.set(c, u), this.hasAnyDynamicInstances = !0, e.displayListMutated = !0, e.depthNames.set(c, l);
		let d = new Y(s, l, e);
		return d.scriptKey = this.clipSourceKey(this.getAsset(s), l), d.placedX = u.matrix.tx, d.placedY = u.matrix.ty, e.childClips.set(Us(c), d), this.enterFrame(d, 0, 0), this.runClipConstructor(d), d;
	}
	createEmptyMovieClip(e, t, n) {
		let [r, i] = this.parseArgs(t, n, e), a = Number(i ?? this.nextHighestDepth(e));
		if (!Number.isFinite(a)) return;
		let o = String(r ?? `instance${a}`);
		e.dynamicInstances.set(a, {
			depth: a,
			characterId: 0,
			placedFrame: e.currentFrame,
			matrix: { ...as },
			opacity: 1,
			name: o
		}), this.hasAnyDynamicInstances = !0, e.displayListMutated = !0, e.depthNames.set(a, o);
		let s = new Y(0, o, e);
		return s.placedX = 0, s.placedY = 0, e.childClips.set(Us(a), s), s;
	}
	clipSourceKey(e, t) {
		for (let t of e?.linkageNames ?? []) {
			let e = this.linkageClassKeys.get(pc(t));
			if (e) return e;
		}
		return Zs(e, t);
	}
	constructObject(e, t, n) {
		let r = e.match(/^new\s+([\w$.]+)\s*\((.*)\)$/s);
		if (!r) return;
		let i = r[1], a = i.split(".").pop() ?? i, o = Qs(a);
		if (!o) return;
		let s = this.methodFunctions.get(Ys(o, a)) ?? this.functions.get(a);
		if (!s) return { __avm1Class: i };
		let c = new Y(vs, a, null);
		return c.scriptKey = o, this.callFunctionDef(Ys(o, a), s, r[2], t, c, n), c;
	}
	loadXmlObject(e, t) {
		if (!t || typeof fetch > "u" || typeof DOMParser > "u") return;
		let n = t.startsWith("/") ? t : `/${t}`;
		fetch(n).then((e) => e.ok ? e.text() : "").then((t) => {
			if (!t) return;
			let n = new DOMParser().parseFromString(t, "application/xml");
			e.document = n, e.documentElement = n.documentElement;
			let r = e.onLoad;
			if (jc(r) && r.target instanceof Y) {
				if (!Hc(e, r.target)) return;
				let t = this.methodFunctionForClip(r.target, r.method);
				t && this.callFunctionDef(t.key, t.def, "true", void 0, r.target);
			}
			this.render();
		}).catch(() => {});
	}
	loadClipInto(e, t, n) {
		let r = Pc(t);
		if (r) {
			if (this.dispatchMovieClipLoader(e, "onLoadStart", n), Ic(r) && this.options.loadTimeline) {
				this.options.loadTimeline(r).then((t) => {
					if (!t) {
						this.fetchLoadedClip(e, r, n);
						return;
					}
					n.loadedTimeline = t, n.loadedFrame = _o(t.entryFrame ?? 0, 0, Math.max(0, (t.frameCount ?? 1) - 1)), n.loadedPlaying = !0, n.props.__loadedSrc = r, n.props.__loadedWidth = t.dimensions.width, n.props.__loadedHeight = t.dimensions.height, this.dispatchMovieClipLoader(e, "onLoadComplete", n), this.dispatchMovieClipLoader(e, "onLoadInit", n), this.render();
				}).catch(() => this.fetchLoadedClip(e, r, n));
				return;
			}
			this.fetchLoadedClip(e, r, n);
		}
	}
	fetchLoadedClip(e, t, n) {
		if (Fc(t) && typeof Image < "u") {
			let r = new Image();
			r.onload = () => {
				n.props.__loadedSrc = t, n.props.__loadedWidth = r.naturalWidth || r.width || 0, n.props.__loadedHeight = r.naturalHeight || r.height || 0, this.dispatchMovieClipLoader(e, "onLoadComplete", n), this.dispatchMovieClipLoader(e, "onLoadInit", n), this.render();
			}, r.onerror = () => {
				this.dispatchMovieClipLoader(e, "onLoadError", n);
			}, r.src = me(t);
			return;
		}
		if (typeof fetch > "u") {
			this.dispatchMovieClipLoader(e, "onLoadError", n);
			return;
		}
		fetch(me(t), { method: "GET" }).then((r) => {
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
		for (let r of Nc(e)) {
			let e = r[t];
			if (jc(e) && e.target instanceof Y) {
				let t = this.methodFunctionForClip(e.target, e.method);
				t && this.callFunctionDef(t.key, t.def, "__loadedClip", { __loadedClip: n }, e.target);
			}
		}
	}
	createTweenObject(e, t, n) {
		let [r, i, , a, o, s, c] = this.parseArgs(e, t, n), l = typeof i == "string" ? fo(i) : "", u = {
			__avm1Type: "Tween",
			target: r,
			property: l,
			begin: a,
			finish: o,
			duration: s
		}, d = Ps(s, c, this.timeline.fps || 30), f = () => {
			r instanceof Y && l && js(r, l, o);
			let e = u.onMotionFinished;
			if (jc(e) && e.target instanceof Y) {
				let t = this.methodFunctionForClip(e.target, e.method);
				t && this.callFunctionDef(t.key, t.def, "__tween", { __tween: u }, e.target);
			}
			this.render();
		}, p = Number(a), m = Number(o);
		if (!(r instanceof Y) || !l || !Number.isFinite(p) || !Number.isFinite(m) || d <= 16) {
			let e = setTimeout(() => {
				this.runtimeTimers.delete(e), f();
			}, d);
			return this.runtimeTimers.add(e), u;
		}
		js(r, l, p);
		let h = Date.now(), g = setInterval(() => {
			let e = Math.min(1, (Date.now() - h) / d);
			js(r, l, p + (m - p) * e), e >= 1 ? (this.runtimeTimers.delete(g), clearInterval(g), f()) : this.render();
		}, 33);
		return this.runtimeTimers.add(g), u;
	}
	createInterval(e, t, n) {
		let [r, i, a] = this.parseArgs(e, t, n);
		if (!(r instanceof Y)) return;
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
		if (!(r instanceof Y)) return;
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
				let i = Gs(n);
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
		if (t instanceof Y) {
			let i = this.depthOfChild(n, t);
			if (i === void 0) return;
			e.depthOverride = qs(n, i), t.depthOverride = qs(n, r);
			return;
		}
		let i = Number(t);
		if (!Number.isFinite(i)) return;
		let a = Gs(r), o = n.dynamicInstances.get(a);
		if (o && n.childClips.get(r) === e) {
			n.dynamicInstances.delete(a), n.childClips.delete(r), o.depth = i, n.dynamicInstances.set(i, o), n.childClips.set(Us(i), e), n.displayListMutated = !0, e.depthOverride = void 0;
			return;
		}
		e.depthOverride = i >= 0 ? Us(i) : i, n.displayListMutated = !0;
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
		let r = gc(t);
		if (!r.length) return;
		let i, [a] = r;
		i = a === "this" || a === "self" ? e : a === "_root" || a === "_level0" || a === "root" ? this.root : n && a in n ? n[a] : a in e.props ? e.props[a] : this.store?.get(a);
		for (let t of r.slice(1)) if (i instanceof Y) i = this.resolveClipMember(i, t);
		else if (Array.isArray(i)) i = t === "length" ? i.length : i[Number(this.resolveExpr(t, n, e) ?? t)];
		else if (Lc(i)) i = Bc(i, t);
		else if (Q(i)) i = i[t];
		else return;
		return mc(i) ? i : void 0;
	}
	assignObjectPath(e, t, n, r) {
		let i = gc(t ?? "");
		if (i.length < 2) return !1;
		let a = i[i.length - 1], o = i.slice(0, -1).join("."), s = this.resolveValueTarget(e, o, r);
		if (s instanceof Y) {
			let t = this.methodFunctionForClip(s, `set ${a}`);
			return t && this.callFunctionDef(t.key, t.def, "__setterValue", { __setterValue: n }, s, e), s.props[a] = n, Vc(n, s, a), !0;
		}
		return Q(s) ? (s[a] = n, !0) : !1;
	}
	resolveClipMember(e, t) {
		let n = Dc(e, t, this.getAsset(e.characterId));
		return n === void 0 ? t in e.props ? e.props[t] : this.findClipByName(e, t) || this.namedLeafObject(e, t) : n;
	}
	namedLeafObject(e, t) {
		let n = this.framesFor(e)?.[e.currentFrame];
		for (let r of this.instancesForFrame(e, n)) {
			if (r.name !== t) continue;
			let n = this.getAsset(r.characterId);
			if (!n) continue;
			let i = n.kind === "text" ? this.resolveTextField(n.id, n, e, t) : void 0, a = this.leafDisplayProps(e, t);
			return a._width === void 0 && (a._width = i ? kc(i.text ?? "", i.fontHeight, n.text?.width ?? n.origin.width ?? 0) : n.text?.width ?? n.origin.width ?? 0), a._height === void 0 && (a._height = i ? Math.max(i.height ?? 0, i.lineHeight ?? i.fontHeight + (i.leading ?? 0)) : n.text?.height ?? n.origin.height ?? 0), a._x === void 0 && (a._x = r.matrix.tx), a._y === void 0 && (a._y = r.matrix.ty), a;
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
		for (let i of mo(e.slice(1, -1))) {
			let e = i.indexOf(":");
			if (e < 0) continue;
			let a = i.slice(0, e).trim().replace(/^["']|["']$/g, "");
			a && (r[a] = this.resolveExpr(i.slice(e + 1), t, n));
		}
		return r;
	}
	addEventListener(e, t, n) {
		let r = Uc(e), i = r[t] ?? (r[t] = []);
		i.some((e) => e.target === n.target && e.method === n.method) || i.push(n);
	}
	removeEventListener(e, t, n) {
		let r = Uc(e), i = r[t];
		i?.length && (r[t] = i.filter((e) => e.target !== n.target || e.method !== n.method));
	}
	dispatchEvent(e, t) {
		let n = String(t.type ?? "");
		if (n) for (let r of Uc(e)[n] ?? []) {
			if (!(r.target instanceof Y)) continue;
			let e = this.methodFunctionForClip(r.target, r.method);
			e && this.callFunctionDef(e.key, e.def, "__event", { __event: t }, r.target);
		}
	}
	dispatchMovieClipPointerEvent(e, t) {
		let n = Wc(t), r = Gc(t), i = {
			target: e,
			type: n
		}, a = e.props.__appPointerDispatcher;
		if (typeof a == "function" && a(n), r) {
			let t = e.props[r];
			if (jc(t) && t.target instanceof Y) {
				let e = this.methodFunctionForClip(t.target, t.method);
				e && this.callFunctionDef(e.key, e.def, "__event", { __event: i }, t.target);
			}
		}
		this.dispatchEvent(e, i);
	}
	runAssignedEnterFrame(e) {
		let t = e.props.onEnterFrame;
		if (jc(t) && t.target instanceof Y) {
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
		let r = Sc(e);
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
			let i = Kc(e, r);
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
		return Ms(this.resolveExpr(e, t, n) ?? !1);
	}
	evalRuntimeCondition(e, t, n) {
		let r = e.trim();
		if (!r || r === "else" || r === "true") return !0;
		if (r === "false") return !1;
		for (; r.startsWith("(") && Xc(r) === r.length - 1;) r = r.slice(1, -1).trim();
		let i = Kc(r, "||");
		if (i.length > 1) return i.some((e) => this.evalRuntimeCondition(e, t, n));
		let a = Kc(r, "&&");
		if (a.length > 1) return a.every((e) => this.evalRuntimeCondition(e, t, n));
		if (r.startsWith("!")) return !this.evalRuntimeCondition(r.slice(1), t, n);
		let o = qc(r, "instanceof");
		if (o.length === 2) return Yc(this.resolveExpr(o[0], t, n), o[1]);
		for (let e of [
			"<=",
			">=",
			"==",
			"!=",
			"<",
			">"
		]) {
			let i = Kc(r, e);
			if (i.length === 2) return Ns(this.resolveExpr(i[0], t, n), this.resolveExpr(i[1], t, n), e);
		}
		return Ms(this.resolveExpr(r, t, n) ?? !1);
	}
	runRuntimeStatements(e, t, n) {
		for (let r of Tc(e)) {
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
		let a = Cc(r);
		if (a) {
			let e = this.evalRuntimeCondition(a.condition, t, n) ? a.thenBody : a.elseBody;
			return (e === void 0 ? void 0 : this.runRuntimeStatements(e, t, n)) || (a.tail === void 0 ? void 0 : this.runRuntimeStatements(a.tail, t, n));
		}
		let o = Sc(r);
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
		if (xc(r)) {
			this.resolveExpr(r, t, n);
			return;
		}
		let l = Ec(r);
		l && this.runBodyCall({
			kind: "call",
			target: l.target,
			functionName: l.name,
			arguments: l.arguments
		}, t, n);
	}
	assignRuntimeValue(e, t, n, r) {
		t !== void 0 && (ho(e) && (n[e] = t), !this.applyPropertyAssignment(r, e, t, n) && (this.assignObjectPath(r, e, t, n) || this.scopeSet(r, e, t)));
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
			return _o(t.currentFrame + e, 0, Math.max(0, this.frameCountFor(t) - 1));
		}
		return -1;
	}
	framesFor(e) {
		return e.characterId === vs ? this.rootFrames : this.assets[String(e.characterId)]?.timeline ?? null;
	}
	frameCountFor(e) {
		if (e.characterId === vs) return Math.max(1, this.rootFrames.length);
		let t = this.assets[String(e.characterId)];
		return Math.max(1, t?.timeline?.length ?? t?.frames?.length ?? 1);
	}
	stopFramesFor(e) {
		if (e.characterId === vs) return this.rootStop;
		let t = this.spriteStop.get(e.characterId);
		return t || (t = new Set(this.timeline.control?.spriteStopFrames?.[String(e.characterId)] ?? []), this.spriteStop.set(e.characterId, t)), t;
	}
	actionsFor(e) {
		return e.characterId === vs ? this.rootActions.get(e.currentFrame) ?? [] : this.spriteActions.get(`${e.characterId}:${e.currentFrame}`) ?? [];
	}
	instancesForFrame(e, t) {
		let n = (t, n) => Ks(e, t) - Ks(e, n), r = [...e.dynamicInstances.values()].map((e) => ({
			...e,
			depth: Us(e.depth)
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
		this.clipByPath = /* @__PURE__ */ new Map(), this.clipByPath.set("0", this.root), this.flatten(this.root, as, 1, void 0, "0", { n: 0 }, e);
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
		return this.dataApp && t?.alpha !== void 0 ? Fs(t) : e * Fs(t);
	}
	flatten(e, t, n, r, i, a, o) {
		let s = this.framesFor(e)?.[e.currentFrame], c = this.instancesForFrame(e, s), l = hc(e.props.__loadedSrc);
		if (typeof l == "string" && Fc(l) && o.push({
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
			opacity: n * Fs(e),
			colorTransform: r
		}), e.loadedTimeline) {
			let s = _o(e.loadedFrame, 0, Math.max(0, (e.loadedTimeline.frameCount ?? 1) - 1)), c = e.loadedTimeline.frameSvgs?.[s] ?? (e.loadedTimeline.frameSvgsOmitted ? "" : `generated/${e.loadedTimeline.scene}/frames/${s + 1}.svg`);
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
				opacity: n * Fs(e),
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
					origin: Ss,
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
			let u = os(t, Rs(s.matrix, l, c?.origin)), m = n * this.placedAlpha(s.opacity, l), h = So(r, s.colorTransform), g = `${i}/${s.depth}`;
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
					let e = bo(c, l);
					e && _.group.items.push({
						characterId: c.id,
						src: e,
						origin: c.origin,
						matrix: u,
						opacity: m,
						colorTransform: h,
						...xo(s)
					});
				}
				continue;
			}
			if (c.kind === "sprite" && c.frames?.length && !c.overflowsBounds && !(this.hasAnyDynamicInstances && l && this.subtreeHasDynamicInstances(l)) && !(this.hasAnyDynamicInstances && l && this.subtreeHasHiddenChild(l)) && !(this.hasAnyDynamicInstances && l && this.subtreeHasTransformedChild(l))) {
				let e = l ? _o(l.currentFrame, 0, c.frames.length - 1) : 0;
				o.push(Co(g, a.n++, c, c.frames[e], u, m, s, l?.currentFrame, h)), l && c.timeline?.length && this.collectButtons(l, u, h, g, a, o, m), l && this.clipHasPointerEvents(l) && o.push(this.movieClipHitNode(`${g}#hit`, a.n++, c, u, s, g, h));
				continue;
			}
			if (c.kind === "sprite" && l && l.characterId === c.id && (c.timeline?.length || this.hasAnyDynamicInstances && l.dynamicInstances.size)) {
				this.clipByPath.set(g, l), this.clipHasPointerEvents(l) && o.push(this.movieClipHitNode(`${g}#hit`, a.n++, c, u, s, g, h)), this.flatten(l, u, m, h, g, a, o);
				continue;
			}
			if (c.kind === "button") {
				o.push(wo(g, a.n++, c, u, s, i, !0, m, this.buttonVisualStates.get(g), h)), this.collectButtonText(c, u, h, g, a, o, s);
				continue;
			}
			let v = s.name ? e.leafProps.get(s.name) : void 0;
			v?._visible === !1 || v?._visible === 0 || o.push(this.leafNode(g, a.n++, c, c.src ?? "", zs(t, s.matrix, c, v), m * Is(v), s, h, e, v));
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
			let u = os(t, Rs(s.matrix, l, c.origin)), d = o * this.placedAlpha(s.opacity, l), f = So(n, s.colorTransform), p = `${r}/${s.depth}`;
			if (c.kind === "button") a.push(wo(p, i.n++, c, u, s, r, !1, d, this.buttonVisualStates.get(p), f)), this.collectButtonText(c, u, f, p, i, a, s, d);
			else if (c.kind === "text") {
				let n = this.resolveTextField(c.id, c, e, s.name);
				if (n?.normalizedVariableName ? this.textVars.has(n.normalizedVariableName) : n?.text && String(n.text).trim()) {
					let n = s.name ? e.leafProps.get(s.name) : void 0;
					if (n?._visible === !1 || n?._visible === 0) continue;
					a.push(this.leafNode(p, i.n++, c, c.src ?? "", zs(t, s.matrix, c, n), d * Is(n), s, f, e, n));
				}
			} else if (c.kind === "sprite" && l) {
				if (Ws(s.depth) && c.frames?.length) {
					let e = _o(l.currentFrame, 0, c.frames.length - 1);
					a.push(Co(p, i.n++, c, c.frames[e], u, d, s, l.currentFrame, f));
				}
				this.clipHasPointerEvents(l) && a.push(this.movieClipHitNode(`${p}#hit`, i.n++, c, u, s, p, f)), this.collectButtons(l, u, f, p, i, a, d);
			}
		}
		this.collectLatentButtons(e, t, n, r, i, a, u, o);
	}
	collectLatentButtons(e, t, n, r, i, a, o, s = 1) {
		if (!(e.characterId === vs || e.playing)) for (let c of this.latentButtonPlacements(e)) {
			if (o.has(c.depth)) continue;
			let e = this.getAsset(c.characterId);
			if (!e || e.kind !== "button") continue;
			let l = os(t, c.matrix), u = So(n, c.colorTransform), d = `${r}/${c.depth}`;
			a.push(wo(d, i.n++, e, l, c, r, !1, s, this.buttonVisualStates.get(d), u));
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
		let o = bo(e, t);
		if (o) return {
			characterId: e.id,
			src: o,
			origin: e.origin,
			matrix: n,
			opacity: 1,
			colorTransform: r,
			...xo(i)
		};
		if (e.kind !== "sprite" || a > 6) return;
		let s = t ? this.framesFor(t) : e.timeline ?? null, c = t ? t.currentFrame : 0, l = s?.[c] ?? s?.[0], u = t ? this.instancesForFrame(t, l) : l?.instances ?? [];
		for (let e of u) {
			let i = this.getAsset(e.characterId);
			if (!i) continue;
			let o = t?.childClips.get(e.depth), s = os(n, Rs(e.matrix, o, i.origin)), c = this.resolveMaskVisual(i, o, s, r, e, a + 1);
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
		let d = os(n, Rs(l.matrix, c)), f = this.resolveMaskVisual(u, c, d, void 0, l);
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
			origin: Ss,
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
			...Os(e)
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
			return !!(n && (n.command === "gotoAndPlay" || n.command === "gotoAndStop") && Ts(n.target));
		}) : !1;
	}
	collectButtonText(e, t, n, r, i, a, o, s = o.opacity) {
		for (let c of e.textFields ?? []) {
			let e = this.getAsset(c.id);
			if (!e) continue;
			let l = this.resolveTextField(c.id, e);
			if (!l?.normalizedVariableName || !this.textVars.has(l.normalizedVariableName)) continue;
			let u = os(t, c.matrix);
			a.push(this.leafNode(`${r}/txt:${c.id}`, i.n++, e, e.src ?? "", u, s, o, n));
		}
	}
	clipHasPointerEvents(e) {
		let t = e.props.__eventListeners;
		if (Q(t)) {
			for (let e of [
				"release",
				"releaseoutside",
				"rollover",
				"rollout",
				"press"
			]) if (Array.isArray(t[e]) && t[e].length) return !0;
		}
		return e.props.__appPointerEvents || typeof e.props.__appPointerDispatcher == "function" ? !0 : jc(e.props.onRelease) || jc(e.props.onReleaseOutside) || jc(e.props.onRollOver) || jc(e.props.onRollOut) || jc(e.props.onPress);
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
			...xo(i),
			buttonOwnerPath: a
		};
	}
	leafNode(e, t, n, r, i, a, o, s = o.colorTransform, c, l) {
		let u = Bs(n, l), d = n.kind === "text" ? this.resolveTextField(n.id, n, c, o.name) : void 0;
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
			...xo(o),
			clipDepth: o.clipDepth,
			text: d
		};
	}
	autoSizeTextLayout(e, t, n) {
		let r = n?.autoSize === void 0 ? t.autoSize ? "left" : void 0 : n.autoSize;
		if (r == null) return;
		let i = typeof r == "string" ? r.toLowerCase() : "";
		if (!(i ? i !== "none" : Ms(r)) || t.wordWrap || t.multiline || t.staticLines?.length) return;
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
				align: oc(t, o.align, !!o.html)
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
			staticLines: ws(t.staticLines, a),
			align: r === "variable" ? oc(a, t.align, !!t.html) : t.align
		};
	}
	primeAmbientSound() {
		if (!this.options.onSound) return;
		let e;
		for (let t = 0; t < this.root.currentFrame; t += 1) for (let n of this.rootActions.get(t) ?? []) n.command === "attachSound" && n.soundRole === "music" && (e = n);
		e && this.options.onSound(e);
	}
};
function ws(e, t) {
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
function Ts(e) {
	return !e || e === "self" || e === "this" || e === "_root" || e === "_level0" || e === "root";
}
function Es(e, t) {
	return t === "" && hs.test(e);
}
function Ds(e) {
	let t = e?.trim();
	if (!t) return null;
	let n = t.split(".");
	if (n.length < 2) return null;
	let r = fo(n[n.length - 1]);
	return r ? {
		owner: n.slice(0, -1).join(".") || "this",
		property: r
	} : null;
}
function Os(e) {
	return {
		visible: e.visible,
		blendMode: e.blendMode,
		filters: e.filters,
		cacheAsBitmap: e.cacheAsBitmap,
		className: e.className,
		clipActions: e.clipActions
	};
}
function ks(e) {
	let t = {}, n = As(e.color);
	n && (t.color = n);
	let r = Number(e.leading);
	Number.isFinite(r) && (t.leading = r);
	let i = Number(e.size);
	Number.isFinite(i) && i > 0 && (t.fontHeight = i);
	let a = typeof e.align == "string" ? e.align.toLowerCase() : "";
	return (a === "left" || a === "right" || a === "center" || a === "justify") && (t.align = a), t;
}
function As(e) {
	if (typeof e == "string" && /^#[0-9a-f]{6}$/i.test(e)) return e;
	let t = Number(e);
	if (Number.isFinite(t)) return `#${Math.max(0, Math.min(16777215, Math.round(t))).toString(16).padStart(6, "0")}`;
}
function js(e, t, n) {
	switch (t) {
		case "_name": return e.name = String(n ?? ""), !0;
		case "_visible": return e.visible = Ms(n), !0;
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
function Ms(e) {
	return e === null ? !1 : typeof e == "boolean" ? e : typeof e == "number" ? e !== 0 && !Number.isNaN(e) : typeof e == "string" ? e !== "" && e !== "0" && e.toLowerCase() !== "false" : !0;
}
function Ns(e, t, n) {
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
function Ps(e, t, n) {
	let r = Number(e);
	return !Number.isFinite(r) || r <= 0 ? 0 : Ms(t ?? !1) ? r * 1e3 : 1e3 / Math.max(1, n) * r;
}
function Fs(e) {
	return e?.alpha === void 0 ? 1 : _o(e.alpha / 100, 0, 1);
}
function Is(e) {
	let t = Number(e?._alpha);
	return Number.isFinite(t) ? _o(t / 100, 0, 1) : 1;
}
var Ls = 2;
function Rs(e, t, n) {
	if (!t || t.x === void 0 && t.y === void 0 && t.rotation === void 0 && t.xscale === void 0 && t.yscale === void 0 && t.width === void 0 && t.height === void 0) return e;
	let r = { ...e }, i = t.xscale === void 0 ? 1 : t.xscale / 100, a = t.yscale === void 0 ? 1 : t.yscale / 100;
	if (t.xscale === void 0 && t.width !== void 0 && n && n.width > 0 && (i = (t.width + Ls) / n.width), t.yscale === void 0 && t.height !== void 0 && n && n.height > 0 && (a = t.height / n.height), i !== 1 && (r.a *= i, r.b *= i), a !== 1 && (r.c *= a, r.d *= a), t.x !== void 0 && (r.tx = t.x), t.y !== void 0 && (r.ty = t.y), t.rotation !== void 0) {
		let n = t.rotation * Math.PI / 180, i = Math.cos(n), a = Math.sin(n), o = Math.hypot(e.a, e.b) || 1, s = Math.hypot(e.c, e.d) || 1;
		r.a = i * o, r.b = a * o, r.c = -a * s, r.d = i * s;
	}
	return r;
}
function zs(e, t, n, r) {
	if (!r) return os(e, t);
	let i = { ...t }, a = Number(r._xscale) / 100, o = Number(r._yscale) / 100, s = Number(r._width), c = Number(r._height), l = Math.max(1, n.text?.width ?? n.origin.width ?? Math.hypot(t.a, t.b)), u = Math.max(1, n.text?.height ?? n.origin.height ?? Math.hypot(t.c, t.d)), d = Number.isFinite(a) ? a : Number.isFinite(s) ? s / l : 1, f = Number.isFinite(o) ? o : Number.isFinite(c) ? c / u : 1;
	d !== 1 && (i.a *= d, i.b *= d), f !== 1 && (i.c *= f, i.d *= f);
	let p = Number(r._x), m = Number(r._y);
	return Number.isFinite(p) && (i.tx = p), Number.isFinite(m) && (i.ty = m), os(e, i);
}
function Bs(e, t) {
	let n = Number(t?._width), r = Number(t?._height);
	return !Number.isFinite(n) && !Number.isFinite(r) ? e.origin : {
		...e.origin,
		width: Number.isFinite(n) ? n : e.origin.width,
		height: Number.isFinite(r) ? r : e.origin.height
	};
}
function Vs(e, t) {
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
var Hs = 1 << 20;
function Us(e) {
	return e + Hs;
}
function Ws(e) {
	return e >= Hs;
}
function Gs(e) {
	return Ws(e) ? e - Hs : e;
}
function Ks(e, t) {
	return qs(e, t.depth);
}
function qs(e, t) {
	return e.childClips.get(t)?.depthOverride ?? t;
}
function Js(e, t) {
	return e.includes(".") ? t === "main" || t === "init" || /^[A-Z]/.test(t) : !1;
}
function Ys(e, t) {
	return `${e}:${t}`;
}
function Xs(e) {
	let t = e?.split("/").pop()?.replace(/\.as$/i, "");
	return Qs(t);
}
function Zs(e, t) {
	let n = (e?.frames?.[0])?.match(/\/DefineSprite_\d+_([^/]+)\//)?.[1];
	return Qs(n) ?? Qs(t);
}
function Qs(e) {
	return e?.replace(/%20/g, " ").replace(/[^A-Za-z0-9]+/g, "").toLowerCase() || void 0;
}
function $s(e) {
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
function ec(e, t) {
	let n = new Set((e.ownerSpriteIds ?? []).map(String));
	return (t.ownerSpriteIds ?? []).some((e) => n.has(String(e)));
}
function tc(e, t) {
	return !(!e || !t || e.command !== t.command || (e.target ?? "self") !== (t.target ?? "self") || (e.label ?? "") !== (t.label ?? "") || (e.frame ?? "") !== (t.frame ?? "") || (e.frameExpression ?? "") !== (t.frameExpression ?? ""));
}
function nc(e, t) {
	if (!e) return !1;
	let n = ls(t), r = new Set([
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
function rc(e, t) {
	return mo(e)[t]?.trim();
}
function ic(e, t) {
	return ac(e) ?? ac(t);
}
function ac(e) {
	if (e == null) return;
	let t = String(e).replace(/^["']|["']$/g, "").trim(), n = /^_level(\d+)$/i.exec(t), r = Number(n?.[1] ?? t);
	return Number.isFinite(r) ? r : void 0;
}
function oc(e, t, n) {
	if (!n) return t;
	let r = e.match(/<p\b[^>]*\balign\s*=\s*["']?(left|center|right|justify)\b/i) ?? e.match(/\btext-align\s*:\s*(left|center|right|justify)\b/i);
	return r?.[1] ? r[1].toLowerCase() : "left";
}
function sc(e, t) {
	return !e || !t || e === t || !e.startsWith(t) ? !1 : /^[A-Z0-9_$]/.test(e.slice(t.length));
}
function cc(e, t) {
	return t ? t.command === "markSndSegment" ? e.functionName === "markSnd" || e.functionName === "markSndSegment" : e.functionName === t.command : !1;
}
function lc(e) {
	switch (e.command) {
		case "attachSound": return uc("attachSound", e.sound ?? e.resolvedSound);
		case "playVO": return uc("playVO", e.sound ?? e.resolvedSound);
		case "markSndSegment": return uc("markSndSegment", e.segment ?? e.sound ?? e.resolvedSound);
		case "stopSound": return e.target ? uc("stopSound", ls(e.target)) : void 0;
		default: return;
	}
}
function uc(e, t) {
	if (!(t == null || t === "")) return `${e}:${String(t)}`;
}
function dc(e) {
	return (e?.trim().match(/^new\s+([\w$.]+)\s*\(/))?.[1]?.split(".").pop();
}
function fc(e) {
	let t = e?.trim();
	if (t && (t.startsWith("\"") && t.endsWith("\"") || t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
}
function Z(e, t) {
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
function pc(e) {
	return e.trim().toLowerCase();
}
function Q(e) {
	return typeof e == "object" && !!e && !(e instanceof Y);
}
function mc(e) {
	return e === null || typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "object" && !!e;
}
function hc(e) {
	return typeof e == "string" || typeof e == "number" || typeof e == "boolean" ? e : void 0;
}
function gc(e) {
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
function _c(e) {
	return /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\[[^\]]+\])+$/.test(e.trim());
}
function vc(e) {
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
function $(e, t) {
	let n = Z(e, t);
	if (n !== void 0) return { arguments: n };
	let r = `.${t}(`, i = e.indexOf(r);
	if (i < 0 || !e.endsWith(")")) return;
	let a = e.slice(i + r.length - 1);
	if (Xc(a) === a.length - 1) return {
		target: e.slice(0, i),
		arguments: a.slice(1, -1)
	};
}
function yc(e) {
	let t = e.match(/^com\.xfactorstudio\.xml\.xpath\.XPath\.(selectSingleNode|selectNodes)\((.*)\)$/s);
	return t ? {
		name: t[1],
		arguments: t[2]
	} : void 0;
}
function bc(e) {
	if (!e.startsWith("com.xfactorstudio.xml.xpath.XPath.")) return;
	let t = e.slice(34).match(/^(selectSingleNode|selectNodes)\(/);
	if (!t) return;
	let n = t[1], r = 34 + n.length, i = e.slice(r), a = Xc(i);
	if (!(a < 0 || i[a + 1] !== ".")) return {
		name: n,
		arguments: i.slice(1, a),
		memberPath: i.slice(a + 2)
	};
}
function xc(e) {
	let t = e.match(/^new\s+mx\.transitions\.Tween\s*\((.*)\)$/s);
	return t ? { arguments: t[1] } : void 0;
}
function Sc(e) {
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
function Cc(e) {
	let t = e.trim();
	if (!/^if\s*\(/.test(t)) return;
	let n = t.indexOf("("), r = Xc(t.slice(n));
	if (r < 0) return;
	let i = n + r, a = t.slice(n + 1, i).trim(), o = t.indexOf("{", i + 1);
	if (o < 0) return;
	let s = wc(t, o);
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
	let d = wc(u, 0);
	if (!(d < 0)) return {
		condition: a,
		thenBody: c,
		elseBody: u.slice(1, d)
	};
}
function wc(e, t) {
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
function Tc(e) {
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
function Ec(e) {
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
function Dc(e, t, n) {
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
function Oc(e) {
	return e.replace(/<\s*(?:s?br)\b[^>]*>/gi, "\n").replace(/<\s*\/\s*p\s*>/gi, "\n").replace(/<[^>]+>/g, "").replace(/\r/g, "\n");
}
function kc(e, t, n, r = !1) {
	let i = e.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
	if (!i) return r ? 0 : n;
	let a = Number(t);
	if (!Number.isFinite(a) || a <= 0) return n;
	let o = Math.max(1, i.length * a * .62);
	return r ? o : Math.max(n || 1, o);
}
function Ac(e) {
	let t = Z(e, "mx.utils.Delegate.create");
	if (t === void 0) return;
	let [n, r] = mo(t);
	if (!(!n || !r)) return {
		target: n.trim(),
		method: r.trim()
	};
}
function jc(e) {
	return Q(e) && e.__avm1Delegate === !0 && typeof e.method == "string";
}
function Mc(e) {
	return Q(e) && e.__avm1Type === "MovieClipLoader";
}
function Nc(e) {
	return Array.isArray(e.listeners) || (e.listeners = []), Array.isArray(e.listeners) ? e.listeners.filter(Q) : [];
}
function Pc(e) {
	return e.trim().replace(/^\/+/, "");
}
function Fc(e) {
	return /\.(?:png|jpe?g|gif|webp)$/i.test(e.split(/[?#]/, 1)[0] ?? "");
}
function Ic(e) {
	return /\.swf$/i.test(e.split(/[?#]/, 1)[0] ?? "");
}
function Lc(e) {
	return typeof Node < "u" && e instanceof Node;
}
function Rc(e) {
	if (Lc(e) && (e.nodeType === Node.DOCUMENT_NODE || e.nodeType === Node.ELEMENT_NODE)) return e;
	if (Q(e)) {
		let t = e.document;
		if (Lc(t) && t.nodeType === Node.DOCUMENT_NODE) return t;
		let n = e.documentElement;
		if (Lc(n) && n.nodeType === Node.ELEMENT_NODE) return n;
	}
}
function zc(e, t) {
	let n = Rc(e);
	if (!n) return [];
	let r = t.trim().replace(/^\/\//, "").replace(/^\.\//, "").split("/").filter(Boolean).pop();
	return !r || !/^[A-Za-z_][\w.-]*$/.test(r) ? [] : Array.from(n.querySelectorAll(r));
}
function Bc(e, t) {
	if (t === "firstChild") {
		let t = e.firstChild;
		return t ? { nodeValue: t.nodeValue ?? "" } : void 0;
	}
	if (t === "nodeValue") return e.nodeValue ?? "";
	if (t === "attributes" && e instanceof Element) return Object.fromEntries(Array.from(e.attributes).map((e) => [e.name, e.value]));
	if (t === "length" && "length" in e) return Number(e.length);
}
function Vc(e, t, n) {
	if (Q(e)) try {
		Object.defineProperty(e, gs, {
			value: t,
			configurable: !0
		}), Object.defineProperty(e, _s, {
			value: n,
			configurable: !0
		});
	} catch {}
}
function Hc(e, t) {
	let n = e[gs], r = e[_s];
	return !(n instanceof Y) || typeof r != "string" || n !== t ? !0 : n.props[r] === e;
}
function Uc(e) {
	let t = "__eventListeners", n = e.props[t];
	if (Q(n)) return n;
	let r = {};
	return e.props[t] = r, r;
}
function Wc(e) {
	switch (e) {
		case "rollOver": return "rollover";
		case "rollOut": return "rollout";
		case "press": return "press";
		case "release": return "release";
		case "releaseOutside": return "releaseoutside";
	}
}
function Gc(e) {
	switch (e) {
		case "rollOver": return "onRollOver";
		case "rollOut": return "onRollOut";
		case "press": return "onPress";
		case "release": return "onRelease";
		case "releaseOutside": return "onReleaseOutside";
	}
}
function Kc(e, t) {
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
function qc(e, t) {
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
function Jc(e) {
	return e === void 0 ? "undefined" : e === null || Array.isArray(e) ? "object" : e instanceof Y ? "movieclip" : typeof e;
}
function Yc(e, t) {
	let n = t.trim().replace(/^_global\./, "");
	return n === "Array" ? Array.isArray(e) : n === "MovieClip" ? e instanceof Y : n === "Object" ? typeof e == "object" && !!e : Q(e) ? String(e.__avm1Class ?? "").split(".").pop() === n : !1;
}
function Xc(e) {
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
var Zc = class e {
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
			this.musicOwner = t, this.musicTarget = Qc(e.target), this.music.loop = !0, this.music.volume = r, this.tryPlay(this.music);
			return;
		}
		this.stopMusic();
		let i = new Audio(me(n));
		i.preload = "auto", i.loop = !0, i.volume = r, this.music = i, this.musicSrc = n, this.musicOwner = t, this.musicTarget = Qc(e.target), this.tryPlay(i);
	}
	playVoice(e, t) {
		let n = e.soundSrc;
		if (!n) return;
		let r = this.durationFor(e), i = this.pendingVoiceSegmentDurationMs;
		this.pendingVoiceSegmentDurationMs = 0, this.stopVoice();
		let a = new Audio(me(n));
		a.preload = "auto", a.volume = this.volumeFor(e.target, 1), this.voiceStartedAt = performance.now(), this.voiceDurationMs = i || (r && Number.isFinite(r) ? r : 0), a.addEventListener("loadedmetadata", () => {
			!this.voiceDurationMs && Number.isFinite(a.duration) && (this.voiceDurationMs = a.duration * 1e3);
		}), this.voice = a, this.voiceOwner = t, this.voiceTarget = Qc(e.target), this.tryPlay(a);
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
		e && (this.pendingPlayback.delete(e), e.pause(), $c(e)), this.music = null, this.musicSrc = "", this.musicOwner = void 0, this.musicTarget = "";
	}
	stopVoice() {
		let e = this.voice;
		e && (this.pendingPlayback.delete(e), e.pause(), $c(e)), this.voice = null, this.voiceOwner = void 0, this.voiceTarget = "", this.voiceStartedAt = 0, this.voiceDurationMs = 0;
	}
	stopForAction(e) {
		let t = Qc(e.target), n = e.soundRole === "music" || t && t === this.musicTarget, r = e.soundRole === "vo" || !t || t === this.voiceTarget;
		n && this.scheduleMusicStop(), r && this.stopVoice();
	}
	setVolume(e) {
		let t = Qc(e.target);
		if (!t) return;
		let n = el(e.value);
		this.targetVolumes.set(t, n), this.music && t === this.musicTarget && (this.music.volume = n), this.voice && t === this.voiceTarget && (this.voice.volume = n);
	}
	volumeFor(e, t) {
		let n = Qc(e);
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
function Qc(e) {
	return (e ?? "").replace(/^_root\./i, "").replace(/^_level0\./i, "").replace(/^this\./i, "").replace(/^self\./i, "");
}
function $c(e) {
	try {
		e.currentTime = 0;
	} catch {}
}
function el(e) {
	let t = Number(e);
	return Number.isFinite(t) ? Math.max(0, Math.min(1, t / 100)) : 1;
}
//#endregion
//#region src/app/Avm2NativeRuntime.ts
var tl = class {
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
		n.className = "player-avm2-native", n.title = this.timeline.source || "ActionScript web player", n.srcdoc = ll(this.timeline), this.container.replaceChildren(n), this.frame = n, await dl(n);
		let r = n.contentWindow;
		if (!r) throw Error("mmtour: native AVM2 document did not initialize");
		this.installWebAdapters(r), await fl(r, ul(t.program)), this.bootstrap(r, t.expose), e ? this.play() : this.pause();
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
		e.__mmtourResolveAsset = (e) => sl(e, this.timeline.control?.externalAssets ?? []), e.__mmtourPlayVideo = (e) => {
			e.currentTime = 0, e.muted = !1, e.play().catch(() => (e.muted = !0, e.play().catch(() => {})));
		}, e.__mmtourAttachSymbol = (t, n) => rl(e, t, this.timeline.assets[Number(n)], this.timeline), e.__mmtourOnLoaderInit = (e, t) => this.pendingLoaderInits.push({
			target: e,
			handler: t
		}), e.__mmtourGsapKill = (e) => ya.killTweensOf(e), e.__mmtourGsapDelayedCall = (e, t, n = [], r = void 0) => {
			let i = ya.delayedCall(e, () => t.apply(r, n));
			return this.track(i);
		}, e.__mmtourGsapTween = (e, t, n, r) => {
			let i = ol(e, t, n);
			return this.track(r ? ya.from(e, i) : ya.to(e, i));
		}, e.__mmtourGsapFromTo = (e, t, n, r) => this.track(ya.fromTo(e, ol(e, 0, n), ol(e, t, r)));
	}
	track(e) {
		return this.animations.add(e), e.eventCallback("onComplete", pl(e.eventCallback("onComplete"), () => this.animations.delete(e))), e;
	}
	bootstrap(e, t) {
		let n = e.$es4, r = e[t], i = n?.$$?.player?.Player, a = n?.$$?.["flash.events"]?.Event;
		if (!r || !i || !a) throw Error("mmtour: transpiled AS3 program exposes no web player entry point");
		i.$__init("mmtour-avm2-stage", Math.max(1, Math.round(this.timeline.fps)), {}), i.$__getStage().$__internalAddChild(r), il(e, r, this.timeline.frames[this.timeline.entryFrame ?? 0]?.instances ?? [], this.timeline, !1);
		let o = r.loaderInfo?.$__properties?.()?.LoaderInfoScope;
		o && (o.$_loader = null);
		let s = new a(a.INIT);
		for (let { target: e, handler: t } of this.pendingLoaderInits.splice(0)) t.call(e, s);
		for (let t of [
			0,
			250,
			1e3,
			2500
		]) e.setTimeout(() => nl(e.document), t);
	}
};
function nl(e) {
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
function rl(e, t, n, r) {
	if (!n) return;
	let i = t?.$__properties?.()?.DisplayObjectScope, a = i?.$_domView, o = n.frames?.[0] ?? n.src;
	if (!a || !o) return;
	let s = a.ownerDocument.createElement("img");
	s.src = ul(o), s.draggable = !1, s.style.position = "absolute", s.style.pointerEvents = "none", s.style.left = `${-n.origin.x}px`, s.style.top = `${-n.origin.y}px`, s.style.width = `${n.origin.width}px`, s.style.height = `${n.origin.height}px`, a.prepend(s), a.style.overflow = "visible", i.$_setExplicitBounds(n.origin.width, n.origin.height), il(e, t, n.timeline?.[0]?.instances ?? [], r, !0);
}
function il(e, t, n, r, i) {
	let a = r.control?.avm2Runtime;
	for (let r of n) {
		if (!r.name || !a || t[r.name]) continue;
		let n = Object.entries(a.symbolClasses ?? {}).find(([, e]) => e === r.characterId)?.[0], o = n ? al(e, n, a.compiledClass) : void 0;
		if (!o) continue;
		let s = new o();
		s.name = r.name, s.x = r.matrix.tx, s.y = r.matrix.ty, s.scaleX = Math.hypot(r.matrix.a, r.matrix.b), s.scaleY = s.scaleX ? (r.matrix.a * r.matrix.d - r.matrix.b * r.matrix.c) / s.scaleX : 1, s.rotation = Math.atan2(r.matrix.b, r.matrix.a) * 180 / Math.PI;
		let c = s.$__properties?.()?.DisplayObjectScope?.$_domView;
		c && i && (c.style.visibility = "hidden"), t.addChild(s), t[r.name] = s;
	}
}
function al(e, t, n) {
	let r = n.includes(".") ? n.slice(0, n.lastIndexOf(".")) : "", i = t.includes(".") ? t : r ? `${r}.${t}` : t, a = i.lastIndexOf("."), o = a >= 0 ? i.slice(0, a) : "", s = a >= 0 ? i.slice(a + 1) : i;
	return e.$es4?.$$?.[o]?.[s];
}
function ol(e, t, n) {
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
function sl(e, t) {
	let n = cl(e), r = t.filter((e) => e.src).flatMap((e) => [e.ref, ...e.aliases ?? []].map((t) => ({
		alias: cl(t),
		src: e.src
	}))).sort((e, t) => t.alias.length - e.alias.length).find(({ alias: e }) => n === e || n.endsWith(`/${e}`) || e.endsWith(`/${n}`));
	return r ? ul(r.src) : e;
}
function cl(e) {
	return e.replace(/\\/g, "/").replace(/[?#].*$/, "").replace(/^https?:\/\/[^/]+\//i, "").replace(/^\/+/, "").toLowerCase();
}
function ll(e) {
	let { width: t, height: n } = e.dimensions;
	return `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:${ml(e.backgroundColor ?? "#fff")}}
#mmtour-avm2-stage{position:relative;width:${t}px;height:${n}px;overflow:hidden;transform-origin:0 0}
body{transform-origin:0 0}
</style></head><body><div id="mmtour-avm2-stage"></div></body></html>`;
}
function ul(e) {
	let t = ce(e);
	return /^(?:blob:|data:|https?:)/i.test(t) ? t : new URL(t, window.location.href).href;
}
function dl(e) {
	return new Promise((t, n) => {
		e.addEventListener("load", () => t(), { once: !0 }), e.addEventListener("error", () => n(/* @__PURE__ */ Error("mmtour: failed to create native AVM2 document")), { once: !0 });
	});
}
function fl(e, t) {
	return new Promise((n, r) => {
		let i = e.document.createElement("script");
		i.src = t, i.onload = () => n(), i.onerror = () => r(/* @__PURE__ */ Error(`mmtour: failed to load transpiled AS3 program ${t}`)), e.document.head.append(i);
	});
}
function pl(e, t) {
	return () => {
		e?.(), t();
	};
}
function ml(e) {
	return e.replace(/[;{}]/g, "");
}
//#endregion
//#region src/app/PlayerController.ts
var hl = /^_level(\d+)/, gl = class {
	container;
	options;
	textTranslator;
	fonts = new no();
	sound = new Zc();
	levels = /* @__PURE__ */ new Map();
	store = new us();
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
			this.avm2FrameCount = e.frameCount, this.avm2Runtime = new tl(this.container, e), await this.avm2Runtime.activate(!1), this.emitFrame();
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
		this.levels.get(e) && this.destroyLevel(e), this.store.seed(n.control?.globalDefaults), this.sound.registerTimings(ye(n.control)), this.fonts.register(n);
		let r = document.createElement("div");
		r.className = "player-level", r.style.zIndex = String(e), this.container.append(r);
		let i = new Cs(n, new Ra(r, {
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
		for (let t of ge(e)) {
			let e = t.toLowerCase();
			e === this.mainSwf.toLowerCase() || this.prefetched.has(e) || (this.prefetched.add(e), _e(t));
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
		let r = hl.exec(e);
		if (!r) return;
		let i = this.levels.get(Number(r[1]))?.player;
		if (!i) return;
		let a = e.replace(/^_level\d+\.?/i, "");
		i.runNamedClipCommand(i.rootClip, a, t, n);
	}
	async handleLoadVariables(e, t) {
		let n = t.variableSource ?? (t.swf && !/\.swf$/i.test(t.swf) ? t.swf : void 0) ?? t.target;
		if (n) try {
			let t = await fetch(me(n));
			if (!t.ok || this.container.hidden) return;
			this.levels.get(e)?.player.setTextVars(_l(await t.text()));
		} catch {}
	}
	dispatchCall(e, t, n) {
		let r = hl.exec(e);
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
function _l(e) {
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
async function vl(e, n = {}) {
	let { assetsBaseUrl: r = "", assetSource: i = "files", archiveUrl: a, scene: o = "A-tour.swf", autoplay: s = !0, debug: c = !1, onFrame: l, onButton: u, onNavigate: d, onFsCommand: f, onGetURL: p, translateText: m, onLoadStart: h, onLoadComplete: g, onLoadError: _ } = n;
	bl({
		assetsBaseUrl: r,
		assetSource: i,
		archiveUrl: a
	});
	let v = Sl(o), y = t(o);
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
	let x = new gl(e, {
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
	}), s && x.play(), Cl(x);
}
async function yl(e, n) {
	let { assetsBaseUrl: r = "", assetSource: i = "files", archiveUrl: a, autoplay: o = !0, debug: s = !1, onFrame: c, onButton: l, onNavigate: u, onFsCommand: d, onGetURL: f, translateText: p, onLoadStart: m, onLoadComplete: h, onLoadError: g } = n;
	bl({
		assetsBaseUrl: r,
		assetSource: i,
		archiveUrl: a
	});
	let _ = "timeline" in n ? n.timeline : void 0, v = "scene" in n ? n.scene : void 0, y, b, x;
	if (_) b = xl(_, n.swf), x = _.scene;
	else {
		if (!v) throw Error("mmtour: createDecompiledPlayer requires either a scene or a timeline");
		y = v, b = Sl(v), x = t(v);
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
	let C = new gl(e, {
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
	}), o && C.play(), Cl(C);
}
function bl(e) {
	let { assetsBaseUrl: t, assetSource: n, archiveUrl: r } = e;
	E(t), k(n), n === "archive" && w(r ?? `${t.replace(/\/+$/, "")}/xp-tour.pack`), fe();
}
function xl(e, t) {
	return t || Sl(e.scene);
}
function Sl(e) {
	return /\.swf$/i.test(e) ? e : `${e}.swf`;
}
function Cl(e) {
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
export { gl as PlayerController, yl as createDecompiledPlayer, vl as createTourPlayer, O as getAssetSource, D as getAssetsBaseUrl, pe as loadTimeline, t as sceneNameFromSwf, e as scenes, w as setArchiveUrl, k as setAssetSource, E as setAssetsBaseUrl };
