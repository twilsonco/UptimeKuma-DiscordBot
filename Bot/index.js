const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Initialize monitorMessages with all groups from config
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
    // Call the function to update messages immediately
    await updateMessages();
    // Set interval to update messages every 30 seconds
    setInterval(updateMessages, config.updatetime * 1000);
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

        const response = await axios.get(config.urls.backend);
        const monitors = response.data;

        // Process each monitor group from config
        for (const [groupName, monitorNames] of Object.entries(config.monitorGroups)) {
            const groupMonitors = monitors.filter(monitor => 
                monitorNames.includes(monitor.monitor_name)
            );
            await sendMonitorsMessage(channel, groupName, groupMonitors);
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