"""Shared enumerations used across schemas, models, and services."""

import enum


class ColorMode(str, enum.Enum):
    BW = "bw"
    COLOR = "color"


class PrintType(str, enum.Enum):
    SIMPLEX = "simplex"
    DUPLEX = "duplex"
