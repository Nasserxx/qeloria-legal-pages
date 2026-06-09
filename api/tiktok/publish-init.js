const { setCors, handleOptions, getBearerToken, parseTikTokResponse } = require('../_cors');

function computeChunkInfo(videoSize) {
    const maxChunk = 64 * 1024 * 1024;
    const minChunk = 5 * 1024 * 1024;
    let chunkSize = videoSize <= maxChunk ? videoSize : maxChunk;
    if (chunkSize < minChunk && videoSize > minChunk) {
        chunkSize = minChunk;
    }
    const totalChunkCount = Math.max(1, Math.ceil(videoSize / chunkSize));
    return {
        video_size: videoSize,
        chunk_size: chunkSize,
        total_chunk_count: totalChunkCount
    };
}

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

    const {
        title,
        video_size,
        privacy_level,
        disable_duet,
        disable_comment,
        disable_stitch,
        brand_content_toggle,
        brand_organic_toggle
    } = req.body || {};

    if (!video_size || video_size <= 0) {
        return res.status(400).json({ error: 'invalid_video_size' });
    }
    if (!privacy_level) {
        return res.status(400).json({
            error: 'missing_privacy_level',
            error_description: 'privacy_level is required and must match creator_info privacy_level_options'
        });
    }

    const source_info = {
        source: 'FILE_UPLOAD',
        ...computeChunkInfo(Number(video_size))
    };

    const post_info = {
        privacy_level,
        disable_duet: disable_duet !== false,
        disable_comment: disable_comment !== false,
        disable_stitch: disable_stitch !== false,
        brand_content_toggle: Boolean(brand_content_toggle),
        brand_organic_toggle: Boolean(brand_organic_toggle),
        video_cover_timestamp_ms: 1000
    };

    if (title && String(title).trim()) {
        post_info.title = String(title).trim().slice(0, 2200);
    }

    try {
        const response = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({ post_info, source_info })
        });

        const data = await parseTikTokResponse(response);
        return res.status(200).json({
            publish_id: data.data?.publish_id,
            upload_url: data.data?.upload_url,
            source_info
        });
    } catch (err) {
        return res.status(400).json({
            error: err.code || 'publish_init_failed',
            error_description: err.message,
            log_id: err.log_id
        });
    }
};
