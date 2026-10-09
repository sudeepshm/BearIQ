from datetime import datetime, timezone
from uuid import uuid5, NAMESPACE_URL
from app.services.validator import InvalidArchive


def identity(*parts):
    import json

    return str(uuid5(NAMESPACE_URL, json.dumps(parts)))


def timestamp(value):
    if value is None:
        return None
    try:
        return datetime.fromtimestamp(float(value), timezone.utc)
    except (ValueError, TypeError, OverflowError, OSError) as exc:
        raise InvalidArchive("Invalid message timestamp") from exc


def parse_export(payload, user_id):
    output = []
    seen_conversations = set()
    for raw in payload:
        source_id = raw.get("id") or raw.get("conversation_id")
        if not isinstance(source_id, str) or not source_id:
            raise InvalidArchive("Conversation ID missing")
        if source_id in seen_conversations:
            continue
        seen_conversations.add(source_id)
        cid = identity(user_id, "chatgpt", source_id)
        mapping = raw["mapping"]
        # Follow the selected branch, excluding discarded alternate responses.
        current = raw.get("current_node")
        if not current:
            if any(
                not isinstance(n, dict) or (n.get("parent") is not None and not isinstance(n.get("parent"), str))
                for n in mapping.values()
            ):
                raise InvalidArchive("Malformed conversation graph")
            parents = {n.get("parent") for n in mapping.values()}
            leaves = [k for k in mapping if k not in parents]
            if len(leaves) != 1:
                raise InvalidArchive("Ambiguous conversation branch")
            current = leaves[0]
        nodes, visited = [], set()
        while current is not None:
            if (
                not isinstance(current, str)
                or current in visited
                or current not in mapping
                or not isinstance(mapping[current], dict)
            ):
                raise InvalidArchive("Broken or cyclic conversation graph")
            visited.add(current)
            node = mapping[current]
            nodes.append(node)
            current = node.get("parent")
        messages, seen = [], set()
        for node in reversed(nodes):
            msg = node.get("message")
            if not isinstance(msg, dict):
                continue
            author = msg.get("author") or {}
            content = msg.get("content") or {}
            if not isinstance(author, dict) or not isinstance(content, dict):
                raise InvalidArchive("Malformed message")
            role = author.get("role")
            if role not in ("user", "assistant"):
                continue
            parts = content.get("parts", [])
            if not isinstance(parts, list):
                raise InvalidArchive("Malformed message parts")
            text = "\n".join(p for p in parts if isinstance(p, str)).strip()
            mid = msg.get("id") or node.get("id")
            if not text or not isinstance(mid, str) or mid in seen:
                continue
            seen.add(mid)
            messages.append(
                dict(
                    id=identity(cid, mid),
                    source_id=mid,
                    conversation_id=cid,
                    role=role,
                    content=text,
                    timestamp=timestamp(msg.get("create_time")),
                    position=len(messages),
                )
            )
        output.append(
            dict(
                id=cid,
                user_id=user_id,
                source_id=source_id,
                platform="chatgpt",
                title=str(raw.get("title") or "Untitled"),
                created_at=timestamp(raw.get("create_time")),
                updated_at=timestamp(raw.get("update_time")),
                messages=messages,
            )
        )
    return output
