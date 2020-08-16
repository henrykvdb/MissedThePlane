const ALL_LEVELS = [
    {
        tiles: convertFromOld([ // Level 0 - home!
            ['1', '2', '3', '2'],
            ['0', 'P', 'P', 'P'],
            ['4', 'P', 'P', 'P'],
            ['5', '6', 'P', 'P'],
        ]),
        pilot: { coords: [2.5, 1.5], dir: 1 },
        plane: { coords: [3.5, 5.5], dir: 1 },
        difficulty: 'home'
    },
    {
    tiles: convertFromOld([ // level 1 - Explain plane path
        ['M', 'G', 'G', 'G'],
        ['G', 'G', 'G', 'M'],
        ['E', 'R', 'R', 'G'],
        ['G', 'G', 'M', 'G']
    ]),
    pilot: { coords: [3.5, 1.5], dir: 1 },
    plane: { coords: [11.5, 0.5], dir: 1 },
    difficulty: 0
},
{
    tiles: convertFromOld([ // level 2 - Explain Buttons
        ['M', 'M', 'G', 'M', 'G', 'G', 'G'],
        ['B', 'M', 'G', 'W', 'R', 'R', 'E'],
        ['G', 'W', 'G', 'B', 'G', 'G', 'G'],
        ['G', 'W', 'W', 'M', 'G', 'G', 'G'],
        ['G', 'B', 'W', 'W', 'W', 'W', 'M'],
        ['G', 'G', 'M', 'W', 'W', 'W', 'G'],
        ['G', 'G', 'W', 'W', 'W', 'M', 'G']
    ]),
    pilot: { coords: [5.5, 1.5], dir: 1 },
    plane: { coords: [8.5, 3.5], dir: 1 },
    difficulty: 0
},
{
    tiles: convertFromOld([ // level 3 - Simple level with base mechanics
        ['G', 'M', 'G', 'G', 'G', 'G'],
        ['M', 'G', 'G', 'G', 'G', 'G'],
        ['B', 'G', 'W', 'G', 'M', 'B'],
        ['G', 'W', 'W', 'R', 'R', 'E'],
        ['M', 'W', 'W', 'W', 'W', 'G'],
        ['W', 'W', 'W', 'W', 'M', 'G'],
    ]),
    pilot: { coords: [5.5, 5.5], dir: 1 },
    plane: { coords: [4.5, 6.5], dir: 7 },
    difficulty: 1
},
{ // level 4 - another filler easy level to show you have to press the same button multiple times
    tiles: convertFromOld([
        ['B', 'G', 'E', 'G', 'G'],
        ['G', 'G', 'R', 'G', 'M'],
        ['G', 'G', 'R', 'G', 'G'],
        ['B', 'G', 'G', 'G', 'G'],
        ['W', 'W', 'W', 'M', 'G']
    ]),
    pilot: { coords: [0.5, 1.5], dir: 7 },
    plane: { coords: [6.5, 1.5], dir: 1 },
    difficulty: '1'
},
{
    tiles: convertFromOld([ // level 5 - Explain plane trapping
        ['G', 'E', 'M', 'W', 'W', 'W'],
        ['G', 'R', 'G', 'G', 'M', 'W'],
        ['G', 'R', 'G', 'G', 'G', 'M'],
        ['G', 'G', 'B', 'G', 'G', 'M'],
        ['M', 'G', 'G', 'G', 'M', 'G'],
        ['W', 'W', 'G', 'G', 'B', 'G']
    ]),
    pilot: { coords: [5.5, 4.5], dir: 3 },
    plane: { coords: [10, 4.5], dir: 1 },
    difficulty: 1
},
{ // level 6 - water level, teaches mid-turn toggle
    tiles: convertFromOld([
        ['W', 'W', 'Q', 'W', 'W', 'W', 'W', 'W', 'W'],
        ['W', 'W', 'W', 'W', 'W', 'W', 'Q', 'W', 'W'],
        ['W', 'Q', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
        ['Q', 'W', 'W', 'G', 'G', 'G', 'W', 'Q', 'W'],
        ['W', 'Q', 'W', 'G', 'B', 'G', 'W', 'W', 'W'],
        ['W', 'W', 'W', 'G', 'G', 'G', 'W', 'W', 'M'],
        ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'R', 'G'],
        ['W', 'W', 'Q', 'W', 'W', 'W', 'G', 'R', 'G'],
        ['W', 'W', 'W', 'W', 'W', 'G', 'M', 'E', 'G'],
    ]),
    pilot: { coords: [3.5, 3.5], dir: 3 },
    plane: { coords: [9.5, 4.5], dir: 1 },
    difficulty: 2
},
{ // Level 7 - Show how multiple buttons can interact with each others mountains
    tiles: convertFromOld([
        ['G', 'G', 'E', 'W', 'G', 'G', 'G'],
        ['M', 'B', 'R', 'G', 'G', 'Q', 'G'],
        ['G', 'G', 'R', 'W', 'W', 'W', 'G'],
        ['M', 'B', 'G', 'W', 'G', 'G', 'G'],
        ['G', 'G', 'W', 'G', 'G', 'M', 'G'],
        ['G', 'B', 'W', 'G', 'M', 'G', 'M'],
        ['G', 'M', 'W', 'G', 'B', 'M', 'G'],
        ]),
    pilot: { coords: [5.5, 0.5], dir: 3 },
    plane: { coords: [5.5, 5.5], dir: 5 },
    difficulty: '2'
},
{ // level 8 - longer level, showing position is important
    tiles: convertFromOld([
        ['G', 'M', 'W', 'W', 'G', 'G', 'B', 'G', 'G'],
        ['G', 'W', 'W', 'W', 'G', 'G', 'G', 'G', 'G'],
        ['W', 'W', 'W', 'G', 'B', 'G', 'G', 'G', 'M'],
        ['W', 'W', 'W', 'G', 'G', 'W', 'R', 'R', 'E'],
        ['W', 'W', 'G', 'G', 'W', 'G', 'W', 'W', 'W'],
        ['M', 'G', 'G', 'G', 'M', 'B', 'M', 'G', 'G'],
        ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
        ['B', 'G', 'G', 'M', 'G', 'G', 'G', 'M', 'G'],
        ['M', 'G', 'G', 'G', 'G', 'M', 'G', 'G', 'G'],
    ]),
    pilot: { coords: [0.5, 8.5], dir: 7 },
    plane: { coords: [1.5, 1.5], dir: 3 },
    difficulty: 3
},
{ // Level 9 - maybe the first actually difficult puzzle?
    tiles: convertFromOld([
        ['G', 'M', 'M', 'G', 'G', 'G', 'G', 'G'],
        ['G', 'B', 'G', 'G', 'W', 'W', 'G', 'M'],
        ['W', 'M', 'W', 'W', 'W', 'W', 'G', 'G'],
        ['W', 'G', 'G', 'W', 'W', 'G', 'B', 'M'],
        ['W', 'W', 'G', 'Q', 'W', 'G', 'M', 'B'],
        ['W', 'W', 'G', 'W', 'W', 'R', 'R', 'E'],
        ['M', 'B', 'G', 'W', 'W', 'M', 'W', 'G'],
        ['G', 'M', 'G', 'W', 'G', 'B', 'G', 'G'],
        ]),
    pilot: { coords: [0.5, 0.5], dir: 3, speedModifier: 0.95 },
    plane: { coords: [1.5, -0.5], dir: 3 },
    difficulty: '4'
}]

// Given a list of tiles, convert the runway's E and R to R0, R1, etc
function convertFromOld(tiles) { //TODO REPLACE BY LEVEL EDITOR
    var conversionMap = {
        'G': TILES.GRASS,
        'P': TILES.PLANK,
        'M': TILES.MOUNTAIN,
        'Q': TILES.MOUNTAIN_WATER,
        'W': TILES.WATER,
        'B': TILES.BUTTON,
        'R': TILES.RUNWAY,
        'E': TILES.RUNWAY_END,
        '0': TILES.MISC_0,
        '1': TILES.MISC_1,
        '2': TILES.MISC_2,
        '3': TILES.MISC_3,
        '4': TILES.MISC_4,
        '5': TILES.MISC_5,
        '6': TILES.MISC_6
    }

    for (let x = 0; x < tiles.length; x++) {
        for (let y = 0; y < tiles.length; y++) {
            var old = tiles[x][y]
            tiles[x][y] = conversionMap[old] == undefined ? old : conversionMap[old]
        }
    }

    return tiles
}
