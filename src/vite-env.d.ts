/// <reference types="vite/client" />

/** true only in preview builds made with VITE_AVATAR_DEMO=1 (see vite.config.ts). */
declare const __AVATAR_DEMO__: boolean;
/** true while the /digital-twin-test prototype route is switched on (see vite.config.ts). */
declare const __TWIN_TEST__: boolean;
/** true only in the shareable design preview: the twin page talks to a labelled simulator, not MetaPerson. */
declare const __TWIN_SIMULATOR__: boolean;
