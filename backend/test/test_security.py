import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.security import parse_cors_origins


class CorsOriginTests(unittest.TestCase):
    def test_defaults_to_official_https_origins(self):
        self.assertEqual(
            parse_cors_origins(None),
            [
                'https://sienna-crypto-girl.vercel.app',
                'https://zmarty.me',
                'https://app.zmarty.me',
            ],
        )

    def test_rejects_wildcards_credentials_and_non_root_origins(self):
        self.assertEqual(
            parse_cors_origins(
                '*,https://user@example.com,https://example.com/path,https://valid.example'
            ),
            ['https://valid.example'],
        )

    def test_allows_loopback_http_only_for_local_development(self):
        self.assertEqual(
            parse_cors_origins('http://localhost:3000,http://127.0.0.1:3000,http://example.com'),
            ['http://localhost:3000', 'http://127.0.0.1:3000'],
        )


if __name__ == '__main__':
    unittest.main()
