"""Bound prompts by both message count and characters, including oversized messages."""


def chunks(messages, settings):
    fragments = []
    for message in messages:
        for offset in range(0, len(message["content"]), settings.chunk_characters):
            fragments.append({**message, "content": message["content"][offset : offset + settings.chunk_characters]})
    start = 0
    while start < len(fragments):
        end, size = start, 0
        while end < len(fragments) and end - start < settings.chunk_messages:
            length = len(fragments[end]["content"])
            if size + length > settings.chunk_characters:
                break
            size += length
            end += 1
        yield fragments[start:end]
        if end == len(fragments):
            break
        start = max(start + 1, end - settings.chunk_overlap)
