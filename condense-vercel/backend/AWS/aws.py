# import re
# import json
# import math
# from schema import (
#     CONDENSE_BENCHMARK,
#     CONDENSE_TO_MSK_BENCHMARK,
#     EstimateRequestProvisioned,
#     EstimateRequestServerless,
#     EstimateRequestExpress,
#     EstimateResponse,
#     EXPRESS_CAPACITY_MBPS,
#     PROVISIONED_CAPACITY_MBPS,
#     SERVERLESS_MBPS_PER_PARTITION,
#     THROUGHPUT_MIN_RAM,
#     _M7G_RAM,
#     _get_min_ram_from_benchmark,
#     _parse_mbps_from_rate,
# )
# from typing import Dict, Tuple, Optional, List
# from fastapi import HTTPException, status
# import boto3
# from functools import lru_cache
# from decimal import ROUND_HALF_UP, Decimal, ROUND_CEILING
# import logging

# PRICING_REGION = "us-east-1"
# SERVICE_CODE   = "AmazonMSK"
# CENTS          = Decimal("0.01")
# INTERZONE_RATE = Decimal("0.02")   # $0.01/GB out + $0.01/GB in — billed via EC2, not MSK SKU
# logger         = logging.getLogger("uvicorn.error")
# ISR            = 3

# # ---------------------------------------------------------------------------
# # GROUND TRUTH from AWS Pricing API (Mumbai debug output):
# #
# # Provisioned brokers : group="Broker",       operation="RunBroker",  computeFamily="m7g.xlarge"
# # Provisioned storage : group="Storage",      operation="RunVolume",  storageFamily="GP2"
# # Provisioned data-in : DOES NOT EXIST
# # Express brokers     : group="ExpressBroker",operation="RunBroker",  computeFamily="express.m7g.xlarge"
# # Express storage     : operation="Storage",  storageFamily="Express storage"
# # Express data-in     : group="ExpressIngress",operation="Data-In"
# # Serverless          : group="Serverless",   usagetype contains "PartitionHours"/"StorageHours"/"In-Bytes"/"Out-Bytes"
# # Interzone transfer  : NOT in AmazonMSK SKUs — hardcoded INTERZONE_RATE = $0.02/GB
# # ---------------------------------------------------------------------------

# # ---------------------------------------------------------------------------
# # Condense benchmark pricing  (EC2 on-demand ap-south-1, from excel sheet 1)
# # ---------------------------------------------------------------------------

# CONDENSE_MACHINE_PRICE_PER_MONTH: Dict[str, float] = {
#     "r6a.large":   51.83,
#     "r6a.xlarge":  104.39,
#     "r6a.2xlarge": 208.78,
# }
# CONDENSE_STORAGE_PRICE_PER_TB_MONTH = 93.39   # gp3 1 TB PVC from excel sheet 1


# # ---------------------------------------------------------------------------
# # Rate parsing
# # ---------------------------------------------------------------------------

# def _parse_throughput(rate_str: str) -> Tuple[float, float]:
#     rate_str = rate_str.strip().lower()
#     m_mb  = re.match(r"^\s*([0-9]*\.?[0-9]+)\s*mbps\s*$", rate_str)
#     m_gbd = re.match(r"^\s*([0-9]*\.?[0-9]+)\s*gb\s*/\s*day\s*$", rate_str)
#     if m_mb:
#         mbps = float(m_mb.group(1))
#         return mbps, mbps * 86.4
#     if m_gbd:
#         gb_per_day = float(m_gbd.group(1))
#         return gb_per_day / 86.4, gb_per_day
#     raise ValueError("throughput must look like '50 MBps' or '4000 GB/day'")


# # ---------------------------------------------------------------------------
# # Benchmark helpers
# # ---------------------------------------------------------------------------

# def _benchmark_instance(mbps: float) -> str:
#     """RAM-matched MSK m7g suggestion for given throughput (reference only)."""
#     for low, high, instance in CONDENSE_TO_MSK_BENCHMARK:
#         if low <= mbps < high:
#             return instance
#     return "kafka.m7g.4xlarge"


# def _get_condense_benchmark(mbps: float):
#     """Returns (machine, nodes, ram_gb, vcpu) from Condense benchmark table."""
#     for low, high, machine, nodes, ram, vcpu in CONDENSE_BENCHMARK:
#         if low <= mbps < high:
#             return machine, nodes, ram, vcpu
#     return "r6a.2xlarge", 9, 64, 8   # 250+ MBps fallback


# def _get_min_ram(mbps: float) -> int:
#     return _get_min_ram_from_benchmark(mbps)


# def _get_allowed_instances(location: str, mbps: float) -> list:
#     """m7g instances whose RAM >= minimum required for the given throughput."""
#     min_ram   = _get_min_ram(mbps)
#     instances = _list_provisioned_instances_detailed(location)
#     return [
#         inst["instance"]
#         for inst in instances
#         if inst.get("memory_gib")
#         and inst["memory_gib"] >= min_ram
#         and inst["instance"].startswith("kafka.m7g")
#     ]


# # ---------------------------------------------------------------------------
# # Condense cost estimator  (side-by-side comparison)
# # ---------------------------------------------------------------------------

# def _estimate_condense(mbps: float, gb_per_day: float, retention_days: int) -> dict:
#     machine, brokers, ram, vcpu = _get_condense_benchmark(mbps)

#     storage_tb_total    = math.ceil((mbps * 3600 * 24 * retention_days * ISR) / 1024 / 1024)
#     storage_tb_per_node = math.ceil(storage_tb_total / brokers)
#     interzone_gb_month  = round(round((mbps * 24 * 3600 * 30) / 1024, 1) * ((ISR - 1) / ISR), 1)

#     node_price     = CONDENSE_MACHINE_PRICE_PER_MONTH.get(machine, 0.0)
#     cost_brokers     = round(brokers * node_price, 2)
#     cost_storage   = round(brokers * storage_tb_per_node * CONDENSE_STORAGE_PRICE_PER_TB_MONTH, 2)
#     cost_interzone = round(interzone_gb_month * 0.02, 2)
#     total          = round(cost_brokers + cost_storage + cost_interzone, 2)

#     return {
#         "machine":                          machine,
#         "vcpu_per_node":                    vcpu,
#         "ram_gb_per_node":                  ram,
#         "brokers":                            brokers   ,
#         "storage_per_node_tb":              storage_tb_per_node,
#         "interzone_data_transfer_gb_month": interzone_gb_month,
#         "unit_prices_usd": {
#             "node_per_month":        node_price,
#             "storage_per_tb_month":  CONDENSE_STORAGE_PRICE_PER_TB_MONTH,
#             "interzone_gb":          0.02,
#         },
#         "costs_usd": {
#             "brokers":                   cost_brokers,
#             "storage":                 cost_storage,
#             "interzone_data_transfer": cost_interzone,
#             "total":                   total,
#         },
#     }


# # ---------------------------------------------------------------------------
# # Pricing API helpers
# # ---------------------------------------------------------------------------

# def _pricing_client():
#     return boto3.client("pricing", region_name=PRICING_REGION)


# def _iter_on_demand_price_dimensions(item):
#     terms = item.get("terms", {}).get("OnDemand", {})
#     for term in terms.values():
#         for dim in term.get("priceDimensions", {}).values():
#             usd  = dim.get("pricePerUnit", {}).get("USD")
#             unit = dim.get("unit")
#             desc = dim.get("description")
#             if usd:
#                 yield Decimal(usd), unit, desc


