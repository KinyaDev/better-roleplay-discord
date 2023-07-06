const { MongoClient } = require("mongodb");
require("dotenv").config();
const isImageUrl = require("is-image-url");

const mongoClient = new MongoClient(process.env.MONGO_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
  try {
    await mongoClient.connect();
    console.log("Connected to the Database");
  } catch (err) {
    console.error("Failed to connect to the Database:", err);
  }
})();

let db = mongoClient.db("test");

function clearDB() {
  db.dropCollection("characters");
  db.dropCollection("stats");
  db.dropCollection("link_channels");
  db.dropCollection("guilds");
  db.dropCollection("users");
  db.dropCollection("keys");
}

/*
 * Reset DB.
 * clearDB()
 */

// Setup DB.
const charactersCollection = db.collection("characters");
const statsCollection = db.collection("stats");
const linkChannelsCollection = db.collection("link_channels");
const guildsCollection = db.collection("guilds");
const usersCollection = db.collection("users");
const keysCollection = db.collection("keys");

class KeyPlaceAPI {
  /**
   *
   * @param {string} charaId
   */
  constructor(chara_id) {
    this.chara_id = chara_id;
  }

  static async all() {
    return await keysCollection.find().toArray();
  }

  async all() {
    return await keysCollection.find({ chara: this.chara_id }).toArray();
  }

  async get(channel_id) {
    return await keysCollection.findOne({
      chara: this.chara_id,
      channel_id: channel_id,
    });
  }

  async remove(channel_id) {
    if (await this.get(channel_id))
      await keysCollection.deleteOne({
        chara: this.chara_id,
        channel_id: channel_id,
      });
  }
  async give(channel_id) {
    if (!(await this.get(channel_id)))
      await keysCollection.insertOne({
        chara: this.chara_id,
        channel_id: channel_id,
      });
  }
}

/**
 * Characters creation, management, etc thanks to the DB, charactersCollection
 */

class CharactersAPI {
  constructor(userID) {
    this.userID = userID;
  }

  static async getCharas() {
    let a = charactersCollection.find();
    return a ? a.toArray() : [];
  }

  async createCharacter(name, iconURL) {
    await charactersCollection.insertOne({
      user: this.userID,
      name: name,
      current: 0,
      bio: null,
      avatar: isImageUrl(iconURL) ? iconURL : null,
    });

    let charas = await this.getCharas();
    if (charas) {
      let last = charas[charas.length - 1];

      return await this.select(last._id);
    }
  }

  async setSpecies(species) {
    let selected = await this.getSelected();

    if (selected) {
      await charactersCollection.updateOne(
        { _id: selected._id },
        { $set: { species } }
      );
    }

    return selected;
  }

  async setBio(bio) {
    let selected = await this.getSelected();

    if (selected) {
      await charactersCollection.updateOne(
        { _id: selected._id },
        { $set: { bio } }
      );
    }

    return selected;
  }

  setAvatar(avatar) {
    return new Promise(async (resolve, reject) => {
      if (isImageUrl(avatar)) {
        let selected = await this.getSelected();

        if (selected) {
          await charactersCollection.updateOne(
            { _id: selected._id },
            { $set: { avatar } }
          );
          resolve(selected);
        }
        resolve(undefined);
      } else resolve("invalid");
    });
  }

  async paginate(index) {
    return (await this.getCharas())[index - 1]._id;
  }

  async indexOf(id) {
    return new Promise(async (resolve, reject) => {
      let charas = await this.getCharas();
      charas.forEach((chara, i) => {
        if (chara._id.equals(id)) {
          resolve(i);
        }

        if (i === charas.length - 1) resolve(false);
      });
    });
  }

  async delChara() {
    let selected = await this.getSelected();
    if (selected) {
      await statsCollection.deleteMany({ chara: selected._id });
      await charactersCollection.deleteOne({ _id: selected._id });

      return true;
    } else return false;
  }

  async getCharas() {
    let a = charactersCollection.find({ user: this.userID });
    return a ? a.toArray() : [];
  }

  async getSelected() {
    return await charactersCollection.findOne({
      user: this.userID,
      current: 1,
    });
  }

  async getStats(id) {
    if (id) {
      return await statsCollection.find({ chara: id }).toArray();
    } else {
      let selected = await this.getSelected();
      return selected
        ? await statsCollection.find({ chara: selected._id }).toArray()
        : [];
    }
  }

  async select(id) {
    let chara = await this.getChara(id);
    if (chara) {
      await charactersCollection.updateMany(
        { user: this.userID },
        { $set: { current: 0 } }
      );
      await charactersCollection.updateOne(
        { user: this.userID, _id: id },
        { $set: { current: 1 } }
      );

      return chara;
    } else {
      return undefined;
    }
  }

