const http = require('http');

const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': '*',
        });
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/heartbeat') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const headers = {
                    'Content-Type': 'application/json',
                    'X-Machine-Name': req.headers['x-machine-name'] || 'Unknown',
                    'Content-Length': Buffer.byteLength(body).toString(),
                    'User-Agent': req.headers['user-agent'] || 'Unknown',
                };

                const proxyUrl = req.headers['x-proxy-url'] || '';
                const apiKey = req.headers['api-key'] || '';
                if (!proxyUrl || !apiKey) {
                    console.error('Missing headers X-Proxy-Url and API-Key');
                    res.writeHead(400, { 'Access-Control-Allow-Origin': '*' });
                    res.end('Missing headers X-Proxy-Url and API-Key are required');
                    return;
                }

                const wakapiRes = await fetch(`${proxyUrl}/users/current/heartbeats?api_key=${apiKey}`, {
                    method: 'POST',
                    headers,
                    body,
                });

                const data = await wakapiRes.text();

                const responseHeaders = {};
                wakapiRes.headers.forEach((value, key) => {
                    responseHeaders[key] = value;
                });
                responseHeaders['Access-Control-Allow-Origin'] = '*';

                res.writeHead(wakapiRes.status, responseHeaders);
                res.end(data);
            } catch (err) {
                console.error('Error stack:', err.stack);
                res.writeHead(500, { 'Access-Control-Allow-Origin': '*' });
                res.end('Error processing request');
            }
        });
    } else {
        res.writeHead(404, { 'Access-Control-Allow-Origin': '*' });
        res.end();
    }
});

server.listen(53128, () => {
    console.log('🟢 Local proxy running at http://127.0.0.1:53128');
});
