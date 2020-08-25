const TILES = {
    AIR: {
        id: 0,
        assets: [],
        passable_pilot: false,
        passable_plane: true,
        levelEditor: false,
        z_index: 0
    },
    GRASS: {
        id: 1,
        assets: ['grass0', 'grass1', 'grass2', 'grass3', 'grass4', 'grass5', 'grass6'],
        passable_pilot: true,
        passable_plane: true,
        levelEditor: true,
        z_index: 0
    },
    MOUNTAIN: {
        id: 2,
        assets: ['mountain00', 'mountain01', 'mountain02', 'mountain03'],
        passable_pilot: false,
        passable_plane: false,
        levelEditor: true,
        z_index: 0.99
    },
    MOUNTAIN_WATER: {
        id: 3,
        assets: ['mountainwater0', 'mountainwater1', 'mountainwater2', 'mountainwater3'],
        passable_pilot: false,
        passable_plane: false,
        levelEditor: true,
        z_index: 0.99
    },
    // id: 4 available
    RUNWAY: {
        id: 5,
        assets: ['stripmiddle0', 'stripmiddle1','stripstart0', 'stripstart1', 'stripstart2', 'stripstart3'],
        preferedAssetIndex: 0,
        passable_pilot: true,
        passable_plane: true,
        levelEditor: true,
        z_index: 0
    },
    // id: 6 available
    PLANK: {
        id: 7,
        assets: ['plank'],
        passable_pilot: true,
        passable_plane: true,
        levelEditor: true,
        z_index: 0
    },
    WATER: {
        id: 8,
        assets: ['water'],
        passable_pilot: false,
        passable_plane: true,
        levelEditor: true,
        z_index: 0
    },
    BUTTON: {
        id: 9,
        assets: ['button0'],
        passable_pilot: true,
        passable_plane: true,
        levelEditor: true,
        z_index: 0
    },
    BUTTON_PRESSED: {
        id: 10,
        assets: ['button1'],
        passable_pilot: true,
        passable_plane: true,
        levelEditor: false,
        z_index: 0
    },
    MISC_0: {
        id: 1000, // I'm not going to waste good ids on misc tiles
        assets: ['misc0'],
        levelEditor: false,
        passable_pilot: true,
        passable_plane: false,
        z_index: 0
    },
    MISC_1: {
        id: 1001,
        assets: ['misc1'],
        levelEditor: false,
        passable_pilot: true,
        passable_plane: false,
        z_index: 0
    },
    MISC_2: {
        id: 1002,
        assets: ['misc2'],
        levelEditor: false,
        passable_pilot: true,
        passable_plane: false,
        z_index: 0
    },
    MISC_3: {
        id: 1003,
        assets: ['misc3'],
        levelEditor: false,
        passable_pilot: true,
        passable_plane: false,
        z_index: 0
    },
    MISC_4: {
        id: 1004,
        assets: ['misc4'],
        levelEditor: false,
        passable_pilot: false,
        passable_plane: false,
        z_index: 1
    },
    MISC_5: {
        id: 1005,
        assets: ['misc5'],
        levelEditor: false,
        passable_pilot: false,
        passable_plane: false,
        z_index: 1
    },
    MISC_6: {
        id: 1006,
        assets: ['misc6'],
        levelEditor: false,
        passable_pilot: false,
        passable_plane: false,
        z_index: 1
    },
}
TILES_IMPASSABLE_PILOT = Object.values(TILES).filter(data => !data.passable_pilot)
TILES_IMPASSABLE_PLANE = Object.values(TILES).filter(data => !data.passable_plane)
TILES_LEVEL_EDITOR = Object.values(TILES).filter(data => data.levelEditor)
