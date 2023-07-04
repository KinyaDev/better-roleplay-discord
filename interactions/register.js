const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
} = require("discord.js");
const { CharaEmbed } = require("../modules/embeds");
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
    .addStringOption((option) =>
      option
        .setName("avatar")
        .setDescription("The avatar url to set to your brand new character")
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
    ),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction, db, langdata) => {
    let name = interaction.options.getString("name");
    let avatar = interaction.options.getString("avatar");
    let bio = interaction.options.getString("bio");
    let species = interaction.options.getString("species");
    if (avatar) {
      if (isImageUrl(avatar)) {
        await create();
      } else {
        interaction.editReply("Invalid image url");
      }
    } else await create();

    async function create() {
      let { _id } = await db.createCharacter(name, avatar);
      if (bio) db.setBio(bio);

      if (species) {
        db.setSpecies(species);
      } else {
        db.setSpecies("Human");
      }

      let chara = await db.getChara(_id);
      interaction.editReply({
        content: langdata.register.replace("$", name),
        embeds: [await CharaEmbed(chara, interaction.member.user)],
      });
    }
  },
};
