const TILES = {
    AIR: {
        description: 'toggles between grass/mountain',
        assets: [],
        //toggeable: true,
        //toggle: mountain,
        passable_pilot: false,
        passable_plane: true,
        z_index: -1
    },
    GRASS: {
        description: 'toggles between grass/mountain',
        assets: ['grass0', 'grass1', 'grass2', 'grass3', 'grass4', 'grass5', 'grass6'],
        //toggeable: true,
        //toggle: mountain,
        passable_pilot: true,
        passable_plane: true,
        z_index: 0
    },
    MOUNTAIN: {
        description: 'toggles between grass/mountain',
        assets: [], // Already in spritesheet, special case...
        //toggeable: true,
        //toggle: mountain,
        passable_pilot: false,
        passable_plane: false,
        z_index: 1
    },
    MOUNTAIN_WATER: {
        description: 'WATERMOUNTAIN //TODO',
        assets: ['mountainwater0, mountainwater1, mountainwater2, mountainwater3'],
        //toggeable: true,
        //toggle: mountain,
        passable_pilot: false,
        passable_plane: false,
        z_index: 1
    },
    RUNWAY_START: {
        description: 'STRIP*start //TODO',
        assets: ['stripstart0', 'stripstart1', 'stripstart2', 'stripstart3'],
        //toggeable: true,
        //toggle: mountain,
        passable_pilot: true,
        passable_plane: true,
        z_index: 0
    },
    RUNWAY: {
        description: 'STRIP //TODO',
        assets: ['stripmiddle0', 'stripmiddle1'],
        preferedAssetIndex: 0,
        //toggeable: true,
        //toggle: mountain,
        passable_pilot: true,
        passable_plane: true,
        z_index: 0
    },
    RUNWAY_END: {
        description: 'STRIP*end //TODO',
        assets: ['stripend0', 'stripend1', 'stripend2', 'stripend3'],
        preferedAssetIndex: 0,
        //toggeable: true,
        //toggle: mountain,
        passable_pilot: true,
        passable_plane: true,
        z_index: 0
    },
    PLANK: {
        description: 'plank //TODO',
        assets: ['plank'],
        //toggeable: true,
        //toggle: mountain,
        passable_pilot: true,
        passable_plane: true,
        z_index: 0
    },
    WATER: {
        description: 'Water //TODO',
        assets: ['water'],
        //toggeable: true,
        //toggle: mountain,
        passable_pilot: false,
        passable_plane: true,
        z_index: 0
    }, //TODO MORE
    BUTTON: {
        description: 'Button //TODO',
        assets: ['button0', 'button1'],
        //toggeable: true,
        //toggle: mountain,
        passable_pilot: true,
        passable_plane: true,
        z_index: 1
    }, //TODO MORE
}
TILES_IMPASSABLE_PILOT = Object.values(TILES).filter(data => !data.passable_pilot)
TILES_IMPASSABLE_PLANE = Object.values(TILES).filter(data => !data.passable_plane)
