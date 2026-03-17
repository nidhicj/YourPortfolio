// src/scene/cardConfigs/desktop.js
//
// Canvas: 2800×1900 — matches the mesh aspect ratio (meshW/meshH ≈ 1.476)
// so the texture fills the plane without any horizontal squeeze.
// All values are 2× logical screen size for crisp rendering.
//
// Screen equivalents: title=80px, tags=22px, desc=23px, padding=90px

export const DESKTOP_CFG = {
    canvasW: 2800,  canvasH: 1900,  radius: 0,
    pad: 180,
    // Title — big and confident, vertically centred in slot
    titleY: 698,
    titleFont: '400 160px "Bowlby One",sans-serif',
    titleLH: 192,  titleLines: 1,
    // Highlight — small label below title
    hlY: 838,
    hlFont: '500 36px "DM Mono",monospace',
    // Tags — mono, below highlight
    tagsY: 916,
    tagsFont: '400 44px "DM Mono",monospace',
    tagsMax: 6,
    // Desc rule — thin separator
    descRuleY: 992,  descRuleAlpha: 0.15,
    // Description — generous line height
    descY: 1122,
    descFont: '400 46px "Crete Round",serif',
    descLH: 72,  descLines: 4,
    // Zone fracs
    zoneFracs: [
        [0.78, 1.00],
        [0.55, 0.78],
        [0.44, 0.55],
        [0.00, 0.44],
    ],
};