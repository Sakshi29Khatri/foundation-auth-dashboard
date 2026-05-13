import json
import ssl
import urllib.error
import urllib.request

url = 'https://foundation-api.hsp.ovh/api/auth/register'
variants = [
    {'name': 'Test User', 'phone': '1234567890', 'email': 'testuser_' + str(i) + '@example.com', 'password': 'Password123!'}
    for i in range(1000, 1003)
]

for payload in variants:
    print('=== Payload ===')
    print(json.dumps(payload, indent=2))
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    )
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
            print('STATUS', r.status)
            body = r.read().decode('utf-8', 'replace')
            print(body)
    except urllib.error.HTTPError as e:
        print('HTTP', e.code)
        body = e.read().decode('utf-8', 'replace')
        print(body)
    except Exception as e:
        print('ERR', type(e).__name__, e)
