import json
import ssl
import urllib.error
import urllib.request

url = 'https://foundation-api.hsp.ovh/api/auth/register'
payload = {
    'name': 'Test User',
    'email': 'testuser_12345@example.com',
    'password': 'Password123!',
    'phone': '1234567890',
}
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
        print('HEADERS')
        for k, v in r.getheaders():
            print(k, v)
        body = r.read(2000)
        print('BODY')
        print(body.decode('utf-8', 'replace'))
except urllib.error.HTTPError as e:
    print('HTTP', e.code)
    print('HEADERS')
    for k, v in e.headers.items():
        print(k, v)
    body = e.read(2000)
    print('BODY')
    print(body.decode('utf-8', 'replace'))
except Exception as e:
    print('ERR', type(e).__name__, e)