# def _first_price_usd(terms: dict):
#     on_demand = terms.get("OnDemand", {})
#     for term in on_demand.values():
#         for dim in term.get("priceDimensions", {}).values():
#             usd  = dim.get("pricePerUnit", {}).get("USD")
#             unit = dim.get("unit")
#             desc = dim.get("description")
#             if usd:
#                 return Decimal(usd), unit, desc
#     return None, None, None


# def _find_price_products(location: str, predicate, max_pages: int = 8):
#     client = _pricing_client()
#     token, pages, results = None, 0, []
#     while True:
#         kwargs = dict(
#             ServiceCode=SERVICE_CODE,
#             Filters=[{"Type": "TERM_MATCH", "Field": "location", "Value": location}],
#             MaxResults=100,
#         )
#         if token:
#             kwargs["NextToken"] = token
#         resp = client.get_products(**kwargs)
#         for s in resp["PriceList"]:
#             item    = json.loads(s)
#             product = item.get("product", {})
#             attrs   = product.get("attributes", {})
#             if predicate(product, attrs):
#                 price, unit, desc = _first_price_usd(item.get("terms", {}))
#                 if price:
#                     results.append((item, price, unit, desc))
#         token = resp.get("NextToken")
#         pages += 1
#         if not token or pages >= max_pages:
#             break
#     return results


# # ---------------------------------------------------------------------------
# # Region listing
# # ---------------------------------------------------------------------------

# def list_regions() -> List[str]:
#     client = _pricing_client()
#     vals, token = [], None
#     while True:
#         kwargs = dict(ServiceCode=SERVICE_CODE, AttributeName="location", MaxResults=100)
#         if token:
#             kwargs["NextToken"] = token
#         resp = client.get_attribute_values(**kwargs)
#         vals += [v["Value"] for v in resp["AttributeValues"]]
#         token = resp.get("NextToken")
#         if not token:
#             break
#     return sorted(set(vals))


# # ---------------------------------------------------------------------------
# # Instance listing
# # ---------------------------------------------------------------------------

# @lru_cache(maxsize=128)
# def _list_express_instances_detailed(location: str):
#     def predicate(product, attrs):
#         return (
#             attrs.get("group") == "ExpressBroker"
#             and attrs.get("operation") == "RunBroker"
#             and attrs.get("computeFamily", "").startswith("express.")
#         )
#     items   = _find_price_products(location, predicate)
#     results = []
#     for item, price, unit, _ in items:
#         attrs    = item["product"]["attributes"]
#         instance = attrs.get("computeFamily")
#         if not instance:
#             continue
#         results.append({
#             "instance":         instance,
#             "hourly_price_usd": str(price),
#             "capacity_mbps":    EXPRESS_CAPACITY_MBPS.get(instance),
#             "vcpu":             int(attrs["vcpu"])      if attrs.get("vcpu")      else None,
#             "memory_gib":       int(attrs["memoryGib"]) if attrs.get("memoryGib") else None,
#         })
#     return list({r["instance"]: r for r in results}.values())


# @lru_cache(maxsize=128)
# def _list_provisioned_instances_detailed(location: str):
#     def predicate(product, attrs):
#         return (
#             attrs.get("group") == "Broker"
#             and attrs.get("operation") == "RunBroker"
#         )
#     items   = _find_price_products(location, predicate)
#     results = []
#     for item, price, unit, _ in items:
#         attrs    = item["product"]["attributes"]
#         cf       = attrs.get("computeFamily", "")
#         instance = f"kafka.{cf}" if cf else None
#         if not instance or instance not in PROVISIONED_CAPACITY_MBPS:
#             continue
#         results.append({
#             "instance":         instance,
#             "hourly_price_usd": str(price),
#             "capacity_mbps":    PROVISIONED_CAPACITY_MBPS.get(instance),
#             "vcpu":             int(attrs["vcpu"])      if attrs.get("vcpu")      else None,
#             "memory_gib":       int(attrs["memoryGib"]) if attrs.get("memoryGib") else None,
#         })
#     return list({r["instance"]: r for r in results}.values())


# def list_broker_instances(region: str, cluster_type: str):
#     try:
#         if cluster_type == "express":
#             instances = _list_express_instances_detailed(region)
#         elif cluster_type == "provisioned":
#             instances = _list_provisioned_instances_detailed(region)
#         else:
#             raise HTTPException(
#                 status_code=400,
#                 detail="cluster_type must be 'express' or 'provisioned' to list instances"
#             )
#         if not instances:
#             raise HTTPException(status_code=404, detail=f"No {cluster_type} instances found for region '{region}'")
#         return instances
#     except HTTPException:
#         raise
#     except Exception:
#         logger.exception("Failed to list broker instances")
#         raise HTTPException(status_code=502, detail="Failed to query Pricing API")


# def list_allowed_provisioned_instances(region: str, throughput: str):
#     """Returns allowed m7g instances for the given throughput — use this to drive frontend dropdowns."""
#     mbps    = _parse_mbps_from_rate(throughput)
#     min_ram = _get_min_ram(mbps)
#     allowed = _get_allowed_instances(region, mbps)
#     all_inst = _list_provisioned_instances_detailed(region)
#     return {
#         "throughput_mbps":    mbps,
#         "min_ram_gb":         min_ram,
#         "suggested_instance": _benchmark_instance(mbps),
#         "condense_benchmark": {
#             "machine": _get_condense_benchmark(mbps)[0],
#             "nodes":   _get_condense_benchmark(mbps)[1],
#             "ram_gb":  _get_condense_benchmark(mbps)[2],
#         },
#         "allowed_instances": [i for i in all_inst if i["instance"] in allowed],
#     }


# # ---------------------------------------------------------------------------
# # Price lookups — Express
# # ---------------------------------------------------------------------------

# @lru_cache(maxsize=128)
# def _express_broker_hour_price(location: str, instance: str) -> Decimal:
#     def predicate(product, attrs):
#         return (
#             attrs.get("group") == "ExpressBroker"
#             and attrs.get("operation") == "RunBroker"
#             and attrs.get("computeFamily") == instance
#         )
#     for item, _, _, _ in _find_price_products(location, predicate):
#         for price, unit, _ in _iter_on_demand_price_dimensions(item):
#             if unit and unit.lower() in ("hrs", "hours"):
#                 return price
#     raise KeyError(f"No Express broker hourly price for '{instance}' in {location}")


# @lru_cache(maxsize=128)
# def _express_storage_price(location: str) -> Decimal:
#     def predicate(product, attrs):
#         return (
#             attrs.get("storageFamily") == "Express storage"
#             and attrs.get("operation") == "Storage"
#         )
#     for _, price, unit, _ in _find_price_products(location, predicate):
#         if unit and unit.lower() in ("gb-mo", "gb-month", "gb-months"):
#             return price
#     raise KeyError(f"No Express storage GB-month price for {location}")


# @lru_cache(maxsize=128)
# def _express_data_write_price(location: str) -> Decimal:
#     def predicate(product, attrs):
#         return (
#             attrs.get("group") == "ExpressIngress"
#             and attrs.get("operation") == "Data-In"
#         )
#     for _, price, unit, _ in _find_price_products(location, predicate):
#         if unit and unit.upper() == "GB":
#             return price
#     raise KeyError(f"No Express data-write GB price for {location}")


# # ---------------------------------------------------------------------------
# # Price lookups — Provisioned
# # ---------------------------------------------------------------------------

# @lru_cache(maxsize=128)
# def _provisioned_broker_hour_price(location: str, instance: str) -> Decimal:
#     cf = instance.removeprefix("kafka.")
#     def predicate(product, attrs):
#         return (
#             attrs.get("group") == "Broker"
#             and attrs.get("operation") == "RunBroker"
#             and attrs.get("computeFamily") == cf
#         )
#     for item, _, _, _ in _find_price_products(location, predicate):
#         for price, unit, _ in _iter_on_demand_price_dimensions(item):
#             if unit and unit.lower() in ("hrs", "hours"):
#                 return price
#     raise KeyError(f"No Provisioned broker hourly price for '{instance}' in {location}")


