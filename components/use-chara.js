const { ButtonInteraction } = require("discord.js");
const { GuildAPI } = require("../modules/db");

/**
 *
 * @param {ButtonInteraction} interaction
 * @param {*} db
 */
module.exports = async function useChara(interaction, db) {
  if (interaction.customId === "use-chara") {
    let charaName = interaction.message.embeds[0].title;
    let footer = interaction.message.embeds[0].footer.text;
    let charas = await db.getCharas();
    let langdata = await new GuildAPI(interaction.guildId).getLangData();

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
  }
};
