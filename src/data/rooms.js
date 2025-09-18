import { backgrounds } from "./backgrounds.js";
import { DOOR_SPRITES } from "./sprites.js";

export const ROOM_DEFINITIONS = [
  {
    key: "well",
    name: "Submerged Reliquary",
    background: "bg_room_well.png",
    description:
      "The well chamber opens into a circular antechamber, its waters thrumming with residual whispers that tug at your memory.",
    ariaLabel: "A flooded reliquary chamber branching from the manor's Styx well.",
  },
  {
    key: "atrium",
    name: "Flooded Atrium",
    background: "bg_room_atrium.png",
    description:
      "Collapsed skylights spill moonlight across the atrium's reflecting pool. Spectral vines curl toward the rippling surface.",
    ariaLabel: "A decayed manor atrium filled with water and moonlight.",
  },
  {
    key: "bedroom",
    name: "Forsaken Bedroom",
    background: "bg_room_bedroom.png",
    description:
      "Antique furniture floats inches above the ground, swaying in time with a lullaby no mortal voice should sing.",
    ariaLabel: "An abandoned bedroom with haunted furnishings suspended midair.",
  },
  {
    key: "closet",
    name: "Locksmith's Closet",
    background: "bg_room_closet.png",
    description:
      "Walls of keys clatter like chimes. One of them pulses with a heartbeat in sync with your own.",
    ariaLabel: "A cramped closet overflowing with shimmering keys.",
  },
  {
    key: "counsel",
    name: "Counsel Chamber",
    background: "bg_room_counsel.png",
    description:
      "Couches circle a darkened fireplace. The ashes whisper fractured therapy sessions from lifetimes ago.",
    ariaLabel: "A dim counseling chamber lined with couches and a smoldering hearth.",
  },
  {
    key: "kitchen",
    name: "Haunted Kitchen",
    background: "bg_room_kitchen.png",
    description:
      "Copper pots rattle without touch. Aromas of impossible feasts pull at your hunger and your soul alike.",
    ariaLabel: "A spectral kitchen with floating utensils and lingering aromas.",
  },
  {
    key: "studio",
    name: "Painter's Studio",
    background: "bg_room_studio.png",
    description:
      "Unfinished canvases watch you. Fresh paint crawls across them, forming scenes of your past lives.",
    ariaLabel: "An artist's studio where the paintings appear to move on their own.",
  },
  {
    key: "study",
    name: "Occult Study",
    background: "bg_room_study.png",
    description:
      "Books flutter from shelves as if anxious birds. Glyphs glow along the desk, cataloging every decision you've made tonight.",
    ariaLabel: "A study filled with floating books and glowing occult glyphs.",
  },
  {
    key: "washroom",
    name: "Mirror Washroom",
    background: "bg_room_washroom.png",
    description:
      "Steam coats the mirrors, yet silhouettes stare back from beyond the glass waiting to trade places.",
    ariaLabel: "A misty washroom with haunted mirrors.",
  },
  {
    key: "winecellar",
    name: "Cursed Wine Cellar",
    background: "bg_room_winecellar.png",
    description:
      "Barrels hum with the voices of bottled celebrations. A single cork trembles, eager to release something old.",
    ariaLabel: "A wine cellar where barrels glow with spectral light.",
  },
];

export const FOYER_ROOM = {
  key: "foyer",
  name: "The Foyer",
  background: backgrounds.foyer,
  description:
    "Helen Cebarti's foyer waits in stillness. The manor itself holds its breath for the coming confrontation.",
  ariaLabel: "The foyer of Cebarti Manor prepared for the final confrontation.",
};

export const TOTAL_ROOMS_PER_RUN = ROOM_DEFINITIONS.length + 1;

export const ROOMS_BEFORE_BOSS = ROOM_DEFINITIONS.length;
export const ROOM_MAP = ROOM_DEFINITIONS.reduce((map, room) => {
  map.set(room.key, room);
  return map;
}, new Map());

export const DOOR_CATEGORIES = [
  {
    key: "combat",
    label: "Combat",
    colorClass: "door-button--crimson",
    ariaDescription: "Engage in a standard combat encounter.",
    detail: "Battle restless shades.",
    icon: DOOR_SPRITES.icons.combat,
  },
  {
    key: "elite",
    label: "Elite Combat",
    colorClass: "door-button--violet",
    ariaDescription: "Challenge a formidable elite opponent.",
    detail: "Face a formidable elite.",
    icon: DOOR_SPRITES.icons.elite,
  },
  {
    key: "boss",
    label: "Boss Combat",
    colorClass: "door-button--umbra",
    ariaDescription: "Confront a boss-tier adversary.",
    detail: "Challenge a boss-tier foe.",
    icon: DOOR_SPRITES.icons.boss,
  },
  {
    key: "recovery",
    label: "Recovery",
    colorClass: "door-button--verdant",
    ariaDescription:
      "Replenish and permanently fortify your essence in a restorative chamber.",
    detail: "Claim lasting essence and mend completely.",
    icon: DOOR_SPRITES.icons.recovery,
  },
  {
    key: "treasure",
    label: "Treasure",
    colorClass: "door-button--amber",
    ariaDescription: "Search for rare rewards hidden within the manor.",
    detail: "Seek hidden rewards.",
    icon: DOOR_SPRITES.icons.treasure,
  },
  {
    key: "merchant",
    label: "Merchant",
    colorClass: "door-button--azure",
    ariaDescription: "Trade with a spectral merchant.",
    detail: "Barter with a spectral vendor.",
    icon: DOOR_SPRITES.icons.merchant,
  },
  {
    key: "event",
    label: "Event",
    colorClass: "door-button--aether",
    ariaDescription: "Trigger an unpredictable manor event.",
    detail: "Stumble into a strange event.",
    icon: DOOR_SPRITES.icons.event,
  },
];