# @lru_cache(maxsize=128)
# def _provisioned_storage_price(location: str) -> Decimal:
#     def predicate(product, attrs):
#         return (
#             attrs.get("group") == "Storage"
#             and attrs.get("operation") == "RunVolume"
#             and attrs.get("storageFamily") == "GP2"
#         )
#     for _, price, unit, _ in _find_price_products(location, predicate):
#         if unit and unit.lower() in ("gb-mo", "gb-month", "gb-months"):
#             return price
#     raise KeyError(f"No Provisioned storage GB-month price for {location}")


# # ---------------------------------------------------------------------------
# # Price lookups — Serverless
# # ---------------------------------------------------------------------------

# @lru_cache(maxsize=128)
# def _serverless_partition_hour_price(location: str) -> Decimal:
#     def predicate(product, attrs):
#         return (
#             attrs.get("group") == "Serverless"
#             and "PartitionHours" in attrs.get("usagetype", "")
#         )
#     for _, price, unit, _ in _find_price_products(location, predicate):
#         return price
#     raise KeyError(f"No Serverless partition-hour price for {location}")


# @lru_cache(maxsize=128)
# def _serverless_storage_price(location: str) -> Decimal:
#     def predicate(product, attrs):
#         return (
#             attrs.get("group") == "Serverless"
#             and "StorageHours" in attrs.get("usagetype", "")
#         )
#     for _, price, unit, _ in _find_price_products(location, predicate):
#         return price
#     raise KeyError(f"No Serverless storage price for {location}")


# @lru_cache(maxsize=128)
# def _serverless_data_in_price(location: str) -> Decimal:
#     def predicate(product, attrs):
#         return (
#             attrs.get("group") == "Serverless"
#             and "In-Bytes" in attrs.get("usagetype", "")
#         )
#     for _, price, unit, _ in _find_price_products(location, predicate):
#         return price
#     raise KeyError(f"No Serverless data-in price for {location}")


# @lru_cache(maxsize=128)
# def _serverless_data_out_price(location: str) -> Decimal:
#     def predicate(product, attrs):
#         return (
#             attrs.get("group") == "Serverless"
#             and "Out-Bytes" in attrs.get("usagetype", "")
#         )
#     for _, price, unit, _ in _find_price_products(location, predicate):
#         return price
#     raise KeyError(f"No Serverless data-out price for {location}")


# # ---------------------------------------------------------------------------
# # Estimation logic
# # ---------------------------------------------------------------------------

# def _estimate_express(body: EstimateRequestExpress, mbps: float, gb_per_day: float) -> EstimateResponse:
#     instance = body.instance_type
#     capacity = EXPRESS_CAPACITY_MBPS[instance]

#     if mbps < 25:
#         brokers = 2
#     else:
#         brokers = round(-0.00015 * (mbps ** 2) + 0.108 * mbps + 0.35, 1)
#     brokers = int(brokers)

#     data_write_gb_month            = gb_per_day * 30.0
#     storage_tb_total               = math.ceil((mbps * 3600 * 24 * body.retention_days * ISR) / 1024 / 1024)
#     storagetb                      = math.ceil(storage_tb_total / brokers)
#     interzonedatatransfer_gb_month = round(round((mbps * 24 * 3600 * 30) / 1024, 1) * ((ISR - 1) / ISR), 1)

#     try:
#         p_broker  = _express_broker_hour_price(body.region, instance)
#         p_storage = _express_storage_price(body.region)
#         p_write   = _express_data_write_price(body.region)
#     except KeyError as e:
#         raise HTTPException(status_code=404, detail=str(e))
#     except Exception:
#         logger.exception("Pricing API error (express)")
#         raise HTTPException(status_code=502, detail="Failed to query Pricing API")

#     cost_broker    = (Decimal(brokers) * 720 * p_broker).quantize(CENTS, ROUND_CEILING)
#     cost_storage   = (Decimal(storagetb) * Decimal(brokers) * Decimal(1024) * p_storage).quantize(CENTS, ROUND_CEILING)
#     cost_write     = (Decimal(data_write_gb_month) * p_write).quantize(CENTS, ROUND_CEILING)
#     cost_interzone = (Decimal(str(interzonedatatransfer_gb_month)) * INTERZONE_RATE).quantize(CENTS, ROUND_CEILING)
#     total          = cost_broker + cost_storage + cost_write + cost_interzone

#     return EstimateResponse(
#         cluster_type="express",
#         inputs={
#             "retention_days":     body.retention_days,
#             "replication_factor": body.replication_factor,
#             "throughput":         body.throughput,
#             "region":             body.region,
#         },
#         sizing={
#             "instance_type":                    instance,
#             "per_broker_capacity_mbps":         capacity,
#             "brokers":                          brokers,
#             "storage_per_broker_tb":            storagetb,
#             "interzone_data_transfer_gb_month": interzonedatatransfer_gb_month,
#         },
#         derived_usage={
#             "broker_hours_month":    brokers * 720,
#             "data_write_gb_month":   round(data_write_gb_month, 3),
#             "storage_per_broker_tb": storagetb,
#         },
#         unit_prices_usd={
#             "broker_hour":      str(p_broker),
#             "storage_gb_month": str(p_storage),
#             "data_write_gb":    str(p_write),
#             "interzone_gb":     str(INTERZONE_RATE),
#         },
#         costs_usd={
#             "broker_hours":            float(cost_broker),
#             "storage":                 float(cost_storage),
#             "data_write":              float(cost_write),
#             "interzone_data_transfer": float(cost_interzone),
#             "total":                   float(total),
#         },
#     )


# def _estimate_provisioned(body: EstimateRequestProvisioned, mbps: float, gb_per_day: float) -> EstimateResponse:
#     # Validate RAM constraint (also enforced in schema validator, this is defence-in-depth)
#     allowed = _get_allowed_instances(body.region, mbps)
#     if body.instance_type not in allowed:
#         min_ram = _get_min_ram(mbps)
#         raise HTTPException(
#             status_code=400,
#             detail=f"For {mbps} MBps, minimum RAM is {min_ram} GB. "
#                    f"Allowed m7g instances: {', '.join(sorted(allowed))}"
#         )

#     instance = body.instance_type
#     capacity = PROVISIONED_CAPACITY_MBPS[instance]

#     # Broker count matches Condense node count from excel for fair side-by-side comparison
#     condense_data = _estimate_condense(mbps, gb_per_day, body.retention_days)
#     brokers       = int(condense_data["brokers"])

#     warnings = []
#     if instance == "kafka.t3.small":
#         warnings.append(
#             "kafka.t3.small is burstable (dev/test only). "
#             "Sustained throughput is ~5 MB/s per broker. Not recommended for production."
#         )

#     storage_gb_total               = math.ceil((mbps * 3600 * 24 * body.retention_days * ISR) / 1024 )
#     storagegb                      = math.ceil(storage_gb_total / brokers)
#     interzonedatatransfer_gb_month = round(round((mbps * 24 * 3600 * 30) / 1024, 1) * ((ISR - 1) / ISR), 1)

#     try:
#         p_broker  = _provisioned_broker_hour_price(body.region, instance)
#         p_storage = _provisioned_storage_price(body.region)
#     except KeyError as e:
#         raise HTTPException(status_code=404, detail=str(e))
#     except Exception:
#         logger.exception("Pricing API error (provisioned)")
#         raise HTTPException(status_code=502, detail="Failed to query Pricing API")

