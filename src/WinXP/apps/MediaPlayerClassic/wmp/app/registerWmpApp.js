/* eslint-disable */

import templateHtml from "./template.html?raw";
import { withBaseUrl } from "../../../../../utils/baseUrl.js";

import {
  COLOR_HUE_ROTATE,
  COLOR_SATURATION,
  NAV_PANE_WIDTH_BY_UI,
  WMP_UI_CSS_FILES,
  WMP_UI_ICON_FILES,
} from "./constants.js";
import { SAMPLE_PLAYLIST } from "./samplePlaylist.js";
import { formatTime, mediaTypeFromPath } from "./utils.js";

const c = () => "";
const G = templateHtml.replaceAll("/ui/wmp/", withBaseUrl("/ui/wmp/"));
const n = WMP_UI_CSS_FILES;
const g = WMP_UI_ICON_FILES;
const z = NAV_PANE_WIDTH_BY_UI;
const t = COLOR_HUE_ROTATE;
const r = COLOR_SATURATION;
const L = SAMPLE_PLAYLIST;

registerApp({ _template: null, _singleInstance: true, _instanceIdentifier: "wmp", setup: async function() {
  const i2 = c;
  this["_template"] = document.createElement("template"), this["_template"]["innerHTML"] = G;
}, handleNewData: async function(i2 = {}) {
  const a = c, G2 = wm["_desktop"]["querySelector"]("app#" + this["hWnd"]);
  G2 && G2._wmpState && i2["filePath"] && G2["_wmpAppInstance"] && "function" == typeof G2["_wmpAppInstance"]["addMediaByVFSPath"] && await G2["_wmpAppInstance"].addMediaByVFSPath(i2["filePath"], false);
}, start: async function(a = {}) {
  const G2 = c;
  var B = this["_template"]["content"]["firstElementChild"]["cloneNode"](true), w = wm["createNewWindow"]("wmp", B), s = wm._windows[w];
  s["style"].visibility = "hidden";
  const e = ((i2) => {
    const a2 = c;
    return !i2["_wmpState"] && (i2._wmpState = { hWnd: i2.id, currentColorSet: 0, currentUI: 0, navPaneVisible: true, miniPlayerEnabled: false, UIFrameHidden: false, playlistHidden: false, visualizers: ["Bars", "Ocean Mist", "Fire Storm", "Cover Art"], selectedVis: 0, currentCoverArtImage: null, songDisplayNames: [], songPlayableSources: [], songVFSPaths: [], songBlobs: [], songCoverArtData: [], songIndex: 0, playing: false, killVizProcess: false, audioContext: null, audioAnalyzer: null, audioSource: null, currentObjectUrls: /* @__PURE__ */ new Set(), wmpUiCssLink: null }, null != localStorage.getItem(shell["_currentUser"] + ".wmpVersion") && (i2["_wmpState"].currentUI = parseInt(localStorage["getItem"](shell["_currentUser"] + ".wmpVersion")))), i2["_wmpState"];
  })(s);
  e["hWnd"] = w, this["hWnd"] = w, s["_wmpAppInstance"] = this;
  try {
    wm && wm._desktop && (wm._desktop.dataset.wmpUi = String(e["currentUI"]));
  } catch {
    // ignore
  }
  let wmpCssLoadFailed = false;
  const D = new Promise((i2) => {
    const c2 = G2;
    e["wmpUiCssLink"] = document["getElementById"]("wmpCSS_instance_" + e["hWnd"]), !e["wmpUiCssLink"] && (e.wmpUiCssLink = document.createElement("link"), e["wmpUiCssLink"].id = "wmpCSS_instance_" + e["hWnd"], e["wmpUiCssLink"]["rel"] = "stylesheet", e["wmpUiCssLink"]["type"] = "text/css", document["head"]["appendChild"](e["wmpUiCssLink"])), e["wmpUiCssLink"]["onload"] = () => i2(), e["wmpUiCssLink"]["onerror"] = () => {
      wmpCssLoadFailed = true, i2();
    }, e["wmpUiCssLink"]["href"] = withBaseUrl("/ui/wmp/" + n[e.currentUI]);
  });
  await D;
  if (wmpCssLoadFailed || !e["wmpUiCssLink"] || !e["wmpUiCssLink"]["sheet"]) {
    throw new Error("Failed to load WMP skin CSS: " + (e["wmpUiCssLink"] && e["wmpUiCssLink"]["href"] ? e["wmpUiCssLink"]["href"] : "(missing link)"));
  }
  s["querySelector"]("wmpmainframe");
  const y = s["querySelector"]("wmpcolorifier"), o = s["querySelector"]("wmpcontent"), x = s["querySelector"]("#navtoggle"), C = s["querySelector"]("#navcollapsed"), v = s.querySelector("#toggleUIFrame"), p = s["querySelector"]("#playlist"), f = s["querySelector"]("#wmpresizer"), I = s["querySelector"]("#topmetal"), u = s["querySelector"]("#minimize"), M = s.querySelector("#maximize"), A = s["querySelector"]("#close"), l = s["querySelector"]("#colorswitch"), d = s["querySelector"]("#skinmode"), b = s["querySelector"]("#playbackHolder"), P = s["querySelector"]("#playlistcontainer ul"), K = s.querySelector("#viewmenu"), j = s["querySelector"]("#helpmenu"), V = s["querySelector"]("#artistname"), H = s["querySelector"]("#songname"), J = s["querySelector"]("#statusbar #info"), U = s["querySelector"]("#progress"), W = s["querySelector"]("#visualizer"), S = s["querySelector"]("#visgroups"), X = s["querySelector"]("#prevvis"), Z = s["querySelector"]("#nextvis"), N = s["querySelector"]("#visName"), m = s["querySelector"]("#fullscreen"), q = s.querySelector("#playpause"), h = s["querySelector"]("#stop"), Y = s["querySelector"]("#prev"), O = s["querySelector"]("#next"), T = s.querySelector("#mute"), E = s["querySelector"]("#seekbar"), k = s["querySelector"]("#seekfill"), F = s["querySelector"]("#seekpointer"), R = s["querySelector"]("#volbar"), Q = s["querySelector"]("#volfill"), _ = s["querySelector"]("#volpointer"), $ = s["querySelector"]("appcontrols .closebtn"), ii = (s["querySelector"]("#playlistselector"), s["querySelector"]("#nav #skins"));
  s["style"] = "", wm["setIcon"](e.hWnd, g[e["currentUI"]]), wm.setCaption(e["hWnd"], "Windows Media Player"), wm.setSize(e["hWnd"], 640, 532), wm["focusWindow"](e["hWnd"]), ei(false);
  // Attach drag ref to #topmetal for frameless window dragging
  if (wm && typeof wm.attachDragRef === 'function') {
    wm.attachDragRef(I);
  }
  let ci = W["getContext"]("2d");
  if (function() {
    const i2 = G2;
    if (e["audioContext"] || void 0 === (window["AudioContext"] || window.webkitAudioContext)) {
      if (!e["audioContext"]) return;
    } else try {
      e["audioContext"] = new (window["AudioContext"] || window["webkitAudioContext"])(), e["audioAnalyzer"] = e["audioContext"]["createAnalyser"](), ci["translate"](0.5, 0.5), ci.mozImageSmoothingEnabled = false, e["audioSource"] = e["audioContext"]["createMediaElementSource"](b), e["audioSource"]["connect"](e["audioAnalyzer"]), e.audioAnalyzer["connect"](e["audioContext"]["destination"]);
    } catch (c3) {
      e["audioContext"] = null;
    }
    Li();
    let c2 = performance["now"](), a2 = [];
    requestAnimationFrame(function G3(n2) {
      const g2 = i2;
      if (e["killVizProcess"]) return;
      requestAnimationFrame(G3);
      const z2 = e["songVFSPaths"][e["songIndex"]] || e.songDisplayNames[e["songIndex"]];
      if (e["visualizers"][e["selectedVis"]] === "Cover Art" || ti(z2) === "video") return void ("video" === ti(z2) && ci && ci.clearRect(0, 0, W.width, W["height"]));
      if (!e["playing"] || !e.audioAnalyzer) return;
      const t2 = 1e3 / 24;
      let r2, L2, B2, w2, s2, D2, y2, o2, x2;
      if (0 == e["selectedVis"]) s2 = 5, D2 = 1, o2 = 48, x2 = 128, B2 = getComputedStyle(document["documentElement"])["getPropertyValue"]("--visualizerBars"), w2 = getComputedStyle(document["documentElement"])["getPropertyValue"]("--visualizerPeaks"), y2 = 1;
      else if (1 == e.selectedVis) s2 = 1, D2 = 0, o2 = 1024, x2 = 4096, y2 = 2, B2 = "#00f", w2 = "#fff";
      else {
        if (2 != e["selectedVis"]) return;
        s2 = 1, D2 = 0, o2 = 1024, x2 = 4096, y2 = 2, B2 = "#ffa500", w2 = "#f00";
      }
      if (L2 = n2, r2 = L2 - c2, r2 > t2) {
        c2 = L2 - r2 % t2, e["audioAnalyzer"]["fftSize"] = x2;
        let i3 = new Uint8Array(e["audioAnalyzer"]["frequencyBinCount"]);
        e.audioAnalyzer["getByteFrequencyData"](i3), 0 == e["selectedVis"] ? ci.clearRect(0, 0, W["width"], W.height) : (ci.fillStyle = "rgba(0,0,0,0.12)", ci["fillRect"](0, 0, W["width"], W["height"]));
        let G4 = Math["floor"](W["width"] / s2);
        G4 > o2 && (G4 = o2);
        let n3 = s2 + D2, z3 = Math["ceil"]((W.width - G4 * n3) / 2);
        for (let c3 = 0; c3 < G4; c3++) {
          let G5 = c3 * n3 + z3;
          0 !== e["selectedVis"] && ci.fillRect(G5, Math["floor"](W.height + a2[c3]), s2, 1);
          let t3 = Math["floor"](-i3[c3] / 2 * (W["height"] / 200));
          !a2[c3] || a2[c3] > t3 ? a2[c3] = t3 - 2 : a2[c3] >= -1 ? a2[c3] = -1 : a2[c3] = a2[c3] + y2, ci["fillStyle"] = B2, ci["fillRect"](G5, W["height"], s2, t3), ci.fillStyle = w2, ci["fillRect"](G5, Math["ceil"](W.height + a2[c3]), s2, 1);
        }
      }
    });
  }(), this["addMediaByVFSPath"] = async (i2, c2 = true) => {
    i2 && await ai([i2], true, c2);
  }, a && a["filePath"]) await this.addMediaByVFSPath(a["filePath"], true);
  else {
    Gi();
    const playlist = wm.getMyMusicPlaylist && wm.getMyMusicPlaylist() || L;
    for (const i2 of playlist["songVFSPaths"]) {
      const c2 = await dm["open"](i2);
      if (c2 && c2["content"] instanceof Blob) {
        const a2 = playlist["songDisplayNames"][playlist.songVFSPaths.indexOf(i2)] || dm["basename"](i2);
        e["songDisplayNames"]["push"](a2), e.songVFSPaths["push"](i2), e.songBlobs["push"](c2["content"]), e["songCoverArtData"]["push"](null);
      }
    }
    ni(), e.songDisplayNames.length > 0 && await zi(0);
  }
  async function ai(i2, c2 = false, a2 = false) {
    const n2 = G2;
    a2 && Gi();
    let g2 = e["songDisplayNames"]["length"], z2 = false;
    for (const c3 of i2) {
      const i3 = await dm.open(c3);
      if (i3 && i3["type"] === "file") {
        if (!(i3["content"] instanceof Blob)) {
          dialogHandler.spawnDialog({ icon: "error", title: "Load Error", text: 'Cannot play "' + dm.basename(c3) + '". File content is not in expected Blob format.' });
          continue;
        }
        e["songDisplayNames"]["push"](dm.basename(c3)), e["songVFSPaths"]["push"](c3), e["songBlobs"]["push"](i3["content"]), e.songCoverArtData["push"](null), z2 = true;
      } else dialogHandler["spawnDialog"]({ icon: "error", title: "Load Error", text: 'Could not open or find file: "' + c3 + '"' });
    }
    if (z2) if (ni(), c2 && e["songDisplayNames"]["length"] > 0) {
      const i3 = a2 ? 0 : g2;
      i3 < e.songDisplayNames.length && await zi(i3);
    } else !e["playing"] && e["songDisplayNames"].length > 0 && e["songIndex"] < e.songDisplayNames.length && await zi(e["songIndex"]);
  }
  function Gi() {
    const i2 = G2;
    oi(), ri(), e["songDisplayNames"] = [], e["songPlayableSources"] = [], e["songVFSPaths"] = [], e.songBlobs = [], e.songCoverArtData = [], e.songIndex = 0, e.currentCoverArtImage = null, b["src"] = "", V["textContent"] = "", H["textContent"] = "Playlist Cleared", J.textContent = "Ready", U.textContent = "00:00", ni(), ci && ci["clearRect"](0, 0, W["width"], W["height"]);
  }
  function ni() {
    const i2 = G2;
    P["innerHTML"] = "";
    for (let c2 = 0; c2 < e.songDisplayNames["length"]; c2++) {
      let a2 = document["createElement"]("li");
      a2["innerHTML"] = e["songDisplayNames"][c2] || "Untitled Track", a2["dataset"]["index"] = c2, P["appendChild"](a2), a2.addEventListener("dblclick", async function() {
        const c3 = i2, a3 = parseInt(this.dataset["index"]);
        !isNaN(a3) && await zi(a3);
      });
    }
    e["songDisplayNames"]["length"] > 0 && gi(e["songIndex"]);
  }
  function gi(i2) {
    const c2 = G2;
    Array.from(P.childNodes)["forEach"]((i3) => i3["classList"].remove("selected")), P["childNodes"][i2] && P["childNodes"][i2]["classList"]["add"]("selected");
  }
  async function zi(c2) {
    const a2 = G2;
    if (c2 < 0 || c2 >= e.songDisplayNames.length) return void (0 === e["songDisplayNames"]["length"] && oi());
    oi(), e.songIndex = c2;
    const n2 = e["songVFSPaths"][e["songIndex"]], g2 = e.songDisplayNames[e.songIndex] || dm["basename"](n2 || "Untitled Track");
    let z2 = e.songBlobs[e["songIndex"]];
    if (!z2 && n2) {
      const i2 = await dm["open"](n2);
      if (!(i2 && i2.content instanceof Blob)) return dialogHandler["spawnDialog"]({ icon: "error", title: "Playback Error", text: 'Could not load media content for "' + g2 + '".' }), void (J["textContent"] = "Error loading: " + g2);
      z2 = i2.content, e.songBlobs[e["songIndex"]] = z2;
    }
    if (!z2) return dialogHandler["spawnDialog"]({ icon: "error", title: "Playback Error", text: 'No data for: "' + g2 + '".' }), void (J.textContent = "No data for: " + g2);
    const t2 = dm["getVfsUrl"](n2);
    e["songPlayableSources"][e.songIndex] = t2;
    const r2 = ti(n2 || g2);
    e["currentCoverArtImage"] = null, r2 === "video" ? (o.classList.add("videomode"), W["style"]["display"] = "none", b["style"]["display"] = "block", ci && ci["clearRect"](0, 0, W["width"], W["height"])) : (o["classList"]["remove"]("videomode"), W.style["display"] = "block", b["style"]["display"] = "none", z2 && await async function(c3, a3) {
      const n3 = G2;
      e.currentCoverArtImage = null;
      const g3 = (c4) => {
        e["visualizers"][e["selectedVis"]] === "Cover Art" && ci && (e["currentCoverArtImage"] ? Bi() : wi());
      };
      if (e["songCoverArtData"][c3]) {
        const i2 = new Image();
        return i2["onload"] = () => {
          const c4 = n3;
          e["currentCoverArtImage"] = i2, g3("cache_load_success");
        }, i2.onerror = () => {
          const i3 = n3;
          e.currentCoverArtImage = null, e["songCoverArtData"][c3] = null, g3("cache_load_error");
        }, void (i2["src"] = e["songCoverArtData"][c3]);
      }
      if (a3 && a3 instanceof Blob) if (typeof jsmediatags !== "undefined") try {
        const i2 = await new Promise((i3, c4) => {
          jsmediatags.read(a3, { onSuccess: (c5) => {
            i3(c5);
          }, onError: (i4) => {
            c4(i4);
          } });
        });
        if (i2 && i2["tags"] && i2["tags"]["picture"]) {
          const a4 = i2["tags"]["picture"];
          let G3 = a4["data"];
          const z3 = a4["format"];
          let t3;
          if (G3 instanceof ArrayBuffer) t3 = new Uint8Array(G3);
          else {
            if (!Array["isArray"](G3)) return void g3();
            t3 = new Uint8Array(G3);
          }
          if (t3 && t3["length"] > 0 && z3) {
            let i3 = "";
            const a5 = 32768;
            for (let c4 = 0; c4 < t3["length"]; c4 += a5) i3 += String["fromCharCode"].apply(null, t3["subarray"](c4, c4 + a5));
            const G4 = "data:" + z3 + ";base64," + window["btoa"](i3);
            e["songCoverArtData"][c3] = G4;
            const r3 = new Image();
            r3["onload"] = () => {
              const i4 = n3;
              e["currentCoverArtImage"] = r3, g3("tag_load_success");
            }, r3.onerror = (i4) => {
              const a6 = n3;
              e.currentCoverArtImage = null, e.songCoverArtData[c3] = null, g3("tag_load_error_data_url");
            }, r3.src = G4;
          } else g3();
        } else g3("tag_no_picture");
      } catch (i2) {
        g3();
      }
      else g3("jsmediatags_not_loaded");
      else g3("no_media_blob");
    }(e["songIndex"], z2), "Cover Art" === e["visualizers"][e.selectedVis] && (e.currentCoverArtImage && ci ? Bi() : ci && wi())), b.src = t2, V["textContent"] = "", H.textContent = g2, J["textContent"] = "Loading: " + g2, gi(e["songIndex"]), Li(), b["load"](), Di();
  }
  function ti(i2) {
    return mediaTypeFromPath(i2);
  }
  function ri() {
    const i2 = G2;
    e["currentObjectUrls"].forEach((c2) => URL["revokeObjectURL"](c2)), e["currentObjectUrls"]["clear"]();
  }
  function Li() {
    const i2 = G2, c2 = W["parentElement"].getBoundingClientRect();
    c2["width"] <= 0 || c2["height"] <= 0 || (W["width"] = c2.width, W["height"] = c2.height, b && (b["width"] = c2["width"], b["height"] = c2.height), e["visualizers"][e["selectedVis"]] === "Cover Art" && ci && (e["currentCoverArtImage"] ? Bi() : wi()));
  }
  function Bi() {
    const i2 = G2;
    if (!(ci && e["currentCoverArtImage"] && W["width"] && W["height"])) return;
    ci["clearRect"](0, 0, W["width"], W["height"]);
    const c2 = W["width"] / e["currentCoverArtImage"]["width"], a2 = W["height"] / e.currentCoverArtImage.height, n2 = Math["min"](c2, a2), g2 = (W["width"] - e["currentCoverArtImage"]["width"] * n2) / 2, z2 = (W["height"] - e["currentCoverArtImage"]["height"] * n2) / 2;
    ci["drawImage"](e["currentCoverArtImage"], 0, 0, e["currentCoverArtImage"]["width"], e.currentCoverArtImage.height, g2, z2, e["currentCoverArtImage"]["width"] * n2, e["currentCoverArtImage"]["height"] * n2);
  }
  function wi() {
    const i2 = G2;
    ci && W["width"] && W["height"] && (ci["clearRect"](0, 0, W["width"], W["height"]), ci["fillStyle"] = "black", ci["fillRect"](0, 0, W["width"], W.height), ci["fillStyle"] = "white", ci["textAlign"] = "center", ci["font"] = "12px sans-serif", ci["fillText"]("No Cover Art Available", W.width / 2, W.height / 2));
  }
  function si(i2 = false) {
    const c2 = G2;
    i2 ? (e["selectedVis"] -= 1, e["selectedVis"] < 0 && (e.selectedVis = e["visualizers"]["length"] - 1)) : (e.selectedVis += 1, e.selectedVis > e["visualizers"].length - 1 && (e["selectedVis"] = 0)), e.visualizers[e["selectedVis"]] === "Cover Art" ? (N["innerText"] = "Visualizer: Cover Art", e["currentCoverArtImage"] && ci ? Bi() : ci && wi()) : N.innerText = "Bars and waves: " + e["visualizers"][e["selectedVis"]];
  }
  function ei(i2 = false) {
    const c2 = G2;
    i2 || (e.UIFrameHidden = !e["UIFrameHidden"]), e["UIFrameHidden"] ? (s["classList"].add("framehidden"), v["classList"]["remove"]("active")) : (s.classList["remove"]("framehidden"), v["classList"].add("active"));
    // Toggle Windows XP frame - hide when in framehidden OR miniplayer mode
    if (wm && typeof wm.toggleXPFrame === 'function') {
      wm.toggleXPFrame(e.UIFrameHidden || e.miniPlayerEnabled);
    }
  }
  function Di() {
    const i2 = G2;
    !b["src"] || b["src"] === window["location"].href || b["src"].endsWith("#") || b.src.endsWith("/") || (e.audioContext && "suspended" === e.audioContext["state"] && e["audioContext"]["resume"]().catch((i3) => {
    }), b["play"]().then(() => {
      const c2 = i2;
      e.playing = true, q["classList"]["add"]("playing"), e["songDisplayNames"]["length"] > 0 && e["songDisplayNames"][e["songIndex"]] ? J.textContent = "Playing: " + e["songDisplayNames"][e["songIndex"]] : J["textContent"] = "Playing";
    }).catch((c2) => {
      const a2 = i2;
      e["playing"] = false, q.classList["remove"]("playing"), e["songDisplayNames"]["length"] > 0 && e["songDisplayNames"][e.songIndex] ? J["textContent"] = "Error: Could not play " + e["songDisplayNames"][e["songIndex"]] : J["textContent"] = "Error: Could not play media";
    }));
  }
  function yi() {
    const i2 = G2;
    b.pause(), e.playing = false, q.classList.remove("playing"), e.songDisplayNames["length"] > 0 && e["songDisplayNames"][e["songIndex"]] ? J["textContent"] = "Paused: " + e["songDisplayNames"][e["songIndex"]] : e["songDisplayNames"].length > 0 ? J.textContent = "Paused" : J["textContent"] = "Ready";
  }
  function oi() {
    const i2 = G2;
    yi(), b && (b["currentTime"] = 0), J["textContent"] = "Stopped";
  }
  async function xi() {
    const i2 = G2;
    if (0 === e["songDisplayNames"]["length"]) return;
    let c2 = e["songIndex"] - 1;
    c2 < 0 && (c2 = e.songDisplayNames["length"] - 1), await zi(c2);
  }
  async function Ci() {
    const i2 = G2;
    if (0 === e["songDisplayNames"]["length"]) return;
    let c2 = e["songIndex"] + 1;
    c2 > e["songDisplayNames"]["length"] - 1 && (c2 = 0), await zi(c2);
  }
  function vi() {
    const i2 = G2;
    b.muted || 0 === b["volume"] ? T["classList"].add("active") : T["classList"]["remove"]("active");
  }
  function pi(i2) {
    const c2 = G2, { duration: a2, currentTime: n2 } = i2["srcElement"];
    if (a2 > 0 && !isNaN(a2) && n2 >= 0) {
      const i3 = n2 / a2 * 100;
      k["style"]["width"] = i3 + "%", F["style"]["left"] = i3 + "%", g2 = n2, U["innerHTML"] = formatTime(g2);
    } else k["style"]["width"] = "0%", F["style"]["left"] = "0%", U["textContent"] = "00:00";
    var g2;
  }
  function fi(i2) {
    const c2 = G2, a2 = E["clientWidth"];
    if (0 === a2) return;
    const n2 = i2["offsetX"], g2 = b.duration;
    g2 > 0 && !isNaN(g2) && (b["currentTime"] = n2 / a2 * g2);
  }
  function Ii(i2) {
    const c2 = G2, a2 = R.clientWidth;
    if (0 === a2) return;
    let n2 = i2["offsetX"] / a2;
    n2 < 0 && (n2 = 0), n2 > 1 && (n2 = 1), b.volume = n2, _["style"].left = 100 * n2 + "%", Q.style["width"] = 100 * n2 + "%", n2 > 0 && (b["muted"] = false), vi();
  }
  function ui() {
    const i2 = G2;
    _["style"]["left"] = 100 * b["volume"] + "%", Q["style"]["width"] = 100 * b.volume + "%", vi();
  }
  function Mi() {
    const i2 = G2;
    2 === e["currentUI"] ? d["style"]["display"] = "none" : d["style"]["display"] = "";
  }
  function Ai() {
    const i2 = G2;
    e["currentUI"] += 1, e["currentUI"] > n["length"] - 1 && (e["currentUI"] = 0), e["wmpUiCssLink"] && e.wmpUiCssLink["setAttribute"]("href", withBaseUrl("/ui/wmp/" + n[e["currentUI"]])), wm["setIcon"](e["hWnd"], g[e["currentUI"]]), localStorage["setItem"](shell["_currentUser"] + ".wmpVersion", e["currentUI"]), wm && wm._desktop && (wm._desktop.dataset.wmpUi = String(e["currentUI"])), Mi(), setTimeout(Li, 50);
  }
  async function li() {
    const i2 = G2;
    let c2 = "C:/Documents and Settings/" + shell["_currentUser"] + "/My Documents";
    e["songVFSPaths"]["length"] > 0 && e["songVFSPaths"][e["songVFSPaths"]["length"] - 1] && (c2 = dm["dirname"](e.songVFSPaths[e["songVFSPaths"]["length"] - 1]));
    const a2 = await wm.openFileDialog({ title: "Open Media File(s)", initialPath: c2, filters: [{ name: "All Media Files", extensions: ["mp3", "mp4", "wav", "ogg", "webm", "aac", "flac", "wma", "wmv", "mid"] }, { name: "Audio Files", extensions: ["mp3", "wav", "ogg", "aac", "flac", "wma", "mid"] }, { name: "Video Files", extensions: ["mp4", "webm", "wmv"] }, { name: "All Files", extensions: ["*.*"] }] });
    if (a2) {
      const c3 = Array.isArray(a2) ? a2 : [a2];
      c3["length"] > 0 && await ai(c3, true, false);
    }
  }
  ui(), Mi(), si(), q.addEventListener("pointerup", () => {
    e["playing"] ? yi() : Di();
  }), h["addEventListener"]("pointerup", oi), Y.addEventListener("pointerup", xi), s["querySelector"]("#rewind")["addEventListener"]("pointerup", xi), O.addEventListener("pointerup", Ci), s.querySelector("#ffwd")["addEventListener"]("pointerup", Ci), T.addEventListener("pointerup", function() {
    b["muted"] = !b.muted, vi();
  }), b["addEventListener"]("timeupdate", pi), b.addEventListener("ended", Ci), b["addEventListener"]("volumechange", ui), b["addEventListener"]("loadedmetadata", (i2) => {
    pi(i2), Li();
  }), b["addEventListener"]("canplay", () => {
    Li(), Di();
  }), b["addEventListener"]("error", (i2) => {
    const c2 = G2, a2 = e["songDisplayNames"][e["songIndex"]] || "current track";
    J["textContent"] = "Error playing " + a2 + ". Unsupported format or file error.";
  }), E.addEventListener("pointerdown", (i2) => {
    const c2 = G2;
    if (!b["duration"] || isNaN(b.duration)) return;
    E.setPointerCapture(i2.pointerId);
    const a2 = e["playing"];
    e["playing"] && b.pause(), F["style"]["pointerEvents"] = "none", fi(i2);
    const n2 = (i3) => {
      i3["pressure"] > 0 && fi(i3);
    };
    E["addEventListener"]("pointermove", n2), E.onpointerup = () => {
      const G3 = c2;
      E["removeEventListener"]("pointermove", n2), E.onpointerup = null, E.releasePointerCapture(i2["pointerId"]), F["style"]["pointerEvents"] = "", a2 && Di();
    };
  }), R["addEventListener"]("pointerdown", (i2) => {
    const c2 = G2;
    R["setPointerCapture"](i2["pointerId"]), _["style"]["pointerEvents"] = "none", Ii(i2);
    const a2 = (i3) => {
      i3.pressure > 0 && Ii(i3);
    };
    R.addEventListener("pointermove", a2), R["onpointerup"] = () => {
      const G3 = c2;
      R["removeEventListener"]("pointermove", a2), R["onpointerup"] = null, R.releasePointerCapture(i2["pointerId"]), _.style.pointerEvents = "";
    };
  }), x["addEventListener"]("pointerup", function() {
    const i2 = G2;
    var c2 = parseInt(s["querySelector"]("appcontents")["style"]["width"], 10), a2 = parseInt(s.querySelector("appcontents")["style"]["height"], 10);
    let n2 = z[e["currentUI"]], g2 = wm["getPosition"](e.hWnd), t2 = g2 ? g2[0] : 0, r2 = g2 ? g2[1] : 0;
    e.navPaneVisible ? (s["classList"]["add"]("collapsed"), C.classList["add"]("collapsed"), x.classList.add("collapsed"), wm["setSize"](e["hWnd"], c2 - n2, a2), wm["setPosition"](e.hWnd, parseInt(t2) + n2, r2)) : (s["classList"]["remove"]("collapsed"), C["classList"].remove("collapsed"), x["classList"]["remove"]("collapsed"), wm.setSize(e["hWnd"], c2 + n2, a2), wm["setPosition"](e["hWnd"], parseInt(t2) - n2, r2)), e["navPaneVisible"] = !e.navPaneVisible, setTimeout(Li, 50);
  }), u["addEventListener"]("pointerup", () => {
    // Use XPortfolio minimize in frameless mode
    if (!wm.xpMinimize()) {
      window.wm["minimizeWindow"](e["hWnd"]);
    }
  }), M["addEventListener"]("pointerup", () => {
    const i2 = G2;
    // Use XPortfolio maximize in frameless mode
    if (!wm.xpMaximize()) {
      window.wm["toggleMaximizeWindow"](e["hWnd"]);
    }
    setTimeout(Li, 150);
  });
  const di = () => {
    const i2 = G2;
    e["killVizProcess"] = true, e["audioContext"] && "closed" !== e["audioContext"]["state"] && e["audioContext"].close()["catch"]((i3) => {
    }), ri(), e.songDisplayNames = [], e["songPlayableSources"] = [], e.songVFSPaths = [], e["songBlobs"] = [], e["songCoverArtData"] = [], e.currentCoverArtImage = null;
    const c2 = document.getElementById("wmpCSS_instance_" + e["hWnd"]);
    c2 && c2.remove(), s["_wmpState"] && delete s["_wmpState"];
    // Use XPortfolio close in frameless mode, otherwise internal close
    if (!wm.xpClose()) {
      window.wm["closeWindow"](e["hWnd"]);
    }
  };
  A["addEventListener"]("pointerup", di), $ && ($["onclick"] = di), s["addEventListener"]("wm:windowClosed", di, { once: true }), l.addEventListener("pointerup", function() {
    const i2 = G2;
    e["currentColorSet"] += 1, e["currentColorSet"] > t.length - 1 && (e.currentColorSet = 0), 0 == e["currentColorSet"] ? y["style"]["filter"] = "none" : y["style"].filter = "hue-rotate(" + t[e.currentColorSet] + "deg) saturate(" + r[e["currentColorSet"]] + ")";
  }), d["addEventListener"]("pointerup", function() {
    const i2 = G2;
    2 !== e["currentUI"] && (s["classList"].contains("maximized") && wm.toggleMaximizeWindow(e["hWnd"]), e["miniPlayerEnabled"] ? s["classList"].remove("miniplayer") : s["classList"].add("miniplayer"), e["miniPlayerEnabled"] = !e.miniPlayerEnabled, setTimeout(Li, 150));
    // Toggle Windows XP frame - hide when in miniplayer OR framehidden mode
    if (wm && typeof wm.toggleXPFrame === 'function') {
      wm.toggleXPFrame(e.UIFrameHidden || e.miniPlayerEnabled);
    }
  }), ii && ii["addEventListener"]("click", Ai), f["addEventListener"]("pointerdown", function(i2) {
    const c2 = G2;
    var a2 = s["querySelector"]("appcontents");
    const n2 = parseFloat(document["body"]["style"]["zoom"] || 100) / 100;
    let g2 = i2["clientX"], z2 = i2.clientY;
    function t2(i3) {
      const G3 = c2, t3 = a2["getBoundingClientRect"](), r2 = (i3["clientX"] - g2) / n2, L2 = (i3.clientY - z2) / n2;
      a2.style["width"] = t3.width / n2 + r2 + "px", a2["style"].height = t3.height / n2 + L2 + "px", g2 = i3.clientX, z2 = i3.clientY;
    }
    window.addEventListener("pointermove", t2), window.addEventListener("pointerup", function i3() {
      const a3 = c2;
      window["removeEventListener"]("pointermove", t2), window["removeEventListener"]("pointerup", i3), Li();
    });
  }), I["addEventListener"]("pointerdown", function(i2) {
    const c2 = G2;
    var a2 = s;
    window["addEventListener"]("pointermove", z2), window.addEventListener("pointerup", function i3() {
      const a3 = c2;
      window["removeEventListener"]("pointermove", z2), window["removeEventListener"]("pointerup", i3);
    });
    let n2 = i2.clientX, g2 = i2["clientY"];
    function z2(i3) {
      const G3 = c2;
      let z3 = n2 - i3["clientX"], t2 = g2 - i3.clientY;
      n2 = i3["clientX"], g2 = i3["clientY"], a2["style"].top = a2["offsetTop"] - t2 + "px", a2["style"].left = a2["offsetLeft"] - z3 + "px";
    }
  }), S["addEventListener"]("pointerup", Li), X["addEventListener"]("pointerup", () => si(true)), Z.addEventListener("pointerup", () => si(false)), m["addEventListener"]("pointerup", function() {
    const i2 = G2;
    ti(e["songVFSPaths"][e["songIndex"]] || e["songDisplayNames"][e["songIndex"]]) === "video" ? b["requestFullscreen"]() : W["requestFullscreen"]();
  }), document["addEventListener"]("fullscreenchange", () => setTimeout(Li, 150)), v.addEventListener("pointerup", () => ei()), p["addEventListener"]("pointerup", function() {
    const i2 = G2;
    e["playlistHidden"] ? (s["classList"].remove("playlisthidden"), o.classList["remove"]("playlisthidden"), p["classList"].add("active")) : (s["classList"]["add"]("playlisthidden"), o["classList"].add("playlisthidden"), p["classList"].remove("active")), e["playlistHidden"] = !e["playlistHidden"], setTimeout(Li, 50);
  }), s["querySelectorAll"]("#wmp-file-menu [data-action]")["forEach"]((i2) => {
    const c2 = G2;
    switch (i2.dataset["action"]) {
      case "open-media-files":
        i2.onclick = li;
        break;
      case "clear-playlist":
        i2["onclick"] = Gi;
        break;
      case "exit-wmp":
        i2["onclick"] = di;
    }
  }), K["addEventListener"]("pointerup", Ai), j.addEventListener("pointerup", () => {
    const i2 = G2;
    dialogHandler["spawnDialog"]({ icon: "info", title: "Windows Media Player Help", text: 'Use "File > Open Media File(s)..." to add songs from your virtual drives to the playlist. <br>Use Explorer to upload songs from your computer to your virtual drives first.', windowSize: [390, "auto"], buttons: [["OK", (c2) => window.wm["closeWindow"](c2["target"]["closest"]("app").id)]] });
  });
  const bi = s["querySelector"]("appcontents") || s;
  return new ResizeObserver(() => setTimeout(Li, 50))["observe"](bi), e["hWnd"];
} });
