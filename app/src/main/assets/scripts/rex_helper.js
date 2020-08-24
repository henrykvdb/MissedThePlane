function createTextDialog(scene, title, body, negative, positive) {
    // Create dialog
    var textDialog = scene.rexUI.add.dialog({
        x: SIZE_X / 2, y: SIZE_Y / 2,
        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x1565c0).setInteractive(),

        title: scene.rexUI.add.label({
            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x003c8f).setInteractive(),
            text: scene.add.text(0, 0, title, { fontSize: 35 * MIN_XY / 600, fontStyle: 'bold' }),
            space: {
                left: getXY(0.015),
                right: getXY(0.015),
                top: getXY(0.01),
                bottom: getXY(0.01)
            }
        }),

        content: scene.add.text(0, 0, body, { fontSize: 30 * MIN_XY / 600 }),

        actions: [
            scene.rexUI.add.label({
                background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x5e92f3),
                text: scene.add.text(0, 0, negative, { fontSize: 30 * MIN_XY / 600, fontStyle: 'bold' }),
                space: { left: getXY(0.01), right: getXY(0.01), top: getXY(0.01), bottom: getXY(0.01) }
            }),
            scene.rexUI.add.label({
                background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x5e92f3),
                text: scene.add.text(0, 0, positive, { fontSize: 30 * MIN_XY / 600, fontStyle: 'bold' }),
                space: { left: getXY(0.01), right: getXY(0.01), top: getXY(0.01), bottom: getXY(0.01) }
            })
        ],

        space: {
            title: getXY(0.02),
            content: getXY(0.02),
            action: getXY(0.015),

            left: getXY(0.02),
            right: getXY(0.02),
            top: getXY(0.02),
            bottom: getXY(0.02),
        },

        align: { actions: 'right' },
        expand: { content: false }
    }).layout().popUp(500).setDepth(500)

    // Make buttons fancy & return
    return textDialog.on('button.over', function (button, groupName, index) {
        button.getElement('background').setStrokeStyle(1, 0xffffff);
    }).on('button.out', function (button, groupName, index) {
        button.getElement('background').setStrokeStyle();
    })
}

// 10 = getXY(0.01)
function createInputDialog(scene, title, negative, positive) {
    // Create input field
    scene.userInput = ""
    var field = createLabel(scene, 'Content')

    // Create keys
    var keys = []
    var reference = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ<', key
    for (var i = 0, cnt = reference.length; i < cnt; i++) {
        key = reference[i]
        keys[key] = scene.rexUI.add.label({
            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, getXY(0.01)).setStrokeStyle(getXY(0.005), COLOR_LIGHT),
            text: scene.add.text(0, 0, key, { fontSize: 30 * MIN_XY / 600, fontStyle: 'bold' }),
            align: 'center',
        })
    }

    // Create the keyboard (grid containing the keys)
    var keyboard = scene.rexUI.add.gridButtons({
        width: getXY(0.9),
        height: getXY(0.9) * 4 / 7,

        buttons: [
            [keys['Q'], keys['W'], keys['E'], keys['R'], keys['T'], keys['Y'], keys['U'], undefined],
            [keys['A'], keys['S'], keys['D'], keys['F'], keys['G'], keys['H'], keys['J'], undefined],
            [keys['Z'], keys['X'], keys['C'], keys['V'], keys['B'], keys['N'], keys['M'], undefined],
            [keys['I'], keys['O'], keys['P'], keys['K'], keys['L'], undefined, undefined, keys['<']],
            Array(8).fill(undefined), Array(8).fill(undefined), Array(8).fill(undefined), Array(8).fill(undefined),
        ],
        space: {
            left: -30 - keys['A'].width, right: -20 - keys['A'].width, top: 10, bottom: +60,
            row: 10, column: 10
        }
    })
    keyboard.rowCount = 4
    keyboard.setColumnProportion(7, 2)
    keyboard.layout().setDepth(600)

    // Create input field
    var field
    function createLabel(scene, text) {
        field = scene.rexUI.add.label({
            width: getXY(0.7), // Minimum width of round-rectangle
            height: getXY(0.1), // Minimum height of round-rectangle
            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x5e92f3),
            text: scene.add.text(0, 0, text, { fontSize: 25 * MIN_XY / 600, fontStyle: 'bold' }),
            space: { left: 10, right: 10, top: 10, bottom: 10 }
        })
        return field
    }

    // Handle keyboard clicks
    keyboard.on('button.click', function (button, index, pointer, event) {
        var key = button.text
        var word = field.text
        if (key === '<') {
            if (word && word.length > 0) {
                word = word.substring(0, word.length - 1)
            }
        } else {
            if(word) word += key
            else word = key
        }
        field.text = word
        scene.userInput = word
    }).on('button.over', function (button, groupName, index) {
        button.getElement('background').setStrokeStyle(getXY(0.005), COLOR_DARK)
    }).on('button.out', function (button, groupName, index) {
        button.getElement('background').setStrokeStyle(getXY(0.005), COLOR_LIGHT)
    })

    // Create dialog
    var textDialog = scene.rexUI.add.dialog({
        x: SIZE_X / 2, y: SIZE_Y / 2,
        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x1565c0).setInteractive(),

        title: scene.rexUI.add.label({
            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x003c8f).setInteractive(),
            text: scene.add.text(0, 0, title, { fontSize: 35 * MIN_XY / 600, fontStyle: 'bold' }),
            space: {
                left: getXY(0.015),
                right: getXY(0.015),
                top: getXY(0.01),
                bottom: getXY(0.01)
            }
        }),

        content: scene.rexUI.add.sizer({ orientation: 1, })
            .add(createLabel(scene, ''))
            .add(keyboard).layout(),

        actions: [
            scene.rexUI.add.label({
                background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x5e92f3),
                text: scene.add.text(0, 0, negative, { fontSize: 30 * MIN_XY / 600, fontStyle: 'bold' }),
                space: { left: getXY(0.01), right: getXY(0.01), top: getXY(0.01), bottom: getXY(0.01) }
            }),
            scene.rexUI.add.label({
                background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x5e92f3),
                text: scene.add.text(0, 0, positive, { fontSize: 30 * MIN_XY / 600, fontStyle: 'bold' }),
                space: { left: getXY(0.01), right: getXY(0.01), top: getXY(0.01), bottom: getXY(0.01) }
            })
        ],

        space: {
            title: getXY(0.02),
            content: getXY(0.02),
            action: getXY(0.015),

            left: getXY(0.02),
            right: getXY(0.02),
            top: getXY(0.02),
            bottom: getXY(0.02),
        },

        align: { actions: 'right' },
        expand: { content: false }
    }).layout().setDepth(400)

    // MAGIC - ONLY TOUCH IF YOU ARE A POWERFUL WIZZARD
    for (var i = 0, cnt = reference.length; i < cnt; i++) {
        key = reference[i]
        var btn = keys[key]
        if (key == '<') btn.x += -10 / 2 - btn.width / 2
        else btn.x += 10 + btn.width
        keys[key].setDepth(1000)
    }

    // Make buttons fancy & return
    return textDialog.on('button.over', function (button, groupName, index) {
        button.getElement('background').setStrokeStyle(1, 0xffffff)
    }).on('button.out', function (button, groupName, index) {
        button.getElement('background').setStrokeStyle()
    })
}