#     cost_broker    = (Decimal(brokers) * 730 * p_broker).quantize(CENTS, ROUND_CEILING)
#     cost_storage   = (Decimal(storagegb) * Decimal(brokers) * p_storage).quantize(CENTS, ROUND_CEILING)
#     cost_interzone = (Decimal(str(interzonedatatransfer_gb_month)) * INTERZONE_RATE).quantize(CENTS, ROUND_CEILING)
#     total          = cost_broker + cost_storage + cost_interzone

#     return EstimateResponse(
#         cluster_type="provisioned",
#         inputs={
#             "retention_days":     body.retention_days,
#             "replication_factor": body.replication_factor,
#             "throughput":       body.throughput,
#             "region":             body.region,
#         },
#         sizing={
#             "instance_type":                    instance,
#             "per_broker_capacity_mbps":         capacity,
#             "brokers":                          brokers,
#             "storage_per_broker_gb  ":            storagegb,
#             "interzone_data_transfer_gb_month": interzonedatatransfer_gb_month,
#             "suggested_instance":               _benchmark_instance(mbps),
#         },
#         derived_usage={
#             "broker_hours_month":    brokers * 730,
#             "storage_per_broker_gb  ": storagegb,
#         },
#         unit_prices_usd={
#             "broker_hour":      str(p_broker),
#             "storage_gb_month": str(p_storage),
#             "interzone_gb":     str(INTERZONE_RATE),
#         },
#         costs_usd={
#             "broker_hours":            float(cost_broker),
#             "storage":                 float(cost_storage),
#             "interzone_data_transfer": float(cost_interzone),
#             "total":                   float(total),
#         },
#         condense_comparison=condense_data,   # side-by-side with same node/broker count
#         warnings=warnings,
#     )


# def _estimate_serverless(body: EstimateRequestServerless, mbps: float, gb_per_day: float) -> EstimateResponse:
#     partitions        = 1000
#     partition_hours   = partitions * 730
#     data_in_gb_month  = gb_per_day * 30.0
#     data_out_gb_month = data_in_gb_month
#     storage_gb_month  = (gb_per_day * body.retention_days * 3) / 30.0

#     try:
#         p_partition = _serverless_partition_hour_price(body.region)
#         p_storage   = _serverless_storage_price(body.region)
#         p_data_in   = _serverless_data_in_price(body.region)
#         p_data_out  = _serverless_data_out_price(body.region)
#     except KeyError as e:
#         raise HTTPException(status_code=404, detail=str(e))
#     except Exception:
#         logger.exception("Pricing API error (serverless)")
#         raise HTTPException(status_code=502, detail="Failed to query Pricing API")

#     cost_partitions = Decimal(partition_hours)   * p_partition
#     cost_storage    = Decimal(storage_gb_month)  * p_storage
#     cost_data_in    = Decimal(data_in_gb_month)  * p_data_in
#     cost_data_out   = Decimal(data_out_gb_month) * p_data_out
#     total           = cost_partitions + cost_storage + cost_data_in + cost_data_out

#     return EstimateResponse(
#         cluster_type="serverless",
#         inputs={
#             "retention_days": body.retention_days,
#             "throughput":     body.throughput,
#             "region":         body.region,
#             "note":           "replication_factor not applicable — serverless manages 3x replication internally",
#         },
#         sizing={
#             "partitions":         partitions,
#             "mbps_per_partition": SERVERLESS_MBPS_PER_PARTITION,
#             "partition_hours":    partition_hours,
#         },
#         derived_usage={
#             "partition_hours_month": partition_hours,
#             "data_in_gb_month":      round(data_in_gb_month, 3),
#             "data_out_gb_month":     round(data_out_gb_month, 3),
#             "storage_gb_month":      round(storage_gb_month, 3),
#         },
#         unit_prices_usd={
#             "partition_hour":   str(p_partition),
#             "storage_gb_month": str(p_storage),
#             "data_in_gb":       str(p_data_in),
#             "data_out_gb":      str(p_data_out),
#         },
#         costs_usd={
#             "partitions": float(cost_partitions),
#             "storage":    float(cost_storage),
#             "data_in":    float(cost_data_in),
#             "data_out":   float(cost_data_out),
#             "total":      float(total),
#         },
#     )


# # ---------------------------------------------------------------------------
# # Main dispatcher
# # ---------------------------------------------------------------------------

# def estimate_msk(body: EstimateRequest) -> EstimateResponse:
#     try:
#         mbps, gb_per_day = _parse_throughput(body.throughput)
#     except ValueError as e:
#         raise HTTPException(status_code=400, detail=str(e))

#     if body.cluster_type == "express":
#         return _estimate_express(body, mbps, gb_per_day)
#     elif body.cluster_type == "provisioned":
#         return _estimate_provisioned(body, mbps, gb_per_day)
#     elif body.cluster_type == "serverless":
#         return _estimate_serverless(body, mbps, gb_per_day)
#     else:
#         raise HTTPException(status_code=400, detail=f"Unknown cluster_type: {body.cluster_type}")


# # ---------------------------------------------------------------------------
# # Debug helper
# # ---------------------------------------------------------------------------

# def debug_raw_attributes(location: str):
#     client = _pricing_client()
#     token, pages = None, 0
#     seen = []
#     while True:
#         kwargs = dict(
#             ServiceCode=SERVICE_CODE,
#             Filters=[{"Type": "TERM_MATCH", "Field": "location", "Value": location}],
#             MaxResults=100,
#         )
#         if token:
#             kwargs["NextToken"] = token
#         resp = client.get_products(**kwargs)
#         for s in resp["PriceList"]:
#             item  = json.loads(s)
#             attrs = item.get("product", {}).get("attributes", {})
#             entry = {
#                 "group":              attrs.get("group"),
#                 "operation":          attrs.get("operation"),
#                 "brokerInstanceType": attrs.get("brokerInstanceType"),
#                 "computeFamily":      attrs.get("computeFamily"),
#                 "storageFamily":      attrs.get("storageFamily"),
#                 "usagetype":          attrs.get("usagetype"),
#             }
#             if entry not in seen:
#                 seen.append(entry)
#         token = resp.get("NextToken")
#         pages += 1
#         if not token or pages >= 8:
#             break
#     return sorted(seen, key=lambda x: (x.get("group") or "", x.get("computeFamily") or ""))



import re
import json
import math
from schema import (
    CONDENSE_BENCHMARK,
    CONDENSE_TO_MSK_BENCHMARK,
    EstimateRequestProvisioned,
    EstimateRequestServerless,
    EstimateRequestExpress,
    EstimateResponse,
    EXPRESS_CAPACITY_MBPS,
    PROVISIONED_CAPACITY_MBPS,
    SERVERLESS_MBPS_PER_PARTITION,
    THROUGHPUT_MIN_RAM,
    _M7G_RAM,
    _get_min_ram_from_benchmark,
    _parse_mbps_from_rate,
    _retention_to_hours,
    _throughput_to_mbps,
)
from typing import Dict, Tuple, Optional, List
from fastapi import HTTPException, status
import boto3
from functools import lru_cache
from decimal import ROUND_HALF_UP, Decimal, ROUND_CEILING
import logging
from dotenv import load_dotenv
load_dotenv()
PRICING_REGION = "us-east-1"
SERVICE_CODE   = "AmazonMSK"
CENTS          = Decimal("0.01")
INTERZONE_RATE = Decimal("0.02")   # $0.01/GB out + $0.01/GB in — billed via EC2, not MSK SKU
logger         = logging.getLogger("uvicorn.error")
ISR            = 3

