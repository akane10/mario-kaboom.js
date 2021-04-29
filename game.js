kaboom({
  global: true,
  fullscreen: true,
  scale: 2,
})

loadRoot('https://i.imgur.com/')
loadSprite('coin', 'wbKxhcd.png')
loadSprite('evil-shroom-one', 'KPO3fR9.png')
loadSprite('evil-shroom-two', 'LmseqUG.png')
loadSprite('brick', 'pogC9x5.png')
loadSprite('block', 'M6rwarW.png')
loadSprite('standing-mario', 'Wb1qfhK.png')
loadSprite('mushroom', '0wMd92p.png')
loadSprite('surprise', 'gesQ1KP.png')
loadSprite('unboxed', 'bdrLpi6.png')
loadSprite('pipe-top-left', 'ReTPiWY.png')
loadSprite('pipe-top-right', 'hj2GK4n.png')
loadSprite('pipe-left', 'c1cYSbt.png')
loadSprite('pipe-right', 'nqQ79eI.png')

loadSprite('blue-block', 'fVscIbn.png')
loadSprite('blue-brick', '3e5YRQd.png')
loadSprite('blue-steel', 'gqVoI2b.png')
loadSprite('blue-evil-shroom', 'SvV4ueD.png')
loadSprite('blue-surprise', 'RMqCc1G.png')

scene('1', () => {
  // define some constants
  let JUMP_FORCE = 410
  const MOVE_SPEED = 120
  const FALL_DEATH = 640
  const ENEMY_SPEED = 20
  let isJumping = false

  // draw background on the bottom, ui on top, layer "obj" is default
  layers(['bg', 'obj', 'ui'], 'obj')

  // add level to scene
  const level = addLevel(
    [
      '                                                ',
      '                                                ',
      '                                                ',
      '             %                                  ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '    %      =*=%=                                ',
      '                                                ',
      '                                  -+            ',
      '                       ^      ^   ()            ',
      '=====================================    =======',
    ],
    {
      // TODO: derive grid size from sprite size instead of hardcode
      // grid size
      width: 20,
      height: 20,
      // define each object as a list of components
      '=': [sprite('block'), solid()],
      $: [sprite('coin'), 'coin'],
      '%': [sprite('surprise'), solid(), 'coin-surprise'],
      '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
      '}': [sprite('unboxed'), solid()],
      ')': [sprite('pipe-right'), scale(0.5), solid()],
      '(': [sprite('pipe-left'), scale(0.5), solid()],
      '-': [sprite('pipe-top-left'), scale(0.5), solid(), 'pipe'],
      '+': [sprite('pipe-top-right'), scale(0.5), solid(), 'pipe'],
      '^': [
        sprite('evil-shroom-one'),
        solid(),
        //tags as strings
        'dangerous',
      ],
      '#': [sprite('mushroom'), 'mushroom'],
    }
  )

  const score = add([
    text('0'),
    pos(6, 6),
    layer('ui'),
    {
      value: 0,
    },
  ])

  add([text('level 1'), pos(26, 6)])

  function big() {
    let timer = 0
    let isBig = false
    return {
      update() {
        if (isBig) {
          JUMP_FORCE = 550
          timer -= dt()
          if (timer <= 0) {
            this.smallify()
          }
        }
      },
      isBig() {
        return isBig
      },
      smallify() {
        this.scale = vec2(1)
        JUMP_FORCE = 410
        timer = 0
        isBig = false
      },
      biggify(time) {
        this.scale = vec2(2)
        timer = time
        isBig = true
      },
    }
  }

  const player = add([
    sprite('standing-mario'),
    //give it position to apply gravity
    pos(0, 0),
    //makes it fall with gravity
    body(),
    big(),
  ])

  player.action(() => {
    camPos(player.pos)
  })

  // grow an mushroom or flower if player's head bumps into an obj with "surprise" tag
  player.on('headbump', (obj) => {
    if (obj.is('coin-surprise')) {
      level.spawn('$', obj.gridPos.sub(0, 1))
      destroy(obj)
      level.spawn('}', obj.gridPos.sub(0, 0))
    }
    if (obj.is('mushroom-surprise')) {
      level.spawn('#', obj.gridPos.sub(0, 1))
      destroy(obj)
      level.spawn('}', obj.gridPos.sub(0, 0))
    }
  })

  action('mushroom', (m) => {
    m.move(10, 0)
    // m.body()
  })

  // player grows big collides with an "mushroom" obj
  player.collides('mushroom', (m) => {
    destroy(m)
    // as we defined in the big() component
    player.biggify(3)
  })

  // increase score if meets coin
  player.collides('coin', (c) => {
    destroy(c)
    score.value++
    score.text = score.value
  })

  player.collides('dangerous', (d) => {
    if (isJumping) {
      destroy(d)
    } else {
      go('lose', { score: score.value })
    }
  })

  action('dangerous', (m) => {
    m.move(-ENEMY_SPEED, 0)
  })

  // action() runs every frame
  player.action(() => {
    // center camera to player
    camPos(player.pos)
    // check fall death
    if (player.pos.y >= FALL_DEATH) {
      go('lose', { score: score.value })
    }
  })

  player.action(() => {
    if (player.grounded()) {
      isJumping = false
    }
  })

  player.collides('pipe', () => {
    keyPress('down', () => {
      go('2', score.value)
    })
  })

  // jump with space
  keyPress('space', () => {
    // these 2 functions are provided by body() component
    if (player.grounded()) {
      isJumping = true
      player.jump(JUMP_FORCE)
    }
  })

  keyDown('left', () => {
    player.move(-MOVE_SPEED, 0)
  })

  keyDown('right', () => {
    player.move(MOVE_SPEED, 0)
  })

  scene('lose', ({ score }) => {
    add([text(score, 32), origin('center'), pos(width() / 2, height() / 2)])
  })
})

