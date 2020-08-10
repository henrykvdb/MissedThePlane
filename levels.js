
const ALL_LEVELS = [{
    tiles: [
        ['M', 'G', 'B'],
        ['G', 'G', 'F'],
        ['G', 'M', 'W']
    ],
    pilot: { coords: [0.5, 1.5], dir: 3 },
    plane: { coords: [4, 0.5], dir: 1 }
},
{
    // no tiles, this is the random level!
    pilot: { coords: [0.5, 0.5], dir: 3 },
    plane: { coords: [-1.5, 1.5], dir: 5 }
},
{
    tiles: [
        ['G', 'M', 'G', 'G', 'G', 'G', 'G'],
        ['G', 'B', 'W', 'W', 'G', 'G', 'G'],
        ['G', 'W', 'W', 'W', 'M', 'G', 'G'],
        ['G', 'G', 'W', 'W', 'W', 'M', 'G'],
        ['G', 'B', 'G', 'W', 'W', 'W', 'G'],
        ['G', 'G', 'G', 'W', 'G', 'W', 'G'],
        ['G', 'G', 'G', 'W', 'G', 'W', 'G']
    ],
    pilot: { coords: [3.5, 0.5], dir: 3 },
    plane: { coords: [7, 1.5], dir: 1 }
},
{
    tiles: [
        ['G', 'M', 'G', 'M', 'G', 'G'],
        ['G', 'G', 'G', 'G', 'G', 'M'],
        ['G', 'G', 'G', 'B', 'G', 'G'],
        ['G', 'G', 'G', 'G', 'G', 'G'],
        ['G', 'G', 'M', 'B', 'G', 'G'],
        ['G', 'G', 'G', 'G', 'M', 'G'],
    ],
    pilot: { coords: [3.5, 0.5], dir: 3 },
    plane: { coords: [7, 1.5], dir: 1 }
}
]