# ---------------------------------------------------------------------------
# GROUND TRUTH from AWS Pricing API (Mumbai debug output):
#
# Provisioned brokers : group="Broker",       operation="RunBroker",  computeFamily="m7g.xlarge"
# Provisioned storage : group="Storage",      operation="RunVolume",  storageFamily="GP2"
# Provisioned data-in : DOES NOT EXIST
# Express brokers     : group="ExpressBroker",operation="RunBroker",  computeFamily="express.m7g.xlarge"
# Express storage     : operation="Storage",  storageFamily="Express storage"
# Express data-in     : group="ExpressIngress",operation="Data-In"
# Serverless          : group="Serverless",   usagetype contains "PartitionHours"/"StorageHours"/"In-Bytes"/"Out-Bytes"
# Interzone transfer  : NOT in AmazonMSK SKUs — hardcoded INTERZONE_RATE = $0.02/GB
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Condense benchmark pricing  (EC2 on-demand ap-south-1, from excel sheet 1)
# ---------------------------------------------------------------------------

CONDENSE_MACHINE_PRICE_PER_MONTH: Dict[str, float] = {
    "r6a.large":   51.83,
    "r6a.xlarge":  104.39,
    "r6a.2xlarge": 208.78,
}
CONDENSE_STORAGE_PRICE_PER_TB_MONTH = 93.39   # gp3 1 TB PVC from excel sheet 1


# ---------------------------------------------------------------------------
# Rate parsing
# ---------------------------------------------------------------------------

def _parse_throughput(rate_str: str) -> Tuple[float, float]:
    rate_str = rate_str.strip().lower()
    m_mb  = re.match(r"^\s*([0-9]*\.?[0-9]+)\s*mbps\s*$", rate_str)
    m_gbd = re.match(r"^\s*([0-9]*\.?[0-9]+)\s*gb\s*/\s*day\s*$", rate_str)
    if m_mb:
        mbps = float(m_mb.group(1))
        return mbps, mbps * 86.4
    if m_gbd:
        gb_per_day = float(m_gbd.group(1))
        return gb_per_day / 86.4, gb_per_day
    raise ValueError("throughput must look like '50 MBps' or '4000 GB/day'")


# ---------------------------------------------------------------------------
# Benchmark helpers
# ---------------------------------------------------------------------------

def _benchmark_instance(mbps: float) -> str:
    """RAM-matched MSK m7g suggestion for given throughput (reference only)."""
    for low, high, instance in CONDENSE_TO_MSK_BENCHMARK:
        if low <= mbps < high:
            return instance
    return "kafka.m7g.4xlarge"


def _get_condense_benchmark(mbps: float,Condenserequest=0):
    """Returns (machine, nodes, ram_gb, vcpu) from Condense benchmark table."""
    for low, high, machine, nodes, ram, vcpu in CONDENSE_BENCHMARK:
        # if mbps==250:
        #     return "kafka.m7g.4xlarge",12, 128, 16   # special case for 250 MBps point in excel
        if low < mbps <=high:
            if Condenserequest==1:
                 nodes=9
            return machine, nodes, ram, vcpu
    return "r6a.2xlarge", 12, 64, 8   # 250+ MBps fallback


def _get_min_ram(mbps: float) -> int:
    return _get_min_ram_from_benchmark(mbps)


def _get_allowed_instances(location: str, mbps: float) -> list:
    """m7g instances whose RAM >= minimum required for the given throughput."""
    min_ram   = _get_min_ram(mbps)
    instances = _list_provisioned_instances_detailed(location)
    return [
        inst["instance"]
        for inst in instances
        if inst.get("memory_gib")
        and inst["memory_gib"] >= min_ram
        and inst["instance"].startswith("kafka.m7g")
    ]


# ---------------------------------------------------------------------------
# Condense cost estimator  (side-by-side comparison)
# ---------------------------------------------------------------------------

def _estimate_condense(mbps: float, gb_per_day: float, retention_days: int,CondenseRequest:int=0) -> dict:
    machine, brokers, ram, vcpu = _get_condense_benchmark(mbps,CondenseRequest)

    storage_tb_total    = math.ceil((mbps * 3600 * 24 * retention_days * ISR) / 1024 / 1024)
    print(storage_tb_total)
    # storage_tb_per_node = math.ceil(storage_tb_total / brokers)
    interzone_gb_month  = round(round((mbps * 24 * 3600 * 30) / 1024, 1) * ((ISR - 1) / ISR), 1)

    node_price     = CONDENSE_MACHINE_PRICE_PER_MONTH.get(machine, 0.0)
    cost_brokers   = round(brokers * node_price, 2)
    cost_storage   = round(storage_tb_total * CONDENSE_STORAGE_PRICE_PER_TB_MONTH, 2)
    cost_interzone = round(interzone_gb_month * 0.02, 2)
    total          = round(cost_brokers + cost_storage + cost_interzone, 2)

    return {
        "machine":                          machine,
        "vcpu_per_node":                    vcpu,
        "ram_gb_per_node":                  ram,
        "brokers":                          brokers,
        "storage_tb_total":                 storage_tb_total,
        "interzone_data_transfer_gb_month": interzone_gb_month,
        "unit_prices_usd": {
            "node_per_month":        node_price,
            "storage_per_tb_month":  CONDENSE_STORAGE_PRICE_PER_TB_MONTH,
            "interzone_gb":          0.02,
        },
        "costs_usd": {
            "brokers":                 cost_brokers,
            "storage":                 cost_storage,
            "interzone_data_transfer": cost_interzone,
            "total":                   total,
        },
    }


# ---------------------------------------------------------------------------
# Pricing API helpers
# ---------------------------------------------------------------------------

def _pricing_client():
    return boto3.client("pricing", region_name=PRICING_REGION)


def _iter_on_demand_price_dimensions(item):
    terms = item.get("terms", {}).get("OnDemand", {})
    for term in terms.values():
        for dim in term.get("priceDimensions", {}).values():
            usd  = dim.get("pricePerUnit", {}).get("USD")
            unit = dim.get("unit")
            desc = dim.get("description")
            if usd:
                yield Decimal(usd), unit, desc


def _first_price_usd(terms: dict):
    on_demand = terms.get("OnDemand", {})
    for term in on_demand.values():
        for dim in term.get("priceDimensions", {}).values():
            usd  = dim.get("pricePerUnit", {}).get("USD")
            unit = dim.get("unit")
            desc = dim.get("description")
            if usd:
                return Decimal(usd), unit, desc
    return None, None, None


def _find_price_products(location: str, predicate, max_pages: int = 8):
    client = _pricing_client()
    token, pages, results = None, 0, []
    while True:
        kwargs = dict(
            ServiceCode=SERVICE_CODE,
            Filters=[{"Type": "TERM_MATCH", "Field": "location", "Value": location}],
            MaxResults=100,
        )
        if token:
            kwargs["NextToken"] = token
        resp = client.get_products(**kwargs)
        for s in resp["PriceList"]:
            item    = json.loads(s)
            product = item.get("product", {})
            attrs   = product.get("attributes", {})
            if predicate(product, attrs):
                price, unit, desc = _first_price_usd(item.get("terms", {}))
                if price:
                    results.append((item, price, unit, desc))
        token = resp.get("NextToken")
        pages += 1
        if not token or pages >= max_pages:
            break
    return results


# ---------------------------------------------------------------------------
# Region listing
# ---------------------------------------------------------------------------

def list_regions() -> List[str]:
    client = _pricing_client()
    vals, token = [], None
    while True:
        kwargs = dict(ServiceCode=SERVICE_CODE, AttributeName="location", MaxResults=100)
        if token:
            kwargs["NextToken"] = token
        resp = client.get_attribute_values(**kwargs)
        vals += [v["Value"] for v in resp["AttributeValues"]]
        token = resp.get("NextToken")
        if not token:
            break
    return sorted(set(vals))


