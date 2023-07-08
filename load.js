const { Client } = require("discord.js");
const { readdirSync } = require("fs");

async function loadCommands(client) {
  const ascii = require("ascii-table");
  const table = new ascii().setHeading("Commands", "Status");

  await client.commands.clear();

  const Files = await loadFiles("interactions");
  Files.forEach((file) => {
    const command = require(file);
    client.commands.set(command.data.name, command);
    table.addRow(command.data.name, "✅");
  });

  console.log(table.toString(), "commands loaded");
}

async function loadFiles(dirName) {
  let path = (process.cwd() + `/${dirName}`).replace(/\\/g, "/");
  let files = readdirSync(path, "utf-8").map((f) => `${path}/${f}`);
  files.forEach((file) => delete require.cache[require.resolve(file)]);

  return files;
}

/**
 *
 * @param {Client} client
 */
async function loadEvents(client) {
  const ascii = require("ascii-table");
  const table = new ascii().setHeading("Events", "Status");

  await client.events.clear();

  const files = await loadFiles("events");
  files.forEach((file) => {
    const event = require(file);
    let name = file.split("/").reverse()[0].replace(".js", "");
    client.events.set(name, event);
    table.addRow(name, "✅");
  });

  client.removeAllListeners();

  client.events.forEach(async (val, key) => {
    client.addListener(key, async (args) => {
      await val(client, args);
    });
  });

  console.log(table.toString(), "events loaded");
}

module.exports = { loadCommands, loadFiles, loadEvents };
