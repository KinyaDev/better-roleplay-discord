const { Client, Message } = require("discord.js");
const { CharactersAPI, GuildAPI, AutoProxyAPI } = require("../modules/db");
const webhooks = require("../modules/webhooks");

/**
 *
 * @param {Client} client
 * @param {Message} message
 * @returns
 */
module.exports = async (client, message) => {
  let webhookify = webhooks(client);
  if (message.author.bot) return;

  let mention = message.mentions.users.first();
  if (mention && mention.id === client.user.id) {
    require("../interactions/help").runMessage(client, message);
  }

  let db = new CharactersAPI(message.author.id);
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

  let autoproxy = new AutoProxyAPI(message.author.id);
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
};
