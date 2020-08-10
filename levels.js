
const ALL_LEVELS = [{
    tiles: [
        ['M', 'G', 'B'],
        ['G', 'R', 'E'],
        ['G', 'M', 'W']
    ],
    pilot: { coords: [0.5, 1.5], dir: 3 },
    plane: { coords: [4, 0.5], dir: 1 }
},
{
    // no tiles, this is the random level!
    pilot: { coords: [0.5, 0.5], dir: 3 },
    plane: { coords: [7.5, 1.5], dir: 1 }
},
{
    tiles: [
        ['G', 'M', 'G', 'G', 'G', 'G', 'G'],
        ['G', 'B', 'W', 'W', 'G', 'G', 'M'],
        ['G', 'W', 'W', 'W', 'M', 'G', 'B'],
        ['G', 'G', 'W', 'W', 'W', 'G', 'G'],
        ['E', 'R', 'R', 'W', 'W', 'W', 'G'],
        ['G', 'G', 'G', 'W', 'G', 'W', 'G'],
        ['G', 'G', 'G', 'W', 'G', 'W', 'G']
    ],
    pilot: { coords: [3.5, 0.5], dir: 3 },
    plane: { coords: [7, 1.5], dir: 1 }
},
{
    tiles: [
        ['W', 'W', 'M', 'W', 'W', 'W', 'G', 'G', 'G'],
        ['W', 'W', 'W', 'W', 'W', 'W', 'M', 'G', 'G'],
        ['G', 'M', 'W', 'W', 'W', 'W', 'G', 'G', 'G'],
        ['M', 'G', 'W', 'G', 'G', 'G', 'G', 'M', 'G'],
        ['G', 'M', 'W', 'G', 'B', 'G', 'G', 'G', 'G'],
        ['W', 'W', 'W', 'G', 'G', 'G', 'G', 'G', 'M'],
        ['W', 'W', 'W', 'W', 'W', 'W', 'G', 'R', 'G'],
        ['W', 'W', 'M', 'W', 'W', 'W', 'G', 'R', 'G'],
        ['W', 'W', 'W', 'W', 'W', 'W', 'M', 'E', 'G'],
    ],
    pilot: { coords: [3.5, 3.5], dir: 3 },
    plane: { coords: [8.5, 4.5], dir: 1 }
}
]