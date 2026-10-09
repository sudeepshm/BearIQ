"""Validate in memory; never extract archive paths onto the filesystem."""

import io
import json
import stat
import zipfile
from pathlib import PurePosixPath


class InvalidArchive(ValueError):
    pass


def read_export(data: bytes, settings) -> list[dict]:
    if len(data) > settings.max_upload_bytes:
        raise InvalidArchive("Upload exceeds size limit")
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            entries = archive.infolist()
            if len(entries) > settings.max_zip_entries:
                raise InvalidArchive("Too many ZIP entries")
            total = 0
            seen = set()
            matches = []
            for entry in entries:
                name = entry.filename.replace("\\", "/")
                path = PurePosixPath(name)
                if path.is_absolute() or ".." in path.parts or ":" in name or "\x00" in name:
                    raise InvalidArchive("Unsafe archive path")
                if name in seen:
                    raise InvalidArchive("Duplicate archive path")
                seen.add(name)
                if stat.S_ISLNK(entry.external_attr >> 16) or entry.flag_bits & 1:
                    raise InvalidArchive("Links and encrypted entries are unsupported")
                total += entry.file_size
                if total > settings.max_uncompressed_bytes:
                    raise InvalidArchive("Archive expands beyond size limit")
                if entry.file_size > max(1, entry.compress_size) * settings.max_compression_ratio:
                    raise InvalidArchive("Suspicious ZIP compression ratio")
                if path.name == "conversations.json" and not entry.is_dir():
                    matches.append(entry)
            if len(matches) != 1:
                raise InvalidArchive("Expected exactly one conversations.json (ChatGPT export)")
            with archive.open(matches[0]) as source:
                raw = source.read(settings.max_uncompressed_bytes + 1)
            if len(raw) > settings.max_uncompressed_bytes:
                raise InvalidArchive("Export exceeds size limit")
            payload = json.loads(raw)
            if (
                not isinstance(payload, list)
                or not payload
                or not all(isinstance(c, dict) and isinstance(c.get("mapping"), dict) for c in payload)
            ):
                raise InvalidArchive("Invalid ChatGPT conversations structure")
            return payload
    except InvalidArchive:
        raise
    except (zipfile.BadZipFile, ValueError, RuntimeError, NotImplementedError, OSError, EOFError) as exc:
        raise InvalidArchive("Unreadable ZIP or JSON export") from exc
