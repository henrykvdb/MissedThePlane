const ALL_LEVELS = [{
    tiles: [ // level 1 - Explain plane path
        ['M', 'G', 'G', 'G'],
        ['G', 'G', 'G', 'M'],
        ['E', 'R', 'R', 'G'],
        ['G', 'G', 'M', 'G']
    ],
    pilot: { coords: [0.5, 1.5], dir: 5 },
    plane: { coords: [4, 0.5], dir: 1 },
    difficulty: 0
},
{
    tiles: [ // level 2 - Explain Buttons
        ['M', 'M', 'G', 'M', 'G', 'G', 'G'],
        ['B', 'M', 'G', 'W', 'R', 'R', 'E'],
        ['G', 'W', 'G', 'B', 'G', 'G', 'G'],
        ['G', 'W', 'W', 'M', 'G', 'G', 'G'],
        ['G', 'B', 'W', 'W', 'W', 'W', 'M'],
        ['G', 'G', 'M', 'W', 'W', 'W', 'G'],
        ['G', 'G', 'W', 'W', 'W', 'M', 'G']
    ],
    pilot: { coords: [5.5, 1.5], dir: 1 },
    plane: { coords: [8.5, 3.5], dir: 1 },
    difficulty: 0
},
{
    // no tiles, this is the random level!
    pilot: { coords: [3.5, 3.5], dir: 3 },
    plane: { coords: [-1.5, 2.5], dir: 5 },
    difficulty: 'todo' //TODO
},
{
    tiles: [ // level 4 - Explain plane trapping
        ['G', 'E', 'M', 'W', 'W', 'W'],
        ['G', 'R', 'G', 'G', 'M', 'W'],
        ['G', 'R', 'G', 'G', 'M', 'W'],
        ['G', 'G', 'B', 'G', 'G', 'M'],
        ['M', 'G', 'G', 'G', 'M', 'G'],
        ['W', 'W', 'G', 'G', 'B', 'G']
    ],
    pilot: { coords: [5.5, 4.5], dir: 3 },
    plane: { coords: [10, 4.5], dir: 1 },
    difficulty: 1
},
{ // level 5 - water level, teaches mid-turn toggle
    tiles: [
        ['W', 'W', 'M', 'W', 'W', 'W', 'W', 'W', 'W'],
        ['W', 'W', 'W', 'W', 'W', 'W', 'M', 'W', 'W'],
        ['W', 'M', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
        ['M', 'W', 'W', 'G', 'G', 'G', 'W', 'M', 'W'],
        ['W', 'M', 'W', 'G', 'B', 'G', 'W', 'W', 'W'],
        ['W', 'W', 'W', 'G', 'G', 'G', 'W', 'W', 'M'],
        ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'R', 'G'],
        ['W', 'W', 'M', 'W', 'W', 'W', 'G', 'R', 'G'],
        ['W', 'W', 'W', 'W', 'W', 'G', 'M', 'E', 'G'],
    ],
    pilot: { coords: [3.5, 3.5], dir: 3 },
    plane: { coords: [8.5, 4.5], dir: 1 },
    difficulty: 2
},
{ // level 6 - longer level, showing position is important
    tiles: [
        ['G', 'M', 'W', 'W', 'G', 'G', 'B', 'G', 'G'],
        ['G', 'W', 'W', 'W', 'G', 'G', 'G', 'G', 'G'],
        ['W', 'W', 'W', 'G', 'B', 'G', 'G', 'G', 'M'],
        ['W', 'W', 'W', 'G', 'G', 'W', 'R', 'R', 'E'],
        ['W', 'W', 'G', 'G', 'W', 'G', 'W', 'W', 'W'],
        ['M', 'G', 'G', 'G', 'M', 'B', 'M', 'G', 'G'],
        ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
        ['B', 'G', 'G', 'M', 'G', 'G', 'G', 'M', 'G'],
        ['M', 'G', 'G', 'G', 'G', 'M', 'G', 'G', 'G'],
    ],
    pilot: { coords: [0.5, 8.5], dir: 7 },
    plane: { coords: [1.5, 1.5], dir: 3 },
    difficulty: 3
},
{
    // no tiles, this is the random level!
    pilot: { coords: [0.5, 0.5], dir: 3 },
    plane: { coords: [7.5, 1.5], dir: 1 },
    difficulty: 'todo' //TODO
},
{
    // no tiles, this is the random level!
    pilot: { coords: [0.5, 0.5], dir: 3 },
    plane: { coords: [7.5, 1.5], dir: 1 },
    difficulty: 'todo' //TODO
},
{
    // no tiles, this is the random level!
    pilot: { coords: [0.5, 0.5], dir: 3 },
    plane: { coords: [7.5, 1.5], dir: 1 },
    difficulty: 'todo'//TODO
},
{
    // no tiles, this is the random level!
    pilot: { coords: [0.5, 0.5], dir: 3 },
    plane: { coords: [7.5, 1.5], dir: 1 },
    difficulty: 'todo'//TODO
}]