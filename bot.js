const {
  Client,
  REST,
  GatewayIntentBits,
  Routes,
  Events,
  ActivityType,
} = require("discord.js");

const fs = require("fs");

const env = require("./modules/env");
const { autoProxy, guild, users } = require("./modules/db");

const path = require("path");
const { CharaEmbed } = require("./modules/embeds");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.once(Events.ClientReady, async (c) => {
  console.log(
    `Ready! Logged in ${c.guilds.cache.size} servers as ${c.user.tag}`
  );

  client.user.setActivity({
    type: ActivityType.Listening,
    name: "Ping me for help or use /help",
  });
});

const webhookify = require("./modules/webhooks")(client);

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(env.TOKEN);

client.commands = new Map();

let files = fs.readdirSync(path.join(__dirname, "interactions"), "utf-8");

files.forEach((f) => {
  if (f.endsWith(".js")) {
    let name = f.replace(".js", "");
    let req = require(path.join(__dirname, "interactions", f));

    if (req) {
      client.commands.set(req.data.name, req);
      if (req.data) {
        console.log(`Registered /${name} command.`);
      } else {
        console.log(`Failed to load ${f}.`);
      }
    } else {
      console.log(`Failed to load ${f}.`);
    }
  }
});
// and deploy your commands!
(async () => {
  try {
    let commands = [];
    client.commands.forEach((v, k) => {
      commands.push(v.data);
    });

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(Routes.applicationCommands(env.CLIENT_ID), {
      body: commands,
    });

    console.log(
      `Successfully loaded ${commands.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();

client.on(Events.InteractionCreate, async (interaction) => {
  let db = users(interaction.member.id);
  let g = guild(interaction.guildId);
  let langdata = await g.getLangData();
  g.init();

  if (interaction.isCommand()) {
    try {
      await interaction.deferReply({ fetchReply: true, ephemeral: true });
      await client.commands
        .get(interaction.commandName)
        .run(client, interaction, db, langdata);
    } catch (e) {
      console.error(e);
    }

    console.log(
      `${interaction.member.user.tag} just used ${interaction.commandName}`,
      interaction.options.data
    );
  } else if (interaction.isButton()) {
    if (interaction.customId === "use-chara") {
      let charaName = interaction.message.embeds[0].title;
      let footer = interaction.message.embeds[0].footer.text;
      let charas = await db.getCharas();

      let member = await interaction.message.guild.members.fetch(
        footer.split("-")[0].replace(" ", "")
      );

      let ok = false;
      charas.forEach((chara) => {
        if (!ok) {
          if (chara.name === charaName) {
            db.select(chara._id);

            interaction.message.channel
              .send(
                langdata.use
                  .replace("$1", interaction.member)
                  .replace("$2", chara.name)
              )
              .then((m) =>
                setTimeout(() => {
                  m.delete();
                }, 3000)
              );

            ok = true;
          }
        }
      });
    } else if (interaction.customId === "ask") {
      interaction.reply({
        content: "Send now your question here.",
        ephemeral: true,
      });

      const msg_filter = (m) => m.author.id === interaction.user.id;
      const collected = await interaction.channel.awaitMessages({
        filter: msg_filter,
        max: 1,
      });

      let questionChannel = await interaction.guild.channels.fetch(
        "1124969295370272860"
      );

      let msg = collected.first();
      questionChannel.send(`${msg.author}'s question: ${msg.content}`);
      interaction.deleteReply();

      msg.delete();
    }
  } else if (interaction.customId === "charas-select") {
    let charas = await db.getCharas();
    let charaName = interaction.values[0];

    let ok = false;
    charas.forEach(async (chara, i) => {
      if (chara.name === charaName) {
        if (!ok) {
          await db.select(chara._id);

          interaction.message.channel.send(
            langdata.use
              .replace("$1", interaction.member)
              .replace("$2", chara.name)
          );

          ok = true;
        }
      }
    });
  }
});

client.on("guildCreate", async (guild) => {
  (await guild.fetchOwner()).send({
    content:
      "Hello! Thanks for inviting the bot on your server! If you have any issues with Better Roleplay, let tell us on the support server: https://discord.gg/nSedrBpthS.",
  });

  console.log("I have been invited on the server: " + guild.name);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  let mention = message.mentions.users.first();
  if (mention && mention.id === client.user.id) {
    require("./interactions/help").runMessage(client, message);
  }

  let db = users(message.author.id);
  let chara = await db.getSelected();

  if (message.reference) {
    const repliedTo = await message.channel.messages.fetch(
      message.reference.messageId
    );

    if (chara && repliedTo.author.username === chara.name) {
      let msg = message.content;
      if (!(msg.startsWith("\\") || msg.startsWith("("))) {
        if (msg === "`delete`") {
          repliedTo.delete();
          message.delete();
        } else {
          (await db.getStats()).forEach((s, i) => {
            msg = msg.replace(`$${i}`, `${s.name}: ${s.value}`);
          });

          webhookify.edit(
            message.channel.id,
            repliedTo.id,
            chara.name,
            chara.avatar || message.author.displayAvatarURL(),
            msg
          );

          message.delete();
        }
      }
    }
  }

  let autoproxy = autoProxy(message.author.id);
  autoproxy.init();
  let channels = await autoproxy.channels();
  if (channels) {
    if (
      !message.reference &&
      channels.includes(message.channelId) &&
      !(message.content.startsWith("\\") || message.content.startsWith("("))
    ) {
      if (chara) {
        let stats = await db.getStats();
        let msg = message.content;
        stats.forEach((s, i) => {
          msg = msg.replace(`$${i}`, `${s.name}: ${s.value}`);
        });

        await webhookify.send(
          message.channelId,
          chara.name,
          chara.avatar || message.author.displayAvatarURL(),
          msg
        );

        message.delete();
      }
    }
  }
});

client.login(env.TOKEN);
