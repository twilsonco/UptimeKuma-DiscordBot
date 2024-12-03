[![GitHub stars](https://img.shields.io/github/stars/Lauwy222/UptimeKuma-DiscordBot.svg?style=social&label=Star&maxAge=2592000)](https://github.com/Lauwy222/UptimeKuma-DiscordBot/stargazers/)
[![GitHub forks](https://img.shields.io/github/forks/Lauwy222/UptimeKuma-DiscordBot.svg?style=social&label=Fork&maxAge=2592000)](https://github.com/Lauwy222/UptimeKuma-DiscordBot/network/)

# Uptime Kuma X Discord

You might have wondered if there's a tool to set your service statuses in Discord, whether it's your Minecraft server or your website. There are players who are curious to see the status but are too lazy to open the URL.

You've found the tool! 😄

As you can see in the screenshot below, the bot is able to send a message on a certain interval and edit it. With the help of a couple of emojis, it is clear for your audience if something is happening with the services.

![Screenshot](https://github.com/Lauwy222/UptimeKuma-DiscordBot/assets/24575818/b52dd1d8-8555-462d-8670-b1c6a5192496)

## Installation and Configuration:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/twilsonco/UptimeKuma-DiscordBot.git
   cd UptimeKuma-DiscordBot
   ```

2. **Install Uptime Kuma and configure it:**

3. **[Create a Discord bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)**

4. **Choose your setup method:**

   - **Standard Setup**
     1. Create a web server capable of running PHP
     2. [Install Node JS](https://discordjs.guide/preparations/)

   - **Docker Setup**
     - Either use docker-compose:
        - Modify the paths in `docker-compose.yml` to match your system
        - Run `docker-compose up -d`
     
     - Or use these docker commands:
        ```bash
        # Build the image
        docker build -t uptime-kuma-discord-bot /path/to/UptimeKuma-DiscordBot

        # Run the container
        docker run -d \
          --name uptime-kuma-discord-bot \
          -v /path/to/config.json:/app/config.json:ro \
          -e TZ=<YourTimeZone> \
          --network bridge \
          uptime-kuma-discord-bot
        ```
     - Replace `/path/to/UptimeKuma-DiscordBot` and `/path/to/config.json` with the actual paths on your system
     - *Lookup your time zone string on [Wikipedia](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)*

5. **[Follow these back-end instructions](Web/setup.md)**
6. **[Follow these bot instructions](Bot/setup.md)**

## Future Plans:

We plan to implement Uptime Kuma Incidents report in a Discord Embed. Currently, it's not possible because Uptime Kuma doesn't share this data in its metrics API.

**Feel free to fork or reuse this code!**

For any assitance or information, I kindly redirect you to [my Discord account](https://discord.com/users/157514976804864000).

### Keywords:
- Minecraft server status
- Discord bot integration
- Uptime monitoring
- Service status updates
- Discord notifications
- Interval-based messaging
- Emojis for service status
- Uptime Kuma integration
- Uptime Kuma Discord bot
- Uptime Kuma Discord integration
- Discord Embeds for server status
