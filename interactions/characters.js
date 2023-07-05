const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const { users, CharactersAPI } = require("../modules/db");
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

      let button = new ButtonBuilder()
        .setCustomId("use-chara")
        .setLabel("Use")
        .setDisabled(
          interaction.options.getUser("mention").username ===
            interaction.user.username
            ? false
            : true
        )
        .setEmoji("🎭")
        .setStyle(ButtonStyle.Primary);

      charas.forEach((chara2, i) => {
        selectMenu.addOptions({
          label: chara2.name,
          value: chara2.name,
        });
      });

      let actionRow1 = new ActionRowBuilder().setComponents(button);
      let actionRow2 = new ActionRowBuilder().setComponents(selectMenu);

      let res = await interaction.editReply({
        embeds: [await CharaEmbed(chara, member, interaction.guild)],
        components: [actionRow2, actionRow1],
        fetchReply: true,
      });
      const collector = res.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 3_600_000,
      });

      collector.on("collect", async (i) => {
        const selection = i.values[0];

        let ok = false;
        charas.forEach(async (chara, i) => {
          if (chara.name === selection) {
            if (!ok) {
              interaction.editReply({
                embeds: [await CharaEmbed(chara, member, interaction.guild)],
              });

              ok = true;
            }
          }
        });
      });
    } else {
      interaction.editReply({
        content: langdata["no-chara"],
        ephemeral: true,
      });
    }
  },
};
