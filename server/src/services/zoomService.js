const axios = require('axios');
const qs = require('qs');

const clientId = process.env.ZOOM_CLIENT_ID;
const clientSecret = process.env.ZOOM_CLIENT_SECRET;
const accountId = process.env.ZOOM_ACCOUNT_ID;
const User = require('../models/user.model');

async function getAccessToken() {
    const response = await axios.post('https://zoom.us/oauth/token',
        qs.stringify({
            grant_type: 'account_credentials',
            account_id: accountId,
        }),
        {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }
    );
    return response.data.access_token;
}

async function createMeeting(topic, startTime, duration = 60) {
    const token = await getAccessToken();

    const response = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
            topic,
            type: 2,
            start_time: startTime,
            duration,
            timezone: 'Europe/Kiev',
            settings: {
                host_video: true,
                participant_video: true,
                join_before_host: true,
                waiting_room: false
            }
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );

    return response.data.join_url;
}
module.exports = { createMeeting };
