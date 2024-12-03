const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

function validateConfig(config) {
    const requiredFields = [
        'token',
        'guildID',
        'channelID',
        'clientID',
        'updateTime',
        'embedColor',
        'urls',
        'monitorGroups',
        'uptimeKumaAPIKey'
    ];

    for (const field of requiredFields) {
        if (!(field in config)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    return config;
}

function loadConfig() {
    try {
        const newConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf8'));
        return validateConfig(newConfig);
    } catch (error) {
        console.error('Error loading config:', error);
        return null;
    }
}

let config = loadConfig();

fs.watch(path.join(__dirname, '../config.json'), (eventType, filename) => {
    if (eventType === 'change') {
        console.log('Config file changed, reloading...');
        const newConfig = loadConfig();
        if (newConfig) {
            config = newConfig;
            console.log('Config reloaded successfully');
            updateMessages().catch(console.error);
        }
    }
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let monitorMessages = Object.keys(config.monitorGroups).reduce((acc, groupName) => {
    acc[groupName] = null;
    return acc;
}, {});

client.once('ready', async () => {
    console.log('Bot is online!');

    const channel = await client.channels.fetch(config.channelID);
if (channel && channel.isTextBased()) {
    await clearChannel(channel);
} else {
    console.error(`Unable to find text channel with ID ${config.channelID}`);
}
    await updateMessages();
    console.log('Sleeping for', config.updateTime, 'seconds');
    setInterval(updateMessages, config.updateTime * 1000);
});

async function updateMessages() {
    try {
        const guild = await client.guilds.fetch(config.guildID);
        if (!guild) {
            console.error(`Unable to find guild with ID ${config.guildID}`);
            return;
        }

        const channel = await guild.channels.fetch(config.channelID);
        if (!channel || !channel.isTextBased()) {
            console.error(`Unable to find text channel with ID ${config.channelID}`);
            return;
        }

        try {
            console.log('Attempting to fetch from:', config.urls.backend);
            const response = await axios.get(config.urls.backend);
            console.log('Response received:', response.status);
            const monitors = response.data;
            if (!Array.isArray(monitors)) {
                console.error('Monitors is not an array:', monitors);
                return;
            }
            for (const [groupName, monitorNames] of Object.entries(config.monitorGroups)) {
                const groupMonitors = monitors.filter(monitor => 
                    monitorNames.includes(monitor.monitor_name)
                );
                await sendMonitorsMessage(channel, groupName, groupMonitors);
            }
        } catch (error) {
            console.error('Error details:', {
                config: error.config,
                url: config.urls.backend,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function sendMonitorsMessage(channel, category, monitors) {
    let description = monitors.map(monitor => {
        let statusEmoji = '';
        switch (monitor.status) {
            case 0:
                statusEmoji = '🔴'; // Offline
                break;
            case 1:
                statusEmoji = '🟢'; // Online
                break;
            case 2:
                statusEmoji = '🟡'; // Warning
                break;
            case 3:
                statusEmoji = '🔵'; // Maintenance
                break;
            default:
                statusEmoji = '❓'; // Unknown
        }
        return `${statusEmoji} | ${monitor.monitor_name}`;
    }).join('\n');

    let embed = new EmbedBuilder()
        .setTitle(`${category} Monitor`)
        .setColor(config.embedColor)
        .setDescription(description)
        .setFooter({ text: `Last updated: ${new Date().toLocaleString()}` })
        .setURL(config.urls.uptimeKumaDashboard);

    try {
        
        if (monitorMessages[category]) {
            const message = await channel.messages.fetch(monitorMessages[category]);
            if (message) {
                await message.edit({ embeds: [embed] });
                console.log(`${new Date().toLocaleString()} | Updated ${category} monitors message`);
            } else {
                const newMessage = await channel.send({ embeds: [embed] });
                monitorMessages[category] = newMessage.id;
                console.log(`${new Date().toLocaleString()} | Sent new ${category} monitors message`);
            }
        } else {
            const newMessage = await channel.send({ embeds: [embed] });
            monitorMessages[category] = newMessage.id;
            console.log(`${new Date().toLocaleString()} | Sent ${category} monitors message`);
        }
    } catch (error) {
        console.error(`Failed to send/update ${category} monitors message:`, error);
    }
}

async function clearChannel(channel) {
    try {
        const fetchedMessages = await channel.messages.fetch();
        await channel.bulkDelete(fetchedMessages);
        console.log('Cleared channel');
    } catch (error) {
        console.error('Error clearing channel:', error);
    }
}

client.login(config.token).catch(error => {
    console.error('Error logging in:', error);
});