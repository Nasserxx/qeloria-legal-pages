const { setCors, handleOptions, getBearerToken, parseTikTokResponse } = require('../_cors');

module.exports = async function handler(req, res) {
    if (handleOptions(req, res)) return;
    setCors(res);

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    const accessToken = getBearerToken(req);
    if (!accessToken) {
        return res.status(401).json({ error: 'missing_token' });
    }

    const { publish_id } = req.body || {};
    if (!publish_id) {
        return res.status(400).json({ error: 'missing_publish_id' });
    }

    try {
        const response = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({ publish_id })
        });

        const data = await parseTikTokResponse(response);
        return res.status(200).json(data.data || {});
    } catch (err) {
        return res.status(400).json({
            error: err.code || 'publish_status_failed',
            error_description: err.message,
            log_id: err.log_id
        });
    }
};
