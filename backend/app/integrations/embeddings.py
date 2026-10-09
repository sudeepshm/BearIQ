import math


def normalize(values, dimensions):
    if len(values) != dimensions or not all(math.isfinite(x) for x in values):
        raise ValueError("Invalid embedding dimensions or values")
    norm = math.sqrt(sum(x * x for x in values))
    if norm == 0:
        raise ValueError("Zero embedding")
    return [x / norm for x in values]


def cosine(a, b):
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(x * x for x in b))
    return sum(x * y for x, y in zip(a, b, strict=True)) / (na * nb) if na and nb else 0.0
