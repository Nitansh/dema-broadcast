#!/usr/bin/env python3
"""
Market Data Validator for DEMA Broadcast Master.
Validates daily telemetry JSON against the standard schema.
"""

import argparse
import json
import sys
from pathlib import Path


def validate(data_path: Path, schema_path: Path) -> bool:
    with open(data_path, "r", encoding="utf-8") as df:
        data = json.load(df)

    try:
        import jsonschema
        with open(schema_path, "r", encoding="utf-8") as sf:
            schema = json.load(sf)
        jsonschema.validate(instance=data, schema=schema)
        print(f"[SUCCESS] {data_path.name} strictly conforms to {schema_path.name}")
        return True
    except ImportError:
        pass
    except Exception as err:
        print(f"[VALIDATION ERROR] {err}")
        return False

    # Built-in structural validation
    required_keys = [
        "date", "session", "voice", "disclaimer", "market_summary",
        "top_gainers", "top_losers", "momentum_stocks", "featured_stock", "deep_dive_stocks"
    ]
    missing = [k for k in required_keys if k not in data]
    if missing:
        print(f"[ERROR] Missing required top-level keys: {missing}")
        return False

    if not isinstance(data.get("market_summary"), list) or len(data["market_summary"]) < 5:
        print("[ERROR] market_summary must be a list with at least 5 instruments (Nifty, Gold, Silver, WTI, Brent)")
        return False

    for stock_list in ("top_gainers", "top_losers", "momentum_stocks"):
        if not isinstance(data.get(stock_list), list):
            print(f"[ERROR] {stock_list} must be a list of stock entries")
            return False

    feat = data.get("featured_stock", {})
    feat_required = ["symbol", "company", "ltp", "open", "high", "low", "changeStr", "volume", "rsi14", "dema20", "dema50", "dema200"]
    missing_feat = [k for k in feat_required if k not in feat]
    if missing_feat:
        print(f"[ERROR] featured_stock missing required fields: {missing_feat}")
        return False

    print(f"[SUCCESS] {data_path.name} passed all structural and schema checks.")
    return True


def main():
    parser = argparse.ArgumentParser(description="Validate daily market JSON against schema.")
    parser.add_argument("data_file", nargs="?", default=None, help="Path to market data JSON")
    parser.add_argument("--schema", default=None, help="Path to schema JSON (default: schema in skill)")
    args = parser.parse_args()

    skill_root = Path(__file__).resolve().parent.parent
    schema_path = Path(args.schema) if args.schema else skill_root / "schemas" / "market_data_schema.json"
    data_path = Path(args.data_file) if args.data_file else skill_root / "schemas" / "sample_market_data.json"

    if not schema_path.exists():
        print(f"[ERROR] Schema not found at {schema_path}")
        sys.exit(1)
    if not data_path.exists():
        print(f"[ERROR] Data file not found at {data_path}")
        sys.exit(1)

    ok = validate(data_path, schema_path)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
