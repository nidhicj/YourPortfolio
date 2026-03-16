// src/scene/cardConfigs/mobile.js
// Layout: title (centered) | highlight | tags | desc rule | description

export const MOBILE_CFG = {
    // Canvas size
    canvasW: 900,  canvasH: 1260,  radius: 36,
    // Padding
    pad: 64,
    // Title
    titleY: 220,
    titleFont: '400 90px "Bowlby One",sans-serif',
    titleLH: 108,  titleLines: 2,
    // Highlight (below title)
    hlY: 460,
    hlFont: '500 24px "DM Mono",monospace',
    // Tags (below highlight)
    tagsY: 512,
    tagsFont: '400 20px "DM Mono",monospace',
    tagsMax: 4,
    // Desc rule
    descRuleY: 552,  descRuleAlpha: 0.18,
    // Description
    descY: 610,
    descFont: '400 28px "Crete Round",serif',
    descLH: 44,  descLines: 5,
    // Zone fracs
    zoneFracs: [
        [0.76, 1.00],   // zone 0 — description
        [0.52, 0.76],   // zone 1 — tags
        [0.42, 0.52],   // zone 2 — highlight
        [0.00, 0.42],   // zone 3 — title
    ],
};