# ---------------------------------------------------------------------------
# Instance listing
# ---------------------------------------------------------------------------

@lru_cache(maxsize=128)
def _list_express_instances_detailed(location: str):
    def predicate(product, attrs):
        return (
            attrs.get("group") == "ExpressBroker"
            and attrs.get("operation") == "RunBroker"
            and attrs.get("computeFamily", "").startswith("express.")
        )
    items   = _find_price_products(location, predicate)
    results = []
    for item, price, unit, _ in items:
        attrs    = item["product"]["attributes"]
        instance = attrs.get("computeFamily")
        if not instance:
            continue
        results.append({
            "instance":         instance,
            "hourly_price_usd": str(price),
            "capacity_mbps":    EXPRESS_CAPACITY_MBPS.get(instance),
            "vcpu":             int(attrs["vcpu"])      if attrs.get("vcpu")      else None,
            "memory_gib":       int(attrs["memoryGib"]) if attrs.get("memoryGib") else None,
        })
    return list({r["instance"]: r for r in results}.values())


@lru_cache(maxsize=128)
def _list_provisioned_instances_detailed(location: str):
    def predicate(product, attrs):
        return (
            attrs.get("group") == "Broker"
            and attrs.get("operation") == "RunBroker"
        )
    items   = _find_price_products(location, predicate)
    results = []
    for item, price, unit, _ in items:
        attrs    = item["product"]["attributes"]
        cf       = attrs.get("computeFamily", "")
        instance = f"kafka.{cf}" if cf else None
        if not instance or instance not in PROVISIONED_CAPACITY_MBPS:
            continue
        results.append({
            "instance":         instance,
            "hourly_price_usd": str(price),
            "capacity_mbps":    PROVISIONED_CAPACITY_MBPS.get(instance),
            "vcpu":             int(attrs["vcpu"])      if attrs.get("vcpu")      else None,
            "memory_gib":       int(attrs["memoryGib"]) if attrs.get("memoryGib") else None,
        })
    return list({r["instance"]: r for r in results}.values())


def list_broker_instances(region: str, cluster_type: str):
    try:
        if cluster_type == "express":
            instances = _list_express_instances_detailed(region)
        elif cluster_type == "provisioned":
            instances = _list_provisioned_instances_detailed(region)
        else:
            raise HTTPException(
                status_code=400,
                detail="cluster_type must be 'express' or 'provisioned' to list instances"
            )
        if not instances:
            raise HTTPException(status_code=404, detail=f"No {cluster_type} instances found for region '{region}'")
        return instances
    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to list broker instances")
        raise HTTPException(status_code=502, detail="Failed to query Pricing API")


def list_allowed_provisioned_instances(region: str, throughput: str):
    """Returns allowed m7g instances for the given throughput — use this to drive frontend dropdowns."""
    mbps     = _parse_mbps_from_rate(throughput)
    min_ram  = _get_min_ram(mbps)
    allowed  = _get_allowed_instances(region, mbps)
    all_inst = _list_provisioned_instances_detailed(region)
    return {
        "throughput_mbps":    mbps,
        "min_ram_gb":         min_ram,
        "suggested_instance": _benchmark_instance(mbps),
        "condense_benchmark": {
            "machine": _get_condense_benchmark(mbps)[0],
            "nodes":   _get_condense_benchmark(mbps)[1],
            "ram_gb":  _get_condense_benchmark(mbps)[2],
        },
        "allowed_instances": [i for i in all_inst if i["instance"] in allowed],
    }


# ---------------------------------------------------------------------------
# Price lookups — Express
# ---------------------------------------------------------------------------

@lru_cache(maxsize=128)
def _express_broker_hour_price(location: str, instance: str) -> Decimal:
    def predicate(product, attrs):
        return (
            attrs.get("group") == "ExpressBroker"
            and attrs.get("operation") == "RunBroker"
            and attrs.get("computeFamily") == instance
        )
    for item, _, _, _ in _find_price_products(location, predicate):
        for price, unit, _ in _iter_on_demand_price_dimensions(item):
            if unit and unit.lower() in ("hrs", "hours"):
                return price
    raise KeyError(f"No Express broker hourly price for '{instance}' in {location}")


@lru_cache(maxsize=128)
def _express_storage_price(location: str) -> Decimal:
    def predicate(product, attrs):
        return (
            attrs.get("storageFamily") == "Express storage"
            and attrs.get("operation") == "Storage"
        )
    for _, price, unit, _ in _find_price_products(location, predicate):
        if unit and unit.lower() in ("gb-mo", "gb-month", "gb-months"):
            return price
    raise KeyError(f"No Express storage GB-month price for {location}")


@lru_cache(maxsize=128)
def _express_data_write_price(location: str) -> Decimal:
    def predicate(product, attrs):
        return (
            attrs.get("group") == "ExpressIngress"
            and attrs.get("operation") == "Data-In"
        )
    for _, price, unit, _ in _find_price_products(location, predicate):
        if unit and unit.upper() == "GB":
            return price
    raise KeyError(f"No Express data-write GB price for {location}")


# ---------------------------------------------------------------------------
# Price lookups — Provisioned
# ---------------------------------------------------------------------------

@lru_cache(maxsize=128)
def _provisioned_broker_hour_price(location: str, instance: str) -> Decimal:
    cf = instance.removeprefix("kafka.")
    def predicate(product, attrs):
        return (
            attrs.get("group") == "Broker"
            and attrs.get("operation") == "RunBroker"
            and attrs.get("computeFamily") == cf
        )
    for item, _, _, _ in _find_price_products(location, predicate):
        for price, unit, _ in _iter_on_demand_price_dimensions(item):
            if unit and unit.lower() in ("hrs", "hours"):
                return price
    raise KeyError(f"No Provisioned broker hourly price for '{instance}' in {location}")


@lru_cache(maxsize=128)
def _provisioned_storage_price(location: str) -> Decimal:
    def predicate(product, attrs):
        return (
            attrs.get("group") == "Storage"
            and attrs.get("operation") == "RunVolume"
            and attrs.get("storageFamily") == "GP2"
        )
    for _, price, unit, _ in _find_price_products(location, predicate):
        if unit and unit.lower() in ("gb-mo", "gb-month", "gb-months"):
            return price
    raise KeyError(f"No Provisioned storage GB-month price for {location}")


# ---------------------------------------------------------------------------
# Price lookups — Serverless
# ---------------------------------------------------------------------------

@lru_cache(maxsize=128)
def _serverless_partition_hour_price(location: str) -> Decimal:
    def predicate(product, attrs):
        return (
            attrs.get("group") == "Serverless"
            and "PartitionHours" in attrs.get("usagetype", "")
        )
    for _, price, unit, _ in _find_price_products(location, predicate):
        return price
    raise KeyError(f"No Serverless partition-hour price for {location}")


@lru_cache(maxsize=128)
def _serverless_storage_price(location: str) -> Decimal:
    def predicate(product, attrs):
        return (
            attrs.get("group") == "Serverless"
            and "StorageHours" in attrs.get("usagetype", "")
        )
    for _, price, unit, _ in _find_price_products(location, predicate):
        return price
    raise KeyError(f"No Serverless storage price for {location}")


@lru_cache(maxsize=128)
def _serverless_data_in_price(location: str) -> Decimal:
    def predicate(product, attrs):
        return (
            attrs.get("group") == "Serverless"
            and "In-Bytes" in attrs.get("usagetype", "")
        )
    for _, price, unit, _ in _find_price_products(location, predicate):
        return price
    raise KeyError(f"No Serverless data-in price for {location}")


