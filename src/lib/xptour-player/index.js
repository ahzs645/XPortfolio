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
//#region src/data/packedAssets.ts
var r = "files", i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = "", c = null;
function l(e) {
	s = e, c = null;
}
var u = "";
function d(e) {
	u = e.replace(/\/+$/, "");
}
function f() {
	return u;
}
function p() {
	return r;
}
function m(e) {
	e !== r && (r = e, ae(), re(), ee());
}
function ee() {
	for (let e of o.values()) {
		for (let t of e.shapes.values()) t.url && URL.revokeObjectURL(t.url);
		for (let t of e.media.values()) t.url && URL.revokeObjectURL(t.url);
	}
	o.clear(), c = null;
}
async function h(e) {
	if (e[0] === 31 && e[1] === 139 && typeof DecompressionStream < "u") {
		let t = new Blob([e]).stream().pipeThrough(new DecompressionStream("gzip"));
		return await new Response(t).text();
	}
	return new TextDecoder().decode(e);
}
async function g(e) {
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(0, !0), n = JSON.parse(await h(e.slice(4, 4 + t))), r = /* @__PURE__ */ new Map();
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
async function _(e, t, n) {
	let r = await fetch(e, { headers: { Range: `bytes=${t}-${n}` } });
	if (!r.ok) return null;
	let i = new Uint8Array(await r.arrayBuffer());
	return r.status === 206 ? i : i.slice(t, n + 1);
}
async function v() {
	if (c) return c;
	let e = await _(s, 0, 65535);
	if (!e || e.byteLength < 4) return null;
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(0, !0), n = JSON.parse(await h(e.slice(4, 4 + t)));
	return c = {
		blocksStart: 4 + t,
		scenes: n.scenes
	}, c;
}
async function te(e) {
	let t = o.get(e);
	if (t) return t;
	let n = await v(), r = n?.scenes[e];
	if (!n || !r) return null;
	let i = n.blocksStart + r.offset, a = await _(s, i, i + r.length - 1);
	if (!a) return null;
	let c = await g(a);
	return o.set(e, c), c;
}
async function ne(e) {
	let t = o.get(e);
	if (t) return t;
	let n = await fetch(`${u}/generated-packs/${e}.scene?v=${Date.now()}`);
	if (!n.ok) return null;
	let r = await g(new Uint8Array(await n.arrayBuffer()));
	return o.set(e, r), r;
}
function re() {
	for (let e of a.values()) for (let t of e.shapes.values()) t.url && URL.revokeObjectURL(t.url);
	a.clear();
}
async function ie(e) {
	let t = a.get(e);
	if (t) return t;
	let n = null;
	try {
		let t = await fetch(`${u}/generated-bundles/${e}.json.gz?v=${Date.now()}`);
		t.ok && (n = await h(new Uint8Array(await t.arrayBuffer())));
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
	let o = {
		timeline: r.timeline ?? null,
		shapes: i
	};
	return a.set(e, o), o;
}
function ae() {
	for (let e of i.values()) for (let t of e.files.values()) t.url && URL.revokeObjectURL(t.url);
	i.clear();
}
function y(e) {
	return `${r}:${e}`;
}
async function oe(e) {
	return r === "files" ? ce(e) : r === "bundle" ? (await ie(e))?.timeline ?? null : r === "archive" ? (await te(e))?.timeline ?? null : r === "scene-pack" ? (await ne(e))?.timeline ?? null : (await le(e))?.timeline ?? null;
}
function se(e) {
	if (r === "archive" || r === "scene-pack") {
		let t = e.replace(/^\//, ""), n = /^generated\/([^/]+)\//.exec(t)?.[1], r = n ? o.get(n) : void 0;
		if (r) if (t.endsWith(".svg")) {
			let e = r.shapes.get(t);
			if (e) return e.url ||= URL.createObjectURL(new Blob([e.svg], { type: "image/svg+xml" })), e.url;
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
		return `${u}/${t}`;
	}
	if (r === "bundle") {
		let t = e.replace(/^\//, "");
		if (t.endsWith(".svg")) {
			let e = /^generated\/([^/]+)\//.exec(t)?.[1], n = e ? a.get(e)?.shapes.get(t) : void 0;
			if (n) return n.url ||= URL.createObjectURL(new Blob([n.svg], { type: "image/svg+xml" })), n.url;
		}
		return `${u}/${t}`;
	}
	if (r === "pack") {
		let t = e.replace(/^\//, ""), n = /^generated\/([^/]+)\/(.+)$/.exec(t);
		if (n) {
			let e = i.get(n[1])?.files.get(n[2]);
			if (e) return e.url ||= URL.createObjectURL(new Blob([e.bytes.slice().buffer], { type: e.type })), e.url;
		}
	}
	return `${u}/${e.replace(/^\//, "")}`;
}
async function ce(e) {
	let t = await fetch(`${u}/generated/${e}/timeline.json?v=${Date.now()}`);
	if (!t.ok) return null;
	try {
		return await t.json();
	} catch {
		return null;
	}
}
async function le(e) {
	let t = i.get(e);
	if (t) return t;
	let n = await fetch(`${u}/generated-packed/${e}/${e}.pack?v=${Date.now()}`);
	if (!n.ok) return null;
	let r = new Uint8Array(await n.arrayBuffer());
	if (r.byteLength < 4) return null;
	let a = 4 + new DataView(r.buffer, r.byteOffset, r.byteLength).getUint32(0, !0);
	if (a > r.byteLength) return null;
	let o;
	try {
		o = JSON.parse(new TextDecoder().decode(r.slice(4, a)));
	} catch {
		return null;
	}
	if (o.format !== "mmtour-generated-pack" || o.scene !== e) return null;
	let s = /* @__PURE__ */ new Map();
	for (let e of o.files) {
		let t = a + e.offset, n = t + e.length;
		t < a || n > r.byteLength || s.set(e.path, {
			type: e.type,
			bytes: r.slice(t, n)
		});
	}
	let c = s.get("timeline.json")?.bytes, l = null;
	if (c) try {
		l = JSON.parse(new TextDecoder().decode(c));
	} catch {
		l = null;
	}
	let d = {
		scene: e,
		files: s,
		timeline: l
	};
	return i.set(e, d), d;
}
//#endregion
//#region src/data/TimelineLoader.ts
var b = /* @__PURE__ */ new Map();
async function x(e) {
	let t = y(e.toLowerCase()), r = b.get(t);
	if (r) return r;
	let i = await oe(n(e));
	return i ? (!i.frameSvgsOmitted && !i.frameSvgs?.length && (i.frameSvgs = Array.from({ length: i.frameCount }, (e, t) => `generated/${i.scene}/frames/${t + 1}.svg`)), b.set(t, i), i) : null;
}
function S(e) {
	return se(e);
}
//#endregion
//#region src/data/prefetch.ts
var C = /\.swf$/i;
function ue(e) {
	let t = /* @__PURE__ */ new Set(), n = (e) => {
		if (e) {
			e.swf && C.test(e.swf) && t.add(e.swf);
			for (let n of e.loads ?? []) C.test(n.swf) && t.add(n.swf);
		}
	};
	for (let t of Object.values(e.control?.buttonActions ?? {})) n(t.release), n(t.rollOver), n(t.rollOut), n(t.press);
	for (let t of e.control?.frameActions ?? []) for (let e of t.actions ?? []) n(e);
	return [...t];
}
async function de(e) {
	let t = await x(e);
	t && w(t, 0);
}
function w(e, t) {
	for (let n of e.frames[t]?.instances ?? []) {
		let t = e.assets[String(n.characterId)], r = t?.src ?? t?.frames?.[0] ?? t?.states?.up?.src;
		r && fetch(S(r)).catch(() => {});
	}
}
//#endregion
//#region src/render/colorTransform.ts
function T(e, t) {
	let n = t?.rm ?? 1, r = t?.gm ?? 1, i = t?.bm ?? 1, a = t?.ra ?? 0, o = t?.ga ?? 0, s = t?.ba ?? 0;
	if (n === 1 && r === 1 && i === 1 && a === 0 && o === 0 && s === 0) {
		e.style.removeProperty("filter");
		return;
	}
	let c = `<svg xmlns='http://www.w3.org/2000/svg'><filter id='c' color-interpolation-filters='sRGB'><feComponentTransfer><feFuncR type='linear' slope='${n}' intercept='${a}'/><feFuncG type='linear' slope='${r}' intercept='${o}'/><feFuncB type='linear' slope='${i}' intercept='${s}'/></feComponentTransfer></filter></svg>`;
	e.style.filter = `url("data:image/svg+xml,${encodeURIComponent(c)}#c")`;
}
//#endregion
//#region src/render/DomRenderer.ts
var E = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", D = /* @__PURE__ */ new Map(), O = /* @__PURE__ */ new Set(), fe = {
	a: 1,
	b: 0,
	c: 0,
	d: 1,
	tx: 0,
	ty: 0
};
function k(e, t) {
	return {
		a: e.a * t.a + e.c * t.b,
		b: e.b * t.a + e.d * t.b,
		c: e.a * t.c + e.c * t.d,
		d: e.b * t.c + e.d * t.d,
		tx: e.a * t.tx + e.c * t.ty + e.tx,
		ty: e.b * t.tx + e.d * t.ty + e.ty
	};
}
function pe(e) {
	if (D.has(e)) return D.get(e);
	O.has(e) || (O.add(e), fetch(S(e)).then((e) => e.ok ? e.text() : "").then((t) => {
		let n = t.replace(/<\?xml[^>]*\?>/i, "").replace(/<svg[^>]*>/i, "").replace(/<\/svg>\s*$/i, ""), r = n.match(/<g\s+transform="matrix\(([^)]+)\)"\s*>([\s\S]*)<\/g>\s*$/i), i = fe, a = n;
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
		a = a.replace(/fill="[^"]*"/g, "fill=\"#ffffff\"").replace(/stroke="[^"]*"/g, "stroke=\"none\""), D.set(e, {
			gMatrix: i,
			body: a
		});
	}).catch(() => D.set(e, null)));
}
function A(e, t = "") {
	let n = e.matrix, r = S(e.src);
	return `<image href="${r}" xlink:href="${r}" x="${-e.origin.x}" y="${-e.origin.y}" width="${e.origin.width}" height="${e.origin.height}" transform="matrix(${n.a},${n.b},${n.c},${n.d},${n.tx},${n.ty})"${t}/>`;
}
function me(e, t) {
	let n = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"640\" height=\"480\" style=\"position:absolute;left:0;top:0;overflow:visible\">", r = pe(e.mask.src);
	if (!r) return `${n}${e.items.map((e) => A(e)).join("")}</svg>`;
	let i = e.mask.matrix, a = e.mask.origin, o = k(k(i, {
		a: 1,
		b: 0,
		c: 0,
		d: 1,
		tx: -a.x,
		ty: -a.y
	}), r.gMatrix), s = `c${t.replace(/\W/g, "_")}`, c = `matrix(${o.a},${o.b},${o.c},${o.d},${o.tx},${o.ty})`;
	return `${n}<defs><clipPath id="${s}" clipPathUnits="userSpaceOnUse">${r.body.replace(/<(path|polygon|rect|ellipse|circle)\b/g, `<$1 transform="${c}"`)}</clipPath></defs><g clip-path="url(#${s})">${e.items.map((e) => A(e, e.opacity === 1 ? "" : ` opacity="${e.opacity}"`)).join("")}</g></svg>`;
}
var he = class {
	layer;
	options;
	nodes = /* @__PURE__ */ new Map();
	constructor(e, t = {}) {
		this.layer = e, this.options = t;
	}
	clear() {
		this.nodes.clear(), this.layer.replaceChildren();
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
		for (let [e, n] of this.nodes) t.has(e) || (n.element.remove(), this.nodes.delete(e));
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
		t.element.style.zIndex = String(e.order), t.element.style.transform = "none", t.element.innerHTML = me(e.maskGroup, e.key);
	}
	createNode(e) {
		let t = document.createElement("div");
		t.className = "player-instance", t.dataset.key = e.key, t.dataset.character = String(e.characterId);
		let n = this.createMedia(e);
		return n.classList.add("player-media"), t.append(n), this.layer.append(t), e.kind === "button" && e.buttonOwnerPath !== void 0 && this.wireButton(n, e.buttonOwnerPath, e.characterId), {
			element: t,
			media: n,
			characterId: e.characterId,
			kind: e.kind,
			src: ""
		};
	}
	wireButton(e, t, n) {
		let r = this.options.onButtonEvent;
		r && (e.style.pointerEvents = "auto", e.style.cursor = "pointer", e.addEventListener("pointerenter", () => r(t, n, "rollOver")), e.addEventListener("pointerleave", () => r(t, n, "rollOut")), e.addEventListener("pointerdown", () => r(t, n, "press")), e.addEventListener("pointerup", () => r(t, n, "release")));
	}
	createMedia(e) {
		if (e.kind === "text") {
			let t = document.createElement("div");
			return t.className = "player-text", this.styleText(t, e), t;
		}
		if (e.kind === "button") {
			let t = document.createElement("img");
			return t.className = "player-hit", t.decoding = "async", t.draggable = !1, t.src = e.src ? S(e.src) : E, t;
		}
		let t = document.createElement("img");
		return t.decoding = "async", t.draggable = !1, t;
	}
	updateMedia(e, t) {
		if (e.kind === "text") {
			t.text ? this.styleText(e.media, t) : e.src !== t.src && t.src && this.loadPlainText(e.media, t.src), e.src = t.src;
			return;
		}
		e.src !== t.src && e.media instanceof HTMLImageElement && (e.media.src = t.src ? S(t.src) : E, e.src = t.src);
	}
	loadPlainText(e, t) {
		fetch(S(t)).then((e) => e.ok ? e.text() : "").then((t) => {
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
		}), T(t.media, n.colorTransform);
	}
}, ge = class {
	registered = /* @__PURE__ */ new Set();
	families = /* @__PURE__ */ new Map();
	register(e) {
		let t = "fonts" in document;
		for (let n of Object.values(e.assets ?? {})) {
			if (n.kind !== "font" || !n.src) continue;
			let e = (n.src.split("/").pop() ?? "").replace(/\.ttf$/i, "").replace(/^\d+_/, "").trim(), r = `swf-font-${n.id}`;
			this.families.set(n.id, `"${r}", "${e}", Arial, Helvetica, sans-serif`), !(!t || this.registered.has(n.id)) && (this.registered.add(n.id), new FontFace(r, `url("${encodeURI(S(n.src))}")`).load().then((e) => document.fonts.add(e)).catch(() => {}));
		}
	}
	resolveFamily(e) {
		if (e != null) return this.families.get(e);
	}
};
//#endregion
//#region src/player/avm1.ts
function _e(e) {
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
function j(e) {
	let t = e.trim();
	return /^[A-Za-z_$][\w$]*$/.test(t) && !/^(true|false|null|undefined|this|_root|_global|_parent|_level\d+)$/.test(t);
}
function M(e, t) {
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
function N(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
//#endregion
//#region src/player/renderNodes.ts
function P(e, t) {
	for (let n of e.childClips.values()) if (n.name === t) return n;
	return null;
}
function F(e) {
	return e.kind === "sprite" && !!(e.timeline?.length || e.frames?.length);
}
function I(e, t) {
	if (e.kind === "sprite" && e.frames?.length) {
		let n = t ? N(t.currentFrame, 0, e.frames.length - 1) : 0;
		return e.frames[n] ?? "";
	}
	return e.kind === "button" ? e.states?.up?.src ?? e.src ?? "" : e.src ?? "";
}
function ve(e, t, n, r, i, a, o, s) {
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
		colorTransform: o.colorTransform,
		clipDepth: o.clipDepth,
		spriteFrame: s
	};
}
function L(e, t, n, r, i, a, o, s = 1) {
	let c = o ? n.states?.up : void 0;
	return {
		key: e,
		order: t,
		characterId: n.id,
		kind: "button",
		name: i.name,
		src: c?.src ?? "",
		origin: c?.origin ?? n.origin,
		matrix: r,
		opacity: c?.src ? s : 1,
		buttonOwnerPath: a
	};
}
//#endregion
//#region src/player/ClipInstance.ts
var R = class {
	characterId;
	parent;
	name;
	currentFrame = 0;
	playing = !0;
	enteredFrame = -1;
	childClips = /* @__PURE__ */ new Map();
	locals = {};
	constructor(e, t, n) {
		this.characterId = e, this.name = t, this.parent = n;
	}
};
//#endregion
//#region src/player/conditions.ts
function z(e, t) {
	if (!e) return !0;
	let n = e.trim();
	return n === "" || n === "else" || n === "true" ? !0 : n === "false" ? !1 : B(n, t);
}
function B(e, t) {
	let n = G(e, "||");
	return n.length > 1 ? n.some((e) => V(e, t)) : V(e, t);
}
function V(e, t) {
	let n = G(e, "&&");
	return n.length > 1 ? n.every((e) => H(e, t)) : H(e, t);
}
function H(e, t) {
	let n = e.trim();
	for (; n.startsWith("(") && Se(n) === n.length - 1;) n = n.slice(1, -1).trim();
	if (G(n, "||").length > 1) return B(n, t);
	if (G(n, "&&").length > 1) return V(n, t);
	if (n.startsWith("!")) return !H(n.slice(1), t);
	for (let e of [
		"==",
		"!=",
		"<=",
		">=",
		"<",
		">"
	]) {
		let r = xe(n, e);
		if (r >= 0) return ye(U(n.slice(0, r), t), U(n.slice(r + e.length), t), e);
	}
	return be(U(n, t));
}
function ye(e, t, n) {
	let r = W(e), i = W(t);
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
function U(e, t) {
	let n = e.trim();
	if (n !== "") return n.startsWith("\"") && n.endsWith("\"") || n.startsWith("'") && n.endsWith("'") ? n.slice(1, -1) : n === "true" ? !0 : n === "false" ? !1 : /^-?\d+(\.\d+)?$/.test(n) ? Number(n) : t.get(n);
}
function be(e) {
	return e !== void 0 && e !== !1 && e !== 0 && e !== "" && e !== "0";
}
function W(e) {
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
function xe(e, t) {
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
function Se(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(") t++;
	else if (e[n] === ")" && (t--, t === 0)) return n;
	return -1;
}
//#endregion
//#region src/player/matrix.ts
var Ce = {
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
var we = class t {
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
}, q = /^_(?:level\d+|root|parent)\./;
function J(e) {
	let t = e.trim();
	for (; q.test(t);) t = t.replace(q, "");
	return t;
}
var Te = class {
	values = /* @__PURE__ */ new Map();
	seed(e) {
		if (e) for (let [t, n] of Object.entries(e)) {
			let e = J(t);
			!this.values.has(e) && (typeof n == "string" || typeof n == "number" || typeof n == "boolean") && this.values.set(e, n);
		}
	}
	get(e) {
		return this.values.get(J(e));
	}
	set(e, t) {
		this.values.set(J(e), t);
	}
	has(e) {
		return this.values.has(J(e));
	}
	reset() {
		this.values.clear();
	}
}, Y = new Set([
	"gotoAndPlay",
	"gotoAndStop",
	"play",
	"stop",
	"nextFrame",
	"prevFrame"
]), X = new Set(["waitForVal", "startTimer"]), Z = -1, Ee = 24, De = 3, Oe = {
	x: 0,
	y: 0,
	width: 0,
	height: 0
}, ke = class {
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
	root;
	clipByPath = /* @__PURE__ */ new Map();
	lastNodes = [];
	constructor(e, t, n = {}) {
		this.timeline = e, this.renderer = t, this.options = n, this.assets = e.assets ?? {};
		for (let e of Object.values(this.assets)) {
			let t = e?.text?.normalizedVariableName;
			t && this.boundTextVars.add(J(t));
		}
		for (let t of Object.values(e.control?.dynamicTexts ?? {})) {
			let e = t?.normalizedVariableName;
			e && this.boundTextVars.add(J(e));
		}
		this.rootFrames = e.frames ?? [], this.rootStop = new Set(e.control?.stopFrames ?? []), this.startFrame = N(n.startFrame ?? e.entryFrame ?? 0, 0, Math.max(0, this.rootFrames.length - 1));
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
		this.store = n.store, this.buildFunctionTable(), this.ticker = new we(e.fps || 20, () => this.onTick()), this.root = this.buildRoot(this.startFrame), this.primeAmbientSound(), this.render();
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
		this.ticker.pause(), this.voWaiting = !1, this.root = this.buildRoot(N(e, 0, this.frameCount - 1)), this.render(), this.options.onFrame?.(this.root.currentFrame, !1);
	}
	restart() {
		this.seekRootFrame(this.startFrame), this.primeAmbientSound();
	}
	destroy() {
		this.ticker.destroy(), this.renderer.clear();
	}
	handleButtonEvent(e, t, n) {
		let r = this.timeline.control?.buttonActions?.[String(t)]?.[n];
		if (!r) return;
		let i = this.clipByPath.get(e) ?? this.root;
		for (let e of r.assignments ?? []) {
			if (/^_level[1-9]\d*\b/i.test(e.target)) continue;
			let t = this.resolveExpr(e.rawValue ?? String(e.value ?? ""));
			e.target && t !== void 0 && this.scopeSet(i, e.target, t);
		}
		let a = (e) => !e || e === "self" || e === "this" || e === "_root" || e === "_level0" || e === "_parent", o = (e) => {
			if (e.functionName !== r.command || !a(e.target)) return !1;
			let t = (e.arguments ?? "").trim().replace(/^["']|["']$/g, "");
			if (r.label && t === r.label) return !0;
			let n = Number(t);
			return typeof r.frame == "number" && Number.isFinite(n) && (n - 1 === r.frame || n === r.frame);
		}, s = r.command === "gotoAndPlay" || r.command === "gotoAndStop" ? (r.functionCalls ?? []).filter((e) => !o(e)) : r.functionCalls;
		if (s?.length && this.runCallFunctions({
			...r,
			functionCalls: s
		}, i), (r.command === "loadMovieNum" || r.command === "loadMovie") && this.options.onNavigate?.(r), r.command !== "loadMovieNum" && r.command !== "loadMovie") {
			let e = r.loads?.length ? r.loads : r.swf ? [{
				swf: r.swf,
				level: r.level
			}] : [];
			for (let t of e) this.options.onNavigate?.({
				command: "loadMovie",
				swf: t.swf,
				level: t.level,
				reload: !0
			});
		}
		if (r.command === "gotoAndPlay" || r.command === "gotoAndStop") {
			let e = this.resolveTarget(i, r.target), t = this.resolveFrame(r, e);
			e && t >= 0 && (e.playing = r.command === "gotoAndPlay", this.enterFrame(e, t, 0));
		}
		this.render();
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
			n.parameters?.length && (r.parameters = n.parameters), n.body?.length && r.body.push(...n.body), this.functions.set(e, r);
		}
		for (let n of e?.frameActions ?? []) for (let e of n.actions ?? []) {
			if (!e.functionName) continue;
			let n = this.functions.get(e.functionName) ?? t();
			n.actions.push(e), this.functions.set(e.functionName, n);
		}
		for (let n of Object.values(e?.definedFunctions ?? {})) {
			if (n.scope !== "sprite" || typeof n.spriteId != "number" || !n.functionName) continue;
			let e = (n.body ?? []).filter((e) => e.kind === "call" && !!e.functionName?.startsWith("gotoAnd") && (!e.target || e.target === "self" || e.target === "this") || e.kind === "assign" && j(e.target));
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
		let i = this.bindParams(r.parameters, t, n), a = this.functionActionDecisions(r.actions, i), o = new Set(r.body.filter((e) => e.kind === "call").map((e) => e.functionName));
		r.actions.forEach((e, t) => {
			if (!a[t]) return;
			let n = e.functionCalls ?? [];
			e.command === "callFunctions" && n.length > 0 && n.every((e) => o.has(e.functionName)) || this.runFunctionAction(e);
		});
		let s = { ...i };
		for (let e of r.body) !e.branchCondition && e.kind === "assign" && /^[A-Za-z_$][\w$]*$/.test(e.target) && (s[e.target] = this.resolveExpr(e.rawValue, s));
		let c = r.body.map((e) => this.branchPasses(e.branchCondition, s));
		return r.body.forEach((e, t) => {
			c[t] && this.runBodyStatement(e, i);
		}), this.render(), !0;
	}
	functionActionDecisions(e, t) {
		let n = e.map(() => !0);
		if (!this.store) return n;
		let r = (e) => e === "else", i = (e) => !e || this.evalGuard(M(e, t));
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
		return _e(e).map((e) => this.resolveExpr(e.trim(), t));
	}
	getTimer() {
		return performance.now();
	}
	resolveExpr(e, t) {
		let n = e.trim();
		if (n !== "") return n === "getTimer()" ? this.getTimer() : n.startsWith("\"") && n.endsWith("\"") || n.startsWith("'") && n.endsWith("'") ? n.slice(1, -1) : n === "true" ? !0 : n === "false" ? !1 : /^-?\d+(\.\d+)?$/.test(n) ? Number(n) : t && n in t ? t[n] : /^[A-Za-z_$][\w$.]*$/.test(n) ? this.store?.get(n) ?? this.textVars.get(J(n)) ?? void 0 : n;
	}
	scopeGet(e, t) {
		return j(t) && t in e.locals ? e.locals[t] : this.store?.get(t);
	}
	scopeSet(e, t, n) {
		j(t) && (e.locals[t] = n), this.store?.set(t, n);
	}
	scopeFor(e) {
		return {
			get: (t) => this.scopeGet(e, t),
			set: (t, n) => this.scopeSet(e, t, n),
			has: (t) => j(t) && t in e.locals || (this.store?.has(t) ?? !1)
		};
	}
	evalGuard(e, t) {
		return this.store ? e ? z(e.replace(/[\w.]*\btimeMarkDone\s*\(([^)]*)\)/g, (e, t) => {
			let n = Number(this.resolveExpr(t.trim()) ?? 0), r = Number(this.store?.get("bkgd.timeTarg") ?? 0);
			return this.getTimer() > r + n ? "1" : "0";
		}), t ? this.scopeFor(t) : this.store) : !0 : !e;
	}
	resolveArgsString(e, t) {
		return this.parseArgs(e, t).map((e) => typeof e == "string" ? JSON.stringify(e) : String(e)).join(",");
	}
	branchPasses(e, t) {
		return !e || !this.store ? !e : z(M(e, t), this.store);
	}
	runBodyStatement(e, t) {
		if (e.kind === "assign") {
			let n = this.resolveExpr(e.rawValue, t);
			this.store && n !== void 0 && this.store.set(e.target, n);
			return;
		}
		this.runBodyCall(e, t);
	}
	runBodyCall(e, t) {
		let n = e.functionName, r = e.target;
		if (X.has(n)) {
			this.options.onWaiter?.(n, this.parseArgs(e.arguments, t));
			return;
		}
		if (Y.has(n) && r) {
			let i = this.parseArgs(e.arguments, t)[0] ?? 0;
			/^_level\d+/i.test(r) ? this.options.onClipCommand?.(r, n, i) : this.runNamedClipCommand(this.root, r, n, i);
			return;
		}
		if (!r || r === "self" || r === "this" || r === "_root" || r === "_level0") this.callFunction(n, e.arguments, t);
		else if (/^_level\d+/i.test(r)) this.options.onCallFunction?.(r, n, this.resolveArgsString(e.arguments, t));
		else {
			let e = this.resolveTarget(this.root, r) ?? this.findClipByName(this.root, r);
			e && this.callClipFunction(e, n);
		}
	}
	runNamedClipCommand(e, t, n, r) {
		let i = t.split(".").filter(Boolean).pop() ?? t, a = this.resolveTarget(e, t) ?? this.findClipByName(e, t) ?? this.findClipByName(this.root, t);
		if (!a) return this.pendingClipCommands.set(i, {
			command: n,
			frame: r
		}), !1;
		this.pendingClipCommands.delete(i);
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
	runFunctionAction(e) {
		switch (e.command) {
			case "stop":
				this.root.playing = !1;
				break;
			case "play":
				this.root.playing = !0;
				break;
			case "gotoAndPlay":
			case "gotoAndStop": {
				let t = this.resolveTarget(this.root, e.target), n = this.resolveFrame(e, t);
				t && n >= 0 && (t.playing = e.command === "gotoAndPlay", this.enterFrame(t, n, 0));
				break;
			}
			case "attachSound":
			case "playVO":
			case "stopSound":
				e.command === "playVO" && (this.voWaiting = !0), this.options.onSound?.(e);
				break;
			case "loadMovieNum":
			case "loadMovie":
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
				if (this.store && e.target && t !== void 0) {
					this.scopeSet(this.root, e.target, t);
					let n = J(e.target);
					this.boundTextVars.has(n) && this.textVars.set(n, String(t));
				}
				break;
			}
			case "callFunctions":
				this.runCallFunctions(e);
				break;
			default: break;
		}
	}
	runCallFunctions(e, t = this.root) {
		for (let n of e.functionCalls ?? []) {
			let e = n.target ?? "self", r = n.functionName;
			if (X.has(r)) this.options.onWaiter?.(r, this.parseArgs(n.arguments));
			else if (Y.has(r) && e !== "self" && e !== "this" && e !== "_root") {
				let i = this.parseArgs(n.arguments)[0] ?? 0;
				/^_level\d+/i.test(e) ? this.options.onClipCommand?.(e, r, i) : this.runNamedClipCommand(t, e, r, i);
			} else if (e === "self" || e === "this" || e === "_root") e !== "_root" && this.spriteFunctions.get(t.characterId)?.has(r) ? this.callClipFunction(t, r) : this.callFunction(r, n.arguments);
			else if (/^_level\d+/i.test(e)) this.options.onCallFunction?.(e, r, this.resolveArgsString(n.arguments));
			else {
				let n = this.resolveTarget(t, e) ?? this.findClipByName(t, e);
				n && this.callClipFunction(n, r);
			}
		}
	}
	callClipFunction(e, t) {
		let n = this.spriteFunctions.get(e.characterId)?.get(t);
		if (!n) return;
		let r = this.scopeFor(e), i = (e) => e === "else", a = n.actions.some((e) => e.functionBranchCondition && !i(e.functionBranchCondition) && z(e.functionBranchCondition, r)), o = n.actions.map((e) => {
			let t = e.functionBranchCondition;
			return i(t) ? !a : !t || z(t, r);
		});
		for (let t = 0; t < n.actions.length; t += 1) this.store && !o[t] || this.runClipAction(e, n.actions[t]);
		this.render();
	}
	runClipAction(e, t) {
		switch (t.command) {
			case "stop":
				e.playing = !1;
				break;
			case "play":
				e.playing = !0;
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
				t.target && n !== void 0 && this.scopeSet(e, t.target, n);
				break;
			}
			default: break;
		}
	}
	findClipByName(e, t) {
		for (let n of e.childClips.values()) {
			if (n.name === t) return n;
			let e = this.findClipByName(n, t);
			if (e) return e;
		}
		return null;
	}
	buildRoot(e) {
		let t = new R(Z, "_root", null);
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
		e.currentFrame = N(t, 0, Math.max(0, this.frameCountFor(e) - 1)), this.reconcile(e), e.enteredFrame !== e.currentFrame && (e.enteredFrame = e.currentFrame, this.stopFramesFor(e).has(e.currentFrame) && (e.playing = !1), n < Ee && this.runScript(e, n));
	}
	reconcile(e) {
		let t = this.framesFor(e);
		if (!t) return;
		let n = t[e.currentFrame]?.instances ?? [], r = /* @__PURE__ */ new Set();
		for (let t of n) {
			let n = this.getAsset(t.characterId);
			if (!n || !F(n)) continue;
			r.add(t.depth);
			let i = e.childClips.get(t.depth);
			if (!i || i.characterId !== t.characterId) {
				let n = new R(t.characterId, t.name, e);
				e.childClips.set(t.depth, n), this.enterFrame(n, 0, 0);
				let r = t.name ? this.pendingClipCommands.get(t.name) : void 0;
				if (r) {
					this.pendingClipCommands.delete(t.name);
					let e = this.resolveClipFrame(n, r.frame);
					e >= 0 && (n.playing = r.command === "gotoAndPlay", this.enterFrame(n, e, 0));
				}
			} else t.name && i.name !== t.name && (i.name = t.name);
		}
		for (let [t] of e.childClips) r.has(t) || e.childClips.delete(t);
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
					e.playing = !1;
					break;
				case "play":
					e.playing = !0;
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
						if (t <= De && i) {
							this.voWaiting = !1;
							break;
						}
					}
					n.playing = a.command === "gotoAndPlay", (n !== e || r !== e.currentFrame) && this.enterFrame(n, r, t + 1);
					break;
				}
				case "attachSound":
				case "playVO":
				case "stopSound":
					a.command === "playVO" && (this.voWaiting = !0), this.options.onSound?.(a);
					break;
				case "loadMovieNum":
				case "loadMovie":
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
					if (this.store && a.target && t !== void 0) {
						this.scopeSet(e, a.target, t);
						let n = J(a.target);
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
		if (t === "_root" || t === "_level0" || t === "root") return this.root;
		if (t === "_parent") return e.parent ?? e;
		let n = t.split(".").filter(Boolean), r = n[0] === "_root" || n[0] === "_level0" ? this.root : n[0] === "_parent" ? e.parent : e, i = n[0]?.startsWith("_") ? n.slice(1) : n;
		for (let e of i) {
			if (!r) return null;
			r = P(r, e);
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
			return N(t.currentFrame + e, 0, Math.max(0, this.frameCountFor(t) - 1));
		}
		return -1;
	}
	framesFor(e) {
		return e.characterId === Z ? this.rootFrames : this.assets[String(e.characterId)]?.timeline ?? null;
	}
	frameCountFor(e) {
		if (e.characterId === Z) return Math.max(1, this.rootFrames.length);
		let t = this.assets[String(e.characterId)];
		return Math.max(1, t?.timeline?.length ?? t?.frames?.length ?? 1);
	}
	stopFramesFor(e) {
		if (e.characterId === Z) return this.rootStop;
		let t = this.spriteStop.get(e.characterId);
		return t || (t = new Set(this.timeline.control?.spriteStopFrames?.[String(e.characterId)] ?? []), this.spriteStop.set(e.characterId, t)), t;
	}
	actionsFor(e) {
		return e.characterId === Z ? this.rootActions.get(e.currentFrame) ?? [] : this.spriteActions.get(`${e.characterId}:${e.currentFrame}`) ?? [];
	}
	getAsset(e) {
		return this.assets[String(e)] ?? this.assets[`button:${e}`];
	}
	render() {
		let e = [];
		this.clipByPath = /* @__PURE__ */ new Map(), this.clipByPath.set("0", this.root), this.flatten(this.root, Ce, 1, "0", { n: 0 }, e), this.renderer.apply(e), this.lastNodes = e;
	}
	flatten(e, t, n, r, i, a) {
		let o = this.framesFor(e);
		if (!o) return;
		let s = o[e.currentFrame];
		if (!s) return;
		let c = [], l = (e) => {
			for (; c.length && e > c[c.length - 1].clipDepth;) {
				let e = c.pop();
				a.push({
					key: e.key,
					order: e.order,
					characterId: 0,
					kind: "shape",
					name: "",
					src: "",
					origin: Oe,
					matrix: t,
					opacity: 1,
					maskGroup: e.group
				});
			}
		};
		for (let o of s.instances) {
			l(o.depth);
			let s = this.getAsset(o.characterId);
			if (!s) continue;
			let u = K(t, o.matrix), d = n * o.opacity, f = `${r}/${o.depth}`, p = e.childClips.get(o.depth);
			if (o.clipDepth) {
				let e = I(s, p);
				e && c.push({
					key: `${f}#mask`,
					order: i.n++,
					clipDepth: o.clipDepth,
					group: {
						mask: {
							characterId: s.id,
							src: e,
							origin: s.origin,
							matrix: u,
							opacity: 1
						},
						items: []
					}
				});
				continue;
			}
			let m = c[c.length - 1];
			if (m && o.depth <= m.clipDepth) {
				let e = I(s, p);
				e && m.group.items.push({
					characterId: s.id,
					src: e,
					origin: s.origin,
					matrix: u,
					opacity: d
				});
				continue;
			}
			if (s.kind === "sprite" && s.frames?.length && !s.overflowsBounds) {
				let e = p ? N(p.currentFrame, 0, s.frames.length - 1) : 0;
				a.push(ve(f, i.n++, s, s.frames[e], u, d, o, p?.currentFrame)), p && s.timeline?.length && this.collectButtons(p, u, f, i, a);
				continue;
			}
			if (s.kind === "sprite" && s.timeline?.length && p && p.characterId === s.id) {
				this.clipByPath.set(f, p), this.flatten(p, u, d, f, i, a);
				continue;
			}
			if (s.kind === "button") {
				a.push(L(f, i.n++, s, u, o, r, !0, d)), this.collectButtonText(s, u, f, i, a, o);
				continue;
			}
			a.push(this.leafNode(f, i.n++, s, s.src ?? "", u, d, o));
		}
		l(Infinity);
	}
	collectButtons(e, t, n, r, i) {
		this.clipByPath.set(n, e);
		let a = this.framesFor(e);
		if (!a) return;
		let o = a[e.currentFrame];
		if (o) for (let a of o.instances) {
			if (a.clipDepth) continue;
			let o = this.getAsset(a.characterId);
			if (!o) continue;
			let s = K(t, a.matrix), c = `${n}/${a.depth}`;
			if (o.kind === "button") i.push(L(c, r.n++, o, s, a, n, !1)), this.collectButtonText(o, s, c, r, i, a);
			else if (o.kind === "text") {
				let e = this.resolveTextField(o.id, o);
				(e?.normalizedVariableName ? this.textVars.has(e.normalizedVariableName) : e?.text && String(e.text).trim()) && i.push(this.leafNode(c, r.n++, o, o.src ?? "", s, a.opacity, a));
			} else if (o.kind === "sprite") {
				let t = e.childClips.get(a.depth);
				t && this.collectButtons(t, s, c, r, i);
			}
		}
	}
	collectButtonText(e, t, n, r, i, a) {
		for (let o of e.textFields ?? []) {
			let e = this.getAsset(o.id);
			if (!e) continue;
			let s = this.resolveTextField(o.id, e);
			if (!s?.normalizedVariableName || !this.textVars.has(s.normalizedVariableName)) continue;
			let c = K(t, o.matrix);
			i.push(this.leafNode(`${n}/txt:${o.id}`, r.n++, e, e.src ?? "", c, a.opacity, a));
		}
	}
	leafNode(e, t, n, r, i, a, o) {
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
			colorTransform: o.colorTransform,
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
		return a && this.textVars.has(a) ? {
			...i,
			text: this.textVars.get(a)
		} : i;
	}
	primeAmbientSound() {
		if (!this.options.onSound) return;
		let e;
		for (let t = 0; t <= this.root.currentFrame; t += 1) for (let n of this.rootActions.get(t) ?? []) n.command === "attachSound" && n.soundRole === "music" && (e = n);
		e && this.options.onSound(e);
	}
}, Ae = class e {
	music = null;
	musicSrc = "";
	voice = null;
	voiceStartedAt = 0;
	voiceDurationMs = 0;
	muted = !1;
	static FALLBACK_VO_MS = 5e3;
	handle(e) {
		if (!this.muted) switch (e.command) {
			case "attachSound":
				if (!e.soundSrc) break;
				e.soundRole === "music" ? this.playMusic(e.soundSrc) : this.playVoice(e.soundSrc);
				break;
			case "playVO":
				e.soundSrc && this.playVoice(e.soundSrc);
				break;
			case "stopSound":
				this.stopVoice();
				break;
			default: break;
		}
	}
	playMusic(e) {
		if (this.musicSrc === e && this.music) return;
		this.stopMusic();
		let t = new Audio(S(e));
		t.loop = !0, t.volume = .4, t.play().catch(() => void 0), this.music = t, this.musicSrc = e;
	}
	playVoice(e) {
		this.stopVoice();
		let t = new Audio(S(e));
		t.volume = 1, this.voiceStartedAt = performance.now(), this.voiceDurationMs = 0, t.addEventListener("loadedmetadata", () => {
			Number.isFinite(t.duration) && (this.voiceDurationMs = t.duration * 1e3);
		}), t.play().catch(() => void 0), this.voice = t;
	}
	isVoiceDone() {
		if (!this.voice || this.voice.ended) return !0;
		let t = this.voiceDurationMs || e.FALLBACK_VO_MS;
		return performance.now() - this.voiceStartedAt >= t;
	}
	stopMusic() {
		this.music?.pause(), this.music = null, this.musicSrc = "";
	}
	stopVoice() {
		this.voice?.pause(), this.voice = null, this.voiceStartedAt = 0, this.voiceDurationMs = 0;
	}
	suspend() {
		this.music?.pause(), this.voice?.pause();
	}
	resume() {
		this.music?.play().catch(() => void 0);
	}
	destroy() {
		this.stopMusic(), this.stopVoice();
	}
}, Q = /^_level(\d+)/, $ = class {
	container;
	options;
	fonts = new ge();
	sound = new Ae();
	levels = /* @__PURE__ */ new Map();
	store = new Te();
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
		let r = this.levels.get(e);
		r && (r.player.destroy(), r.layer.remove(), this.levels.delete(e)), this.store.seed(n.control?.globalDefaults), this.fonts.register(n);
		let i = document.createElement("div");
		i.className = "player-level", i.style.zIndex = String(e), this.container.append(i);
		let a = new ke(n, new he(i, {
			resolveFontFamily: (e) => this.fonts.resolveFamily(e),
			onButtonEvent: (t, n, r) => this.levels.get(e)?.player.handleButtonEvent(t, n, r)
		}), {
			onFrame: e === 0 ? (e, t) => {
				this.checkWaiters(), this.options.onFrame?.(e, t, this.main?.currentLabel() ?? "");
			} : void 0,
			onSound: (e) => this.sound.handle(e),
			onNavigate: (e) => this.handleNavigate(e),
			store: this.store,
			onCallFunction: (e, t, n) => this.dispatchCall(e, t, n),
			onClipCommand: (e, t, n) => this.dispatchClipCommand(e, t, n),
			onWaiter: (t, n) => this.registerWaiter(e, t, n),
			onLoadVariables: (t) => this.handleLoadVariables(e, t),
			isVoiceDone: () => this.sound.isVoiceDone(),
			startFrame: e > 0 ? 0 : void 0
		});
		if (this.levels.set(e, {
			player: a,
			layer: i,
			swf: t
		}), this.playing && a.play(), this.flushPendingCalls(e), this.prefetchReferenced(n), this.options.debug && e > 0) {
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
		for (let t of ue(e)) {
			let e = t.toLowerCase();
			e === this.mainSwf.toLowerCase() || this.prefetched.has(e) || (this.prefetched.add(e), de(t));
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
		let r = Q.exec(e);
		if (!r) return;
		let i = this.levels.get(Number(r[1]))?.player;
		if (!i) return;
		let a = e.replace(/^_level\d+\.?/i, "");
		i.runNamedClipCommand(i.rootClip, a, t, n);
	}
	async handleLoadVariables(e, t) {
		let n = t.target;
		if (n) try {
			let t = await fetch(S(n));
			if (!t.ok || this.container.hidden) return;
			this.levels.get(e)?.player.setTextVars(je(await t.text()));
		} catch {}
	}
	dispatchCall(e, t, n) {
		let r = Q.exec(e);
		if (!r) return;
		let i = Number(r[1]), a = this.levels.get(i)?.player;
		a ? a.callFunction(t, n) : this.pendingCalls.push({
			level: i,
			name: t,
			args: n
		});
	}
	handleNavigate(e) {
		if (e.command !== "loadMovieNum" && e.command !== "loadMovie" || !e.swf) return;
		let t = Number(e.level ?? 0);
		if (!e.reload) {
			if (this.loadBurst.has(t)) return;
			this.loadBurst.size === 0 && queueMicrotask(() => this.loadBurst.clear()), this.loadBurst.add(t);
		}
		this.loadLevel(t, e.swf, !!e.reload);
	}
	async loadLevel(e, t, n = !1) {
		if (e <= 0) return;
		let r = this.levels.get(e);
		if (!n && r && r.swf.toLowerCase() === t.toLowerCase() || t.toLowerCase() === this.mainSwf.toLowerCase()) return;
		let i = await x(t);
		!i || this.container.hidden || this.createLevel(e, t, i);
	}
	emitFrame() {
		let e = this.main;
		e && this.options.onFrame?.(e.currentFrame, e.isPlaying, e.currentLabel());
	}
};
function je(e) {
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
async function Me(e, t = {}) {
	let { assetsBaseUrl: n = "", assetSource: r = "files", archiveUrl: i, scene: a = "A-tour.swf", autoplay: o = !0, debug: s = !1, onFrame: c } = t;
	d(n), m(r), r === "archive" && l(i ?? `${n.replace(/\/+$/, "")}/xp-tour.pack`);
	let u = await x(a);
	if (!u) throw Error(`mmtour: failed to load tour scene "${a}" from "${n || "/"}"`);
	let f = new $(e, {
		debug: s,
		onFrame: c
	});
	return f.activate(u, a), o && f.play(), {
		play: () => f.play(),
		pause: () => f.pause(),
		toggle: () => f.toggle(),
		restart: () => f.restart(),
		seek: (e) => f.seekRootFrame(e),
		get frameCount() {
			return f.frameCount;
		},
		get currentFrame() {
			return f.currentFrame;
		},
		get isPlaying() {
			return f.isPlaying;
		},
		destroy: () => f.deactivate()
	};
}
//#endregion
export { $ as PlayerController, Me as createTourPlayer, p as getAssetSource, f as getAssetsBaseUrl, x as loadTimeline, n as sceneNameFromSwf, t as scenes, l as setArchiveUrl, m as setAssetSource, d as setAssetsBaseUrl };

//# sourceMappingURL=index.js.map