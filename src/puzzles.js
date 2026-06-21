export const puzzles = [
  {
    sixLetter: "GLITCH",
    fiveLetters: "DROWN",
    fourLetters: "BUMP",
    threeLetters: "SKY",
    twoLetters: "EX",
    oneLetter: "A"
  },
  {
    sixLetter: "BRUNCH",
    fiveLetters: "JOWLS",
    fourLetters: "DAFT",
    threeLetters: "PEG",
    twoLetters: "MY",
    oneLetter: "I"
  },
  {
    sixLetter: "PLUMBS",
    fiveLetters: "CRAFT",
    fourLetters: "NECK",
    threeLetters: "WHY",
    twoLetters: "OX",
    oneLetter: "I"
  },
  {
    sixLetter: "NYMPHS",
    fiveLetters: "BRICK",
    fourLetters: "FOLD",
    threeLetters: "JUG",
    twoLetters: "WE",
    oneLetter: "A"
  },
  {
    sixLetter: "SHMUCK",
    fiveLetters: "WALTZ",
    fourLetters: "BEND",
    threeLetters: "PRY",
    twoLetters: "OF",
    oneLetter: "I"
  },
  {
    sixLetter: "SPHINX",
    fiveLetters: "MUNCH",
    fourLetters: "FLAW",
    threeLetters: "COB",
    twoLetters: "DY",
    oneLetter: "E"
  },
  {
    sixLetter: "THINGS",
    fiveLetters: "CROWD",
    fourLetters: "JAMB",
    threeLetters: "PEW",
    twoLetters: "UX",
    oneLetter: "Z"
  },
  {
    sixLetter: "WRENCH",
    fiveLetters: "SIGHT",
    fourLetters: "FLOP",
    threeLetters: "BUM",
    twoLetters: "AY",
    oneLetter: "K"
  },
  {
    sixLetter: "BRANCH",
    fiveLetters: "SWEPT",
    fourLetters: "FLUX",
    threeLetters: "DOG",
    twoLetters: "MY",
    oneLetter: "I"
  },
  {
    sixLetter: "SCRAWL",
    fiveLetters: "DEPTH",
    fourLetters: "NOUN",
    threeLetters: "GYM",
    twoLetters: "BY",
    oneLetter: "I"
  },
  {
    sixLetter: "DROWNS",
    fiveLetters: "MATCH",
    fourLetters: "FLUB",
    threeLetters: "YEW",
    twoLetters: "IS",
    oneLetter: "P"
  },
  {
    sixLetter: "SWITCH",
    fiveLetters: "REALM",
    fourLetters: "UPON",
    threeLetters: "FOB",
    twoLetters: "GY",
    oneLetter: "X"
  },
  {
    sixLetter: "SKETCH",
    fiveLetters: "BLIMP",
    fourLetters: "FUND",
    threeLetters: "WYE",
    twoLetters: "GO",
    oneLetter: "A"
  },
  {
    sixLetter: "THROWN",
    fiveLetters: "DUMBS",
    fourLetters: "JACK",
    threeLetters: "FEW",
    twoLetters: "BY",
    oneLetter: "P"
  },
  {
    sixLetter: "STRAND",
    fiveLetters: "CHOMP",
    fourLetters: "FLUX",
    threeLetters: "BIG",
    twoLetters: "WY",
    oneLetter: "A"
  },
  {
    sixLetter: "CRYPTS",
    fiveLetters: "FLING",
    fourLetters: "DUMB",
    threeLetters: "HOW",
    twoLetters: "EX",
    oneLetter: "A"
  },
  {
    sixLetter: "STRING",
    fiveLetters: "PLUCK",
    fourLetters: "WHOM",
    threeLetters: "FAD",
    twoLetters: "BY",
    oneLetter: "E"
  },
  {
    sixLetter: "SCRIMP",
    fiveLetters: "FLUNK",
    fourLetters: "DEBT",
    threeLetters: "WHY",
    twoLetters: "GO",
    oneLetter: "A"
  },
  {
    sixLetter: "GULPHS",
    fiveLetters: "TOWNS",
    fourLetters: "BRICK",
    threeLetters: "FEW",
    twoLetters: "MY",
    oneLetter: "A"
  },
  {
    sixLetter: "BLANCH",
    fiveLetters: "GRUMP",
    fourLetters: "FLED",
    threeLetters: "SKY",
    twoLetters: "OX",
    oneLetter: "I"
  },
  {
    sixLetter: "JUMPED",
    fiveLetters: "GLOCK",
    fourLetters: "WISH",
    threeLetters: "TAR",
    twoLetters: "BY",
    oneLetter: "X"
  }
];

export function getAllLettersForPuzzle(puzzle) {
  const all = (
    puzzle.sixLetter +
    puzzle.fiveLetters +
    puzzle.fourLetters +
    puzzle.threeLetters +
    puzzle.twoLetters +
    puzzle.oneLetter
  ).split('');
  return all.sort();
}