/**
 * Qeloria — TikTok API client (calls Vercel API proxy; static site stays on GitHub Pages).
 */
(function (global) {
    function getApiBase() {
        if (global.TikTokOAuth && global.TikTokOAuth.getApiBaseUrl) {
            return global.TikTokOAuth.getApiBaseUrl();
        }
        if (global.TikTokOAuth && global.TikTokOAuth.config.apiProxyUrl) {
            return global.TikTokOAuth.config.apiProxyUrl;
        }
        return '';
    }

    function apiUrl(path) {
        const base = getApiBase().replace(/\/$/, '');
        return base + path;
    }

    async function request(path, options) {
        const url = apiUrl(path);
        let response;
        try {
            response = await fetch(url, options);
        } catch (err) {
            const hint = getApiBase()
                ? ' Check that apiProxyUrl in tiktok-oauth.js matches your Vercel deployment and that Vercel env vars are set.'
                : ' Run npx vercel dev locally, or set apiProxyUrl in tiktok-oauth.js for GitHub Pages.';
            throw new Error('Could not reach TikTok API proxy at ' + url + '.' + hint);
        }
        const data = await response.json().catch(function () {
            return {};
        });
        if (!response.ok) {
            const message = data.error_description || data.error?.message || data.error || response.statusText;
            throw new Error(typeof message === 'string' ? message : 'API request failed');
        }
        return data;
    }

    function getSession() {
        try {
            const raw = global.sessionStorage.getItem('tiktok_session');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function saveSession(tokens) {
        const session = {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            open_id: tokens.open_id,
            scope: tokens.scope,
            expires_in: tokens.expires_in,
            token_type: tokens.token_type,
            saved_at: Date.now()
        };
        global.sessionStorage.setItem('tiktok_session', JSON.stringify(session));
        return session;
    }

    function clearSession() {
        global.sessionStorage.removeItem('tiktok_session');
    }

    function logTokensToConsole(tokens, label) {
        const prefix = '[TikTok OAuth]';
        console.group(prefix + ' ' + (label || 'Tokens'));
        console.log('Full token response:', tokens);
        console.log('access_token:', tokens.access_token);
        console.log('refresh_token:', tokens.refresh_token);
        console.log('open_id:', tokens.open_id);
        console.log('scope:', tokens.scope);
        console.log('expires_in (seconds):', tokens.expires_in);
        console.groupEnd();
    }

    async function exchangeCode(code, redirectUri) {
        const tokens = await request('/api/tiktok/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, redirect_uri: redirectUri })
        });
        logTokensToConsole(tokens, 'Authorization code exchanged');
        return saveSession(tokens);
    }

    async function fetchProfile(accessToken) {
        return request('/api/tiktok/profile', {
            method: 'GET',
            headers: { Authorization: 'Bearer ' + accessToken }
        });
    }

    async function fetchVideos(accessToken, maxCount) {
        return request('/api/tiktok/videos', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ max_count: maxCount || 12 })
        });
    }

    async function initPublish(accessToken, payload) {
        return request('/api/tiktok/publish-init', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    }

    async function fetchPublishStatus(accessToken, publishId) {
        return request('/api/tiktok/publish-status', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ publish_id: publishId })
        });
    }

    async function uploadVideoFile(uploadUrl, file, sourceInfo) {
        const videoSize = file.size;
        const chunkSize = sourceInfo.chunk_size;
        const totalChunks = sourceInfo.total_chunk_count;

        if (totalChunks === 1) {
            const response = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type || 'video/mp4',
                    'Content-Range': 'bytes 0-' + (videoSize - 1) + '/' + videoSize
                },
                body: file
            });
            if (!response.ok) {
                throw new Error('Video upload failed (HTTP ' + response.status + ')');
            }
            return;
        }

        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = i === totalChunks - 1 ? videoSize - 1 : start + chunkSize - 1;
            const chunk = file.slice(start, end + 1);
            const response = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type || 'video/mp4',
                    'Content-Range': 'bytes ' + start + '-' + end + '/' + videoSize
                },
                body: chunk
            });
            if (!response.ok) {
                throw new Error('Chunk upload failed at part ' + (i + 1) + ' (HTTP ' + response.status + ')');
            }
        }
    }

    async function pollPublishStatus(accessToken, publishId, onProgress) {
        const delays = [2000, 3000, 5000, 8000, 10000, 15000];
        for (let i = 0; i < delays.length; i++) {
            const status = await fetchPublishStatus(accessToken, publishId);
            if (onProgress) onProgress(status);
            if (status.status === 'PUBLISH_COMPLETE') return status;
            if (status.status === 'FAILED') {
                throw new Error('Publish failed: ' + (status.fail_reason || 'unknown'));
            }
            await new Promise(function (r) { setTimeout(r, delays[i]); });
        }
        return fetchPublishStatus(accessToken, publishId);
    }

    async function publishVideo(accessToken, file, options) {
        const init = await initPublish(accessToken, {
            title: options.title,
            video_size: file.size,
            privacy_level: options.privacy_level || 'SELF_ONLY'
        });

        if (!init.upload_url || !init.publish_id) {
            throw new Error('TikTok did not return upload_url or publish_id');
        }

        await uploadVideoFile(init.upload_url, file, init.source_info);
        const finalStatus = await pollPublishStatus(accessToken, init.publish_id, options.onProgress);
        return { publish_id: init.publish_id, status: finalStatus };
    }

    async function checkHealth() {
        const response = await fetch(apiUrl('/api/health'));
        const data = await response.json().catch(function () {
            return { ok: false };
        });
        return {
            ok: response.ok && data.ok === true,
            ready: Boolean(data.ready),
            client_secret_configured: Boolean(data.client_secret_configured),
            url: apiUrl('/api/health')
        };
    }

    global.TikTokApi = {
        getSession: getSession,
        saveSession: saveSession,
        clearSession: clearSession,
        logTokensToConsole: logTokensToConsole,
        checkHealth: checkHealth,
        exchangeCode: exchangeCode,
        fetchProfile: fetchProfile,
        fetchVideos: fetchVideos,
        publishVideo: publishVideo
    };
})(window);
