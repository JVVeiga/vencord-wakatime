import definePlugin, { OptionType } from '@utils/types';
import { showNotification } from '@api/Notifications';
import { definePluginSettings } from '@api/Settings';

const MIN_INTERVAL_MS = 2 * 60 * 1000; // 2 minutos
let lastHeartbeatAt = 0;

const settings = definePluginSettings({
    apiKey: {
        type: OptionType.STRING,
        description: 'API Key for wakatime',
        default: '',
        isValid: (e: string) => (!e ? 'API Key is required' : true),
    },
    baseUrl: {
        type: OptionType.STRING,
        description: 'Base URL for WakaTime API',
        default: 'https://api.wakatime.com/api/v1',
        isValid: (e: string) => {
            try {
                new URL(e);
                return true;
            } catch {
                return 'Invalid URL';
            }
        },
    },
    proxyUrl: {
        type: OptionType.STRING,
        description: 'Proxy URL for WakaTime API',
        default: '',
        isValid: (e: string) => {
            if (!e) return true;
            try {
                new URL(e);
                return true;
            } catch {
                return 'Invalid Proxy URL';
            }
        },
    },
    machineName: {
        type: OptionType.STRING,
        description: 'Machine name',
        default: 'Unknown',
        isValid: (e: string) => (!e ? 'Machine name is required' : true),
    },
    projectName: {
        type: OptionType.STRING,
        description: 'Project Name',
        default: 'Discord',
        isValid: (e: string) => (!e ? 'Project name is required' : true),
    },
    debug: {
        type: OptionType.BOOLEAN,
        description: 'Enable debug logging',
        default: false,
    },
});

async function sendHeartbeat(time: number) {
    const key = settings.store.apiKey;
    if (!key) {
        showNotification({
            title: 'WakaTime',
            body: 'No API Key configured.',
            color: 'var(--red-360)',
        });
        return;
    }

    const baseUrl = settings.store.baseUrl;
    const proxyUrl = settings.store.proxyUrl;
    const requestUrl = proxyUrl || `${baseUrl}/users/current/heartbeats?api-key=${key}`;

    if (settings.store.debug) {
        console.log(`[WakaTime] Sending heartbeat to ${requestUrl}`);
    }

    const body = JSON.stringify({
        time: time / 1000,
        entity: 'Discord',
        type: 'app',
        project: settings.store.projectName,
        plugin: 'vencord/version discord-wakatime-proxy/v1.0.0',
    });

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Content-Length': new TextEncoder().encode(body).length.toString(),
        'X-Machine-Name': settings.store.machineName,
    };

    if (proxyUrl) {
        headers['X-Proxy-Url'] = baseUrl;
        headers['API-Key'] = key;
    }

    try {
        const res = await fetch(requestUrl, {
            method: 'POST',
            body,
            headers,
        });
        const data = await res.text();
        if (res.status < 200 || res.status >= 300) {
            console.error(`[WakaTime] Failed (${res.status}): ${data}`);
        }
    } catch (err) {
        console.error(`[WakaTime] Error:`, err);
    }
}

function shouldSendHeartbeat(): boolean {
    return Date.now() - lastHeartbeatAt > MIN_INTERVAL_MS;
}

function handleActivity() {
    if (shouldSendHeartbeat()) {
        lastHeartbeatAt = Date.now();
        sendHeartbeat(lastHeartbeatAt);
    }
}

export default definePlugin({
    name: 'wakatime-proxy',
    description: 'WakaTime plugin with proxy and smart heartbeat',
    authors: [
        {
            id: 846372672421101568n,
            name: 'João Veiga',
        },
    ],
    settings,
    start() {
        lastHeartbeatAt = 0;
        document.addEventListener('mousemove', handleActivity);
        document.addEventListener('keydown', handleActivity);
        document.addEventListener('click', handleActivity);

        if (settings.store.debug) {
            console.log('[WakaTime] Plugin started');
        }
    },
    stop() {
        document.removeEventListener('mousemove', handleActivity);
        document.removeEventListener('keydown', handleActivity);
        document.removeEventListener('click', handleActivity);
        if (settings.store.debug) {
            console.log('[WakaTime] Plugin stopped');
        }
    },
});
