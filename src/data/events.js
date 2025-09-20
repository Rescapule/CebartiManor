export const EVENT_DEFINITIONS = [
  {
    key: "eventManorsFavor",
    name: "Manor's Favor",
    category: "boon",
    summary: "Receive a random relic you do not already possess.",
    effect: { type: "awardRandomRelic", count: 1 },
    detailParagraphs: [
      "The manor occasionally extends a gesture of goodwill, presenting a relic drawn from its vaults to bolster the next traveler.",
    ],
    ui: {
      actionLabel: "Accept the Manor's Gift",
      noEligibleText: "The manor has no further relics to bestow.",
    },
  },
  {
    key: "eventManorsTithe",
    name: "Manor's Tithe",
    category: "burden",
    summary: "Surrender one relic or memory of your choice to appease the manor.",
    effect: { type: "sacrificeRelicOrMemory", count: 1 },
    detailParagraphs: [
      "When the manor hungers, it demands that a cherished possession or memory be relinquished before it grants passage.",
    ],
    ui: {
      confirmLabel: "Offer This Tribute",
      choosePrompt: "Select a relic or memory to surrender.",
      nothingToLoseText: "The manor finds nothing worth claiming and reluctantly lets you pass.",
    },
  },
];

export const EVENT_MAP = EVENT_DEFINITIONS.reduce((map, event) => {
  map.set(event.key, event);
  return map;
}, new Map());

export const ROOM_EVENT_FLAVORS = {
  atrium: {
    eventManorsFavor: {
      description:
        "Moonlight refracts through the flooded atrium, condensing around a drifting relic that waits to be claimed.",
      resolution:
        "The ripples settle as the gift settles into your grasp, the pool glowing with brief approval.",
      failure:
        "The reflecting pool dims; the atrium has no more treasures to reflect back at you.",
    },
    eventManorsTithe: {
      description:
        "Waterlogged ivy curls toward you, whispering that something dear must sink beneath the surface before you may leave.",
      resolution:
        "Your offering vanishes beneath the water, and the vines slacken their hold.",
      failure:
        "The ivy withers when it finds nothing of worth to drown.",
    },
  },
  bedroom: {
    eventManorsFavor: {
      description:
        "A lullaby hums from the wardrobe, coaxing a relic wrapped in velvet to float gently into the air before you.",
      resolution:
        "The lullaby fades to a contented sigh as the relic finds a new dream to haunt.",
      failure:
        "The melody unravels, revealing the wardrobe barren of further keepsakes.",
    },
    eventManorsTithe: {
      description:
        "Suspended furniture leans toward you, creaking for a memento to cradle in its restless embrace.",
      resolution:
        "Once appeased, the pieces drift back to their uneasy slumber.",
      failure:
        "Deprived of offerings, the bedroom furniture twists in frustrated circles before falling still.",
    },
  },
  closet: {
    eventManorsFavor: {
      description:
        "Key hooks clatter until one key-shaped relic glows white-hot, eager to fit a new lock in your possession.",
      resolution:
        "The keys quiet as the chosen relic slips into your satchel with a satisfied chime.",
      failure:
        "The jangling subsides, leaving only empty hooks and stale dust.",
    },
    eventManorsTithe: {
      description:
        "A rusted padlock snaps open and shut, demanding a treasured relic or memory to secure once more.",
      resolution:
        "Metal teeth bite down on your sacrifice, sealing the closet in smug silence.",
      failure:
        "Finding nothing to clamp down on, the locks rattle in annoyed futility.",
    },
  },
  counsel: {
    eventManorsFavor: {
      description:
        "Cushions depress as if unseen clients sit beside you, sliding a polished relic across the table as payment for your patience.",
      resolution:
        "The phantom session ends with a gentle nod, the relic warm from spectral hands.",
      failure:
        "The room remains tight-lipped; there are no more secrets to share tonight.",
    },
    eventManorsTithe: {
      description:
        "Ashes stir within the hearth, bartering for a confession in the form of something you value.",
      resolution:
        "Your concession feeds the coals, coaxing embers into a brief, approving flare.",
      failure:
        "Denied any offering, the hearth sulks cold and ashen.",
    },
  },
  kitchen: {
    eventManorsFavor: {
      description:
        "Copper lids lift on their own, unveiling a relic plated on fine porcelain amid impossible aromas.",
      resolution:
        "Utensils twirl with delight as you pocket the delicacy.",
      failure:
        "The ovens wheeze disappointment, empty of further delights.",
    },
    eventManorsTithe: {
      description:
        "The stove roars and hungry knives spin, insisting that you feed the kitchen something cherished.",
      resolution:
        "Flames purr contentedly as your offering sizzles into spectral steam.",
      failure:
        "Starved of tribute, the burners gutter into sullen embers.",
    },
  },
  studio: {
    eventManorsFavor: {
      description:
        "Paint seeps from canvases, sketching a relic's silhouette before solidifying into the real thing at your feet.",
      resolution:
        "Brushes clap together in applause as the artwork becomes your armament.",
      failure:
        "The colors run dry, their inspirations spent for now.",
    },
    eventManorsTithe: {
      description:
        "A blank canvas stretches taut, demanding pigment mixed from a memory or relic you hold dear.",
      resolution:
        "Once fed, the canvas drinks in your sacrifice and seals with a haunting new scene.",
      failure:
        "Unsated, the canvas sags and its frame creaks in disappointment.",
    },
  },
  study: {
    eventManorsFavor: {
      description:
        "Books flutter open, presenting a catalogued relic annotated with notes on how to wield it best.",
      resolution:
        "Satisfied pages slam shut after you claim the annotated prize.",
      failure:
        "The shelves rustle irritably; the ledger lists no further boons.",
    },
    eventManorsTithe: {
      description:
        "Glyphs blaze across the desk, calculating a tithe owed in memories or relics before releasing you.",
      resolution:
        "Equations resolve the moment your sacrifice touches the desk, ink cooling to calm lines.",
      failure:
        "Without payment, the formulas dissolve into static snow.",
    },
  },
  washroom: {
    eventManorsFavor: {
      description:
        "Mist draws symbols on the mirror before condensing into a gleaming relic resting on the porcelain sink.",
      resolution:
        "The mirrors clear once the gift is accepted, leaving only your determined reflection.",
      failure:
        "Condensation fades, revealing nothing but streaked glass and regret.",
    },
    eventManorsTithe: {
      description:
        "Shapes beyond the mirror tap insistently, demanding you trade a memory or relic to keep them at bay.",
      resolution:
        "Your offering smears across the glass, trapping the silhouettes for another night.",
      failure:
        "Without tribute, the tapping turns to annoyed scratches before it finally subsides.",
    },
  },
  winecellar: {
    eventManorsFavor: {
      description:
        "A cork pops itself free, pouring spectral wine that coalesces into a relic infused with aged celebration.",
      resolution:
        "The barrels hum in approval as you take the vintage blessing.",
      failure:
        "The casks groan empty—no more spirits wish to toast you.",
    },
    eventManorsTithe: {
      description:
        "Bottles clink in unison, thirsty for a keepsake to seal inside their dark glass.",
      resolution:
        "Once offered, the cellar buries your sacrifice in a hush of cork and shadow.",
      failure:
        "Denied sustenance, the bottles rattle in restless dismay.",
    },
  },
};
