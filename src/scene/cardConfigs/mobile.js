// src/scene/cardConfigs/mobile.js
// Canvas: 900×1900 — matches mobile mesh aspect (~0.474)

export const MOBILE_CFG = {
    canvasW: 900,  canvasH: 1900,  radius: 0,
    pad: 80,
    // Title
    titleY: 703,
    titleFont: '400 100px "Bowlby One",sans-serif',
    titleLH: 120,  titleLines: 2,
    // Highlight
    hlY: 893,
    hlFont: '500 28px "DM Mono",monospace',
    // Tags
    tagsY: 953,
    tagsFont: '400 32px "DM Mono",monospace',
    tagsMax: 4,
    // Desc rule
    descRuleY: 1014,  descRuleAlpha: 0.15,
    // Description
    descY: 1117,
    descFont: '400 36px "Crete Round",serif',
    descLH: 56,  descLines: 4,
    // Zone fracs
    zoneFracs: [
        [0.76, 1.00],
        [0.52, 0.76],
        [0.42, 0.52],
        [0.00, 0.42],
    ],
};