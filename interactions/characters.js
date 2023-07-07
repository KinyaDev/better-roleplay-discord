const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const { CharactersAPI } = require("../modules/db");
const { CharaEmbed } = require("../modules/embeds");

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
  run: async (client, interaction, d, langdata) => {
    let member = interaction.options.getUser("mention");
    if (!member) member = interaction.member.user;

    let db = new CharactersAPI(member ? member.id : interaction.member.id);
    let charas = await db.getCharas();
    let chara = (await db.getSelected()) || charas[0] || undefined;

    if (chara) {
      let selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`charas`)
        .setPlaceholder("Make a selection!");

      for (let chara of charas) {
        if (!(await db.getSelected())._id.equals(chara._id)) {
          selectMenu.addOptions({
            label: chara.name,
            value: chara._id.toString(),
          });
        }
      }

      let row = new ActionRowBuilder().setComponents(selectMenu);

      let res = await interaction.editReply({
        embeds: [await CharaEmbed(chara, member, interaction.guild)],
        components: selectMenu.options.length !== 0 ? [row] : undefined,
        fetchReply: true,
      });

      const collector = res.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 3_600_000,
      });

      collector.on("collect", async (i) => {
        const selection = i.values[0];

        for (let chara of charas) {
          if (chara._id.equals(selection)) {
            let newi = await interaction.editReply({
              embeds: [await CharaEmbed(chara, member, interaction.guild)],
              components: selectMenu.options.length !== 0 ? [row] : undefined,
            });

            if (newi.embeds[0].author.name === interaction.member.user.username)
              db.select(chara._id);

            break;
          }
        }
      });
    } else {
      interaction
        .editReply({
          content: langdata["no-chara"],
          ephemeral: true,
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 5000));
    }
  },
};
