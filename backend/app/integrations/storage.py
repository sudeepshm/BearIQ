def store_archive(data, user_id, digest, settings):
    if not settings.gcs_bucket:
        return None
    import hashlib
    from google.cloud import storage

    # Do not use user supplied filenames or user IDs in object paths.
    owner = hashlib.sha256(user_id.encode()).hexdigest()
    name = f"imports/{owner}/{digest}.zip"
    client = storage.Client(project=settings.google_cloud_project)
    client.bucket(settings.gcs_bucket).blob(name).upload_from_string(data, content_type="application/zip")
    return f"gs://{settings.gcs_bucket}/{name}"
