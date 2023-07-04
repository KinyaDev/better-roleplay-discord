const { ButtonInteraction } = require("discord.js");
const { GuildAPI } = require("../modules/db");

/**
 *
 * @param {ButtonInteraction} interaction
 * @param {*} db
 */
let showChara = async (interaction, db) => {
  if (interaction.customId === "charas-select") {
    let charas = await db.getCharas();
    let charaName = interaction.values[0];
    let langdata = await new GuildAPI(interaction.guildId).getLangData();

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
};

module.exports = showChara;
