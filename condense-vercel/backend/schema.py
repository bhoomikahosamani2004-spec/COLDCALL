
import re
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Dict, Optional, List, Literal

# ---------------------------------------------------------------------------
# Capacity maps
# ---------------------------------------------------------------------------

EXPRESS_CAPACITY_MBPS: Dict[str, float] = {
    "express.m7g.large":    62.5,
    "express.m7g.xlarge":   125,
    "express.m7g.2xlarge":  250,
    "express.m7g.4xlarge":  500,
    "express.m7g.8xlarge":  1000,
    "express.m7g.12xlarge": 1500,
    "express.m7g.16xlarge": 2000,
}

PROVISIONED_CAPACITY_MBPS: Dict[str, float] = {
    "kafka.t3.small":     5,
    "kafka.m5.2xlarge":   120,
    "kafka.m5.4xlarge":   200,
    "kafka.m5.8xlarge":   200,
    "kafka.m5.12xlarge":  200,
    "kafka.m5.16xlarge":  200,
    "kafka.m5.24xlarge":  200,
    "kafka.m7g.large":    75,
    "kafka.m7g.xlarge":   75,
    "kafka.m7g.2xlarge":  155,
    "kafka.m7g.4xlarge":  250,
    "kafka.m7g.8xlarge":  250,
    "kafka.m7g.12xlarge": 250,
    "kafka.m7g.16xlarge": 250,
}

SERVERLESS_MBPS_PER_PARTITION = 1.0

# ---------------------------------------------------------------------------
# Benchmark tables (from Cost_Estimation_Template_Airtel_v3.xlsx)
# ---------------------------------------------------------------------------

THROUGHPUT_MIN_RAM = [
    (0,    25,  16),
    (25,   150, 32),
    (150,  999, 64),
]

CONDENSE_BENCHMARK = [
    (0,    5,   "r6a.large",   3,  16, 2),
    (5,    10,  "r6a.large",   4,  16, 2),
    (10,   20,  "r6a.large",   5,  16, 2),
    (20,   25,  "r6a.xlarge",  3,  32, 4),
    (25,   50,  "r6a.xlarge",  5,  32, 4),
    (50,   75,  "r6a.xlarge",  7,  32, 4),
    (75,   100, "r6a.xlarge",  9,  32, 4),
    (100,  125, "r6a.2xlarge", 6,  64, 8),
    (125,  150, "r6a.2xlarge", 7,  64, 8),
    (150,  200, "r6a.2xlarge", 8,  64, 8),
    (200,  250, "r6a.2xlarge", 12,  64, 8),
    (250,  999, "r6a.2xlarge", 12, 64, 8),
]

CONDENSE_TO_MSK_BENCHMARK = [
    (0,    25,  "kafka.m7g.xlarge"),
    (25,   150, "kafka.m7g.2xlarge"),
    (150,  999, "kafka.m7g.4xlarge"),
]

_M7G_RAM: Dict[str, int] = {
    "kafka.m7g.large":    8,
    "kafka.m7g.xlarge":   16,
    "kafka.m7g.2xlarge":  32,
    "kafka.m7g.4xlarge":  64,
    "kafka.m7g.8xlarge":  128,
    "kafka.m7g.12xlarge": 192,
    "kafka.m7g.16xlarge": 256,
}

# ---------------------------------------------------------------------------
# Helpers (also imported by aws.py)
# ---------------------------------------------------------------------------

def _parse_mbps_from_rate(rate_str: str) -> float:
    rate_str = rate_str.strip().lower()
    m_mb  = re.match(r"^\s*([0-9]*\.?[0-9]+)\s*mbps\s*$", rate_str)
    m_gbd = re.match(r"^\s*([0-9]*\.?[0-9]+)\s*gb\s*/\s*day\s*$", rate_str)
    if m_mb:
        return float(m_mb.group(1))
    if m_gbd:
        return float(m_gbd.group(1)) / 86.4
    return 0.0


def _get_min_ram_from_benchmark(mbps: float) -> int:
    for low, high, ram in THROUGHPUT_MIN_RAM:
        if low <= mbps < high:
            return ram
    return 64


