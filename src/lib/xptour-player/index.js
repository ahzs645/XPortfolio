import { gsap as e } from "gsap";
//#region src/data/scenes.ts
var t = [
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
	}
];
function n(e) {
	return e.replace(/\.swf$/i, "");
}
//#endregion
//#region src/data/shapeBitmapInline.ts
var r = /\b(xlink:href|href)="(generated\/[^"]*?\/images\/[^"]+?)"/g;
function i(e) {
	return r.lastIndex = 0, r.test(e);
}
function a(e, t) {
	return e.includes("/images/") ? e.replace(r, (e, n, r) => {
		let i = t(r);
		return i ? `${n}="data:${i.type};base64,${s(i.bytes)}"` : e;
	}) : e;
}
async function o(e, t) {
	if (!e.includes("/images/")) return e;
	r.lastIndex = 0;
	let n = /* @__PURE__ */ new Set();
	for (let t of e.matchAll(r)) n.add(t[2]);
	if (!n.size) return e;
	let i = /* @__PURE__ */ new Map();
	return await Promise.all([...n].map(async (e) => {
		let n = await t(e);
		n && i.set(e, n);
	})), a(e, (e) => i.get(e));
}
function s(e) {
	let t = globalThis.Buffer;
	if (t) return t.from(e).toString("base64");
	let n = "", r = 32768;
	for (let t = 0; t < e.length; t += r) n += String.fromCharCode(...e.subarray(t, t + r));
	return btoa(n);
}
function c(e) {
	return e.replace(/^\/?generated\/[^/]+\//, "");
}
//#endregion
//#region src/data/packedAssets.ts
var l = new TextEncoder(), u = new TextDecoder(), d = /* @__PURE__ */ new Map();
function f() {
	for (let e of d.values()) URL.revokeObjectURL(e);
	d.clear();
}
async function p(e) {
	e?.length && await Promise.all(e.map(async (e) => {
		let t = e.replace(/^\//, "");
		if (!d.has(t)) try {
			let e = await fetch(`${C}/${t}`);
			if (!e.ok) return;
			let n = await e.text();
			if (!i(n)) return;
			let r = await o(n, async (e) => {
				let t = await fetch(`${C}/${e.replace(/^\//, "")}`);
				if (!t.ok) return;
				let n = t.headers.get("content-type") || m(e);
				return {
					bytes: new Uint8Array(await t.arrayBuffer()),
					type: n
				};
			});
			d.set(t, URL.createObjectURL(new Blob([r], { type: "image/svg+xml" })));
		} catch {}
	}));
}
function m(e) {
	return /\.jpe?g$/i.test(e) ? "image/jpeg" : /\.gif$/i.test(e) ? "image/gif" : "image/png";
}
var h = "files", g = 0, _ = /* @__PURE__ */ new Map(), v = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map(), ee = !0, b = "", x = null, S = /* @__PURE__ */ new Map();
function te() {
	for (let e of S.values()) e.url && URL.revokeObjectURL(e.url);
	S.clear();
}
function ne(e) {
	b = e, x = null, te();
}
var C = "";
function re(e) {
	C = e.replace(/\/+$/, "");
}
function ie() {
	return C;
}
function ae() {
	return h;
}
function oe(e) {
	e !== h && (h = e, g += 1, me(), fe(), se(), f());
}
function se() {
	for (let e of y.values()) {
		for (let t of e.shapes.values()) t.url && URL.revokeObjectURL(t.url);
		for (let t of e.media.values()) t.url && URL.revokeObjectURL(t.url);
	}
	y.clear(), x = null, te();
}
async function w(e) {
	if (e[0] === 31 && e[1] === 139 && typeof DecompressionStream < "u") {
		let t = new Blob([e]).stream().pipeThrough(new DecompressionStream("gzip"));
		return await new Response(t).text();
	}
	return new TextDecoder().decode(e);
}
async function T(e) {
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(0, !0), n = JSON.parse(await w(e.slice(4, 4 + t))), r = /* @__PURE__ */ new Map();
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
async function ce(e, t, n) {
	let r = await fetch(e, { headers: { Range: `bytes=${t}-${n}` } });
	if (!r.ok) return null;
	let i = new Uint8Array(await r.arrayBuffer());
	return r.status === 206 ? i : i.slice(t, n + 1);
}
async function le() {
	if (x) return x;
	let e = await ce(b, 0, 65535);
	if (!e || e.byteLength < 4) return null;
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(0, !0), n = JSON.parse(await w(e.slice(4, 4 + t)));
	for (let [e, t] of Object.entries(n.vars ?? {})) S.set(e, { content: t });
	return x = {
		blocksStart: 4 + t,
		scenes: n.scenes
	}, x;
}
async function ue(e) {
	let t = y.get(e);
	if (t) return t;
	let n = await le(), r = n?.scenes[e];
	if (!n || !r) return null;
	let i = n.blocksStart + r.offset, a = await ce(b, i, i + r.length - 1);
	if (!a) return null;
	let o = await T(a);
	return y.set(e, o), o;
}
async function de(e) {
	let t = y.get(e);
	if (t) return t;
	let n = await fetch(`${C}/generated-packs/${e}.scene?v=${Date.now()}`);
	if (!n.ok) return null;
	let r = await T(new Uint8Array(await n.arrayBuffer()));
	return y.set(e, r), r;
}
function fe() {
	for (let e of v.values()) for (let t of e.shapes.values()) t.url && URL.revokeObjectURL(t.url);
	v.clear();
}
async function pe(e) {
	let t = v.get(e);
	if (t) return t;
	let n = null;
	try {
		let t = await fetch(`${C}/generated-bundles/${e}.json.gz?v=${Date.now()}`);
		t.ok && (n = await w(new Uint8Array(await t.arrayBuffer())));
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
	return v.set(e, a), a;
}
function me() {
	for (let e of _.values()) for (let t of e.files.values()) t.url && URL.revokeObjectURL(t.url);
	_.clear(), g += 1;
}
function he(e) {
	return `${h}:${g}:${e}`;
}
async function ge(e) {
	if (h === "files") {
		let t = await ve(e);
		return t && await p(t.bitmapFillShapeSrcs), t;
	}
	if (h === "bundle") {
		let t = (await pe(e))?.timeline ?? null;
		return t && await p(t.bitmapFillShapeSrcs), t;
	}
	return h === "archive" ? (await ue(e))?.timeline ?? null : h === "scene-pack" ? (await de(e))?.timeline ?? null : (await ye(e))?.timeline ?? null;
}
function _e(e) {
	if (h === "archive" || h === "scene-pack") {
		let t = e.replace(/^\//, ""), n = /^generated\/([^/]+)\//.exec(t)?.[1], r = n ? y.get(n) : void 0;
		if (r) if (t.endsWith(".svg")) {
			let e = r.shapes.get(t);
			if (e) {
				if (!e.url) {
					let t = i(e.svg) ? a(e.svg, (e) => {
						let t = r.media.get(e.replace(/^\//, ""));
						if (!t) return;
						let n = r.bodyStart + t.offset;
						return {
							bytes: r.body.slice(n, n + t.length),
							type: t.type
						};
					}) : e.svg;
					e.url = URL.createObjectURL(new Blob([t], { type: "image/svg+xml" }));
				}
				return e.url;
			}
		} else {
			let e = r.media.get(t);
			if (e) {
				if (!e.url) {
					let t = r.bodyStart + e.offset;
					e.url = URL.createObjectURL(new Blob([r.body.slice(t, t + e.length)], { type: e.type }));
				}
				return e.url;
			}
		}
		let o = S.get(t);
		return o ? (o.url ||= URL.createObjectURL(new Blob([o.content], { type: "text/plain" })), o.url) : `${C}/${t}`;
	}
	if (h === "bundle") {
		let t = e.replace(/^\//, "");
		if (t.endsWith(".svg")) {
			let e = d.get(t);
			if (e) return e;
			let n = /^generated\/([^/]+)\//.exec(t)?.[1], r = n ? v.get(n)?.shapes.get(t) : void 0;
			if (r) return r.url ||= URL.createObjectURL(new Blob([r.svg], { type: "image/svg+xml" })), r.url;
		}
		return `${C}/${t}`;
	}
	if (h === "pack") {
		let t = e.replace(/^\//, ""), n = /^generated\/([^/]+)\/(.+)$/.exec(t);
		if (n) {
			let e = _.get(n[1]), t = e?.files.get(n[2]);
			if (t && e) {
				if (!t.url) {
					if (t.type === "image/svg+xml") {
						let n = u.decode(t.bytes);
						if (i(n)) {
							let r = a(n, (t) => {
								let n = e.files.get(c(t));
								return n ? {
									bytes: n.bytes,
									type: n.type
								} : void 0;
							});
							return t.url = URL.createObjectURL(new Blob([l.encode(r)], { type: t.type })), t.url;
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
		let e = d.get(t);
		if (e) return e;
	}
	return `${C}/${t}`;
}
async function ve(e) {
	let t = await fetch(`${C}/generated/${e}/timeline.json?v=${Date.now()}`);
	if (!t.ok) return null;
	try {
		return await t.json();
	} catch {
		return null;
	}
}
async function ye(e) {
	let t = _.get(e);
	if (t) return t;
	if (!ee) return null;
	let n = await fetch(`${C}/generated-packed/${e}/${e}.pack?v=${Date.now()}`);
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
	return _.set(e, l), l;
}
//#endregion
//#region src/data/TimelineLoader.ts
var E = /* @__PURE__ */ new Map();
function be() {
	E.clear();
}
async function D(e) {
	let t = he(e.toLowerCase()), r = E.get(t);
	if (r) return r;
	let i = await ge(n(e));
	return i ? (!i.frameSvgsOmitted && !i.frameSvgs?.length && (i.frameSvgs = Array.from({ length: i.frameCount }, (e, t) => `generated/${i.scene}/frames/${t + 1}.svg`)), E.set(t, i), i) : null;
}
function O(e) {
	return _e(e);
}
//#endregion
//#region src/data/prefetch.ts
var k = /\.swf$/i;
function xe(e) {
	let t = /* @__PURE__ */ new Set(), n = (e) => {
		if (e) {
			e.swf && k.test(e.swf) && t.add(e.swf), e.exitNavigation?.swf && k.test(e.exitNavigation.swf) && t.add(e.exitNavigation.swf);
			for (let n of e.loads ?? []) k.test(n.swf) && t.add(n.swf);
		}
	};
	for (let t of Object.values(e.control?.buttonActions ?? {})) n(t.release), n(t.rollOver), n(t.rollOut), n(t.press);
	for (let t of e.control?.frameActions ?? []) for (let e of t.actions ?? []) n(e);
	return [...t];
}
async function Se(e) {
	let t = await D(e);
	t && Ce(t, 0);
}
function Ce(e, t) {
	for (let n of e.frames[t]?.instances ?? []) {
		let t = e.assets[String(n.characterId)], r = t?.src ?? t?.frames?.[0] ?? t?.states?.up?.src;
		r && fetch(O(r)).catch(() => {});
	}
}
//#endregion
//#region src/data/soundTimings.ts
function A(e) {
	let t = /* @__PURE__ */ new Map();
	for (let [n, r] of Object.entries(e?.soundTimings ?? {})) {
		let e = typeof r == "number" ? r : Number(r?.durationMs);
		n && Number.isFinite(e) && e > 0 && t.set(n, { durationMs: e });
	}
	let n = (e) => {
		for (let n of e?.functionCalls ?? []) {
			let e = we(n);
			e && t.set(e.name, { durationMs: e.durationMs });
		}
	};
	for (let t of e?.frameActions ?? []) for (let e of t.actions ?? []) n(e);
	for (let t of e?.spriteActions ?? []) for (let e of t.actions ?? []) n(e);
	for (let t of Object.values(e?.definedFunctions ?? {})) for (let e of t?.actions ?? []) n(e);
	for (let t of Object.values(e?.buttonActions ?? {})) n(t.release), n(t.rollOver), n(t.rollOut), n(t.press);
	return Object.fromEntries([...t.entries()].sort(([e], [t]) => e.localeCompare(t, void 0, { numeric: !0 })));
}
function we(e) {
	if (e.functionName !== "push" || !Te(e.target)) return;
	let t = j(e.arguments), n = t.length === 1 && t[0]?.trim().startsWith("[") ? Ee(t[0]) : t, r = De(n[0]), i = Number(n[1]);
	if (!(!r || !Number.isFinite(i) || i <= 0)) return {
		name: r,
		durationMs: i
	};
}
function Te(e) {
	let t = String(e ?? "").replace(/[^a-z]/gi, "").toLowerCase();
	return !!(t && /(?:snd|sound).*(?:time|duration|lib)|(?:time|duration).*(?:snd|sound)/.test(t));
}
function Ee(e) {
	let t = e.trim();
	return !t.startsWith("[") || !t.endsWith("]") ? [] : j(t.slice(1, -1));
}
function j(e) {
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
function De(e) {
	let t = e?.trim();
	if (t && (t.startsWith("\"") && t.endsWith("\"") || t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
}
//#endregion
//#region src/render/colorTransform.ts
var M = "http://www.w3.org/2000/svg", Oe = "mmtour-color-transform-filters";
function ke(e, t) {
	let n = t?.rm ?? 1, r = t?.gm ?? 1, i = t?.bm ?? 1, a = t?.ra ?? 0, o = t?.ga ?? 0, s = t?.ba ?? 0;
	if (n === 1 && r === 1 && i === 1 && a === 0 && o === 0 && s === 0) {
		e.style.removeProperty("filter");
		return;
	}
	e.style.filter = `url(#${Ae(n, r, i, a, o, s)})`;
}
function Ae(e, t, n, r, i, a) {
	let o = je(e, t, n, r, i, a);
	if (document.getElementById(o)) return o;
	let s = document.getElementById(Oe);
	s || (s = document.createElementNS(M, "svg"), s.id = Oe, s.setAttribute("width", "0"), s.setAttribute("height", "0"), s.setAttribute("aria-hidden", "true"), s.style.position = "absolute", s.style.width = "0", s.style.height = "0", s.style.overflow = "hidden", document.body.append(s));
	let c = document.createElementNS(M, "filter");
	c.id = o, c.setAttribute("color-interpolation-filters", "sRGB");
	let l = document.createElementNS(M, "feComponentTransfer");
	return l.append(N("feFuncR", e, r), N("feFuncG", t, i), N("feFuncB", n, a)), c.append(l), s.append(c), o;
}
function N(e, t, n) {
	let r = document.createElementNS(M, e);
	return r.setAttribute("type", "linear"), r.setAttribute("slope", String(t)), r.setAttribute("intercept", String(n)), r;
}
function je(...e) {
	return `mmtour-ct-${e.map((e) => String(Math.round(e * 1e5)).replace("-", "n")).join("-")}`;
}
//#endregion
//#region src/render/DomRenderer.ts
var Me = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", P = /* @__PURE__ */ new Map(), Ne = /* @__PURE__ */ new Set(), Pe = {
	a: 1,
	b: 0,
	c: 0,
	d: 1,
	tx: 0,
	ty: 0
};
function Fe(e, t) {
	return {
		a: e.a * t.a + e.c * t.b,
		b: e.b * t.a + e.d * t.b,
		c: e.a * t.c + e.c * t.d,
		d: e.b * t.c + e.d * t.d,
		tx: e.a * t.tx + e.c * t.ty + e.tx,
		ty: e.b * t.tx + e.d * t.ty + e.ty
	};
}
function Ie(e) {
	if (P.has(e)) return P.get(e);
	Ne.has(e) || (Ne.add(e), fetch(O(e)).then((e) => e.ok ? e.text() : "").then((t) => {
		let n = t.replace(/<\?xml[^>]*\?>/i, "").replace(/<svg[^>]*>/i, "").replace(/<\/svg>\s*$/i, ""), r = n.match(/<g\s+transform="matrix\(([^)]+)\)"\s*>([\s\S]*)<\/g>\s*$/i), i = Pe, a = n;
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
		a = a.replace(/fill="[^"]*"/g, "fill=\"#ffffff\"").replace(/stroke="[^"]*"/g, "stroke=\"none\""), P.set(e, {
			gMatrix: i,
			body: a
		});
	}).catch(() => P.set(e, null)));
}
function Le(e, t = "") {
	let n = e.matrix, r = O(e.src), i = e.colorTransform ? ` filter="url(#${Be(e.colorTransform)})"` : "";
	return `<image href="${r}" xlink:href="${r}" x="${-e.origin.x}" y="${-e.origin.y}" width="${e.origin.width}" height="${e.origin.height}" transform="matrix(${n.a},${n.b},${n.c},${n.d},${n.tx},${n.ty})"${i}${t}/>`;
}
function Re(e, t) {
	let n = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"640\" height=\"480\" style=\"position:absolute;left:0;top:0;overflow:visible\">", r = ze(e.items), i = Ie(e.mask.src);
	if (!i) return `${n}${r ? `<defs>${r}</defs>` : ""}${e.items.map((e) => Le(e)).join("")}</svg>`;
	let a = e.mask.matrix, o = e.mask.origin, s = Fe(Fe(a, {
		a: 1,
		b: 0,
		c: 0,
		d: 1,
		tx: -o.x,
		ty: -o.y
	}), i.gMatrix), c = `c${t.replace(/\W/g, "_")}`, l = `matrix(${s.a},${s.b},${s.c},${s.d},${s.tx},${s.ty})`;
	return `${n}<defs>${r}<clipPath id="${c}" clipPathUnits="userSpaceOnUse">${i.body.replace(/<(path|polygon|rect|ellipse|circle)\b/g, `<$1 transform="${l}"`)}</clipPath></defs><g clip-path="url(#${c})">${e.items.map((e) => Le(e, e.opacity === 1 ? "" : ` opacity="${e.opacity}"`)).join("")}</g></svg>`;
}
function ze(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) n.colorTransform && t.set(Be(n.colorTransform), n.colorTransform);
	return [...t.entries()].map(([e, t]) => {
		let n = t.rm ?? 1, r = t.gm ?? 1, i = t.bm ?? 1;
		return `<filter id="${e}" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="${n}" intercept="${t.ra ?? 0}"/><feFuncG type="linear" slope="${r}" intercept="${t.ga ?? 0}"/><feFuncB type="linear" slope="${i}" intercept="${t.ba ?? 0}"/></feComponentTransfer></filter>`;
	}).join("");
}
function Be(e) {
	return `mc${[
		e.rm ?? 1,
		e.gm ?? 1,
		e.bm ?? 1,
		e.ra ?? 0,
		e.ga ?? 0,
		e.ba ?? 0
	].map((e) => String(Math.round(e * 1e5)).replace("-", "n")).join("_")}`;
}
var Ve = class {
	layer;
	options;
	nodes = /* @__PURE__ */ new Map();
	hoveredButtonKeys = /* @__PURE__ */ new Set();
	constructor(e, t = {}) {
		this.layer = e, this.options = t;
	}
	clear() {
		this.nodes.clear(), this.hoveredButtonKeys.clear(), this.layer.replaceChildren();
	}
	apply(e) {
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
		t.element.style.zIndex = String(e.order), t.element.style.transform = "none", t.element.innerHTML = Re(e.maskGroup, e.key);
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
		if (!i) return;
		e.dataset.buttonOwnerPath = t, e.dataset.buttonCharacter = String(n), e.dataset.buttonKey = r, e.style.pointerEvents = "auto", e.style.cursor = "pointer";
		let a = () => {
			this.hoveredButtonKeys.has(r) || (this.hoveredButtonKeys.add(r), i(t, n, "rollOver", r));
		}, o = () => {
			this.hoveredButtonKeys.delete(r) && i(t, n, "rollOut", r);
		};
		e.addEventListener("pointerenter", a), e.addEventListener("pointerover", a), e.addEventListener("mouseover", a), e.addEventListener("pointerleave", (t) => {
			let n = e.getBoundingClientRect(), i = t.clientX, a = t.clientY, s = i >= n.left && i <= n.right && a >= n.top && a <= n.bottom;
			requestAnimationFrame(() => {
				(document.elementFromPoint(i, a)?.closest(".player-hit"))?.dataset.buttonKey !== r && !s && o();
			});
		}), e.addEventListener("mouseleave", (t) => {
			let n = e.getBoundingClientRect(), r = t.clientX, i = t.clientY;
			(r < n.left || r > n.right || i < n.top || i > n.bottom) && o();
		}), e.addEventListener("pointerdown", (a) => {
			if (a.button !== 0) return;
			let o = e.getBoundingClientRect(), s = (e, t) => e >= o.left && e <= o.right && t >= o.top && t <= o.bottom, c = () => {
				window.removeEventListener("pointerup", l, !0), window.removeEventListener("pointercancel", u, !0);
			}, l = (e) => {
				e.pointerId === a.pointerId && (c(), ((document.elementFromPoint(e.clientX, e.clientY)?.closest(".player-hit"))?.dataset.buttonKey === r || s(e.clientX, e.clientY)) && i(t, n, "release", r));
			}, u = (e) => {
				e.pointerId === a.pointerId && c();
			};
			window.addEventListener("pointerup", l, !0), window.addEventListener("pointercancel", u, !0);
			try {
				e.setPointerCapture(a.pointerId);
			} catch {}
			i(t, n, "press", r);
		});
	}
	createMedia(e) {
		if (e.kind === "text") {
			let t = document.createElement("div");
			return t.className = "player-text", this.styleText(t, e), t;
		}
		if (e.kind === "button") {
			let t = document.createElement("img");
			return t.className = "player-hit", t.decoding = "async", t.draggable = !1, t.src = e.src ? O(e.src) : Me, t;
		}
		let t = document.createElement("img");
		return t.decoding = "async", t.draggable = !1, t;
	}
	updateMedia(e, t) {
		if (e.kind === "text") {
			t.text ? this.styleText(e.media, t) : e.src !== t.src && t.src && this.loadPlainText(e.media, t.src), e.src = t.src;
			return;
		}
		e.src !== t.src && e.media instanceof HTMLImageElement && (e.media.src = t.src ? O(t.src) : Me, e.src = t.src);
	}
	loadPlainText(e, t) {
		fetch(O(t)).then((e) => e.ok ? e.text() : "").then((t) => {
			e.textContent = t.trim();
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
		i > 0 && (e.style.width = `${i}px`), e.style.fontSize = `${n.fontHeight}px`, e.style.lineHeight = n.leading ? `${n.fontHeight + n.leading}px` : "normal", e.style.color = n.color ?? "#000", e.style.textAlign = n.align ?? "left", e.style.whiteSpace = n.wordWrap ? "pre-wrap" : "pre", r && (e.style.fontFamily = r), n.html ? e.innerHTML = n.text ?? "" : e.textContent = n.text ?? "";
	}
	placeNode(t, n) {
		t.kind !== "text" && e.set(t.media, {
			position: "absolute",
			left: -n.origin.x,
			top: -n.origin.y,
			width: n.origin.width || "auto",
			height: n.origin.height || "auto"
		});
		let { a: r, b: i, c: a, d: o, tx: s, ty: c } = n.matrix;
		e.set(t.element, {
			zIndex: n.order,
			opacity: n.opacity,
			transform: `matrix(${r}, ${i}, ${a}, ${o}, ${s}, ${c})`
		}), ke(t.media, n.colorTransform);
	}
}, He = class {
	registered = /* @__PURE__ */ new Set();
	families = /* @__PURE__ */ new Map();
	register(e) {
		let t = "fonts" in document;
		for (let n of Object.values(e.assets ?? {})) {
			if (n.kind !== "font" || !n.src) continue;
			let e = (n.src.split("/").pop() ?? "").replace(/\.ttf$/i, "").replace(/^\d+_/, "").trim(), r = `swf-font-${n.id}`;
			this.families.set(n.id, `"${r}", "${e}", Arial, Helvetica, sans-serif`), !(!t || this.registered.has(n.id)) && (this.registered.add(n.id), new FontFace(r, `url("${encodeURI(O(n.src))}")`).load().then((e) => document.fonts.add(e)).catch(() => {}));
		}
	}
	resolveFamily(e) {
		if (e != null) return this.families.get(e);
	}
};
//#endregion
//#region src/player/avm1.ts
function F(e) {
	if (!e?.trim()) return [];
	let t = [], n = 0, r = "", i = 0;
	for (let a = 0; a < e.length; a++) {
		let o = e[a];
		if (r) {
			o === r && e[a - 1] !== "\\" && (r = "");
			continue;
		}
		o === "\"" || o === "'" ? r = o : o === "(" || o === "[" ? n++ : o === ")" || o === "]" ? n-- : o === "," && n === 0 && (t.push(e.slice(i, a)), i = a + 1);
	}
	return t.push(e.slice(i)), t;
}
function I(e) {
	let t = e.trim();
	return /^[A-Za-z_$][\w$]*$/.test(t) && !/^(true|false|null|undefined|this|_root|_global|_parent|_level\d+)$/.test(t);
}
function Ue(e, t) {
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
function L(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
//#endregion
//#region src/player/renderNodes.ts
function We(e, t) {
	for (let n of e.childClips.values()) if (n.name === t) return n;
	return null;
}
function Ge(e) {
	return e.kind === "sprite" && !!(e.timeline?.length || e.frames?.length);
}
function Ke(e, t) {
	if (e.kind === "sprite" && e.frames?.length) {
		let n = t ? L(t.currentFrame, 0, e.frames.length - 1) : 0;
		return e.frames[n] ?? "";
	}
	return e.kind === "button" ? e.states?.up?.src ?? e.src ?? "" : e.src ?? "";
}
function qe(e, t, n, r, i, a, o, s, c = o.colorTransform) {
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
		clipDepth: o.clipDepth,
		spriteFrame: s
	};
}
function R(e, t, n, r, i, a, o, s = 1, c, l = i.colorTransform) {
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
		buttonOwnerPath: a
	};
}
//#endregion
//#region src/player/ClipInstance.ts
var z = class {
	characterId;
	parent;
	name;
	currentFrame = 0;
	playing = !0;
	enteredFrame = -1;
	childClips = /* @__PURE__ */ new Map();
	depthNames = /* @__PURE__ */ new Map();
	locals = {};
	constructor(e, t, n) {
		this.characterId = e, this.name = t, this.parent = n;
	}
};
//#endregion
//#region src/player/conditions.ts
function B(e, t) {
	if (!e) return !0;
	let n = e.trim();
	return n === "" || n === "else" || n === "true" ? !0 : n === "false" ? !1 : V(n, t);
}
function V(e, t) {
	let n = G(e, "||");
	return n.length > 1 ? n.some((e) => H(e, t)) : H(e, t);
}
function H(e, t) {
	let n = G(e, "&&");
	return n.length > 1 ? n.every((e) => U(e, t)) : U(e, t);
}
function U(e, t) {
	let n = e.trim();
	for (; n.startsWith("(") && $e(n) === n.length - 1;) n = n.slice(1, -1).trim();
	if (G(n, "||").length > 1) return V(n, t);
	if (G(n, "&&").length > 1) return H(n, t);
	if (n.startsWith("!")) return !U(n.slice(1), t);
	for (let e of [
		"==",
		"!=",
		"<=",
		">=",
		"<",
		">"
	]) {
		let r = Qe(n, e);
		if (r >= 0) return Je(W(n.slice(0, r), t), W(n.slice(r + e.length), t), e);
	}
	return Xe(W(n, t));
}
function Je(e, t, n) {
	let r = Ze(e), i = Ze(t);
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
function W(e, t) {
	let n = e.trim();
	if (n === "") return;
	let r = Ye(n, "eval");
	if (r !== void 0) {
		let e = W(r, t);
		return e === void 0 ? void 0 : t.get(String(e));
	}
	return n.startsWith("\"") && n.endsWith("\"") || n.startsWith("'") && n.endsWith("'") ? n.slice(1, -1) : n === "true" ? !0 : n === "false" ? !1 : /^-?\d+(\.\d+)?$/.test(n) ? Number(n) : t.get(n);
}
function Ye(e, t) {
	let n = `${t}(`;
	if (!e.startsWith(n) || !e.endsWith(")")) return;
	let r = e.slice(t.length);
	if ($e(r) === r.length - 1) return r.slice(1, -1).trim();
}
function Xe(e) {
	return e !== void 0 && e !== !1 && e !== 0 && e !== "" && e !== "0";
}
function Ze(e) {
	if (typeof e == "number") return e;
	if (typeof e == "boolean") return +!!e;
	if (typeof e == "string" && /^-?\d+(\.\d+)?$/.test(e.trim())) return Number(e);
}
function G(e, t) {
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
function Qe(e, t) {
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
function $e(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(") t++;
	else if (e[n] === ")" && (t--, t === 0)) return n;
	return -1;
}
//#endregion
//#region src/player/matrix.ts
var et = {
	a: 1,
	b: 0,
	c: 0,
	d: 1,
	tx: 0,
	ty: 0
};
function K(e, t) {
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
var tt = class t {
	fps;
	state = { t: 0 };
	tween;
	lastTick = -1;
	onTick;
	static HORIZON = 1e7;
	constructor(n, r) {
		this.fps = n, this.onTick = r, this.tween = e.to(this.state, {
			t: t.HORIZON,
			duration: t.HORIZON / n,
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
}, nt = /^_(?:level\d+|root|parent)\./;
function q(e) {
	let t = e.trim();
	for (; nt.test(t);) t = t.replace(nt, "");
	return t;
}
var rt = class {
	values = /* @__PURE__ */ new Map();
	seed(e) {
		if (e) for (let [t, n] of Object.entries(e)) {
			let e = q(t);
			!this.values.has(e) && (typeof n == "string" || typeof n == "number" || typeof n == "boolean") && this.values.set(e, n);
		}
	}
	get(e) {
		return this.values.get(q(e));
	}
	set(e, t) {
		this.values.set(q(e), t);
	}
	has(e) {
		return this.values.has(q(e));
	}
	reset() {
		this.values.clear();
	}
}, it = new Set([
	"gotoAndPlay",
	"gotoAndStop",
	"play",
	"stop",
	"nextFrame",
	"prevFrame"
]), at = new Set(["waitForVal", "startTimer"]), ot = new Set(["markSnd", "markSndSegment"]), st = /^_level[1-9]\d*\b/i, J = -1, ct = 24, lt = 3, ut = {
	x: 0,
	y: 0,
	width: 0,
	height: 0
}, dt = class {
	timeline;
	renderer;
	options;
	ticker;
	assets;
	rootFrames;
	startFrame;
	rootStop;
	rootActions = /* @__PURE__ */ new Map();
	spriteActions = /* @__PURE__ */ new Map();
	spriteStop = /* @__PURE__ */ new Map();
	functions = /* @__PURE__ */ new Map();
	spriteFunctions = /* @__PURE__ */ new Map();
	store;
	textVars = /* @__PURE__ */ new Map();
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
	constructor(e, t, n = {}) {
		this.timeline = e, this.renderer = t, this.options = n, this.assets = e.assets ?? {};
		for (let e of Object.values(this.assets)) {
			let t = e?.text?.normalizedVariableName;
			t && this.boundTextVars.add(q(t));
		}
		for (let t of Object.values(e.control?.dynamicTexts ?? {})) {
			let e = t?.normalizedVariableName;
			e && this.boundTextVars.add(q(e));
		}
		this.rootFrames = e.frames ?? [], this.rootStop = new Set(e.control?.stopFrames ?? []), this.startFrame = L(n.startFrame ?? e.entryFrame ?? 0, 0, Math.max(0, this.rootFrames.length - 1));
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
		this.store = n.store, this.buildFunctionTable(), this.buildSoundSegmentDurations(), this.ticker = new tt(e.fps || 20, () => this.onTick()), this.root = this.buildRoot(this.startFrame), this.primeAmbientSound(), this.render();
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
		this.ticker.pause(), this.voWaiting = !1, this.buttonVisualStates.clear(), this.root = this.buildRoot(L(e, 0, this.frameCount - 1)), this.render(), this.options.onFrame?.(this.root.currentFrame, !1);
	}
	restart() {
		this.seekRootFrame(this.startFrame), this.primeAmbientSound();
	}
	destroy() {
		this.ticker.destroy(), this.buttonVisualStates.clear(), this.renderer.clear();
	}
	handleButtonEvent(e, t, n, r) {
		this.setButtonVisualState(r ?? `${e}:${t}`, n);
		let i = this.clipByPath.get(e) ?? this.root, a = this.buttonEventScope(i, t), o = this.buttonActionFor(i, t, n), s = this.companionButtonActions(i, t, n);
		if (!o) {
			this.render();
			return;
		}
		for (let e of o.assignments ?? []) {
			let t = this.resolveExpr(e.rawValue ?? String(e.value ?? ""));
			e.target && t !== void 0 && !ft(e.target, t) && this.scopeSet(i, e.target, t);
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
		}, i, void 0, a), (o.command === "loadMovieNum" || o.command === "loadMovie") && this.options.onNavigate?.(o), o.command !== "loadMovieNum" && o.command !== "loadMovie") {
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
	}
	buttonActionFor(e, t, n) {
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
		if (n === "release") return [];
		let r = this.timeline.control?.buttonActions ?? {}, i = r[String(t)], a = pt(i?.release);
		if (!i || !a) return [];
		let o = [], s = e.parent ?? e;
		for (let [c, l] of Object.entries(r)) {
			let r = Number(c);
			if (!Number.isFinite(r) || r === t) continue;
			let u = l[n];
			if (!u || pt(l.release) !== a || !mt(i, l) || !ht(i[n], u)) continue;
			let d = this.findButtonOwnerClip(s, r) ?? this.findButtonOwnerClip(this.root, r);
			!d || d === e || o.push({
				owner: d,
				characterId: r,
				action: u
			});
		}
		return o;
	}
	runCompanionButtonAction(e, t, n) {
		let r = this.buttonEventScope(e, t);
		for (let t of n.assignments ?? []) {
			let n = this.resolveExpr(t.rawValue ?? String(t.value ?? ""));
			t.target && n !== void 0 && !ft(t.target, n) && this.scopeSet(e, t.target, n);
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
		return new z(t, "", e);
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
			body: []
		});
		for (let n of Object.values(e?.definedFunctions ?? {})) {
			let e = n?.functionName;
			if (!e) continue;
			let r = this.functions.get(e) ?? t();
			n.parameters?.length && (r.parameters = n.parameters), n.actions?.length && r.actions.push(...n.actions), n.body?.length && r.body.push(...n.body), this.functions.set(e, r);
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
			let e = (n.body ?? []).filter((e) => e.kind === "call" && !!e.functionName?.startsWith("gotoAnd") && (!e.target || e.target === "self" || e.target === "this") || e.kind === "assign" && I(e.target));
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
		if (!r) return !1;
		let i = this.bindParams(r.parameters, t, n), a = this.functionActionDecisions(r.actions, i), o = this.functionBodyDecisions(r.body, i), s = new Set(r.body.filter((e, t) => o[t] && e.kind === "call").map((e) => e.functionName)), c = new Set(r.body.filter((e, t) => o[t] && e.kind === "call").map((e) => this.bodySoundCallKey(e, i)).filter((e) => !!e));
		return r.actions.forEach((e, t) => {
			if (!a[t]) return;
			let n = e.functionCalls ?? [];
			if (e.command === "callFunctions" && n.length > 0 && n.every((e) => s.has(e.functionName))) return;
			let r = St(e);
			r && c.has(r) || this.runFunctionAction(e, i);
		}), this.runFunctionBody(r.body, i, o), this.render(), !0;
	}
	functionActionDecisions(e, t) {
		let n = e.map(() => !0);
		if (!this.store) return n;
		let r = (e) => e === "else", i = (e) => !e || this.evalGuard(Ue(e, t));
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
	bindParams(e, t, n) {
		let r = {};
		if (!e.length) return r;
		let i = this.parseArgs(t, n);
		return e.forEach((e, t) => {
			r[e] = i[t];
		}), r;
	}
	parseArgs(e, t) {
		return F(e).map((e) => this.resolveExpr(e.trim(), t));
	}
	getTimer() {
		return performance.now();
	}
	resolveExpr(e, t) {
		let n = e.trim();
		if (n === "") return;
		if (n === "getTimer()") return this.getTimer();
		let r = wt(n, "eval");
		if (r !== void 0) {
			let e = this.resolveExpr(r, t);
			return e === void 0 ? void 0 : this.store?.get(String(e)) ?? this.textVars.get(q(String(e))) ?? void 0;
		}
		return n.startsWith("\"") && n.endsWith("\"") || n.startsWith("'") && n.endsWith("'") ? n.slice(1, -1) : n === "true" ? !0 : n === "false" ? !1 : /^-?\d+(\.\d+)?$/.test(n) ? Number(n) : t && n in t ? t[n] : /^[A-Za-z_$][\w$.]*$/.test(n) ? this.store?.get(n) ?? this.textVars.get(q(n)) ?? void 0 : n;
	}
	scopeGet(e, t) {
		return I(t) && t in e.locals ? e.locals[t] : this.store?.get(t);
	}
	scopeSet(e, t, n) {
		I(t) && (e.locals[t] = n), this.store?.set(t, n);
	}
	scopeFor(e) {
		return {
			get: (t) => this.scopeGet(e, t),
			set: (t, n) => this.scopeSet(e, t, n),
			has: (t) => I(t) && t in e.locals || (this.store?.has(t) ?? !1)
		};
	}
	evalGuard(e, t) {
		return this.store ? e ? B(e.replace(/[\w.]*\btimeMarkDone\s*\(([^)]*)\)/g, (e, t) => {
			let n = Number(this.resolveExpr(t.trim()) ?? 0), r = Number(this.store?.get("bkgd.timeTarg") ?? 0);
			return this.getTimer() > r + n ? "1" : "0";
		}), t ? this.scopeFor(t) : this.store) : !0 : !e;
	}
	resolveArgsString(e, t) {
		return this.parseArgs(e, t).map((e) => typeof e == "string" ? JSON.stringify(e) : String(e)).join(",");
	}
	branchPasses(e, t) {
		return !e || !this.store ? !e : B(Ue(e, t), this.store);
	}
	functionBodyDecisions(e, t) {
		let n = this.functionGuardLocals(e, t);
		return e.map((e) => this.branchPasses(e.branchCondition, n));
	}
	runFunctionBody(e, t, n = this.functionBodyDecisions(e, t)) {
		e.forEach((e, r) => {
			n[r] && this.runBodyStatement(e, t);
		});
	}
	functionGuardLocals(e, t) {
		let n = { ...t };
		for (let t of e) {
			if (t.kind !== "assign" || gt(t.branchCondition, t.target) || !this.branchPasses(t.branchCondition, n)) continue;
			let e = this.resolveExpr(t.rawValue, n);
			e !== void 0 && (n[t.target] = e);
		}
		return n;
	}
	runBodyStatement(e, t) {
		if (e.kind === "assign") {
			let n = this.resolveExpr(e.rawValue, t);
			this.trackSoundObject(e.target, e.rawValue), this.store && n !== void 0 && this.store.set(e.target, n);
			return;
		}
		this.runBodyCall(e, t);
	}
	runBodyCall(e, t) {
		let n = e.functionName, r = e.target;
		if (!this.runMovieLoadCall(n, e.arguments, t) && !this.runMovieUnloadCall(n, e.arguments, t) && !this.runSoundMethod(r, n, e.arguments, t)) {
			if (at.has(n)) {
				this.options.onWaiter?.(n, this.parseArgs(e.arguments, t));
				return;
			}
			if (ot.has(n)) {
				let n = this.parseArgs(e.arguments, t)[0];
				n !== void 0 && this.runSoundMarker(r, String(n), e.arguments);
				return;
			}
			if (it.has(n) && r) {
				let i = this.parseArgs(e.arguments, t)[0] ?? 0;
				/^_level\d+/i.test(r) ? this.options.onClipCommand?.(r, n, i) : this.runNamedClipCommand(this.root, r, n, i);
				return;
			}
			if (!r || r === "self" || r === "this" || r === "_root" || r === "_level0") this.callFunction(n, e.arguments, t);
			else if (/^_level\d+/i.test(r)) this.options.onCallFunction?.(r, n, this.resolveArgsString(e.arguments, t));
			else {
				let i = this.resolveTarget(this.root, r) ?? this.findClipByName(this.root, r);
				i === this.root ? this.callFunction(n, e.arguments, t) : i && this.callClipFunction(i, n);
			}
		}
	}
	bodySoundCallKey(e, t) {
		let [n] = this.parseArgs(e.arguments, t);
		switch (e.functionName) {
			case "attachSound": return Q("attachSound", n);
			case "playVO": return Q("playVO", n);
			case "markSnd":
			case "markSndSegment": return Q("markSndSegment", n);
			case "stop": return e.target ? Q("stopSound", q(e.target)) : void 0;
			default: return;
		}
	}
	runMovieLoadCall(e, t, n) {
		if (e !== "loadMovieNum" && e !== "loadMovie") return !1;
		let r = this.parseArgs(t, n), i = r[0] === void 0 ? "" : String(r[0]);
		return i && this.options.onNavigate?.({
			command: e,
			swf: i,
			level: e === "loadMovieNum" ? vt(r[1], _t(t, 1)) : void 0,
			executionContext: "function"
		}), !0;
	}
	runMovieUnloadCall(e, t, n) {
		if (e !== "unloadMovieNum" && e !== "unloadMovie") return !1;
		let r = this.parseArgs(t, n);
		return this.options.onNavigate?.({
			command: e,
			level: vt(r[0], _t(t, 0)),
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
				value: typeof t == "boolean" ? Number(t) : t,
				executionContext: "function"
			}), !0;
		}
		return t === "getVolume";
	}
	soundTargetKey(e) {
		return q(e);
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
		let e = A(this.timeline.control);
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
				let e = F(t.arguments);
				(t.functionName === "markSnd" || t.functionName === "markSndSegment") && n(Ct(e[0])), t.functionName === "playVO" && n(Ct(e[2]));
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
	runFunctionAction(e, t) {
		switch (e.command) {
			case "stop":
				Y(e.target) && (this.root.playing = !1);
				break;
			case "play":
				Y(e.target) && (this.root.playing = !0);
				break;
			case "gotoAndPlay":
			case "gotoAndStop": {
				let t = this.resolveTarget(this.root, e.target), n = this.resolveFrame(e, t);
				t && n >= 0 && (t.playing = e.command === "gotoAndPlay", this.enterFrame(t, n, 0));
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
			case "loadVariables":
				this.options.onLoadVariables?.(e);
				break;
			case "setVariable": {
				let t = this.resolveExpr(e.rawValue ?? String(e.value ?? ""));
				if (this.trackSoundObject(e.target, e.rawValue), this.store && e.target && t !== void 0) {
					this.scopeSet(this.root, e.target, t);
					let n = q(e.target);
					this.boundTextVars.has(n) && this.textVars.set(n, String(t));
				}
				break;
			}
			case "callFunctions":
				this.runCallFunctions(e, this.root, t);
				break;
			default: break;
		}
	}
	runCallFunctions(e, t = this.root, n, r) {
		let i = !1;
		for (let a of e.functionCalls ?? []) {
			let o = this.runFunctionCall(a, t, n, r);
			xt(a, e.soundAction) && o && (i = !0);
		}
		e.soundAction && !i && this.runSoundMetadataFallback(e.soundAction);
	}
	runFunctionCall(e, t, n, r) {
		let i = e.target ?? "self", a = e.functionName;
		if (this.runSoundMethod(i, a, e.arguments, n)) return !0;
		if (at.has(a)) return this.options.onWaiter?.(a, this.parseArgs(e.arguments, n)), !0;
		if (ot.has(a)) {
			let t = this.parseArgs(e.arguments, n)[0];
			if (t !== void 0) return this.runSoundMarker(i, String(t), e.arguments), !0;
		}
		if (it.has(a) && i !== "self" && i !== "this" && i !== "_root") {
			let o = this.parseArgs(e.arguments, n)[0] ?? 0;
			return /^_level\d+/i.test(i) ? (this.options.onClipCommand?.(i, a, o), !0) : this.runNamedClipCommand(t, i, a, o) ? !0 : r ? this.runNamedClipCommand(r, i, a, o) : !1;
		}
		if (i === "self" || i === "this" || i === "_root") return i !== "_root" && this.spriteFunctions.get(t.characterId)?.has(a) ? this.callClipFunction(t, a) : this.callFunction(a, e.arguments);
		if (/^_level\d+/i.test(i)) return this.options.onCallFunction?.(i, a, this.resolveArgsString(e.arguments, n)), !0;
		let o = i.split(".").filter(Boolean).pop() ?? i, s = this.resolveTarget(t, i) ?? this.findClipByName(t, o) ?? (r ? this.resolveTarget(r, i) ?? this.findClipByName(r, o) : null);
		return s === this.root ? this.callFunction(a, e.arguments, n) : s ? this.callClipFunction(s, a) : !1;
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
		let r = this.scopeFor(e), i = (e) => e === "else", a = n.actions.some((e) => e.functionBranchCondition && !i(e.functionBranchCondition) && B(e.functionBranchCondition, r)), o = n.actions.map((e) => {
			let t = e.functionBranchCondition;
			return i(t) ? !a : !t || B(t, r);
		});
		for (let t = 0; t < n.actions.length; t += 1) this.store && !o[t] || this.runClipAction(e, n.actions[t]);
		return this.render(), !0;
	}
	runClipAction(e, t) {
		switch (t.command) {
			case "stop":
				Y(t.target) && (e.playing = !1);
				break;
			case "play":
				Y(t.target) && (e.playing = !0);
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
				this.trackSoundObject(t.target, t.rawValue), t.target && n !== void 0 && this.scopeSet(e, t.target, n);
				break;
			}
			default: break;
		}
	}
	findClipByName(e, t) {
		let n = [], r = (e) => {
			if (e.name === t) return e;
			Z(e.name, t) && n.push(e);
			for (let t of e.childClips.values()) {
				let e = r(t);
				if (e) return e;
			}
			return null;
		};
		return r(e) || (n.length === 1 ? n[0] : null);
	}
	buildRoot(e) {
		let t = new z(J, "_root", null);
		return this.enterFrame(t, e, 0), t;
	}
	onTick() {
		this.tickClip(this.root), this.render(), this.options.onFrame?.(this.root.currentFrame, this.ticker.isPlaying);
	}
	tickClip(e) {
		let t = this.frameCountFor(e);
		if (e.playing && t > 1) {
			let n = e.currentFrame + 1 >= t ? 0 : e.currentFrame + 1;
			this.enterFrame(e, n, 0);
		} else e.enteredFrame < 0 && this.enterFrame(e, e.currentFrame, 0);
		for (let t of e.childClips.values()) this.tickClip(t);
	}
	enterFrame(e, t, n) {
		e.currentFrame = L(t, 0, Math.max(0, this.frameCountFor(e) - 1)), this.reconcile(e), e.enteredFrame !== e.currentFrame && (e.enteredFrame = e.currentFrame, this.stopFramesFor(e).has(e.currentFrame) && (e.playing = !1), n < ct && this.runScript(e, n));
	}
	reconcile(e) {
		let t = this.framesFor(e);
		if (!t) return;
		let n = t[e.currentFrame]?.instances ?? [], r = /* @__PURE__ */ new Set();
		for (let t of n) {
			let n = this.getAsset(t.characterId);
			if (!n || !Ge(n)) continue;
			r.add(t.depth), t.name && e.depthNames.set(t.depth, t.name);
			let i = t.name || e.depthNames.get(t.depth) || "", a = e.childClips.get(t.depth);
			if (!a || a.characterId !== t.characterId) {
				let n = new z(t.characterId, i, e);
				e.childClips.set(t.depth, n), this.enterFrame(n, 0, 0);
				let r = i ? this.pendingClipCommandKey(i) : void 0, a = r ? this.pendingClipCommands.get(r) : void 0;
				if (a && r) {
					this.pendingClipCommands.delete(r);
					let e = this.resolveClipFrame(n, a.frame);
					e >= 0 && (n.playing = a.command === "gotoAndPlay", this.enterFrame(n, e, 0));
				}
			} else i && a.name !== i && (a.name = i);
		}
		for (let [t] of e.childClips) r.has(t) || e.childClips.delete(t);
	}
	pendingClipCommandKey(e) {
		if (this.pendingClipCommands.has(e)) return e;
		let t = Array.from(this.pendingClipCommands.keys()).filter((t) => Z(e, t));
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
					Y(a.target) && (e.playing = !1);
					break;
				case "play":
					Y(a.target) && (e.playing = !0);
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
						if (t <= lt && i) {
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
						this.scopeSet(e, a.target, t);
						let n = q(a.target);
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
			r = We(r, t) ?? this.findClipByName(r, t);
		}
		return r;
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
			return L(t.currentFrame + e, 0, Math.max(0, this.frameCountFor(t) - 1));
		}
		return -1;
	}
	framesFor(e) {
		return e.characterId === J ? this.rootFrames : this.assets[String(e.characterId)]?.timeline ?? null;
	}
	frameCountFor(e) {
		if (e.characterId === J) return Math.max(1, this.rootFrames.length);
		let t = this.assets[String(e.characterId)];
		return Math.max(1, t?.timeline?.length ?? t?.frames?.length ?? 1);
	}
	stopFramesFor(e) {
		if (e.characterId === J) return this.rootStop;
		let t = this.spriteStop.get(e.characterId);
		return t || (t = new Set(this.timeline.control?.spriteStopFrames?.[String(e.characterId)] ?? []), this.spriteStop.set(e.characterId, t)), t;
	}
	actionsFor(e) {
		return e.characterId === J ? this.rootActions.get(e.currentFrame) ?? [] : this.spriteActions.get(`${e.characterId}:${e.currentFrame}`) ?? [];
	}
	getAsset(e) {
		return this.assets[String(e)] ?? this.assets[`button:${e}`];
	}
	render() {
		let e = [];
		this.clipByPath = /* @__PURE__ */ new Map(), this.clipByPath.set("0", this.root), this.flatten(this.root, et, 1, void 0, "0", { n: 0 }, e);
		let t = new Set(e.filter((e) => e.kind === "button").map((e) => e.key));
		for (let e of this.buttonVisualStates.keys()) t.has(e) || this.buttonVisualStates.delete(e);
		this.renderer.apply(e), this.lastNodes = e;
	}
	flatten(e, t, n, r, i, a, o) {
		let s = this.framesFor(e);
		if (!s) return;
		let c = s[e.currentFrame];
		if (!c) return;
		let l = new Set(c.instances.map((e) => e.depth)), u = [], d = (e) => {
			for (; u.length && e > u[u.length - 1].clipDepth;) {
				let e = u.pop();
				o.push({
					key: e.key,
					order: e.order,
					characterId: 0,
					kind: "shape",
					name: "",
					src: "",
					origin: ut,
					matrix: t,
					opacity: 1,
					maskGroup: e.group
				});
			}
		};
		for (let s of c.instances) {
			d(s.depth);
			let c = this.getAsset(s.characterId);
			if (!c) continue;
			let l = K(t, s.matrix), f = n * s.opacity, p = X(r, s.colorTransform), m = `${i}/${s.depth}`, h = e.childClips.get(s.depth);
			if (s.clipDepth) {
				let e = Ke(c, h);
				e && u.push({
					key: `${m}#mask`,
					order: a.n++,
					clipDepth: s.clipDepth,
					group: {
						mask: {
							characterId: c.id,
							src: e,
							origin: c.origin,
							matrix: l,
							opacity: 1,
							colorTransform: p
						},
						items: []
					}
				});
				continue;
			}
			let g = u[u.length - 1];
			if (g && s.depth <= g.clipDepth) {
				let e = Ke(c, h);
				e && g.group.items.push({
					characterId: c.id,
					src: e,
					origin: c.origin,
					matrix: l,
					opacity: f,
					colorTransform: p
				});
				continue;
			}
			if (c.kind === "sprite" && c.frames?.length && !c.overflowsBounds) {
				let e = h ? L(h.currentFrame, 0, c.frames.length - 1) : 0;
				o.push(qe(m, a.n++, c, c.frames[e], l, f, s, h?.currentFrame, p)), h && c.timeline?.length && this.collectButtons(h, l, p, m, a, o);
				continue;
			}
			if (c.kind === "sprite" && c.timeline?.length && h && h.characterId === c.id) {
				this.clipByPath.set(m, h), this.flatten(h, l, f, p, m, a, o);
				continue;
			}
			if (c.kind === "button") {
				o.push(R(m, a.n++, c, l, s, i, !0, f, this.buttonVisualStates.get(m), p)), this.collectButtonText(c, l, p, m, a, o, s);
				continue;
			}
			o.push(this.leafNode(m, a.n++, c, c.src ?? "", l, f, s, p));
		}
		this.collectLatentButtons(e, t, r, i, a, o, l, n), d(Infinity);
	}
	collectButtons(e, t, n, r, i, a) {
		this.clipByPath.set(r, e);
		let o = this.framesFor(e);
		if (!o) return;
		let s = o[e.currentFrame];
		if (!s) return;
		let c = new Set(s.instances.map((e) => e.depth));
		for (let o of s.instances) {
			if (o.clipDepth) continue;
			let s = this.getAsset(o.characterId);
			if (!s) continue;
			let c = K(t, o.matrix), l = X(n, o.colorTransform), u = `${r}/${o.depth}`;
			if (s.kind === "button") a.push(R(u, i.n++, s, c, o, r, !1, 1, this.buttonVisualStates.get(u), l)), this.collectButtonText(s, c, l, u, i, a, o);
			else if (s.kind === "text") {
				let e = this.resolveTextField(s.id, s);
				(e?.normalizedVariableName ? this.textVars.has(e.normalizedVariableName) : e?.text && String(e.text).trim()) && a.push(this.leafNode(u, i.n++, s, s.src ?? "", c, o.opacity, o, l));
			} else if (s.kind === "sprite") {
				let t = e.childClips.get(o.depth);
				t && this.collectButtons(t, c, l, u, i, a);
			}
		}
		this.collectLatentButtons(e, t, n, r, i, a, c);
	}
	collectLatentButtons(e, t, n, r, i, a, o, s = 1) {
		if (!(e.characterId === J || e.playing)) for (let c of this.latentButtonPlacements(e)) {
			if (o.has(c.depth)) continue;
			let e = this.getAsset(c.characterId);
			if (!e || e.kind !== "button") continue;
			let l = K(t, c.matrix), u = X(n, c.colorTransform), d = `${r}/${c.depth}`;
			a.push(R(d, i.n++, e, l, c, r, !1, s, this.buttonVisualStates.get(d), u));
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
	buttonControlsOwnerTimeline(e) {
		let t = this.timeline.control?.buttonActions?.[String(e)];
		return t ? [
			"rollOver",
			"press",
			"release",
			"rollOut"
		].some((e) => {
			let n = t[e];
			return !!(n && (n.command === "gotoAndPlay" || n.command === "gotoAndStop") && Y(n.target));
		}) : !1;
	}
	collectButtonText(e, t, n, r, i, a, o) {
		for (let s of e.textFields ?? []) {
			let e = this.getAsset(s.id);
			if (!e) continue;
			let c = this.resolveTextField(s.id, e);
			if (!c?.normalizedVariableName || !this.textVars.has(c.normalizedVariableName)) continue;
			let l = K(t, s.matrix);
			a.push(this.leafNode(`${r}/txt:${s.id}`, i.n++, e, e.src ?? "", l, o.opacity, o, n));
		}
	}
	leafNode(e, t, n, r, i, a, o, s = o.colorTransform) {
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
			colorTransform: s,
			clipDepth: o.clipDepth,
			text: n.kind === "text" ? this.resolveTextField(n.id, n) : void 0
		};
	}
	setTextVars(e) {
		for (let [t, n] of Object.entries(e)) this.textVars.set(t, n);
		this.render();
	}
	resolveTextField(e, t) {
		let n = t.text, r = this.timeline.control?.dynamicTexts?.[String(e)], i = n && r ? {
			...n,
			...r
		} : n ?? r;
		if (!i) return i;
		let a = i.normalizedVariableName;
		if (a && this.textVars.has(a)) {
			let e = this.textVars.get(a) ?? "";
			return {
				...i,
				text: e,
				align: bt(e, i.align, !!i.html)
			};
		}
		return i;
	}
	primeAmbientSound() {
		if (!this.options.onSound) return;
		let e;
		for (let t = 0; t < this.root.currentFrame; t += 1) for (let n of this.rootActions.get(t) ?? []) n.command === "attachSound" && n.soundRole === "music" && (e = n);
		e && this.options.onSound(e);
	}
};
function Y(e) {
	return !e || e === "self" || e === "this" || e === "_root" || e === "_level0" || e === "root";
}
function ft(e, t) {
	return t === "" && st.test(e);
}
function X(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = (t.rm ?? 1) * (e.rm ?? 1), r = (t.gm ?? 1) * (e.gm ?? 1), i = (t.bm ?? 1) * (e.bm ?? 1), a = (t.ra ?? 0) * (e.rm ?? 1) + (e.ra ?? 0), o = (t.ga ?? 0) * (e.gm ?? 1) + (e.ga ?? 0), s = (t.ba ?? 0) * (e.bm ?? 1) + (e.ba ?? 0);
	if (!(n === 1 && r === 1 && i === 1 && a === 0 && o === 0 && s === 0)) return {
		rm: n,
		gm: r,
		bm: i,
		ra: a,
		ga: o,
		ba: s
	};
}
function pt(e) {
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
function mt(e, t) {
	let n = new Set((e.ownerSpriteIds ?? []).map(String));
	return (t.ownerSpriteIds ?? []).some((e) => n.has(String(e)));
}
function ht(e, t) {
	return !(!e || !t || e.command !== t.command || (e.target ?? "self") !== (t.target ?? "self") || (e.label ?? "") !== (t.label ?? "") || (e.frame ?? "") !== (t.frame ?? "") || (e.frameExpression ?? "") !== (t.frameExpression ?? ""));
}
function gt(e, t) {
	if (!e) return !1;
	let n = q(t), r = new Set([
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
function _t(e, t) {
	return F(e)[t]?.trim();
}
function vt(e, t) {
	return yt(e) ?? yt(t);
}
function yt(e) {
	if (e == null) return;
	let t = String(e).replace(/^["']|["']$/g, "").trim(), n = /^_level(\d+)$/i.exec(t), r = Number(n?.[1] ?? t);
	return Number.isFinite(r) ? r : void 0;
}
function bt(e, t, n) {
	if (!n) return t;
	let r = e.match(/<p\b[^>]*\balign\s*=\s*["']?(left|center|right|justify)\b/i) ?? e.match(/\btext-align\s*:\s*(left|center|right|justify)\b/i);
	return r?.[1] ? r[1].toLowerCase() : "left";
}
function Z(e, t) {
	return !e || !t || e === t || !e.startsWith(t) ? !1 : /^[A-Z0-9_$]/.test(e.slice(t.length));
}
function xt(e, t) {
	return t ? t.command === "markSndSegment" ? e.functionName === "markSnd" || e.functionName === "markSndSegment" : e.functionName === t.command : !1;
}
function St(e) {
	switch (e.command) {
		case "attachSound": return Q("attachSound", e.sound ?? e.resolvedSound);
		case "playVO": return Q("playVO", e.sound ?? e.resolvedSound);
		case "markSndSegment": return Q("markSndSegment", e.segment ?? e.sound ?? e.resolvedSound);
		case "stopSound": return e.target ? Q("stopSound", q(e.target)) : void 0;
		default: return;
	}
}
function Q(e, t) {
	if (!(t == null || t === "")) return `${e}:${String(t)}`;
}
function Ct(e) {
	let t = e?.trim();
	if (t && (t.startsWith("\"") && t.endsWith("\"") || t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
}
function wt(e, t) {
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
//#endregion
//#region src/audio/SoundController.ts
var Tt = class e {
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
			this.musicOwner = t, this.musicTarget = $(e.target), this.music.loop = !0, this.music.volume = r, this.tryPlay(this.music);
			return;
		}
		this.stopMusic();
		let i = new Audio(O(n));
		i.preload = "auto", i.loop = !0, i.volume = r, this.music = i, this.musicSrc = n, this.musicOwner = t, this.musicTarget = $(e.target), this.tryPlay(i);
	}
	playVoice(e, t) {
		let n = e.soundSrc;
		if (!n) return;
		let r = this.durationFor(e), i = this.pendingVoiceSegmentDurationMs;
		this.pendingVoiceSegmentDurationMs = 0, this.stopVoice();
		let a = new Audio(O(n));
		a.preload = "auto", a.volume = this.volumeFor(e.target, 1), this.voiceStartedAt = performance.now(), this.voiceDurationMs = i || (r && Number.isFinite(r) ? r : 0), a.addEventListener("loadedmetadata", () => {
			!this.voiceDurationMs && Number.isFinite(a.duration) && (this.voiceDurationMs = a.duration * 1e3);
		}), this.voice = a, this.voiceOwner = t, this.voiceTarget = $(e.target), this.tryPlay(a);
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
		e && (this.pendingPlayback.delete(e), e.pause(), Et(e)), this.music = null, this.musicSrc = "", this.musicOwner = void 0, this.musicTarget = "";
	}
	stopVoice() {
		let e = this.voice;
		e && (this.pendingPlayback.delete(e), e.pause(), Et(e)), this.voice = null, this.voiceOwner = void 0, this.voiceTarget = "", this.voiceStartedAt = 0, this.voiceDurationMs = 0;
	}
	stopForAction(e) {
		let t = $(e.target), n = e.soundRole === "music" || t && t === this.musicTarget, r = e.soundRole === "vo" || !t || t === this.voiceTarget;
		n && this.scheduleMusicStop(), r && this.stopVoice();
	}
	setVolume(e) {
		let t = $(e.target);
		if (!t) return;
		let n = Dt(e.value);
		this.targetVolumes.set(t, n), this.music && t === this.musicTarget && (this.music.volume = n), this.voice && t === this.voiceTarget && (this.voice.volume = n);
	}
	volumeFor(e, t) {
		let n = $(e);
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
function $(e) {
	return (e ?? "").replace(/^_root\./i, "").replace(/^_level0\./i, "").replace(/^this\./i, "").replace(/^self\./i, "");
}
function Et(e) {
	try {
		e.currentTime = 0;
	} catch {}
}
function Dt(e) {
	let t = Number(e);
	return Number.isFinite(t) ? Math.max(0, Math.min(1, t / 100)) : 1;
}
//#endregion
//#region src/app/PlayerController.ts
var Ot = /^_level(\d+)/, kt = class {
	container;
	options;
	fonts = new He();
	sound = new Tt();
	levels = /* @__PURE__ */ new Map();
	store = new rt();
	loadBurst = /* @__PURE__ */ new Set();
	pendingCalls = [];
	waiters = [];
	prefetched = /* @__PURE__ */ new Set();
	mainSwf = "";
	playing = !1;
	constructor(e, t = {}) {
		this.container = e, this.options = t;
	}
	get main() {
		return this.levels.get(0)?.player ?? null;
	}
	get active() {
		return this.levels.size > 0;
	}
	get frameCount() {
		return this.main?.frameCount ?? 0;
	}
	get currentFrame() {
		return this.main?.currentFrame ?? 0;
	}
	get isPlaying() {
		return this.main?.isPlaying ?? !1;
	}
	activate(e, t, n) {
		this.deactivate(), this.container.hidden = !1, this.mainSwf = t, this.createLevel(0, t, e), typeof n == "number" && this.main?.seekRootFrame(n), this.emitFrame();
	}
	deactivate() {
		for (let e of this.levels.values()) e.player.destroy(), e.layer.remove();
		this.levels.clear(), this.store.reset(), this.pendingCalls = [], this.waiters = [], this.loadBurst.clear(), this.prefetched.clear(), this.sound.destroy(), this.container.hidden = !0, this.container.replaceChildren();
	}
	play() {
		this.playing = !0;
		for (let e of this.levels.values()) e.player.play();
		this.sound.resume();
	}
	pause() {
		this.playing = !1;
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
		for (let e of this.levels.values()) e.player.restart();
		this.emitFrame();
	}
	createLevel(e, t, n) {
		this.levels.get(e) && this.destroyLevel(e), this.store.seed(n.control?.globalDefaults), this.sound.registerTimings(A(n.control)), this.fonts.register(n);
		let r = document.createElement("div");
		r.className = "player-level", r.style.zIndex = String(e), this.container.append(r);
		let i = new dt(n, new Ve(r, {
			resolveFontFamily: (e) => this.fonts.resolveFamily(e),
			onButtonEvent: (t, n, r, i) => this.levels.get(e)?.player.handleButtonEvent(t, n, r, i)
		}), {
			onFrame: e === 0 ? (e, t) => {
				this.checkWaiters(), this.options.onFrame?.(e, t, this.main?.currentLabel() ?? "");
			} : void 0,
			onSound: (t) => this.sound.handle(t, e),
			onNavigate: (t) => this.handleNavigate(t, e),
			store: this.store,
			onCallFunction: (e, t, n) => this.dispatchCall(e, t, n),
			onClipCommand: (e, t, n) => this.dispatchClipCommand(e, t, n),
			onWaiter: (t, n) => this.registerWaiter(e, t, n),
			onLoadVariables: (t) => this.handleLoadVariables(e, t),
			isVoiceDone: () => this.sound.isVoiceDone(),
			startFrame: e > 0 ? 0 : void 0
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
		for (let t of xe(e)) {
			let e = t.toLowerCase();
			e === this.mainSwf.toLowerCase() || this.prefetched.has(e) || (this.prefetched.add(e), Se(t));
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
		let r = Ot.exec(e);
		if (!r) return;
		let i = this.levels.get(Number(r[1]))?.player;
		if (!i) return;
		let a = e.replace(/^_level\d+\.?/i, "");
		i.runNamedClipCommand(i.rootClip, a, t, n);
	}
	async handleLoadVariables(e, t) {
		let n = t.variableSource ?? (t.swf && !/\.swf$/i.test(t.swf) ? t.swf : void 0) ?? t.target;
		if (n) try {
			let t = await fetch(O(n));
			if (!t.ok || this.container.hidden) return;
			this.levels.get(e)?.player.setTextVars(At(await t.text()));
		} catch {}
	}
	dispatchCall(e, t, n) {
		let r = Ot.exec(e);
		if (!r) return;
		let i = Number(r[1]), a = this.levels.get(i)?.player;
		a ? a.callFunction(t, n) : this.pendingCalls.push({
			level: i,
			name: t,
			args: n
		});
	}
	handleNavigate(e, t = 0) {
		if (e.command === "unloadMovieNum" || e.command === "unloadMovie") {
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
	async loadLevel(e, t, n = !1) {
		if (e <= 0) return;
		let r = this.levels.get(e);
		if (!n && r && r.swf.toLowerCase() === t.toLowerCase() || t.toLowerCase() === this.mainSwf.toLowerCase()) return;
		let i = await D(t);
		!i || this.container.hidden || this.createLevel(e, t, i);
	}
	destroyLevel(e) {
		let t = this.levels.get(e);
		t && (this.sound.stopOwner(e), t.player.destroy(), t.layer.remove(), this.levels.delete(e));
	}
	emitFrame() {
		let e = this.main;
		e && this.options.onFrame?.(e.currentFrame, e.isPlaying, e.currentLabel());
	}
};
function At(e) {
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
async function jt(e, t = {}) {
	let { assetsBaseUrl: n = "", assetSource: r = "files", archiveUrl: i, scene: a = "A-tour.swf", autoplay: o = !0, debug: s = !1, onFrame: c } = t;
	re(n), oe(r), r === "archive" && ne(i ?? `${n.replace(/\/+$/, "")}/xp-tour.pack`), be();
	let l = await D(a);
	if (!l) throw Error(`mmtour: failed to load tour scene "${a}" from "${n || "/"}"`);
	let u = new kt(e, {
		debug: s,
		onFrame: c
	});
	return u.activate(l, a), o && u.play(), {
		play: () => u.play(),
		pause: () => u.pause(),
		toggle: () => u.toggle(),
		restart: () => u.restart(),
		seek: (e) => u.seekRootFrame(e),
		get frameCount() {
			return u.frameCount;
		},
		get currentFrame() {
			return u.currentFrame;
		},
		get isPlaying() {
			return u.isPlaying;
		},
		destroy: () => u.deactivate()
	};
}
//#endregion
export { kt as PlayerController, jt as createTourPlayer, ae as getAssetSource, ie as getAssetsBaseUrl, D as loadTimeline, n as sceneNameFromSwf, t as scenes, ne as setArchiveUrl, oe as setAssetSource, re as setAssetsBaseUrl };

//# sourceMappingURL=index.js.map