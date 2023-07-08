const { watchFile } = require("fs");
let client = require("./bot");
let dashbordServer = require("./dashbord");
require("dotenv").config();
const chokidar = require("chokidar");

chokidar.watch(`${__dirname}/bot.js`).on("change", (path, stats) => {
  if (client.isReady()) {
    client.destroy();
    client.login(process.env.TOKEN).then(() => {
      console.log("Better Roleplay has restarted. ");
    });
  } else {
    client.login(process.env.TOKEN);
  }

  client = require("./bot");
});

chokidar.watch(`${__dirname}/dashbord.js`).on("change", (path, stats) => {
  if (dashbordServer.server.listening) {
    dashbordServer = require("./dashbord");
    dashbordServer.server.close();
    dashbordServer.server.listen(dashbordServer.app.get("port"), () => {
      console.log(
        "Web server restarted and listening on port:" +
          dashbordServer.app.get("port")
      );
    });
  }
});
