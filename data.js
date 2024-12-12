export const locations = {
  shrine: {
    name: "Crumbling Shrine",
    description:
      "Long ago, your father’s kingdom touched these sacred grounds...",
    connections: ["harbor"],
    challenge: {
      text: "A trembling monk speaks: 'I saw a hooded figure after your father was murdered...'",
      choices: [
        { text: "Kneel and Pray for Guidance (win)", outcome: "win" },
        { text: "Offer Coin for Information (progress)", outcome: "progress" },
        { text: "Threaten the Monk (lose)", outcome: "lose" },
      ],
    },
  },
  harbor: {
    name: "Kurokumo Harbor",
    description: "Ships creak under faded sails... The assassin fled by sea.",
    connections: ["castle", "shrine"],
    challenge: {
      text: "A weathered merchant: 'The killer sailed from here...'",
      choices: [
        { text: "Trade Fairly (win)", outcome: "win" },
        { text: "Haggle Hard (progress)", outcome: "progress" },
        { text: "Try to Steal It (lose)", outcome: "lose" },
      ],
    },
  },
  castle: {
    name: "Ruined Castle",
    description: "Your father’s old keep lies in ruins...",
    connections: ["village", "harbor"],
    challenge: {
      text: "A loyal servant: 'The killer cursed your father’s name...'",
      choices: [
        { text: "Honor the Fallen (win)", outcome: "win" },
        { text: "Pay the Servant (progress)", outcome: "progress" },
        { text: "Demand the Letter (lose)", outcome: "lose" },
      ],
    },
  },
  village: {
    name: "Kiyama Village",
    description: "This quiet place remembers the assassin...",
    connections: ["castle", "forest"],
    challenge: {
      text: "A fearful villager: 'The killer cried by our well...'",
      choices: [
        { text: "Offer Comfort (win)", outcome: "win" },
        { text: "Pay for Silence (progress)", outcome: "progress" },
        { text: "Intimidate (lose)", outcome: "lose" },
      ],
    },
  },
  forest: {
    name: "Bamboo Forest",
    description: "In the whispering bamboo...",
    connections: ["village", "battlefield"],
    challenge: {
      text: "A spirit’s voice: 'He lost everything...'",
      choices: [
        { text: "Offer a Prayer (win)", outcome: "win" },
        { text: "Leave a Coin (progress)", outcome: "progress" },
        { text: "Curse the Forest (lose)", outcome: "lose" },
      ],
    },
  },
  battlefield: {
    name: "Crimson Battlefield",
    description: "A scarred field of old wars...",
    connections: ["forest"],
    challenge: {
      text: "A specter hovers: 'He swore your father would know his pain...'",
      choices: [
        { text: "Bow to the Fallen (win)", outcome: "win" },
        { text: "Whisper Vengeance (progress)", outcome: "progress" },
        { text: "Scoff at the Dead (lose)", outcome: "lose" },
      ],
    },
  },
  finalboss: {
    name: "Old Cliffside Ruin",
    description: "With all clues gathered...",
    connections: [],
    challenge: {
      text: "The assassin: 'Your father’s guards slaughtered my family...'",
      choices: [
        { text: "Fight With Honor (win)", outcome: "win" },
        { text: "Ambush Him (progress)", outcome: "progress" },
        { text: "Hesitate (lose)", outcome: "lose" },
      ],
    },
  },
};
