import definePlugin, { OptionType } from '@utils/types';
import { showNotification } from '@api/Notifications';
import { definePluginSettings } from '@api/Settings';

const settings = definePluginSettings({
    apiKey: {
        type: OptionType.STRING,
        description: 'API Key for wakatime',
        default: '',
        isValid: (e: string) => {
            if (!e) return 'API Key is required';
            return true;
        },
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
        isValid: (e: string) => {
            if (!e) return 'Machine name is required';
            return true;
        },
    },
    projectName: {
        type: OptionType.STRING,
        description: 'Project Name',
        default: 'Discord',
        isValid: (e: string) => {
            if (!e) return 'Project name is required';
            return true;
        },
    },
    debug: {
        type: OptionType.BOOLEAN,
        description: 'Enable debug logging',
        default: false,
    },
});

async function sendHeartbeat(time) {
    const key = settings.store.apiKey;
    if (!key) {
        showNotification({
            title: 'WakaTime',
            body: 'No api key for wakatime is setup.',
            color: 'var(--red-360)',
        });
        return;
    }

    const baseUrl = settings.store.baseUrl;
    const proxyUrl = settings.store.proxyUrl;

    const requestUrl = proxyUrl || `${baseUrl}/users/current/heartbeats?api-key=${key}`;
    if (settings.store.debug) {
        console.log(`Sending heartbeat to ${requestUrl}`);
        console.log(`Time: ${time / 1000}, Entity: Discord, Type: app, Project: ${settings.store.projectName}, Plugin: vencord/version discord-wakatime/v0.0.1`);
    }

    const body = JSON.stringify({
        time: time / 1000,
        entity: 'Discord',
        type: 'app',
        project: settings.store.projectName,
        plugin: 'vencord/version discord-wakatime-proxy/v1.0.0',
    });

    const headers = {
        'Content-Type': 'application/json',
        'Content-Length': new TextEncoder().encode(body).length.toString(),
        'X-Machine-Name': settings.store.machineName,
    };
    if (proxyUrl) {
        headers['X-Proxy-Url'] = baseUrl;
        headers['API-Key'] = key;
    }

    const response = await fetch(requestUrl, {
        method: 'POST',
        body: body,
        headers: headers,
    });
    const data = await response.text();
    if (response.status < 200 || response.status >= 300) {
        console.error(`Error sending heartbeat: ${response.status} - ${data}`);
    }
}

export default definePlugin({
    name: 'wakatime-proxy',
    description: 'Wakatime plugin with proxy support',
    authors: [
        {
            id: 846372672421101568n,
            name: 'João Veiga',
        },
    ],
    settings,
    start() {
        const minutesInMilliseconds = 120000; // 2 minutes
        this.updateInterval = setInterval(async () => {
            const time = Date.now();
            await sendHeartbeat(time);
        }, minutesInMilliseconds);
        console.log('Initializing WakaTime');
    },
    stop() {
        clearInterval(this.updateInterval);
        console.log('Unloading WakaTime');
    },
});
