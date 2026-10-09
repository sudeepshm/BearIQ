def initial(candidate):
    return min(candidate.confidence, 0.95 if candidate.source_type == "explicit" else 0.75)


def supported(score, new_evidence):
    return min(0.99, score + 0.02 * new_evidence)
