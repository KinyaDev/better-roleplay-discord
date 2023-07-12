const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
} = require("discord.js");

const isImageUrl = require("is-image-url");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Create new characters with the /register command.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name to set to your brand new character")
        .setRequired(true)
    )
    .addAttachmentOption((option) =>
      option
        .setName("avatar")
        .setDescription("The image of the avatar.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("species")
        .setDescription("The species to set to your brand new character")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("bio")
        .setDescription("The bio to set to your brand new character")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("bracket")
        .setDescription(
          "Tupperbox-like brackets to make speak your character, sends a message when matches"
        )
        .setRequired(false)
    ),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const { CharaEmbed } = require("../modules/embeds");
    const { CharactersAPI } = require("../modules/db");

    let name = interaction.options.getString("name");
    let avatar = interaction.options.getAttachment("avatar");
    let bio = interaction.options.getString("bio");
    let species = interaction.options.getString("species");
    let bracket = interaction.options.getString("bracket");
    let db = new CharactersAPI(interaction.user.id);

    if (avatar) {
      if (isImageUrl(avatar.url)) {
        await create();
      } else {
        interaction.editReply("Invalid image url");
      }
    } else await create();

    async function create() {
      let chara = await db.createCharacter(
        name,
        avatar ? avatar.url : undefined
      );
      if (bio) db.setBio(bio);

      if (species) {
        db.setSpecies(species);
      } else {
        db.setSpecies("Human");
      }

      if (bracket) {
        db.setBracket(bracket);
      }

      if (chara) {
        interaction.editReply({
          content: `Your character ${chara.name} has been registered.`,
          embeds: [await CharaEmbed(chara, interaction.member.user)],
        });

        db.select(chara._id);
      }
    }
  },
};
