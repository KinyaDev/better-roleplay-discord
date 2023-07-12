const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set")
    .setDescription("customize your character")
    .addSubcommand((sc) =>
      sc
        .setName("species")
        .setDescription("Define character's species with the /species command.")
        .addStringOption((option) =>
          option
            .setName("species")
            .setDescription("The species to set to your character")
            .setRequired(true)
        )
    )
    .addSubcommand((sc) =>
      sc
        .setName("avatar")
        .setDescription(
          "Personalize character's appearance with the /avatar [avatar] command."
        )
        .addAttachmentOption((option) =>
          option
            .setName("avatar")
            .setDescription("The image of the avatar.")
            .setRequired(true)
        )
    )
    .addSubcommand((sc) =>
      sc
        .setName("bio")
        .setDescription("Craft captivating backstory with the /bio command.")
        .addStringOption((option) =>
          option
            .setName("bio")
            .setDescription("The bio to set to your character")
            .setRequired(true)
        )
    )
    .addSubcommand((sc) =>
      sc
        .setName("bracket")
        .setDescription(
          "Tupperbox-like brackets to make speak your character, sends a message when matches"
        )
        .addStringOption((option) =>
          option
            .setName("bracket")
            .setDescription(
              "a prefix or brackets, must include `text` to match the future content to send"
            )
            .setRequired(true)
        )
    ),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const { CharactersAPI } = require("../modules/db");
    const { noChara, set, invalidImg } = require("../modules/errors");
    let db = new CharactersAPI(interaction.user.id);
    if (await db.getSelected()) {
      if (interaction.options.getSubcommand() === "species") {
        let species = interaction.options.getString("species");
        db.setSpecies(species).then(() => set(interaction, "species"));
      } else if (interaction.options.getSubcommand() === "avatar") {
        let url = interaction.options.getAttachment("avatar").url;

        if (isImageUrl(url))
          db.setAvatar(url).then(() => set(interaction, "avatar"));
        else invalidImg(interaction);
      } else if (interaction.options.getSubcommand() === "bio") {
        let bio = interaction.options.getString("bio");

        db.setBio(bio).then(() => set(interaction, "bio"));
      } else if (interaction.options.getSubcommand() === "bracket") {
        let bracket = interaction.options.getString("bracket");
        db.setBracket(bracket).then(() => set(interaction, "bracket"));
      }
    } else noChara(interaction);
  },
};
