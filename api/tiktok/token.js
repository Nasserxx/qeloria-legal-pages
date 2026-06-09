const { setCors, handleOptions, getTikTokCredentials } = require('../_cors');

module.exports = async function handler(req, res) {
    if (handleOptions(req, res)) return;
    setCors(res);

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    const { code, redirect_uri } = req.body || {};
    if (!code || !redirect_uri) {
        return res.status(400).json({ error: 'missing_params', error_description: 'code and redirect_uri are required' });
    }

    const { client_key, client_secret } = getTikTokCredentials();
    if (!client_secret) {
        return res.status(500).json({
            error: 'server_config',
            error_description: 'TIKTOK_CLIENT_SECRET is not set on the Vercel API. Add it in Vercel → Settings → Environment Variables (GitHub Pages cannot run this endpoint).'
        });
    }

    const body = new URLSearchParams({
        client_key,
        client_secret,
        code,
        grant_type: 'authorization_code',
        redirect_uri
    });

    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
    });

    const data = await response.json();
    if (!response.ok || data.error) {
        return res.status(400).json(data);
    }

    return res.status(200).json(data);
};
