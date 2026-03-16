// src/scene/cardConfigs/desktop.js
// Layout: title (centered) | highlight | tags | desc rule | description

export const DESKTOP_CFG = {
    // Canvas size
    canvasW: 1400,  canvasH: 780,  radius: 28,
    // Padding
    pad: 80,
    // Title
    titleY: 190,
    titleFont: '400 82px "Bowlby One",sans-serif',
    titleLH: 90,  titleLines: 1,
    // Highlight (below title)
    hlY: 310,
    hlFont: '500 15px "DM Mono",monospace',
    // Tags (below highlight)
    tagsY: 348,
    tagsFont: '400 24px "DM Mono",monospace',
    tagsMax: 6,
    // Desc rule
    descRuleY: 378,  descRuleAlpha: 0.20,
    // Description
    descY: 422,
    descFont: '400 21px "Crete Round",serif',
    descLH: 33,  descLines: 4,
    // Zone fracs for getScreenZones (not used for exit anim anymore, kept for compat)
    zoneFracs: [
        [0.78, 1.00],   // zone 0 — description
        [0.55, 0.78],   // zone 1 — tags
        [0.44, 0.55],   // zone 2 — highlight
        [0.00, 0.44],   // zone 3 — title
    ],
};