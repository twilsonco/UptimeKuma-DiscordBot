# Uptime Kuma Metrics API

This project reads the values from the metrics published by the Uptime Kuma service and creates an open API with simple information such as monitor name, monitor type, monitor URL, monitor hostname, monitor port, and status. The status is defined by Uptime Kuma metrics as follows:
- `1 = UP`
- `0 = DOWN`
- `2 = PENDING`
- `3 = MAINTENANCE`

The following instructions will guide you through setting up and using this code to fetch and display monitor data from Uptime Kuma in JSON format.

## Prerequisites

- PHP installed on your server.
- Uptime Kuma service running and accessible.
- API key generated from the Uptime Kuma dashboard.

## Setup Instructions

1. **Retrieve Your Metrics URL and API Key**
   - Navigate to your Uptime Kuma dashboard.
   - Go to `Settings` -> `API Keys`.
   - Generate and copy the API key.
   - Identify your Uptime Kuma metrics URL (usually in the form of `<yourURL>/metrics`).

2. **Configure the config.json file for the PHP Script**
   - Copy the PHP script provided below.
   - Set `uptimeKumaBase` to your Uptime Kuma URL to fetch metrics. (If you use a non-standard metrics URL, then set the endpoint correctly in the php script at [line 32](back-end.php#L32))
   - Set `uptimeKumaAPIKey` to your API key from step 1.

3. **That's it!** Now please start with the Discord Bot setup.


### Code Pieces Referenced by Lines
- **[Lines 4-33](back-end.php#L4-L33)**: Define the URL and API key for the metrics endpoint.
- **[Lines 41-55](back-end.php#L41-L55)**: Initialize a new cURL session with the given URL, then fetch, store, and get status of the response before closing the session.
- **[Line 58](back-end.php#L58)**: Check if the request was successful by comparing the HTTP status code to 200.
- **[Lines 60-83](back-end.php#L60-L83)**: If the request was successful, parse the response using a regular expression to extract relevant data, and construct an array of the parsed data.
- **[Lines 87-89](back-end.php#L87-L89)**: Set the content type of the response to JSON and output the data in JSON format.
- **[Line 92](back-end.php#L92)**: Output an error message if the request was not successful, including the HTTP status code in the message.
