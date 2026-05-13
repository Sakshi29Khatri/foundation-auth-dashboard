import ssl
import urllib.request

base = 'https://foundation-api.hsp.ovh'
paths = [
    '/api/auth/register',
    '/api/register',
    '/api/signup',
    '/auth/register',
    '/register',
    '/api/v1/auth/register',
    '/api/v1/register',
]
ctx = ssl.create_default_context()
for p in paths:
    url = base + p
    print('===', url)
    try:
        req = urllib.request.Request(url, method='HEAD')
        with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
            print('HEAD', r.status)
            print(r.getheader('Content-Type'))
    except Exception as e:
        print(type(e).__name__, e)
