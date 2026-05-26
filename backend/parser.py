from pydantic import BaseModel, field_validator, model_validator
from typing import List, Optional

# ── SCHEMAS ───────────────────────────────────────────────────────────────────

class PartModel(BaseModel):
    name:     str
    qty:      int
    is_spare: bool = False

    @field_validator("qty")
    @classmethod
    def qty_positive(cls, v):
        if v <= 0:
            raise ValueError("qty 必須大於 0")
        return v


class OperationModel(BaseModel):
    part_name:   str
    op_no:       str
    machine:     str
    uph:         float
    efficiency:  float
    defect_rate: float

    @field_validator("uph")
    @classmethod
    def uph_positive(cls, v):
        if v <= 0:
            raise ValueError("uph 必須大於 0")
        return v

    @field_validator("efficiency")
    @classmethod
    def eff_range(cls, v):
        if not (0 < v <= 1):
            raise ValueError("efficiency 必須在 (0, 1] 之間")
        return v

    @field_validator("defect_rate")
    @classmethod
    def defect_range(cls, v):
        if not (0 <= v < 1):
            raise ValueError("defect_rate 必須在 [0, 1) 之間")
        return v


class SpaceModel(BaseModel):
    machine: str
    L:       float
    W:       float
    A_MTS:   float = 0.0
    A_O:     float = 0.0
    A_WIP:   float = 0.0

    @field_validator("L", "W", "A_MTS", "A_O", "A_WIP")
    @classmethod
    def non_negative(cls, v):
        if v < 0:
            raise ValueError("空間數值不能為負數")
        return v


class FlowModel(BaseModel):
    from_station: str
    to_station:   str
    volume:       int

    @field_validator("volume")
    @classmethod
    def volume_positive(cls, v):
        if v <= 0:
            raise ValueError("flow volume 必須大於 0")
        return v


class FacilityInput(BaseModel):
    weekly_output: int
    weekly_hours:  float
    stations:      List[str]
    parts:         List[PartModel]
    operations:    List[OperationModel]
    space:         List[SpaceModel]
    flows:         List[FlowModel]
    rel_thresholds: Optional[dict] = None  # 使用者可覆蓋級距

    @field_validator("weekly_output")
    @classmethod
    def output_positive(cls, v):
        if v <= 0:
            raise ValueError("weekly_output 必須大於 0")
        return v

    @field_validator("weekly_hours")
    @classmethod
    def hours_positive(cls, v):
        if v <= 0:
            raise ValueError("weekly_hours 必須大於 0")
        return v

    @field_validator("stations")
    @classmethod
    def stations_not_empty(cls, v):
        if len(v) < 2:
            raise ValueError("stations 至少需要 2 個")
        return v

    @model_validator(mode="after")
    def cross_validate(self):
        part_names    = {p.name for p in self.parts}
        machine_names = {s.machine for s in self.space}
        station_set   = set(self.stations)

        # 每個 operation 的 part_name 必須存在於 parts
        for op in self.operations:
            if op.part_name not in part_names:
                raise ValueError(
                    f"Operation {op.op_no} 的 part_name '{op.part_name}' "
                    f"不在 parts 清單中"
                )
            # machine 必須存在於 space
            if op.machine not in machine_names:
                raise ValueError(
                    f"Operation {op.op_no} 的 machine '{op.machine}' "
                    f"不在 space 清單中"
                )

        # flow 的 station 必須存在於 stations
        for f in self.flows:
            if f.from_station not in station_set:
                raise ValueError(
                    f"Flow from_station '{f.from_station}' 不在 stations 中"
                )
            if f.to_station not in station_set:
                raise ValueError(
                    f"Flow to_station '{f.to_station}' 不在 stations 中"
                )

        return self


# ── PARSE FUNCTION ────────────────────────────────────────────────────────────

def parse(raw: dict) -> FacilityInput:
    """
    Validate and parse raw input dict.
    Raises ValidationError if anything is wrong.
    Returns FacilityInput on success.
    """
    return FacilityInput(**raw)

