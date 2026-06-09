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

    const max_count = Math.min(Number(req.body?.max_count) || 12, 20);
    const fields = 'id,title,cover_image_url,create_time,duration,view_count,like_count';

    try {
        const response = await fetch(
            'https://open.tiktokapis.com/v2/video/list/?fields=' + encodeURIComponent(fields),
            {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ max_count })
            }
        );

        const data = await parseTikTokResponse(response);
        return res.status(200).json({
            videos: data.data?.videos || [],
            cursor: data.data?.cursor,
            has_more: data.data?.has_more
        });
    } catch (err) {
        return res.status(400).json({
            error: err.code || 'video_list_failed',
            error_description: err.message,
            log_id: err.log_id
        });
    }
};
