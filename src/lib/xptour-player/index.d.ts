/**
 * Public library entry for the Windows XP Tour player.
 *
 * Embeds the decompiled GSAP tour player into a host-provided container.
 * The host serves the converted scene assets (the `generated/` tree produced by
 * the conversion scripts) at `assetsBaseUrl` and gets back a small handle to
 * drive playback. GSAP is a peer dependency.
 *
 *   import { createTourPlayer } from "windows-xp-tour-gsap";
 *
 *   const tour = await createTourPlayer(containerEl, {
 *     assetsBaseUrl: "/apps/xp-tour/gsap",
 *     autoplay: true,
 *   });
 *   // …later
 *   tour.destroy();
 */
import "./player.css";
import type { PlayerLoadErrorEvent, PlayerLoadEvent, PlayerLoadLifecycleCallbacks, TourButtonEvent, TourNavigation } from "./app/PlayerController";
import type { AssetTimeline } from "./data/timelineTypes";
import { type AssetSource } from "./data/packedAssets.ts";
export interface DecompiledPlayerAssetOptions {
    /** Where the converted `generated/` (and `generated-packed/`) assets are served. Default "" (origin root). */
    assetsBaseUrl?: string;
    /**
     * How assets are loaded:
     * - "files" (default): loose files under `${assetsBaseUrl}/generated/`.
     * - "bundle": one gzipped JSON of timeline+shapes per scene (media still loose).
     * - "archive": ONE file for the whole tour, scenes read on demand via HTTP Range.
     * - "scene-pack": one self-contained file per scene under `generated-packs/`.
     */
    assetSource?: AssetSource;
    /** For assetSource "archive": URL of the single archive. Default `${assetsBaseUrl}/xp-tour.pack`. */
    archiveUrl?: string;
}
export interface PlayerRuntimeOptions {
    /** Begin playing immediately. Default true. */
    autoplay?: boolean;
    /** Enable verbose segment-flash tracing in the console. Default false. */
    debug?: boolean;
    /** Per-frame callback for the root level (frame index, playing, current frame label). */
    onFrame?: (frame: number, playing: boolean, label: string) => void;
    /** Notified on every button interaction, including buttons the conversion left
     *  unbound. Return `true` to suppress the player's own handling so the host fully
     *  owns the response (e.g. wire "Skip Intro" or an end-of-tour button to exit). */
    onButton?: (event: TourButtonEvent) => boolean | void;
    /** Notified when the tour navigates between scenes/levels (loadMovie/unloadMovie),
     *  so the host can follow progress (e.g. detect the final segment / tour end). */
    onNavigate?: (nav: TourNavigation) => void;
    /** Notified when the movie issues an AVM1 `fscommand(command, args)`. The original
     *  tour's quit button is `fscommand("quit")`; map it to your own response (e.g. close
     *  the tour). Any embedder gets a working quit button with no per-button wiring. */
    onFsCommand?: (command: string, args: string) => void;
}
export type DecompiledPlayerLoadEvent = PlayerLoadEvent;
export type DecompiledPlayerLoadErrorEvent = PlayerLoadErrorEvent;
export type DecompiledPlayerLoadLifecycleCallbacks = PlayerLoadLifecycleCallbacks;
export type DecompiledPlayerRuntimeOptions = PlayerRuntimeOptions & DecompiledPlayerLoadLifecycleCallbacks;
export type DecompiledPlayerOptions = DecompiledPlayerAssetOptions & DecompiledPlayerRuntimeOptions & ({
    /** Entry SWF to load from the configured generated assets, e.g. "intro.swf". */
    scene: string;
    timeline?: never;
    swf?: never;
} | {
    /** Already-loaded timeline data to play without fetching the entry timeline. */
    timeline: AssetTimeline;
    /** Optional SWF name used for level identity and self-load guards. Defaults to `${timeline.scene}.swf`. */
    swf?: string;
    scene?: never;
});
export interface TourPlayerOptions extends DecompiledPlayerAssetOptions, PlayerRuntimeOptions, DecompiledPlayerLoadLifecycleCallbacks {
    /** Entry SWF. Default "A-tour.swf" — the Tour Shell that drives the full guided tour. */
    scene?: string;
}
/** Handle returned by {@link createDecompiledPlayer} for driving playback. */
export interface DecompiledPlayer {
    play(): void;
    pause(): void;
    toggle(): void;
    restart(): void;
    seek(frame: number): void;
    readonly frameCount: number;
    readonly currentFrame: number;
    readonly isPlaying: boolean;
    /** Tear down the player, its levels, audio, and DOM. */
    destroy(): void;
}
/** Handle returned by {@link createTourPlayer} for driving playback. */
export interface TourPlayer extends DecompiledPlayer {
}
/**
 * Create and (optionally) start a tour player inside `container`.
 * Resolves once the entry scene's timeline has loaded.
 */
export declare function createTourPlayer(container: HTMLElement, options?: TourPlayerOptions): Promise<TourPlayer>;
/**
 * Create and (optionally) start the data-driven Decompiled Player inside `container`.
 *
 * Unlike {@link createTourPlayer}, this generic API has no tour-shell default:
 * pass either a `scene` SWF to load from generated assets or an already-loaded
 * `timeline`.
 */
export declare function createDecompiledPlayer(container: HTMLElement, options: DecompiledPlayerOptions): Promise<DecompiledPlayer>;
export { PlayerController } from "./app/PlayerController";
export type { PlayerControllerOptions, PlayerLoadEvent, PlayerLoadErrorEvent, PlayerLoadLifecycleCallbacks, PlayerLoadSource, TourButtonEvent, TourButtonAction, TourNavigation, } from "./app/PlayerController";
export { setAssetsBaseUrl, getAssetsBaseUrl, setAssetSource, getAssetSource, setArchiveUrl } from "./data/packedAssets.ts";
export type { AssetSource } from "./data/packedAssets.ts";
export { loadTimeline } from "./data/TimelineLoader";
export type { AssetTimeline } from "./data/timelineTypes";
export { scenes, sceneNameFromSwf } from "./data/scenes";
export type { TourScene } from "./data/scenes";
