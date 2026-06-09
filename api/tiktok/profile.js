const { setCors, handleOptions, getBearerToken, parseTikTokResponse } = require('../_cors');

module.exports = async function handler(req, res) {
    if (handleOptions(req, res)) return;
    setCors(res);

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    const accessToken = getBearerToken(req);
    if (!accessToken) {
        return res.status(401).json({ error: 'missing_token' });
    }

    try {
        const userFields = 'open_id,union_id,avatar_url,display_name,username,bio_description,video_count,follower_count';
        const userUrl = 'https://open.tiktokapis.com/v2/user/info/?fields=' + encodeURIComponent(userFields);

        const [userRes, creatorRes] = await Promise.all([
            fetch(userUrl, {
                headers: { Authorization: 'Bearer ' + accessToken }
            }),
            fetch('https://open.tiktokapis.com/v2/post/publish/creator_info/query/', {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + accessToken,
                    'Content-Type': 'application/json; charset=UTF-8'
                }
            })
        ]);

        const userData = await parseTikTokResponse(userRes);
        let creator = null;
        try {
            const creatorData = await parseTikTokResponse(creatorRes);
            creator = creatorData.data || null;
        } catch (e) {
            creator = null;
        }

        return res.status(200).json({
            user: userData.data?.user || null,
            creator
        });
    } catch (err) {
        return res.status(400).json({
            error: err.code || 'profile_failed',
            error_description: err.message,
            log_id: err.log_id
        });
    }
};
