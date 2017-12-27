# THIS PROJECT IS DEPRECATED

Kazoo-UI is not maintained by 2600Hz anymore, we encourage you to use [Monster-UI](https://github.com/2600hz/monster-ui) instead.

If you want to keep adding features to Kazoo-UI, feel free to fork it and we will be more than happy to link your project here as an alternative solution

---

# Kazoo-UI [![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)

Note that [Kazoo](https://github.com/2600hz/kazoo)'s default listening port is `8000`.
[Kazoo-UI](https://github.com/2600hz/kazoo-ui) is a static website project that uses Kazoo's API.
Thus all one needs to configure is:
1. `WEB`: the transport protocol (either `http` or `https`),
1. `HOST`: host name (`api.zswitch.net` or `127.0.0.1` or `localhost` or any IP address or hostname)
1. `PORT`: and server port (`8443` or `80` or whatever available number)
    * Note that if your OS is already running Kazoo, port `8000` is alreay devoted to the Kazoo API server

## Quick setup & launch

- Get Kazoo-UI from GitHub
```shell
git clone git@github.com:2600hz/kazoo-ui.git kazoo-ui.git
```

- Edit `config/config.js`'s `api_url` fields with the above information
```js
api_url: 'https://api.zswitch.net:8443/v1'
```
becomes
```js
api_url: 'WEB://HOST:PORT/v1'
```
*`WEB`, `HOST` & `PORT` replaced by the values you picked.*

- Serve this static website's content
```shell
cd kazoo-ui.git
python -m SimpleHTTPServer 3333
```

Your own version of Kazoo-UI is now up and running at [http://localhost:3333/](http://localhost:3333/)!
