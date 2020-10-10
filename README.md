# Minecraft Classic Multiplayer Server

[Minecraft Classic](https://classic.minecraft.net) is an early version of Minecraft that Mojang have made publicly available on their website. Although it is a very simple game, a niché speedrunning community sprung up around it in 2020. Unfortunately Mojang shut down the Minecraft Classic multiplayer servers in 2019, and have never put them back up.

Although the actual multiplayer code is peer-to-peer, the client relies on a web server to orchestrate the creation of the peer-to-peer connection. This project implements all the needed WebSocket and HTTP APIs used by Minecraft Classic, so that players can (with some work) play with friends.

# Installing (server)

Clone this repo onto a server. Make sure NodeJS and Yarn are installed, then run `yarn install` in the cloned directory. Finally run `yarn dev` to start the server (production mode is not yet implemented).

The server can be configured by setting the environment variables `URL` and `PORT` to the public-facing URL/IP of your server and the port you want the application to listen to, respectively.

# Using (client)

Since this is a third party server, some work has to be done on the client side to use it instead of Mojang's official server. You will need a browser extension that's capable of redirecting requests, so that the requests that would normally go to Mojang can instead go to your own server. More details on this in [`docs/using.md`](https://github.com/birjolaxew/minecraft-classic-multiplayer/blob/master/docs/using.md).