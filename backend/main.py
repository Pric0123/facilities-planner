from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import parser as fp
import engine
import math
from pydantic import ValidationError

app = FastAPI()

# 允許 React 前端連線
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok"}


@app.post("/calculate")
def calculate(raw: dict):
    # Step 1: Parser 驗證
    try:
        validated = fp.parse(raw)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())

    # Step 2: 整理成 engine 格式
    parts      = [(p.name, p.qty, p.is_spare) for p in validated.parts]
    operations = [(o.part_name, o.op_no, o.machine,
                   o.uph, o.efficiency, o.defect_rate)
                  for o in validated.operations]
    space_data = {s.machine: (s.L, s.W, s.A_MTS, s.A_O, s.A_WIP)
                  for s in validated.space}
    flows      = {(f.from_station, f.to_station): f.volume
                  for f in validated.flows}

    config = {
        "weekly_output" : validated.weekly_output,
        "weekly_hours"  : validated.weekly_hours,
        "parts"         : parts,
        "operations"    : operations,
        "space_data"    : space_data,
        "flows"         : flows,
        "stations"      : validated.stations,
    }

    # Step 3: 計算引擎
    result = engine.run(config)

    # Step 4: 序列化（tuple key 轉成字串）
    result["fromto"] = {
        f"{k[0]}->{k[1]}": v for k, v in result["fromto"].items()
    }
    result["flowbetween"] = {
        f"{k[0]}<>{k[1]}": v for k, v in result["flowbetween"].items()
    }
    result["rel"] = {
        f"{k[0]}<>{k[1]}": v for k, v in result["rel"].items()
    }

    return result

from llm import interpret_results

@app.post("/interpret")
def interpret(result: dict):
    try:
        analysis = interpret_results(result)
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
