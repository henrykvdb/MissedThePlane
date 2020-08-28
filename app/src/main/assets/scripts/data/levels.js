const ALL_LEVELS = [
    // Level 0 - home!
    "{\"size\":4,\"tiles\":[[1001,1002,1003,1002],[1000,7,7,7],[1004,7,7,7],[1005,1006,7,7]],\"pilot\":[2.5,1.5,1],\"plane\":[3.5,5.5,1],\"difficulty\":\"home\",\"seed\":5619}",

    // level 1 - Explain plane path
    "{\"size\":4,\"tiles\":[[2,1,1,1],[1,1,1,2],[5,5,5,1],[1,1,2,1]],\"pilot\":[3.5,1.5,1],\"plane\":[11.5,0.5,1],\"difficulty\":0,\"seed\":4560}",

    // level 2 - Explain Buttons
    "{\"size\":7,\"tiles\":[[2,2,1,2,1,1,1],[9,2,1,8,5,5,5],[1,8,1,9,1,1,1],[1,8,8,2,1,1,1],[1,9,8,8,8,8,2],[1,1,2,8,8,8,1],[1,1,8,8,8,2,1]],\"pilot\":[5.5,1.5,1],\"plane\":[8.5,3.5,1],\"difficulty\":0,\"seed\":5836}",

    // level 3 - Simple level with base mechanics
    "{\"size\":6,\"tiles\":[[1,2,1,1,1,1],[2,1,1,1,1,1],[9,1,8,1,2,9],[1,8,8,5,5,5],[2,8,8,8,8,1],[8,8,8,8,2,1]],\"pilot\":[5.5,5.5,1],\"plane\":[4.5,6.5,7],\"difficulty\":1,\"seed\":960}",

    // level 4 - another filler easy level to show you have to press the same button multiple times
    "{\"size\":5,\"tiles\":[[9,1,5,1,1],[1,1,5,1,2],[1,1,5,1,1],[9,1,1,1,1],[8,8,8,2,1]],\"pilot\":[0.5,1.5,7],\"plane\":[6.5,1.5,1],\"difficulty\":\"1\",\"seed\":4077}",

    // Level 5 - Very simple button-under-plane level (to prepare plane trapping)
    "{\"size\":5,\"tiles\":[[1,1,1,1,1],[8,1,9,1,1],[8,1,2,1,2],[8,8,5,1,1],[8,8,5,1,1]],\"pilot\":[0.5,1.5,3],\"plane\":[-0.5,4.5,5],\"difficulty\":\"1\",\"seed\":99399.50451079357}",

    // level 6 - Slightly more advanced plane trapping level
    "{\"size\":6,\"tiles\":[[1,5,2,8,8,8],[1,5,1,1,2,8],[1,5,1,1,1,2],[1,1,9,1,1,2],[2,1,1,1,2,1],[8,8,1,1,9,1]],\"pilot\":[5.5,4.5,3],\"plane\":[10,4.5,1],\"difficulty\":2,\"seed\":1093}",

    // level 7 - water level, teaches mid-turn toggle
    "{\"size\":9,\"tiles\":[[8,8,3,8,8,8,8,8,8],[8,8,8,8,8,8,3,8,8],[8,3,8,8,8,8,8,8,8],[3,8,8,1,1,1,8,3,8],[8,3,8,1,9,1,8,8,8],[8,8,8,1,1,1,8,8,2],[8,8,8,8,8,8,8,5,1],[8,8,3,8,8,8,1,5,1],[8,8,8,8,8,1,2,5,1]],\"pilot\":[3.5,3.5,3],\"plane\":[9.5,4.5,1],\"difficulty\":2,\"seed\":2553}",

    // Level 8 - Show how multiple buttons can interact with each others mountains
    "{\"size\":7,\"tiles\":[[1,1,5,8,1,1,1],[2,9,5,1,1,3,1],[1,1,5,8,8,8,1],[2,9,1,8,1,1,1],[1,1,8,1,1,2,1],[1,9,8,1,2,1,2],[1,2,8,1,9,2,1]],\"pilot\":[5.5,0.5,3],\"plane\":[5.5,5.5,5],\"difficulty\":\"2\",\"seed\":8133}",

    // level 9 - longer level, showing position is important
    "{\"size\":9,\"tiles\":[[1,2,8,8,1,1,9,1,1],[1,8,8,8,1,1,1,1,1],[8,8,8,1,9,1,1,1,2],[8,8,8,1,1,8,5,5,5],[8,8,1,1,8,1,8,8,8],[2,1,1,1,2,9,2,1,1],[1,1,1,1,1,1,1,1,1],[9,1,1,2,1,1,1,2,1],[2,1,1,1,1,2,1,1,1]],\"pilot\":[0.5,8.5,7],\"plane\":[1.5,1.5,3],\"difficulty\":3,\"seed\":6308}",

    // Level 10 - maybe the first actually difficult puzzle?
    "{\"size\":8,\"tiles\":[[1,2,2,1,1,1,1,1],[1,9,1,1,8,8,1,2],[8,2,8,8,8,8,1,1],[8,1,1,8,8,1,9,2],[8,8,1,3,8,1,2,9],[8,8,1,8,8,5,5,5],[2,9,1,8,8,2,8,1],[1,2,1,8,1,9,1,1]],\"pilot\":[0.5,0.5,3],\"plane\":[1.5,-0.5,3],\"difficulty\":\"4\",\"seed\":1191}",

    // Filler levels for level select menu
    "{\"size\":1,\"tiles\":[[1]],\"pilot\":[0.5,0.5,3],\"plane\":[1.5,-0.5,3],\"difficulty\":\"4\",\"seed\":1191}",
    "{\"size\":1,\"tiles\":[[1]],\"pilot\":[0.5,0.5,3],\"plane\":[1.5,-0.5,3],\"difficulty\":\"4\",\"seed\":1191}",
    "{\"size\":1,\"tiles\":[[1]],\"pilot\":[0.5,0.5,3],\"plane\":[1.5,-0.5,3],\"difficulty\":\"4\",\"seed\":1191}",
    "{\"size\":1,\"tiles\":[[1]],\"pilot\":[0.5,0.5,3],\"plane\":[1.5,-0.5,3],\"difficulty\":\"4\",\"seed\":1191}",
    "{\"size\":1,\"tiles\":[[1]],\"pilot\":[0.5,0.5,3],\"plane\":[1.5,-0.5,3],\"difficulty\":\"4\",\"seed\":1191}",
    "{\"size\":1,\"tiles\":[[1]],\"pilot\":[0.5,0.5,3],\"plane\":[1.5,-0.5,3],\"difficulty\":\"4\",\"seed\":1191}",
    "{\"size\":1,\"tiles\":[[1]],\"pilot\":[0.5,0.5,3],\"plane\":[1.5,-0.5,3],\"difficulty\":\"4\",\"seed\":1191}",
    "{\"size\":1,\"tiles\":[[1]],\"pilot\":[0.5,0.5,3],\"plane\":[1.5,-0.5,3],\"difficulty\":\"4\",\"seed\":1191}",
    "{\"size\":1,\"tiles\":[[1]],\"pilot\":[0.5,0.5,3],\"plane\":[1.5,-0.5,3],\"difficulty\":\"4\",\"seed\":1191}",
    "{\"size\":1,\"tiles\":[[1]],\"pilot\":[0.5,0.5,3],\"plane\":[1.5,-0.5,3],\"difficulty\":\"4\",\"seed\":1191}",
]

const DEFAULT_LEVEL = "{\"size\":4,\"tiles\":[[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],\"pilot\":[3.5,0.5,1],\"plane\":[4.5,0.5,1],\"difficulty\":\"0\"}"

// Todo maybe change this to have undefineds as well, which then render/initialize as the default level, so we know when a new level has been created (for our database)
const USER_LEVELS = [DEFAULT_LEVEL, DEFAULT_LEVEL, DEFAULT_LEVEL, DEFAULT_LEVEL]

