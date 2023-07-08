const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");
const isImageUrl = require("is-image-url");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription(
      "Personalize character's appearance with the /avatar [avatar] command."
    )
    .addAttachmentOption((option) =>
      option
        .setName("avatar")
        .setDescription("The image of the avatar.")
        .setRequired(true)
    ),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const { noChara, set, invalidImg } = require("../modules/errors");
    const { CharactersAPI } = require("../modules/db");

    let db = new CharactersAPI(interaction.user.id);
    let url = interaction.options.getAttachment("avatar").url;

    if (db.getSelected()) {
      if (isImageUrl(url))
        db.setAvatar(url).then(() => set(interaction, "avatar"));
      else invalidImg(interaction);
    } else noChara(interaction);
  },
};
