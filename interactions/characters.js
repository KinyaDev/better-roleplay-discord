const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("characters")
    .setDescription(
      "Keep track of all characters with the /characters command."
    )
    .addUserOption((opt) =>
      opt.setName("mention").setDescription("Get characters of the target user")
    ),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const { CharactersAPI } = require("../modules/db");
    const { CharaEmbed } = require("../modules/embeds");
    const charaSelectMenu = require("../modules/charaSelectMenu");
    let member = interaction.options.getUser("mention");
    if (!member) member = interaction.member.user;
    let db = new CharactersAPI(member.id);

    let selectmenu;
    if ((await db.getCharas()).length > 1) {
      selectmenu = await charaSelectMenu(member, interaction);
    }

    let msg = await interaction.editReply({
      embeds: [
        await CharaEmbed(await db.getSelected(), member, interaction.guild),
      ],
      components: selectmenu ? [selectmenu.row] : undefined,
      fetchReply: true,
    });

    if (selectmenu)
      selectmenu(
        () => msg,
        async (chara, charas, db) => {
          await interaction.editReply({
            embeds: [await CharaEmbed(chara, member, interaction.guild)],
            components: [(await selectmenu.newSelectMenu(chara)).row],
          });

          if (msg.embeds[0].author.name === interaction.user.username)
            db.select(chara._id);
        }
      );
  },
};