@lru_cache(maxsize=128)
def _serverless_data_out_price(location: str) -> Decimal:
    def predicate(product, attrs):
        return (
            attrs.get("group") == "Serverless"
            and "Out-Bytes" in attrs.get("usagetype", "")
        )
    for _, price, unit, _ in _find_price_products(location, predicate):
        return price
    raise KeyError(f"No Serverless data-out price for {location}")

@lru_cache(maxsize=128)
def _serverless_cluster_hour_price(location: str) -> Decimal:
    def predicate(product, attrs):
        return (
            attrs.get("group") == "Serverless"
            and "ClusterHours" in attrs.get("usagetype", "")
        )
    for _, price, unit, _ in _find_price_products(location, predicate):
        return price
    raise KeyError(f"No Serverless cluster-hour price for {location}")
# ---------------------------------------------------------------------------
# Estimation logic
# ---------------------------------------------------------------------------

def _estimate_express(body: EstimateRequestExpress, mbps: float, gb_per_day: float) -> EstimateResponse:
    instance = body.instance_type
    capacity = EXPRESS_CAPACITY_MBPS[instance]

    if mbps < 25:
        brokers = 2
    else:
        brokers = round(-0.00015 * (mbps ** 2) + 0.108 * mbps + 0.35, 1)
    brokers = int(brokers)

    data_write_gb_month            = gb_per_day * 30.0
    storage_tb_total               = math.ceil((mbps * 3600 * 24 * body.retention_days * ISR) / 1024 / 1024)
    storagetb                      = math.ceil(storage_tb_total / brokers)
    interzonedatatransfer_gb_month = round(round((mbps * 24 * 3600 * 30) / 1024, 1) * ((ISR - 1) / ISR), 1)

    try:
        p_broker  = _express_broker_hour_price(body.region, instance)
        p_storage = _express_storage_price(body.region)
        p_write   = _express_data_write_price(body.region)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        logger.exception("Pricing API error (express)")
        raise HTTPException(status_code=502, detail="Failed to query Pricing API")

    cost_broker    = (Decimal(brokers) * 720 * p_broker).quantize(CENTS, ROUND_CEILING)
    cost_storage   = (Decimal(storagetb) * Decimal(brokers) * Decimal(1024) * p_storage).quantize(CENTS, ROUND_CEILING)
    cost_write     = (Decimal(data_write_gb_month) * p_write).quantize(CENTS, ROUND_CEILING)
    cost_interzone = (Decimal(str(interzonedatatransfer_gb_month)) * INTERZONE_RATE).quantize(CENTS, ROUND_CEILING)
    total          = cost_broker + cost_storage + cost_write + cost_interzone

    return EstimateResponse(
        cluster_type="express",
        inputs={
            "retention_days":     body.retention_days,
            "replication_factor": body.replication_factor,
            "throughput":         body.throughput,
            "region":             body.region,
        },
        sizing={
            "instance_type":                    instance,
            "per_broker_capacity_mbps":         capacity,
            "brokers":                          brokers,
            "storage_per_broker_tb":            storagetb,
            "interzone_data_transfer_gb_month": interzonedatatransfer_gb_month,
        },
        derived_usage={
            "broker_hours_month":    brokers * 720,
            "data_write_gb_month":   round(data_write_gb_month, 3),
            "storage_per_broker_tb": storagetb,
        },
        unit_prices_usd={
            "broker_hour":      str(p_broker),
            "storage_gb_month": str(p_storage),
            "data_write_gb":    str(p_write),
            "interzone_gb":     str(INTERZONE_RATE),
        },
        costs_usd={
            "broker_hours":            float(cost_broker),
            "storage":                 float(cost_storage),
            "data_write":              float(cost_write),
            "interzone_data_transfer": float(cost_interzone),
            "total":                   float(total),
        },
    )


def _estimate_provisioned(body: EstimateRequestProvisioned, mbps: float, gb_per_day: float) -> EstimateResponse:
    # Validate RAM constraint (also enforced in schema validator, this is defence-in-depth)
    allowed = _get_allowed_instances(body.region, mbps)
    if body.instance_type not in allowed:
        min_ram = _get_min_ram(mbps)
        raise HTTPException(
            status_code=400,
            detail=f"For {mbps} MBps, minimum RAM is {min_ram} GB. "
                   f"Allowed m7g instances: {', '.join(sorted(allowed))}"
        )

    instance = body.instance_type
    capacity = PROVISIONED_CAPACITY_MBPS[instance]

    # Broker count matches Condense node count from excel for fair side-by-side comparison
    condense_data = _estimate_condense(mbps, gb_per_day, body.retention_days)
    brokers       = int(condense_data["brokers"])

    warnings = []
    if instance == "kafka.t3.small":
        warnings.append(
            "kafka.t3.small is burstable (dev/test only). "
            "Sustained throughput is ~5 MB/s per broker. Not recommended for production."
        )

    storage_gb_total               = condense_data["storage_tb_total"] * 1024
    storagegb                      = math.ceil(storage_gb_total / brokers)
    interzonedatatransfer_gb_month = math.ceil(round((mbps * 24 * 3600 * 30) / 1024, 1) * ((ISR - 1) / ISR))

    try:
        p_broker  = _provisioned_broker_hour_price(body.region, instance)
        p_storage = _provisioned_storage_price(body.region)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        logger.exception("Pricing API error (provisioned)")
        raise HTTPException(status_code=502, detail="Failed to query Pricing API")

    cost_broker    = (Decimal(brokers) * 730 * p_broker).quantize(CENTS, ROUND_CEILING)
    cost_storage   = (Decimal(storagegb) * Decimal(brokers) * p_storage).quantize(CENTS, ROUND_CEILING)
    cost_interzone = (Decimal(str(interzonedatatransfer_gb_month)) * INTERZONE_RATE).quantize(CENTS, ROUND_CEILING)
    total          = cost_broker + cost_storage + cost_interzone

    return EstimateResponse(
        cluster_type="provisioned",
        inputs={
            "retention_days":     body.retention_days,
            "replication_factor": body.replication_factor,
            "throughput":         body.throughput,
            "region":             body.region,
        },
        sizing={
            "instance_type":                    instance,
            "per_broker_capacity_mbps":         capacity,
            "brokers":                          brokers,
            "storage_per_broker_gb":            storagegb,
            "interzone_data_transfer_gb_month": interzonedatatransfer_gb_month,
            "suggested_instance":               _benchmark_instance(mbps),
        },
        derived_usage={
            "broker_hours_month":    brokers * 730,
            "storage_per_broker_gb": storagegb,
        },
        unit_prices_usd={
            "broker_hour":      str(p_broker),
            "storage_gb_month": str(p_storage),
            "interzone_gb":     str(INTERZONE_RATE),
        },
        costs_usd={
            "broker_hours":            float(cost_broker),
            "storage":                 float(cost_storage),
            "interzone_data_transfer": float(cost_interzone),
            "total":                   float(total),
        },
        condense_comparison=condense_data,
        warnings=warnings,
    )


