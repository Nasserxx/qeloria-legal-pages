const { setCors, handleOptions, getTikTokCredentials } = require('./_cors');

module.exports = async function handler(req, res) {
    if (handleOptions(req, res)) return;
    setCors(res);

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    const { client_key, client_secret } = getTikTokCredentials();

    return res.status(200).json({
        ok: true,
        service: 'qeloria-tiktok-api',
        client_key_configured: Boolean(client_key),
        client_secret_configured: Boolean(client_secret),
        ready: Boolean(client_key && client_secret)
    });
};
