const config = window['appConfig'] || { host: 'localhost', hostRmtp: 'localhost' };

export const environment = {
    urlAuth: `http://${config.host}:3000/monitoreo/authentication/`,
    url: `http://${config.host}:3000/monitoreo/`,
    pagination: 20,
    production: false,
    sourceRmtp: `http://${config.hostRmtp}:8080/hls/stream.m3u8`
};
