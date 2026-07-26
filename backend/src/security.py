from urllib.parse import urlsplit


DEFAULT_CORS_ORIGINS = [
    'https://sienna-crypto-girl.vercel.app',
    'https://zmarty.me',
    'https://app.zmarty.me',
]


def parse_cors_origins(raw_value):
    candidates = raw_value.split(',') if raw_value else DEFAULT_CORS_ORIGINS
    origins = []

    for candidate in candidates:
        value = candidate.strip()
        try:
            parsed = urlsplit(value)
            is_loopback = parsed.hostname in {'localhost', '127.0.0.1', '::1'}
            valid_scheme = parsed.scheme == 'https' or (parsed.scheme == 'http' and is_loopback)
            valid_root = parsed.path in {'', '/'} and not parsed.query and not parsed.fragment
            valid_authority = bool(parsed.hostname) and not parsed.username and not parsed.password
            if valid_scheme and valid_root and valid_authority and value != '*':
                origin = f'{parsed.scheme}://{parsed.netloc}'
                if origin not in origins:
                    origins.append(origin)
        except (TypeError, ValueError):
            continue

    return origins
