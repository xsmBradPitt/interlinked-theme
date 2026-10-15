// src/theme/chrome.mjs
import { withAlpha as a } from '../color.mjs';
import { ALPHA, tints } from './shared.mjs';

export function chromeColors(p) {
  const t = tints(p);
  return {
    // activityBar（上游沒有此區域，沿用 chrome 底色）
    'activityBar.background': p.bgChrome,
    'activityBar.foreground': p.tealBright,
    'activityBar.inactiveForeground': t.textDim,
    'activityBar.border': t.border,
    'activityBar.activeBorder': p.tealBright,
    'activityBarBadge.background': p.teal,
    'activityBarBadge.foreground': p.bgChrome,

    // sideBar
    'sideBar.background': p.bgSide,
    'sideBar.foreground': p.fg,
    'sideBar.border': t.border,
    'sideBarTitle.foreground': p.mintPale,
    'sideBarSectionHeader.background': p.bgRaised,
    'sideBarSectionHeader.foreground': p.mintPale,
    'sideBarSectionHeader.border': t.border,

    // statusBar
    'statusBar.background': p.bgChrome,
    'statusBar.foreground': p.fg,
    'statusBar.border': t.border,
    'statusBar.debuggingBackground': p.amber,
    'statusBar.debuggingForeground': p.bgChrome,
    'statusBar.debuggingBorder': t.border,
    'statusBar.noFolderBackground': p.bgRaised,
    'statusBar.noFolderForeground': p.fg,
    'statusBar.noFolderBorder': t.border,
    'statusBarItem.hoverBackground': t.hoverBg,
    'statusBarItem.activeBackground': t.activeBg,
    'statusBarItem.prominentBackground': p.bgRaised,
    'statusBarItem.prominentForeground': p.tealBright,
    'statusBarItem.remoteBackground': p.teal,
    'statusBarItem.remoteForeground': p.bgChrome,
    'statusBarItem.errorBackground': p.coral,
    'statusBarItem.errorForeground': p.bgChrome,
    'statusBarItem.warningBackground': p.lemon,
    'statusBarItem.warningForeground': p.bgChrome,

    // titleBar 與選單
    'titleBar.activeBackground': p.bgChrome,
    'titleBar.activeForeground': p.fg,
    'titleBar.inactiveBackground': p.bgChrome,
    'titleBar.inactiveForeground': t.textDim,
    'titleBar.border': t.border,
    'menubar.selectionBackground': t.hoverBg,
    'menubar.selectionForeground': p.fg,
    'menu.background': p.bgSide,
    'menu.foreground': p.fg,
    'menu.selectionBackground': t.activeBg,
    'menu.selectionForeground': p.fg,
    'menu.separatorBackground': t.border,
    'menu.border': t.border,

    // tabs
    'editorGroupHeader.tabsBackground': p.bgTabBar,
    'editorGroupHeader.noTabsBackground': p.bgEditor,
    'editorGroupHeader.tabsBorder': t.border,
    'editorGroup.border': t.border,
    'editorGroup.dropBackground': t.activeBg,
    'tab.activeBackground': p.bgEditor,
    'tab.activeForeground': p.fg,
    'tab.activeBorder': t.none,
    'tab.activeBorderTop': p.tealBright,            // 作用中分頁的指示線（spec 故事 24）
    'tab.activeModifiedBorder': p.amber,
    'tab.inactiveBackground': p.bgTabBar,
    'tab.inactiveForeground': t.textDim,
    'tab.inactiveModifiedBorder': a(p.amber, ALPHA.strong),
    'tab.unfocusedActiveBackground': p.bgEditor,
    'tab.unfocusedActiveForeground': t.textDim,
    'tab.unfocusedInactiveBackground': p.bgTabBar,
    'tab.unfocusedInactiveForeground': t.textDimmer,
    'tab.hoverBackground': p.bgRaised,
    'tab.hoverForeground': p.fg,
    'tab.hoverBorder': t.none,
    'tab.border': t.border,
    'tab.lastPinnedBorder': t.border,

    // panel
    'panel.background': p.bgPanel,
    'panel.border': t.border,
    'panel.dropBorder': p.tealBright,
    'panelTitle.activeBorder': p.tealBright,
    'panelTitle.activeForeground': p.fg,
    'panelTitle.inactiveForeground': t.textDim,
    'panelSection.border': t.border,
    'panelSectionHeader.background': p.bgRaised,
    'panelInput.border': t.border,

    // badge / progress / focus
    'badge.background': p.teal,
    'badge.foreground': p.bgChrome,
    'progressBar.background': p.tealBright,
    'focusBorder': t.borderStrong,
    'sash.hoverBorder': p.tealBright,

    // global
    'foreground': p.fg,
    'descriptionForeground': t.textDim,
    'errorForeground': p.coral,
    'icon.foreground': p.fg,
    'selection.background': a(p.mint, ALPHA.soft),
    'textLink.foreground': p.aquamarine,
    'textLink.activeForeground': p.springGreen,
    'textCodeBlock.background': p.bgSide,
    'widget.shadow': a(p.bgChrome, 0.6),
    'toolbar.hoverBackground': t.hoverBg,
    'toolbar.activeBackground': t.activeBg,
  };
}
