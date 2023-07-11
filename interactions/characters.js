const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");
const { CharactersAPI } = require("../modules/db");
const { noChara } = require("../modules/errors");

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
    const { CharaEmbed } = require("../modules/embeds");
    let user = interaction.options.getUser("mention")
      ? interaction.options.getUser("mention")
      : interaction.user;

    const CharaSel = await require("../modules/charaSelectMenu")(
      user,
      interaction
    );

    let db = new CharactersAPI(user.id);
    let getSelected = await db.getSelected();
    let menu = await CharaSel.genMenu();

    function newSelectMenu() {
      let sl = menu.selectMenu;
      if (!sl.options) {
        sl = {
          options: {
            length: 0,
          },
        };
      } else {
        sl.options = sl.options.filter(async (v, i) =>
          (await db.getSelected())._id.equals(v.data.value)
        );
      }

      return sl;
    }

    let message = await interaction.editReply({
      embeds: [await CharaEmbed(getSelected, user, client)],
      components: newSelectMenu().options.length > 1 ? [menu.row] : null,
      fetchReply: true,
    });

    let collector = CharaSel.genCollector(
      message,
      async (chara, charas, db) => {
        console.log(chara);
        let message = await interaction.editReply({
          embeds: [await CharaEmbed(chara, user, client)],
          components: newSelectMenu().options.length > 1 ? [menu.row] : null,
          fetchReply: true,
        });

        if (message.embeds[0].author.name === interaction.user.username) {
          db.select(chara._id);
          interaction
            .followUp({
              content: `Your character, ${chara.name} has been selected for further actions.`,
              ephemeral: true,
            })
            .then((msg) => setTimeout(msg.delete, 5000));
        }
      }
    );
  },
};
