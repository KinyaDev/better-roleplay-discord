let guildId = params.guildId;
let accessToken = getCookie("token");

fetch("https://discord.com/api/users/@me", {
  headers: {
    authorization: `Bearer ${accessToken}`,
  },
})
  .then((result) => {
    if (result.status === 401) {
      setCookie("token", "");
      window.location.assign("/");
    } else return result.json();
  })
  .then(async (response) => {
    const { username, id, avatar } = response;
    document.querySelector("#header > h1").innerText = `Welcome, ${username}!`;

    let charaList = document.querySelector("#chara-list");
    let charas = await getCharas(id);

    charas.forEach((chara) => {
      let option = document.createElement("option");
      option.value = chara._id;
      option.innerText = chara.name;
      charaList.appendChild(option);
    });

    charaList.addEventListener("change", (event) => {
      const selectedCharaId = event.target.value;
      const selectedChara = charas.find(
        (chara) => chara._id === selectedCharaId
      );

      if (selectedChara) {
        displayCharaDetails(selectedChara, { id: id, avatar: avatar });
      } else {
        hideCharaDetails();
      }
    });
  })
  .catch((error) => {
    console.error(error);
    window.location.assign("/");
  });

function displayCharaDetails(chara, user) {
  const charaDetailsContainer = document.getElementById("chara-details");
  charaDetailsContainer.innerHTML = ""; // Clear previous content

  const charaName = document.createElement("p");
  charaName.innerText = `Name: ${chara.name}`;
  charaDetailsContainer.appendChild(charaName);

  const charaSpecies = document.createElement("p");
  charaSpecies.innerHTML = `Species: <input class="input" placeholder="${chara.species}"/>`;
  charaDetailsContainer.appendChild(charaSpecies);

  const charaStats = document.createElement("ul");
  chara.stats.forEach((stat) => {
    const statItem = document.createElement("li");
    statItem.innerHTML = `${stat.name}: <input class="input" placeholder="${stat.value}"/>`;
    charaStats.appendChild(statItem);
  });
  charaDetailsContainer.appendChild(charaStats);

  const charaBio = document.createElement("p");
  charaBio.innerHTML = `Bio:<br><textarea class="bio-input">${
    chara.bio || ""
  }</textarea>`;
  charaDetailsContainer.appendChild(charaBio);

  const charaImage = document.createElement("img");
  charaImage.src =
    chara.avatar ||
    `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`;
  charaImage.alt = "Character Image";
  charaDetailsContainer.appendChild(charaImage);

  // Show the selected character details container
  const selectedCharaContainer = document.querySelector(".selectedChara");
  selectedCharaContainer.style.display = "block";
}

function hideCharaDetails() {
  const selectedCharaContainer = document.querySelector(".selectedChara");
  selectedCharaContainer.style.display = "none";
}
