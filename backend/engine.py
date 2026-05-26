
import math

# ── CONSTANTS ─────────────────────────────────────────────────────────────────
DISPLAY_ROUND = 4

# ── DATA MODELS ───────────────────────────────────────────────────────────────
# Operation: (part_name, op_no, machine, uph, efficiency, defect_rate)
# Part: (part_name, quantity, is_spare)

# ── ENGINE ────────────────────────────────────────────────────────────────────

def calc_equipment(parts, operations, weekly_output, weekly_hours):
    """
    Calculate raw N for each (part, machine) pair.
    All intermediate values stay raw float - no rounding.
    Returns:
        part_machine_n : dict {(part, machine): raw_N}
        machine_n      : dict {machine: raw_N_total}
    """
    part_machine_n = {}

    for part_name, qty, is_spare in parts:
        part_ops = [o for o in operations if o[0] == part_name]
        required = weekly_output * qty  # spare already included in qty
        cum_output = required

        for op in reversed(part_ops):
            _, op_no, mach, uph, eff, defect = op
            # back-calculate input from output
            inp = cum_output / (1.0 - defect) if defect < 1.0 else cum_output
            raw_n = inp / (uph * eff * weekly_hours)
            key = (part_name, mach)
            part_machine_n[key] = part_machine_n.get(key, 0.0) + raw_n
            cum_output = inp

    # aggregate per machine (raw)
    machine_n = {}
    for (part, mach), n in part_machine_n.items():
        machine_n[mach] = machine_n.get(mach, 0.0) + n

    return part_machine_n, machine_n


def calc_space(machine_n, space_data):
    """
    Calculate space requirements per machine.
    All intermediate values stay raw float.
    space_data: dict {machine: (L, W, A_MTS, A_O, A_WIP)}
    Returns list of dicts with raw and display values.
    """
    results = []
    for mach, (L, W, amts, ao, awip) in space_data.items():
        mach_area  = L * W
        unit_ws    = mach_area + amts + ao + awip
        qty        = math.ceil(machine_n.get(mach, 0.0))
        total      = unit_ws * qty
        total_aisle = total * 1.2

        results.append({
            "machine"     : mach,
            "L"           : L,
            "W"           : W,
            "mach_area"   : round(mach_area,   DISPLAY_ROUND),
            "A_MTS"       : amts,
            "A_O"         : ao,
            "A_WIP"       : awip,
            "unit_ws"     : round(unit_ws,      DISPLAY_ROUND),
            "qty"         : qty,
            "total"       : round(total,        DISPLAY_ROUND),
            "total_aisle" : round(total_aisle,  DISPLAY_ROUND),
        })
    return results


def calc_fromto(flows):
    """
    flows: dict {(from_station, to_station): volume}
    Returns the same dict (already integers, no rounding needed).
    """
    return dict(flows)


def calc_flowbetween(flows, stations):
    """
    Merge bidirectional flows into upper triangle.
    Returns dict {(s_i, s_j): volume} where index(s_i) < index(s_j)
    """
    fb = {}
    for (f, t), v in flows.items():
        key = tuple(sorted([f, t], key=lambda x: stations.index(x)))
        fb[key] = fb.get(key, 0) + v
    return fb


def calc_rel_thresholds(fb):
    """
    REL thresholds: (max - min) / 5
    All raw, no rounding until display.
    Returns dict {level: raw_threshold}
    """
    non_zero = [v for v in fb.values() if v > 0]
    if not non_zero:
        return {}
    max_f    = max(non_zero)
    min_f    = min(non_zero)
    interval = (max_f - min_f) / 5.0  # raw

    return {
        "max"      : max_f,
        "min"      : min_f,
        "interval" : interval,
        "A"        : max_f - interval,
        "E"        : max_f - interval * 2,
        "I"        : max_f - interval * 3,
        "O"        : max_f - interval * 4,
    }


def flow_to_rel(v, thresholds):
    """
    Convert raw flow value to REL level using raw thresholds.
    No rounding involved.
    """
    if v == 0:                    return "U"
    if v >= thresholds["A"]:      return "A"
    if v >= thresholds["E"]:      return "E"
    if v >= thresholds["I"]:      return "I"
    if v >= thresholds["O"]:      return "O"
    return "U"


def calc_rel(fb, stations, thresholds):
    """
    Build REL chart dict {(s_i, s_j): level}
    Upper triangle only.
    """
    rel = {}
    for i, s_i in enumerate(stations):
        for j, s_j in enumerate(stations):
            if j <= i:
                continue
            key = (s_i, s_j)
            v   = fb.get(key, 0)
            rel[key] = flow_to_rel(v, thresholds)
    return rel


def run(config):
    """
    Main entry point.
    config: {
        weekly_output, weekly_hours,
        parts, operations, space_data,
        flows, stations
    }
    Returns full result dict.
    """
    part_machine_n, machine_n = calc_equipment(
        config["parts"],
        config["operations"],
        config["weekly_output"],
        config["weekly_hours"],
    )

    space = calc_space(machine_n, config["space_data"])
    fromto = calc_fromto(config["flows"])
    fb = calc_flowbetween(config["flows"], config["stations"])
    thresholds = calc_rel_thresholds(fb)
    rel = calc_rel(fb, config["stations"], thresholds)

    # display-ready equipment table
    equipment = []
    machines = list(config["space_data"].keys())
    for mach in machines:
        raw_total = machine_n.get(mach, 0.0)
        row = {"machine": mach, "qty": math.ceil(raw_total),
               "total_n": round(raw_total, DISPLAY_ROUND)}
        for part_name, qty, _ in config["parts"]:
            key = (part_name, mach)
            raw = part_machine_n.get(key, 0.0)
            row[part_name] = round(raw, DISPLAY_ROUND) if raw else None
        equipment.append(row)

    return {
        "equipment"  : equipment,
        "space"      : space,
        "fromto"     : fromto,
        "flowbetween": fb,
        "thresholds" : {k: round(v, DISPLAY_ROUND) if isinstance(v, float) else v
                        for k, v in thresholds.items()},
        "rel"        : rel,
    }