def _estimate_serverless(body: EstimateRequestServerless, mbps: float, gb_per_day: float) -> EstimateResponse:
    partitions        = 1000
    partition_hours   = partitions * 730
    data_in_gb_month  = gb_per_day * 30.0
    data_out_gb_month = data_in_gb_month
    storage_gb_month  = (gb_per_day * body.retention_days * 3) / 30.0

    try:
        p_partition = _serverless_partition_hour_price(body.region)
        p_storage   = _serverless_storage_price(body.region)
        p_data_in   = _serverless_data_in_price(body.region)
        p_data_out  = _serverless_data_out_price(body.region)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        logger.exception("Pricing API error (serverless)")
        raise HTTPException(status_code=502, detail="Failed to query Pricing API")

    cost_partitions = Decimal(partition_hours)   * p_partition
    cost_storage    = Decimal(storage_gb_month)  * p_storage
    cost_data_in    = Decimal(data_in_gb_month)  * p_data_in
    cost_data_out   = Decimal(data_out_gb_month) * p_data_out
    total           = cost_partitions + cost_storage + cost_data_in + cost_data_out

    return EstimateResponse(
        cluster_type="serverless",
        inputs={
            "retention_days": body.retention_days,
            "throughput":     body.throughput,
            "region":         body.region,
            "note":           "replication_factor not applicable — serverless manages 3x replication internally",
        },
        sizing={
            "partitions":         partitions,
            "mbps_per_partition": SERVERLESS_MBPS_PER_PARTITION,
            "partition_hours":    partition_hours,
        },
        derived_usage={
            "partition_hours_month": partition_hours,
            "data_in_gb_month":      round(data_in_gb_month, 3),
            "data_out_gb_month":     round(data_out_gb_month, 3),
            "storage_gb_month":      round(storage_gb_month, 3),
        },
        unit_prices_usd={
            "partition_hour":   str(p_partition),
            "storage_gb_month": str(p_storage),
            "data_in_gb":       str(p_data_in),
            "data_out_gb":      str(p_data_out),
        },
        costs_usd={
            "partitions": float(cost_partitions),
            "storage":    float(cost_storage),
            "data_in":    float(cost_data_in),
            "data_out":   float(cost_data_out),
            "total":      float(total),
        },
    )


# ---------------------------------------------------------------------------
# Main dispatchers — one per cluster type
# ---------------------------------------------------------------------------

def estimate_msk_provisioned(body: EstimateRequestProvisioned) -> EstimateResponse:
    try:
        mbps, gb_per_day = _parse_throughput(body.throughput)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return _estimate_provisioned(body, mbps, gb_per_day)


# def estimate_msk_serverless(body: EstimateRequestServerless) -> EstimateResponse:
#     ingress_mbps = _throughput_to_mbps(body.ingress_throughput, body.ingress_throughput_unit)
#     gb_per_day   = ingress_mbps * 86.4
#     return _estimate_serverless(body, ingress_mbps, gb_per_day)


def estimate_msk_express(body: EstimateRequestExpress) -> EstimateResponse:
    try:
        mbps, gb_per_day = _parse_throughput(body.throughput)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return _estimate_express(body, mbps, gb_per_day)


# ---------------------------------------------------------------------------
# Debug helper
# ---------------------------------------------------------------------------

def debug_raw_attributes(location: str):
    client = _pricing_client()
    token, pages = None, 0
    seen = []
    while True:
        kwargs = dict(
            ServiceCode=SERVICE_CODE,
            Filters=[{"Type": "TERM_MATCH", "Field": "location", "Value": location}],
            MaxResults=100,
        )
        if token:
            kwargs["NextToken"] = token
        resp = client.get_products(**kwargs)
        for s in resp["PriceList"]:
            item  = json.loads(s)
            attrs = item.get("product", {}).get("attributes", {})
            entry = {
                "group":              attrs.get("group"),
                "operation":          attrs.get("operation"),
                "brokerInstanceType": attrs.get("brokerInstanceType"),
                "computeFamily":      attrs.get("computeFamily"),
                "storageFamily":      attrs.get("storageFamily"),
                "usagetype":          attrs.get("usagetype"),
            }
            if entry not in seen:
                seen.append(entry)
        token = resp.get("NextToken")
        pages += 1
        if not token or pages >= 8:
            break
    return sorted(seen, key=lambda x: (x.get("group") or "", x.get("computeFamily") or ""))

# ---------------------------------------------------------------------------
# Replace _estimate_serverless in aws.py with this function
# Also add this import at the top of aws.py:
#   from schema import ... _throughput_to_mbps, _retention_to_hours
# ---------------------------------------------------------------------------

def _estimate_serverless(body: EstimateRequestServerless, mbps: float, gb_per_day: float) -> EstimateResponse:
    # Convert inputs to canonical units
    ingress_mbps    = _throughput_to_mbps(body.ingress_throughput, body.ingress_throughput_unit)
    egress_mbps     = _throughput_to_mbps(body.egress_throughput,  body.egress_throughput_unit)
    retention_hours = _retention_to_hours(body.retention_value,    body.retention_unit)
    retention_days  = retention_hours / 24

    partitions        = body.partitions           # user-chosen, minimum 1000
    partition_hours   = partitions * 730

    ingress_gb_per_day  = ingress_mbps * 86.4     # MBps -> GB/day
    egress_gb_per_day   = egress_mbps  * 86.4

    data_in_gb_month    = (ingress_mbps * 730.0*3600)/1024
    data_out_gb_month   = (egress_mbps  * 730.0*3600)/1024
    storage_gb_month    = (ingress_mbps * retention_days*24* 3600) / 1024  # 3x replication

    try:
        p_cluster=_serverless_cluster_hour_price(body.region )
        p_partition = _serverless_partition_hour_price(body.region)
        p_storage   = _serverless_storage_price(body.region)
        p_data_in   = _serverless_data_in_price(body.region)
        p_data_out  = _serverless_data_out_price(body.region)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        logger.exception("Pricing API error (serverless)")
        raise HTTPException(status_code=502, detail="Failed to query Pricing API")
    cost_cluster = Decimal(730) * p_cluster 
    cost_partitions = Decimal(partition_hours)    * p_partition
    cost_storage    = Decimal(storage_gb_month)   * p_storage
    cost_data_in    = Decimal(data_in_gb_month)   * p_data_in
    cost_data_out   = Decimal(data_out_gb_month)  * p_data_out
    total           = cost_partitions + cost_storage + cost_data_in + cost_data_out+cost_cluster

    return EstimateResponse(
        cluster_type="serverless",
        inputs={
            "region":                   body.region,
            "ingress_throughput":       f"{body.ingress_throughput} {body.ingress_throughput_unit}",
            "ingress_throughput_mbps":  round(ingress_mbps, 4),
            "egress_throughput":        f"{body.egress_throughput} {body.egress_throughput_unit}",
            "egress_throughput_mbps":   round(egress_mbps, 4),
            "partitions":               partitions,
            "retention":                f"{body.retention_value} {body.retention_unit}",
            "retention_hours":          round(retention_hours, 2),
            "note": "MSK Serverless manages 3x replication internally",
        },
        sizing={
            "partitions":         partitions,
            "mbps_per_partition": SERVERLESS_MBPS_PER_PARTITION,
            "partition_hours":    partition_hours,
        },
        derived_usage={
            "partition_hours_month": partition_hours,
            "data_in_gb_month":      round(data_in_gb_month, 3),
            "data_out_gb_month":     round(data_out_gb_month, 3),
            "storage_gb_month":      round(storage_gb_month, 3),
        },
        unit_prices_usd={
            "partition_hour":   str(p_partition),
            "storage_gb_month": str(p_storage),
            "data_in_gb":       str(p_data_in),
            "data_out_gb":      str(p_data_out),
        },
        costs_usd={
            "partitions": float(cost_partitions),
            "storage":    float(cost_storage),
            "data_in":    float(cost_data_in),
            "data_out":   float(cost_data_out),
            "total":      float(total),
        },
    )


def estimate_msk_serverless(body: EstimateRequestServerless) -> EstimateResponse:
    # ingress_mbps used as the canonical throughput for storage sizing
    ingress_mbps = _throughput_to_mbps(body.ingress_throughput, body.ingress_throughput_unit)
    gb_per_day   = ingress_mbps * 86.4
    return _estimate_serverless(body, ingress_mbps, gb_per_day)
