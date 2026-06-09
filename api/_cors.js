function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function handleOptions(req, res) {
    setCors(res);
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }
    return false;
}

function getBearerToken(req) {
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
        return header.slice(7);
    }
    return null;
}

function getTikTokCredentials() {
    const client_key = process.env.TIKTOK_CLIENT_KEY || 'sbawoppy1qxvt41y0g';
    const client_secret = process.env.TIKTOK_CLIENT_SECRET;
    return { client_key, client_secret };
}

async function parseTikTokResponse(response) {
    const data = await response.json();
    if (data.error && data.error.code && data.error.code !== 'ok') {
        const err = new Error(data.error.message || data.error.code);
        err.code = data.error.code;
        err.log_id = data.error.log_id;
        throw err;
    }
    if (data.error && typeof data.error === 'string') {
        const err = new Error(data.error_description || data.error);
        err.code = data.error;
        throw err;
    }
    return data;
}

module.exports = {
    setCors,
    handleOptions,
    getBearerToken,
    getTikTokCredentials,
    parseTikTokResponse
};