scene('2', (score) => {
  const JUMP_FORCE = 410
  const MOVE_SPEED = 120
  const FALL_DEATH = 640
  const ENEMY_SPEED = 20
  let isJumping = false

  add([
    text(score),
    pos(6, 6),
    layer('ui'),
    {
      value: 0,
    },
  ])

  add([text('level 2'), pos(26, 6)])

  // draw background on the bottom, ui on top, layer "obj" is default
  layers(['bg', 'obj', 'ui'], 'obj')

  // add level to scene
  const level = addLevel(
    [
      '%                                                %',
      '%                                                %',
      '%                                                %',
      '%                                                %',
      '%                                                %',
      '%                                                %',
      '%                                                %',
      '%                                                %',
      '%          @@@@@               * *               %',
      '%                            * * * *             %',
      '%                          * * * * *  *       -+ %',
      '%              ^ ^       * * * * * *  *       () %',
      '%=================================================',
    ],
    {
      // TODO: derive grid size from sprite size instead of hardcode
      // grid size
      width: 20,
      height: 20,
      // define each object as a list of components
      '=': [sprite('blue-block'), scale(0.5), solid()],
      '%': [sprite('blue-brick'), scale(0.5), solid()],
      $: [sprite('coin'), 'coin'],
      '^': [sprite('blue-evil-shroom'), scale(0.5), 'dangerous'],
      '@': [sprite('blue-surprise'), scale(0.5), solid(), 'coin-surprise'],
      '*': [sprite('blue-steel'), scale(0.5), solid()],
      ')': [sprite('pipe-right'), scale(0.5), solid()],
      '(': [sprite('pipe-left'), scale(0.5), solid()],
      '-': [sprite('pipe-top-left'), scale(0.5), solid(), 'pipe'],
      '+': [sprite('pipe-top-right'), scale(0.5), solid(), 'pipe'],
    }
  )

  const player = add([
    sprite('standing-mario'),
    //give it position to apply gravity
    pos(30, 0),
    //makes it fall with gravity
    body(),
    // big()
  ])

  player.action(() => {
    camPos(player.pos)
  })

  player.on('headbump', (obj) => {
    if (obj.is('coin-surprise')) {
      level.spawn('$', obj.gridPos.sub(0, 1))
      destroy(obj)
      level.spawn('}', obj.gridPos.sub(0, 0))
    }
  })

  // increase score if meets coin
  player.collides('coin', (c) => {
    destroy(c)
    score.value++
    score.text = score.value
  })

  player.collides('dangerous', (d) => {
    if (isJumping) {
      destroy(d)
    } else {
      go('lose', { score: score.value })
    }
  })

  player.collides('pipe', () => {
    keyPress('down', () => {
      go('1', score.value)
    })
  })

  action('dangerous', (m) => {
    m.move(-ENEMY_SPEED, 0)
  })

  player.action(() => {
    if (player.grounded()) {
      isJumping = false
    }
  })

  // jump with space
  keyPress('space', () => {
    // these 2 functions are provided by body() component
    if (player.grounded()) {
      isJumping = true
      player.jump(JUMP_FORCE)
    }
  })

  keyDown('left', () => {
    player.move(-MOVE_SPEED, 0)
  })

  keyDown('right', () => {
    player.move(MOVE_SPEED, 0)
  })

  scene('lose', ({ score }) => {
    add([text(score, 32), origin('center'), pos(width() / 2, height() / 2)])
  })
})

start('1')
