const host = 'localhost';
const hostRmtp = 'localhost';

export const environment = {
    urlAuth: `http://${host}:3000/monitoreo/authentication/`,
    url: `http://${host}:3000/monitoreo/`,
    pagination: 20,
    production: false,
    sourceRmtp: `http://${hostRmtp}:8080/hls/stream.m3u8`
};
