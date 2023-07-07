const { Client, Webhook, WebhookClient, TextChannel } = require("discord.js");
/**
 *
 * @param {Client} bot
 */
function webhooks(bot) {
  return {
    async get(channelId) {
      let channel = await bot.channels.fetch(channelId);

      if (channel instanceof TextChannel) {
        /**
         * @type {Webhook[]}
         */
        let whs = await channel.fetchWebhooks();
        return whs.find((w) => w.owner.id === bot.user.id);
      }
    },
    async edit(channelId, messageId, name, avatar, message) {
      const channel = bot.channels.cache.get(channelId);
      try {
        if (channel instanceof TextChannel) {
          const webhooks = await channel.fetchWebhooks();
          let webhook = webhooks.find((wh) => wh.owner.id === bot.user.id);

          await webhook.editMessage(messageId, {
            content: message,
            username: name,
            avatarURL: avatar,
            allowedMentions: { parse: [] },
          });
        }
      } catch (error) {
        console.error("Error trying to send a message: ", error);
      }
    },
    async send(channelId, name, avatar, message) {
      const channel = bot.channels.cache.get(channelId);
      try {
        if (channel instanceof TextChannel) {
          const webhooks = await channel.fetchWebhooks();
          let webhook = webhooks.find((wh) => wh.owner.id === bot.user.id);

          if (!webhook) {
            webhook = await channel.createWebhook({
              name: name,
              avatar: avatar,
            });
          }

          await webhook.send({
            content: message,
            username: name,
            avatarURL: avatar,
            allowedMentions: { parse: [] },
          });
        }
      } catch (error) {
        console.error("Error trying to send a message: ", error);
      }
    },
  };
}

module.exports = webhooks;
