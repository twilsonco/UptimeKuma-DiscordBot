# UptimeKuma-DiscordBot

## Prerequisites

- **NodeJS**: [NodeJS](https://nodejs.org/en)
- **DiscordJS**: [DiscordJS](https://discord.js.org/)
- **axios**: [axios](https://www.npmjs.com/package/axios)

## Setup Instructions

### Create a configuration file by copying [`config.example.json`](../config.example.json) to `config.json`:

  ```json
 {
     "token": "<token>",
     "guildID": "<guildID>",
     "channelID": "<channelID>",
     "clientID": "<clientID i.e. Application ID>",
     "updateTime": 60,
     "embedColor": "#0099ff",
     "uptimeKumaAPIKey": "<uptimeKumaAPIKey>",
     "urls": {
         "uptimeKumaBase": "<uptime_kuma_base_url>",
         "uptimeKumaDashboard": "<uptime_kuma_dashboard_url>",
         "backend": "http://localhost/back-end.php"
     },
     "monitorGroups": {
         "Gaming": ["Lobby", "Skyblock", "Survival", "Creative", "KitPvP", "Factions", "Prison", "Skywars"],
         "Discord": ["Discord bot", "Status bot"],
         "Web": ["web1", "web2", "web3"]
     }
 }
  ```

1. Set up your Discord bot configuration in `config.json`:
   - `token`: Your Discord bot token
   - `guildID`: The ID of your Discord server
   - `channelID`: The ID of the channel where status updates will be posted
   - `clientID`: Your Discord application ID
   - `uptimeKumaAPIKey`: Your Uptime Kuma API key

2. Configure your backend and Uptime Kuma URLs in the `urls` section of `config.json`. You'll need to set:
   - `uptimeKumaBase`: The base URL for your Uptime Kuma API
   - `uptimeKumaDashboard`: The URL to your Uptime Kuma dashboard interface
   - `backend`: Your backend service URL to the php script. **If you are using the Docker setup, then leave this as is.**

3. Create and group your dashboards by configuring the `monitorGroups` section in `config.json`. Each group should be defined with a name and an array of monitor names. The monitor names must match exactly the "Friendly Name" as in your Uptime Kuma monitor list. For example:
   ```
   "monitorGroups": {
     "Gaming": ["Lobby", "Skyblock", "Survival", "Creative", "KitPvP"],
     "Discord": ["Discord bot", "Status bot"],
     "Web": ["web1", "web2", "web3"]
   }
   ```
   You can create as many groups as you need, and each group can contain any number of monitors. The group names (like "Gaming", "Discord", "Web") will be used as the dashboard section titles.

4. To add a new monitor group, simply add another entry to the `monitorGroups` object in `config.json` with your desired group name and an array of the monitors you want to include in that group.

5. Customize the embed appearance by modifying these values in `config.json`:
   - `embedColor`: Set this to your preferred HEX color code (e.g., "#0099ff")

6. `updateTime` is the duration (in seconds) between status updates in the Discord channel.

The embed will display your monitor statuses with the specified color and include footer showing the last update time, along with a link to your Uptime Kuma dashboard.

## Code Pieces Referenced by Lines

- **[Lines 1-4](index.js#L1-L4)**: Import required modules.
- **[Lines 6-50](index.js#L6-L50)**: Setup loading and real-time checking of config file, and load the config file.
- **[Lines 52-58](index.js#L52-L58)**: Initialize the Discord client with required intents.
- **[Lines 60-63](index.js#L60-L63)**: Initialize `monitorMessages` object to store monitor message IDs.
- **[Lines 65-77](index.js#L65-L77)**: Event listener for when the bot is ready, fetching the channel and clearing it.
- **[Lines 79-120](index.js#L79-L120)**: Function to update monitor messages, fetch guild and channel, and make HTTP requests to get monitor data.
- **[Lines 122-171](index.js#L122-L171)**: Function to send or update monitor messages in the channel based on category.
- **[Lines 173-181](index.js#L173-L181)**: Function to clear messages in a channel.
- **[Lines 183-185](index.js#L183-L185)**: Log in to Discord with the bot token from the config.