  async getChara(id) {
    return charactersCollection.findOne({ user: this.userID, _id: id });
  }

  async setStats(name, value) {
    let chara = await this.getSelected();
    if (chara) {
      if (value === 0) {
        await statsCollection.deleteMany({ chara: chara._id });
      } else if (value > 0) {
        let existingStat = await statsCollection.findOne({
          chara: chara._id,
          name: name,
        });

        if (existingStat) {
          await statsCollection.updateOne(
            { _id: existingStat._id },
            { $set: { value: value } }
          );
        } else {
          await statsCollection.insertOne({
            chara: chara._id,
            name: name,
            value: value,
          });
        }
      }

      return chara;
    }
  }

  async setLocation(channel_id) {
    let chara = await this.getSelected();
    charactersCollection.updateOne(
      { _id: chara._id },
      { $set: { location: channel_id } }
    );
  }
}

/**
 * Auto-Proxy thanks to the DB usersCollection.
 * /auto-proxy command, to activate auto-proxy in a specific channel.
 */

class AutoProxyAPI {
  constructor(userId) {
    this.userId = userId;
  }
  async init() {
    if (!(await usersCollection.findOne({ user: this.userId }))) {
      usersCollection.insertOne({ user: this.userId, channels: "" });
    }
  }

  async channels() {
    let u = await usersCollection.findOne({ user: this.userId });
    if (u && u.channels) {
      return u.channels.split(",");
    } else {
      return [];
    }
  }

  async addAutoProxy(channel) {
    let chs = await this.channels();
    chs.push(channel);
    chs = chs.join(",");
    usersCollection.updateOne(
      { user: this.userId },
      { $set: { channels: chs } }
    );
  }

  async delAutoProxy(channel) {
    let chs = await this.channels();
    let newChs = chs.filter((c) => c !== channel);
    newChs = newChs.join(",");

    usersCollection.updateOne(
      { user: this.userId },
      { $set: { channels: newChs } }
    );
  }
}

class GuildAPI {
  constructor(guildID) {
    this.guildID = guildID;
  }

  async reset() {
    guildsCollection.deleteOne({ guild: this.guildID });
    linkChannelsCollection.deleteMany({ guild: this.guildID });
  }

  async channels() {
    let guild = await guildsCollection.findOne({ guild: this.guildID });
    if (guild && guild.channels) {
      return guild.channels.split(",");
    } else {
      return [];
    }
  }

  setLang(lang) {
    guildsCollection.updateOne(
      { guild: this.guildID },
      { $set: { lang: lang } }
    );
  }

  async getLangData() {
    let lang = await this.getLang();
    let langData = require("../langs.json");
    return langData[lang];
  }

  async getLang() {
    let info = await this.getInfo();
    return info ? info.lang : "en";
  }

  async linkeds(id) {
    let linkChannels = await linkChannelsCollection.findOne({ channel: id });
    return linkChannels ? linkChannels.channels.split(",") : [];
  }

  link(id, ids) {
    linkChannelsCollection.insertOne({
      guild: this.guildID,
      channel: id,
      channels: ids,
    });
  }

  unlink(id) {
    linkChannelsCollection.deleteOne({ channel: id });
  }

  async addChannels(ids) {
    let toAdd = await this.channels();

    ids.split(",").forEach((id) => {
      if (!toAdd.includes(id)) {
        toAdd.push(id);
      }
    });

    guildsCollection.updateOne(
      { guild: this.guildID },
      { $set: { channels: toAdd.join(",") } }
    );

    return toAdd;
  }

  async deleteChannels(ids) {
    let toDel = await this.channels();

    ids.split(",").forEach((id) => {
      if (toDel.includes(id)) {
        toDel = toDel.filter((t) => t !== id);
      }
    });

    guildsCollection.updateOne(
      { guild: this.guildID },
      { $set: { channels: toDel.join(",") } }
    );

    return toDel;
  }

  async getInfo() {
    return guildsCollection.findOne({ guild: this.guildID });
  }

  async init() {
    let info = await this.getInfo();
    if (!info) {
      await guildsCollection.insertOne({
        lang: "en",
        guild: this.guildID,
        active: 0,
        channels: "",
      });
    }
  }

  async isLinked(id1, id2) {
    let linkedChannels = await linkChannelsCollection.findOne({
      channel: id1,
    });
    return linkedChannels && linkedChannels.channels.includes(id2);
  }

  enable(bool) {
    guildsCollection.updateOne(
      { guild: this.guildID },
      { $set: { active: bool ? 1 : 0 } }
    );
  }

  async isEnabled() {
    let info = await this.getInfo();
    return info ? info.active : false;
  }
}

module.exports = {
  CharactersAPI,
  AutoProxyAPI,
  GuildAPI,
  KeyPlaceAPI,
};
