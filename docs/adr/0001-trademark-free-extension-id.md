# 擴充套件 ID 避開「Blade Runner」商標字

擴充套件 ID（`publisher.name`）發布後就不能改，改名只能下架重新上架，已安裝的使用者也不會跟著過去；而「Blade Runner」是 Alcon Entertainment 的註冊商標。因此 ID 採用中性的 `xsmbradpitt.interlinked-theme`（「Interlinked」取自片中 Baseline Test 的台詞，本身是一般英文單字），只在可以隨時修改的 displayName 和 description 寫上「Blade Runner 2049 inspired」，讓使用者搜尋得到。萬一收到商標方面的要求，只要改 displayName 就好，不必動到 ID。

## Considered Options

- 直接用 `blade-runner-2049-theme`：辨識度最高，但商標風險會被鎖死在無法修改的 ID 上。
- 完全不提電影（例如 `neon-noir-theme`）：最安全，但辨識度低，也容易撞名。
