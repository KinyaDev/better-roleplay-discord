const {
  ComponentType,
  StringSelectMenuBuilder,
  ActionRowBuilder,
} = require("discord.js");
const { CharactersAPI } = require("./db");
const { noChara } = require("./errors");
const { ObjectId } = require("mongodb");

module.exports = async (member, interaction) => {
  let db = new CharactersAPI(member.id);
  let charas = await db.getCharas();

  async function genCollector(message, callback) {
    if (message.createMessageComponentCollector) {
      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 3_600_000,
      });

      collector.on("collect", async (i) => {
        const selection = i.values[0];

        for (let chara of charas) {
          if (chara._id.equals(new ObjectId(selection))) {
            await callback(chara, charas, db);
          }
        }
      });
    } else {
      await callback(await db.getSelected(), charas, db);
    }
  }

  async function genMenu() {
    let selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`charas`)
      .setPlaceholder("Make a selection!");

    for (let chara of charas) {
      selectMenu.addOptions({
        label: chara.name,
        value: chara._id.toString(),
      });
    }

    if (selectMenu.options.length === 0) {
      noChara(interaction);
      return { row: null, selectMenu: null };
    } else {
      return {
        selectMenu,
        row: new ActionRowBuilder().addComponents(selectMenu),
      };
    }
  }

  return { genCollector, genMenu };
};
