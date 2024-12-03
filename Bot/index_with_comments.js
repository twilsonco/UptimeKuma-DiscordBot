// Import required classes from discord.js and axios for making HTTP requests
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// Validate the config object
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

// Function to load config
function loadConfig() {
    try {
        const newConfig = JSON.parse(fs.readFileSync('../config.json', 'utf8'));
        return validateConfig(newConfig);
    } catch (error) {
        console.error('Error loading config:', error);
        return null;
    }
}

let config = loadConfig();

// Watch for config file changes
fs.watch('../config.json', (eventType, filename) => {
    if (eventType === 'change') {
        console.log('Config file changed, reloading...');
        const newConfig = loadConfig();
        if (newConfig) {
            config = newConfig;
            console.log('Config reloaded successfully');
            // Optionally trigger an immediate update
            updateMessages().catch(console.error);
        }
    }
});

// Create a new Discord client instance with specified intents
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

// Event listener for when the bot is ready
client.once('ready', async () => {
    console.log('Bot is online!');

    // Fetch the channel using the channel ID from the config
    const channel = await client.channels.fetch(config.channelID);
    
    if (channel && channel.isTextBased()) {
        // Clear the channel if it's a text-based channel
        await clearChannel(channel);
    } else {
        console.error(`Unable to find text channel with ID ${config.channelID}`);
    }

    // Call the function to update messages immediately
    await updateMessages();
    // Set interval to update messages every configured seconds
    setInterval(updateMessages, config.updatetime * 1000);
});

// Function to update monitor messages
async function updateMessages() {
    try {
        // Fetch the guild using the guild ID from the config
        const guild = await client.guilds.fetch(config.guildID);
        if (!guild) {
            console.error(`Unable to find guild with ID ${config.guildID}`);
            return;
        }

        // Fetch the channel using the channel ID from the config
        const channel = await guild.channels.fetch(config.channelID);
        if (!channel || !channel.isTextBased()) {
            console.error(`Unable to find text channel with ID ${config.channelID}`);
            return;
        }

        // Make a GET request to the backend to fetch monitor data
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

// Function to send or update a monitor message in the channel
async function sendMonitorsMessage(channel, category, monitors) {
    // Create the description for the embed message
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

    // Create the embed message
    let embed = new EmbedBuilder()
        .setTitle(`${category} Monitor`)
        .setColor(config.embedColor)
        .setDescription(description)
        .setFooter({ text: `Last updated: ${new Date().toLocaleString()}` })
        .setURL(config.urls.uptimeKumaDashboard);

    try {
        // Check if there is an existing message to update or send a new one
        if (monitorMessages[category]) {
            const message = await channel.messages.fetch(monitorMessages[category]);
            if (message) {
                // Update the existing message
                await message.edit({ embeds: [embed] });
                console.log(`${new Date().toLocaleString()} | Updated ${category} monitors message`);
            } else {
                // Send a new message if the existing one was not found
                const newMessage = await channel.send({ embeds: [embed] });
                monitorMessages[category] = newMessage.id;
                console.log(`${new Date().toLocaleString()} | Sent new ${category} monitors message`);
            }
        } else {
            // Send a new message if there is no existing message ID
            const newMessage = await channel.send({ embeds: [embed] });
            monitorMessages[category] = newMessage.id;
            console.log(`${new Date().toLocaleString()} | Sent ${category} monitors message`);
        }
    } catch (error) {
        console.error(`Failed to send/update ${category} monitors message:`, error);
    }
}

// Function to clear the messages in a channel
async function clearChannel(channel) {
    try {
        // Fetch all messages in the channel and bulk delete them
        const fetchedMessages = await channel.messages.fetch();
        await channel.bulkDelete(fetchedMessages);
        console.log('Cleared channel');
    } catch (error) {
        console.error('Error clearing channel:', error);
    }
}

// Log in to Discord with the bot token from the config
client.login(config.token).catch(error => {
    console.error('Error logging in:', error);
});
