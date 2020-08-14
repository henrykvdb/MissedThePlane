const TILES = {
    AIR: {
        description: 'toggles between grass/mountain',
        assets: [],
        passable_pilot: false,
        passable_plane: true,
        levelEditor: true,
        z_index: 0
    },
    GRASS: {
        description: 'toggles between grass/mountain',
        assets: ['grass0', 'grass1', 'grass2', 'grass3', 'grass4', 'grass5', 'grass6'],
        passable_pilot: true,
        passable_plane: true,
        levelEditor: true,
        z_index: 0
    },
    MOUNTAIN: {
        description: 'toggles between grass/mountain',
        assets: ['mountain00', 'mountain01', 'mountain02', 'mountain03'],
        passable_pilot: false,
        passable_plane: false,
        levelEditor: true,
        z_index: 1
    },
    MOUNTAIN_WATER: {
        description: 'WATERMOUNTAIN //TODO',
        assets: ['mountainwater0', 'mountainwater1', 'mountainwater2', 'mountainwater3'],
        passable_pilot: false,
        passable_plane: false,
        levelEditor: true,
        z_index: 1
    },
    RUNWAY_START: {
        description: 'STRIP*start //TODO',
        assets: ['stripstart0', 'stripstart1', 'stripstart2', 'stripstart3'],
        passable_pilot: true,
        passable_plane: true,
        levelEditor: true,
        z_index: 0
    },
    RUNWAY: {
        description: 'STRIP //TODO',
        assets: ['stripmiddle0', 'stripmiddle1'],
        preferedAssetIndex: 0,
        passable_pilot: true,
        passable_plane: true,
        levelEditor: true,
        z_index: 0
    },
    RUNWAY_END: {
        description: 'STRIP*end //TODO',
        assets: ['stripend0', 'stripend1', 'stripend2', 'stripend3'],
        preferedAssetIndex: 0,
        passable_pilot: true,
        passable_plane: true,
        levelEditor: true,
        z_index: 0
    },
    PLANK: {
        description: 'plank //TODO',
        assets: ['plank'],
        passable_pilot: true,
        passable_plane: true,
        levelEditor: true,
        z_index: 0
    },
    WATER: {
        description: 'Water //TODO',
        assets: ['water'],
        passable_pilot: false,
        passable_plane: true,
        levelEditor: true,
        z_index: 0
    },
    BUTTON: {
        description: 'Button //TODO',
        assets: ['button0', 'button1'],
        passable_pilot: true,
        passable_plane: true,
        levelEditor: true,
        z_index: 0
    },
    MISC_0: {
        assets: ['misc0'],
        levelEditor: false,
        passable_pilot: true,
        passable_plane: false,
        z_index: 0
    },
    MISC_1: {
        assets: ['misc1'],
        levelEditor: false,
        passable_pilot: true,
        passable_plane: false,
        z_index: 0
    },
    MISC_2: {
        assets: ['misc2'],
        levelEditor: false,
        passable_pilot: true,
        passable_plane: false,
        z_index: 0
    },
    MISC_3: {
        assets: ['misc3'],
        levelEditor: false,
        passable_pilot: true,
        passable_plane: false,
        z_index: 0
    },
    MISC_4: {
        assets: ['misc4'],
        levelEditor: false,
        passable_pilot: false,
        passable_plane: false,
        z_index: 1
    },
    MISC_5: {
        assets: ['misc5'],
        levelEditor: false,
        passable_pilot: false,
        passable_plane: false,
        z_index: 1
    },
    MISC_6: {
        assets: ['misc6'],
        levelEditor: false,
        passable_pilot: false,
        passable_plane: false,
        z_index: 1
    },
}
TILES_IMPASSABLE_PILOT = Object.values(TILES).filter(data => !data.passable_pilot)
TILES_IMPASSABLE_PLANE = Object.values(TILES).filter(data => !data.passable_plane)
