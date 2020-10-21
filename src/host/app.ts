import yargs from "yargs/yargs";
import { resolve as resolvePath, dirname } from "path";
import { constants as FS } from "fs";
import { promises as fs } from "fs";
import PeerClient from "./client";
import Connection from "./communication/connection";
import { codeFromURL } from "../utils";
import World from "./game/world";
import PeerHost from "./host";

const argv = yargs(process.argv.slice(2))
    .command("$0 [file] [url]", "Host a game of Minecraft Classic", (yargs) => {
        yargs
            .positional("file", {
                describe: "Name of world data in storage folder",
                default: "world",
            })
            .positional("url", {
                describe: "URL of game to copy world from",
            });
    })
    .option("server", {
        default: "http://localhost:9876",
        describe: "Address of web server used finding peers",
    })
    .option("player-limit", {
        default: 10,
        describe: "Maximum number of players that can join at a time",
        type: "number",
    })
    .option("storage", {
        default: "./worlds",
        describe: "Directory to store world data in",
        coerce: resolvePath,
    })
    .help().argv;

type Args = typeof argv & { file: string; url?: string };
(async (args: Args) => {
    const worldPath = resolvePath(args.storage, args.file);
    const worldExists = await fs
        .stat(worldPath)
        .then((stat) => stat.size > 0)
        .catch((_) => false);

    // exit if we would overwrite an existing world file
    if (args.url && worldExists) {
        console.error(
            `World file would be overwritten. Delete ${worldPath} and try again`
        );
        process.exit(1);
    }

    // make sure we have the directory for our world file
    if (!worldExists) {
        await fs.mkdir(dirname(worldPath), { recursive: true });
    }

    // open the file and start working
    let file: fs.FileHandle;
    try {
        file = await fs.open(worldPath, FS.O_RDWR | FS.O_CREAT);
        let client: PeerClient;
        let world: World;
        let clientConnection: Connection;
        // fetch world from remote, or generate it ourselves
        if (args.url) {
            clientConnection = new Connection(args.server);
            clientConnection.connect(codeFromURL(args.url));
            client = new PeerClient(clientConnection);
            world = await client.fetchWorld();
        } else {
            world = new World(Math.floor(99999999999999 * Math.random())); // same upper limit as used by Minecraft Classic
        }

        // setup our host
        const connection = new Connection(args.server);
        await connection.connect("host");
        const host = new PeerHost(connection, world);

        if (client) {
            clientConnection?.close();
            client?.message(
                `map is now hosted at classic.minecraft.net/?join=${connection.gameCode}`
            );
            client?.close();
        }
    } finally {
        file?.close();
    }
})(argv as Args).catch((e) => {
    console.error("Error while executing:");
    console.error(e);
    process.exit(1);
});