def _throughput_to_mbps(value: float, unit: str) -> float:
    """Convert any throughput value to MBps."""
    unit = unit.strip().lower()
    if unit in ("mbps", "mb/s"):
        return value
    if unit in ("kbps", "kb/s"):
        return value / 1024
    raise ValueError(f"Unsupported throughput unit '{unit}'. Use 'MBps' or 'KBps'.")


def _retention_to_hours(value: float, unit: str) -> float:
    """Convert any retention value to hours."""
    unit = unit.strip().lower()
    if unit in ("hours", "hour", "hrs", "hr", "h"):
        return value
    if unit in ("days", "day", "d"):
        return value * 24
    if unit in ("months", "month", "mo"):
        return value * 24 * 30
    raise ValueError(f"Unsupported retention unit '{unit}'. Use 'hours', 'days', or 'months'.")


# ---------------------------------------------------------------------------
# Request model — Serverless
# ---------------------------------------------------------------------------

class EstimateRequestServerless(BaseModel):
    cluster_type: Literal["serverless"] = Field(
        default="serverless",
        description="Must be 'serverless'"
    )
    region: str = Field(
        ...,
        description="Human location string for Pricing API (e.g., 'Asia Pacific (Mumbai)')"
    )

    # Ingress throughput
    ingress_throughput: float = Field(
        ..., gt=0,
        description="Average monthly ingress throughput value (max 200 MBps)"
    )
    ingress_throughput_unit: Literal["MBps", "KBps"] = Field(
        default="MBps",
        description="Unit for ingress throughput: 'MBps' or 'KBps'"
    )

    # Egress throughput
    egress_throughput: float = Field(
        ..., gt=0,
        description="Average monthly egress throughput value (max 400 MBps)"
    )
    egress_throughput_unit: Literal["MBps", "KBps"] = Field(
        default="MBps",
        description="Unit for egress throughput: 'MBps' or 'KBps'"
    )

    # Partitions — minimum 1000, user can go higher
    partitions: int = Field(
        default=1000, ge=1000,
        description="Number of leader partitions. Minimum is 1000."
    )

    # Retention
    retention_value: float = Field(
        ..., gt=0,
        description="Data retention period value"
    )
    retention_unit: Literal["hours", "days", "months"] = Field(
        default="days",
        description="Unit for retention period: 'hours', 'days', or 'months'"
    )

    @model_validator(mode="after")
    def validate_serverless_limits(self) -> "EstimateRequestServerless":
        # Convert to MBps for validation
        try:
            ingress_mbps = _throughput_to_mbps(self.ingress_throughput, self.ingress_throughput_unit)
        except ValueError as e:
            raise ValueError(str(e))

        try:
            egress_mbps = _throughput_to_mbps(self.egress_throughput, self.egress_throughput_unit)
        except ValueError as e:
            raise ValueError(str(e))

        try:
            retention_hours = _retention_to_hours(self.retention_value, self.retention_unit)
        except ValueError as e:
            raise ValueError(str(e))

        # AWS Serverless limits
        if ingress_mbps > 200:
            raise ValueError(
                f"Ingress throughput cannot exceed 200 MBps. "
                f"Got {ingress_mbps:.2f} MBps ({self.ingress_throughput} {self.ingress_throughput_unit})."
            )
        if egress_mbps > 400:
            raise ValueError(
                f"Egress throughput cannot exceed 400 MBps. "
                f"Got {egress_mbps:.2f} MBps ({self.egress_throughput} {self.egress_throughput_unit})."
            )
        if retention_hours > 1_000_000_000_000:
            raise ValueError(
                f"Retention period cannot exceed 1,000,000,000,000 hours. "
                f"Got {retention_hours:.2f} hours ({self.retention_value} {self.retention_unit})."
            )

        return self


# ---------------------------------------------------------------------------
# Request model — Provisioned
# ---------------------------------------------------------------------------

