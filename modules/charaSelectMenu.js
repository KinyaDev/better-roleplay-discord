const {
  StringSelectMenuBuilder,
  ActionRowBuilder,
  Message,
  ComponentType,
} = require("discord.js");
const { CharactersAPI } = require("./db");
const { noChara } = require("./errors");
const { ObjectId } = require("mongodb");

module.exports = async function charaSelectMenu(member, interaction, type) {
  let db = new CharactersAPI(member.id);
  let charas = await db.getCharas();
  let selectedChara = await db.getSelected();

  async function genSelectMenu(selectedChara) {
    let selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`charas`)
      .setPlaceholder("Make a selection!");

    for (let chara of charas) {
      if (!selectedChara) {
        selectMenu.addOptions({
          label: chara.name,
          value: chara._id.toString(),
        });
      } else if (selectedChara && !selectedChara._id.equals(chara._id)) {
        selectMenu.addOptions({
          label: chara.name,
          value: chara._id.toString(),
        });
      }
    }
    let row = new ActionRowBuilder().setComponents(selectMenu);
    if (selectMenu.options.length === 0 && !selectedChara) noChara(interaction);

    return { row, selectMenu };
  }

  let g = await genSelectMenu(type === "all" ? undefined : selectedChara);
  /**
   *
   * @param {() => Message} getResponse
   * @param {(chara, charas, db: CharactersAPI)=>Promise<void>} onCollected
   */
  let x = async (getResponse, onCollected) => {
    let message = getResponse(g.selectMenu.options.length !== 0);

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 3_600_000,
    });

    collector.on("collect", async (i) => {
      const selection = i.values[0];

      for (let chara of charas) {
        if (chara._id.equals(new ObjectId(selection))) {
          await onCollected(chara, charas, db);

          break;
        }
      }
    });

    if (g.selectMenu.options.length === 0 && (await db.getSelected())) {
      onCollected(await db.getSelected(), await db.getCharas(), db);
    }
  };
  Object.assign(
    x,
    await genSelectMenu(type === "all" ? undefined : selectedChara)
  );
  Object.assign(x, { newSelectMenu: genSelectMenu });
  Object.assign(x, {
    hasChara:
      (await genSelectMenu(type === "all" ? undefined : selectedChara))
        .selectMenu.options.length !== 0,
  });
  return x;
};
