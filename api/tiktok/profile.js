const { setCors, handleOptions, getBearerToken, parseTikTokResponse } = require('../_cors');

async function fetchUserFields(accessToken, fields) {
    const userUrl = 'https://open.tiktokapis.com/v2/user/info/?fields=' + encodeURIComponent(fields);
    const response = await fetch(userUrl, {
        headers: { Authorization: 'Bearer ' + accessToken }
    });
    const data = await parseTikTokResponse(response);
    return data.data?.user || null;
}

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
        let user = await fetchUserFields(accessToken, 'open_id,union_id,avatar_url,display_name');

        try {
            const extended = await fetchUserFields(
                accessToken,
                'username,bio_description,video_count,follower_count'
            );
            if (extended) {
                user = Object.assign({}, user, extended);
            }
        } catch (extErr) {
            // Extended fields need user.info.profile / user.info.stats — optional.
        }

        let creator = null;
        let creator_error = null;
        try {
            const creatorRes = await fetch('https://open.tiktokapis.com/v2/post/publish/creator_info/query/', {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + accessToken,
                    'Content-Type': 'application/json; charset=UTF-8'
                }
            });
            const creatorData = await parseTikTokResponse(creatorRes);
            creator = creatorData.data || null;
        } catch (creatorErr) {
            creator_error = {
                code: creatorErr.code || 'creator_info_failed',
                message: creatorErr.message || 'Could not load creator info'
            };
        }

        return res.status(200).json({
            user,
            creator,
            creator_error
        });
    } catch (err) {
        return res.status(400).json({
            error: err.code || 'profile_failed',
            error_description: err.message,
            log_id: err.log_id
        });
    }
};
