# Facilities Planning Tool

> 設施規劃自動化工具：上傳 Excel，自動產出設備需求、空間需求、From-to Chart、Flow-between Chart、REL Chart，並由 AI 提供專業分析。

🔗 **Live Demo**: https://facilities-planner.vercel.app

---

## 觀點（Why）

傳統設施規劃需要工程師手動計算設備數量、空間需求、物流矩陣，容易出現：
- 人工計算錯誤（如良率連鎖反推疏忽）
- 級距設定主觀（REL Chart 憑感覺切）
- 換產品就要重做全部

**核心觀點：設施規劃的計算邏輯是固定的，只有資料不同。應該讓工程師專注在判斷，不是計算。**

---

## 策略（What）

三層架構，職責分離：
關鍵設計決策：
- LLM Temperature = 0.1，確保輸出穩定不亂猜
- 不用 RAG：所有數據來自使用者，AI 沒有需要「猜」的地方
- REL 級距用公式 `(max - min) / 5`，不讓 AI 決定
- 中間值全程不四捨五入，只有最終輸出才 `round(4)`

---

## 手法（How）

### 技術選型
| 層 | 技術 | 原因 |
|---|---|---|
| 前端 | React + SheetJS | Excel 匯入/匯出，表單即時微調 |
| 後端 | FastAPI + Pydantic | 嚴格參數驗證，型別安全 |
| LLM | Groq API (llama-3.3-70b) | 免費、速度快、Temperature 可控 |
| 部署 | Vercel + Render | 免費，零維運成本 |

### 使用流程
1. 下載 Excel 模板
2. 填入產品資料（BOM、工序、機器空間、物流路徑）
3. 上傳 → 自動填入表單（可手動微調）
4. 按計算 → 得到 5 張報表 + AI 分析

### 計算輸出
- 設備需求表（各機器需求台數）
- 空間需求表（含 20% 走道）
- From-to Chart（單向物流量）
- Flow-between Chart（雙向合計，上三角）
- REL Chart（A/E/I/O/U 等級，顏色編碼）
- AI 分析（瓶頸工站、相鄰建議、整體規劃）

---

## 驗證（Proof）

以中原大學工業工程 C-Clamp 案例驗證：

| 項目 | 計算結果 | 課本答案 |
|---|---|---|
| LH 六角車床 | 6 台 | 6 台 ✅ |
| SW 鋸床 | 4 台 | 4 台 ✅ |
| ML 銑床 | 13 台 | 13 台 ✅ |
| BH 長桌子 | 6 台 | 6 台 ✅ |
| S→LH 流量 | 20500 | 20500 ✅ |
| REL S↔LH | A | A ✅ |

---

## 本地開發

```bash
# 後端
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
GROQ_API_KEY=your_key uvicorn main:app --reload

# 前端
cd frontend
npm install
npm start
```

---

## 專案結構
