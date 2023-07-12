const { Client, Message } = require("discord.js");
const {
  CharactersAPI,
  GuildAPI,
  AutoProxyAPI,
  parseCharaMessage,
} = require("../modules/db");
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

  function parse(str) {
    return str
      .replace(/ +/gi, "")
      .replace(/(\<\#)/gi, "")
      .replace(/\>/gi, "");
  }
  let mention = parse(message.content);
  if (mention === client.user.id) {
    require("../interactions/help").runMessage(client, message);
  }

  let db = new CharactersAPI(message.author.id);
  let chara = await db.getSelected();
  let charas = await db.getCharas();

  if (message.reference) {
    const repliedTo = await message.channel.messages.fetch(
      message.reference.messageId
    );
    for (let chara of charas) {
      if (chara && repliedTo.author.username === chara.name) {
        let msg = message.content;
        if (!(msg.startsWith("\\") || msg.startsWith("("))) {
          if (msg === "`delete`") {
            repliedTo.delete();
            message.delete();
          } else {
            webhookify.edit(
              message.channel.id,
              repliedTo.id,
              chara.name,
              chara.avatar || message.author.displayAvatarURL(),
              await parseCharaMessage(chara, db, message)
            );

            message.delete();
          }
        }
      }
    }
  } else {
    let charas = await db.getCharas();
    for (let chara of charas) {
      if (chara.bracket) {
        let splitted = chara.bracket.split("text");
        if (
          message.content.startsWith(splitted[0]) &&
          message.content.endsWith(splitted[1])
        ) {
          await webhookify.send(
            message.channel.id,
            chara.name,
            chara.avatar || message.author.displayAvatarURL(),
            (await parseCharaMessage(chara, db, message))
              .replace(new RegExp(`^(${splitted[0]})`), "")
              .replace(new RegExp(`(${splitted[1]})$`), "")
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
        await webhookify.send(
          message.channelId,
          chara.name,
          chara.avatar || message.author.displayAvatarURL(),
          parseCharaMessage(chara, db, message.content)
        );

        message.delete();
      }
    }
  }
};
