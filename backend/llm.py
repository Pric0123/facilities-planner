import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

SYSTEM_PROMPT = """你是一個設施規劃（Facilities Planning）專家助理。
你的工作是根據計算結果提供專業的分析和建議。
請用繁體中文回答，簡潔專業，不超過200字。
絕對不要自己計算數字，只根據提供的數據做分析。"""

def interpret_results(result: dict) -> str:
    equipment_summary = []
    for eq in result.get("equipment", []):
        equipment_summary.append(
            f"{eq['machine']}: {eq['qty']} 台（N={eq['total_n']}）"
        )

    rel_summary = []
    for pair, level in result.get("rel", {}).items():
        if level in ("A", "E"):
            rel_summary.append(f"{pair}: {level}")

    thresholds = result.get("thresholds", {})

    prompt = f"""以下是設施規劃的計算結果，請提供專業分析：

設備需求：
{chr(10).join(equipment_summary)}

REL Chart 重要關係（A/E級）：
{chr(10).join(rel_summary) if rel_summary else "無"}

REL 級距：
A≥{thresholds.get("A","?")}, E≥{thresholds.get("E","?")}, I≥{thresholds.get("I","?")}, O≥{thresholds.get("O","?")}

請指出：
1. 哪個工作站是瓶頸
2. 哪些工作站應該相鄰
3. 整體建議"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": prompt},
        ],
        temperature=0.1,
        max_tokens=400,
    )

    return response.choices[0].message.content