class EstimateRequestProvisioned(BaseModel):
    cluster_type: Literal["provisioned"] = Field(
        default="provisioned",
        description="Must be 'provisioned'"
    )
    retention_days: int = Field(..., ge=1, le=3650, description="Retention window in days")
    replication_factor: int = Field(..., ge=1, le=5, description="Kafka replication factor (1-5)")
    throughput: str = Field(..., description="Either '<num> MBps' or '<num> GB/day'")
    region: str = Field(..., description="Human location string for Pricing API (e.g., 'Asia Pacific (Mumbai)')")
    instance_type: str = Field(
        ...,
        description=(
            "MSK m7g broker instance (e.g. 'kafka.m7g.2xlarge'). "
            "Must meet minimum RAM for the given throughput."
        )
    )

    @field_validator("throughput")
    @classmethod
    def validate_throughput(cls, v: str) -> str:
        v = v.strip()
        if re.match(r"^[0-9]*\.?[0-9]+\s*MBps$", v, re.IGNORECASE) or \
           re.match(r"^[0-9]*\.?[0-9]+\s*GB\s*/\s*day$", v, re.IGNORECASE):
            return v
        raise ValueError("throughput must look like '50 MBps' or '4000 GB/day'")

    @model_validator(mode="after")
    def validate_instance(self) -> "EstimateRequestProvisioned":
        if self.instance_type not in PROVISIONED_CAPACITY_MBPS:
            raise ValueError(
                f"Unsupported instance '{self.instance_type}'. "
                f"Allowed: {', '.join(PROVISIONED_CAPACITY_MBPS.keys())}"
            )
        if self.instance_type.startswith("kafka.m7g"):
            mbps     = _parse_mbps_from_rate(self.throughput)
            min_ram  = _get_min_ram_from_benchmark(mbps)
            inst_ram = _M7G_RAM.get(self.instance_type)
            if inst_ram is not None and inst_ram < min_ram:
                allowed = [k for k, v in _M7G_RAM.items() if v >= min_ram]
                raise ValueError(
                    f"For {mbps} MBps, minimum RAM required is {min_ram} GB. "
                    f"'{self.instance_type}' has only {inst_ram} GB. "
                    f"Allowed m7g instances: {', '.join(sorted(allowed))}"
                )
        return self


# ---------------------------------------------------------------------------
# Request model — Express
# ---------------------------------------------------------------------------

class EstimateRequestExpress(BaseModel):
    cluster_type: Literal["express"] = Field(
        default="express",
        description="Must be 'express'"
    )
    retention_days: int = Field(..., ge=1, le=3650, description="Retention window in days")
    replication_factor: int = Field(..., ge=1, le=5, description="Kafka replication factor (1-5)")
    throughput: str = Field(..., description="Either '<num> MBps' or '<num> GB/day'")
    region: str = Field(..., description="Human location string for Pricing API (e.g., 'Asia Pacific (Mumbai)')")
    instance_type: str = Field(
        ...,
        description="Express broker instance (e.g. 'express.m7g.4xlarge')"
    )

    @field_validator("throughput")
    @classmethod
    def validate_throughput(cls, v: str) -> str:
        v = v.strip()
        if re.match(r"^[0-9]*\.?[0-9]+\s*MBps$", v, re.IGNORECASE) or \
           re.match(r"^[0-9]*\.?[0-9]+\s*GB\s*/\s*day$", v, re.IGNORECASE):
            return v
        raise ValueError("throughput must look like '50 MBps' or '4000 GB/day'")

    @model_validator(mode="after")
    def validate_instance(self) -> "EstimateRequestExpress":
        if self.instance_type not in EXPRESS_CAPACITY_MBPS:
            raise ValueError(
                f"Unsupported Express instance '{self.instance_type}'. "
                f"Allowed: {', '.join(EXPRESS_CAPACITY_MBPS.keys())}"
            )
        return self

class EstimateRequestCondense(BaseModel):
    retention_days: int = Field(..., ge=1, le=3650, description="Retention window in days")
    throughput: str = Field(..., description="Either '<num> MBps' or '<num> GB/day'")
# ---------------------------------------------------------------------------
# Response model — shared across all cluster types
# ---------------------------------------------------------------------------

class EstimateResponse(BaseModel):
    cluster_type: str
    inputs: dict
    sizing: dict
    derived_usage: dict
    unit_prices_usd: dict
    costs_usd: dict
    condense_comparison: Optional[dict] = None
    warnings: List[str] = []


class BrokerInstanceInfo(BaseModel):
    instance: str
    hourly_price_usd: str
    capacity_mbps: Optional[float]
    vcpu: Optional[int]
    memory_gib: Optional[int]
