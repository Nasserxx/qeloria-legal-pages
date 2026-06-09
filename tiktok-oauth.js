/**
 * TikTok Login Kit (Web) — shared OAuth helpers.
 * @see https://developers.tiktok.com/doc/login-kit-web
 */
(function (global) {
    const TIKTOK_OAUTH = {
        // Sandbox key (Staging app). Production key: aweov6tyahsy44f9 — swap when app is live.
        clientKey: 'sbawoppy1qxvt41y0g',
        authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
        scopes: 'user.info.basic,user.info.profile,user.info.stats,video.upload,video.publish,video.list',
        requiredScopes: [
            'user.info.basic',
            'user.info.profile',
            'user.info.stats',
            'video.upload',
            'video.publish',
            'video.list'
        ],
        stateStorageKey: 'tiktok_oauth_state',
        codeStorageKey: 'tiktok_oauth_code',
        // Must match Login Kit → Redirect URI entries in TikTok Developer Portal exactly.
        registeredRedirectUris: [
            'https://qeloria.com/tiktok-callback.html',
            'https://nasserxx.github.io/qeloria-legal-pages/tiktok-callback.html'
        ],
        // GitHub Pages is static-only — deploy the api/ folder to Vercel and paste the URL here.
        // Example: https://qeloria-legal-pages.vercel.app (no trailing slash)
        apiProxyUrl: 'https://qeloria-legal-pages.vercel.app'
    };

    function getApiBaseUrl() {
        if (typeof location === 'undefined') {
            return TIKTOK_OAUTH.apiProxyUrl || '';
        }
        try {
            var override = new URLSearchParams(location.search).get('api');
            if (override) {
                return override.replace(/\/$/, '');
            }
        } catch (e) {
            // ignore
        }
        var host = location.hostname;
        // Local dev: npx vercel dev serves /api on the same origin.
        if (host === 'localhost' || host === '127.0.0.1') {
            return '';
        }
        return TIKTOK_OAUTH.apiProxyUrl || '';
    }

    function getRedirectUri() {
        return new URL('tiktok-callback.html', global.location.href).href.split('#')[0];
    }

    function getHomeUrl() {
        return new URL('index.html', global.location.href).href.split('#')[0];
    }

    function generateState() {
        if (global.crypto && global.crypto.randomUUID) {
            return global.crypto.randomUUID();
        }
        const bytes = new Uint8Array(16);
        global.crypto.getRandomValues(bytes);
        return Array.from(bytes, function (b) {
            return b.toString(16).padStart(2, '0');
        }).join('');
    }

    function buildAuthUrl(state) {
        const redirectUri = getRedirectUri();
        const params = new URLSearchParams({
            client_key: TIKTOK_OAUTH.clientKey,
            scope: TIKTOK_OAUTH.scopes,
            response_type: 'code',
            redirect_uri: redirectUri,
            state: state
        });
        return TIKTOK_OAUTH.authUrl + '?' + params.toString();
    }

    function isRegisteredRedirectUri(uri) {
        return TIKTOK_OAUTH.registeredRedirectUris.indexOf(uri) !== -1;
    }

    function saveState(state) {
        try {
            global.sessionStorage.setItem(TIKTOK_OAUTH.stateStorageKey, state);
        } catch (e) {
            // sessionStorage may be unavailable in some embedded browsers
        }
    }

    function readState() {
        try {
            return global.sessionStorage.getItem(TIKTOK_OAUTH.stateStorageKey);
        } catch (e) {
            return null;
        }
    }

    function clearState() {
        try {
            global.sessionStorage.removeItem(TIKTOK_OAUTH.stateStorageKey);
        } catch (e) {
            // ignore
        }
    }

    function saveAuthCode(code) {
        try {
            global.sessionStorage.setItem(TIKTOK_OAUTH.codeStorageKey, code);
        } catch (e) {
            // ignore
        }
    }

    function readAuthCode() {
        try {
            return global.sessionStorage.getItem(TIKTOK_OAUTH.codeStorageKey);
        } catch (e) {
            return null;
        }
    }

    function clearAuthCode() {
        try {
            global.sessionStorage.removeItem(TIKTOK_OAUTH.codeStorageKey);
        } catch (e) {
            // ignore
        }
    }

    function verifyState(returnedState) {
        const storedState = readState();
        if (!storedState || !returnedState || storedState !== returnedState) {
            return false;
        }
        clearState();
        return true;
    }

    function describeTikTokSetupError(errorType) {
        const redirectUri = getRedirectUri();
        const lines = [
            'TikTok rejected the authorization request. Common fixes:',
            '',
            '1. In developers.tiktok.com → your app → add the Login Kit product.',
            '2. Under Login Kit → Redirect URI, register this exact URL:',
            '   ' + redirectUri,
            '3. Also register any other domains you use:',
            '   ' + TIKTOK_OAUTH.registeredRedirectUris.join('\n   '),
            '4. If the app is in Staging: use Sandbox mode and add your TikTok account as a target user.',
            '5. Confirm client_key matches the app shown in Manage apps.',
            '6. Use https://www.tiktok.com/v2/auth/authorize/ (not the legacy /auth/authorize/ URL).',
            '',
            'Docs: https://developers.tiktok.com/doc/login-kit-web'
        ];
        if (errorType === 'client_key' || errorType === 'invalid_client') {
            lines.splice(4, 0, '→ client_key errors usually mean the app is in Staging without Sandbox target users, or Login Kit is not configured.');
        }
        if (errorType === 'redirect_uri') {
            lines.splice(4, 0, '→ redirect_uri must match a registered Login Kit Redirect URI character-for-character.');
        }
        return lines.join('\n');
    }

    global.TikTokOAuth = {
        config: TIKTOK_OAUTH,
        getApiBaseUrl: getApiBaseUrl,
        getRedirectUri: getRedirectUri,
        getHomeUrl: getHomeUrl,
        generateState: generateState,
        buildAuthUrl: buildAuthUrl,
        isRegisteredRedirectUri: isRegisteredRedirectUri,
        saveState: saveState,
        readState: readState,
        clearState: clearState,
        saveAuthCode: saveAuthCode,
        readAuthCode: readAuthCode,
        clearAuthCode: clearAuthCode,
        verifyState: verifyState,
        describeTikTokSetupError: describeTikTokSetupError
    };
})(window);
