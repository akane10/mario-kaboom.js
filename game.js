kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
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
  
  
  
  // so i noticed you're copying some stuff in between scenes, 1 and 2 are both
  // game scenes which use the same logic, i define them as one scene, and use
  // the scene argument to decide which level data to load
  scene('game', (level) => {
    // define some constants
  const JUMP_FORCE = 360
  const BIG_JUMP_FORCE = 550
  let CURRENT_JUMP_FORCE = JUMP_FORCE
  const MOVE_SPEED = 120
  const FALL_DEATH = 640
  const ENEMY_SPEED = 20
    let isJumping = false
  
  // draw background on the bottom, ui on top, layer "obj" is default
  layers(['bg', 'obj', 'ui'], 'obj')
  
  const maps = [
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
    [
      '£                                                £',
      '£                                                £',
      '£                                                £',
      '£                                                £',
      '£                                                £',
      '£                                                £',
      '£                                                £',
      '£                                                £',
      '£                              x x               £',
      '£          @@@@@             x x x x             £',
      '£                          x x x x x  x       -+ £',
      '£              z z       x x x x x x  x       () £',
      '£!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!£',
    ],
  ];
  
  const levelCfg = {
    width: 20,
    height: 20,
          // define each object as a list of components
          '=': [sprite('block'), solid()],
          '$': [sprite('coin'), 'coin'],
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
    '#': [sprite('mushroom'), body(), 'mushroom'],
    '!': [sprite('blue-block'), scale(0.5), solid()],
    '£': [sprite('blue-brick'), scale(0.5), solid()],
    'z': [sprite('blue-evil-shroom'), scale(0.5), 'dangerous'],
    '@': [sprite('blue-surprise'), scale(0.5), solid(), 'coin-surprise'],
    'x': [sprite('blue-steel'), scale(0.5), solid()],
          
  };
  
  const gameLevel = addLevel(maps[level], levelCfg);
  
  const score = add([
    text('0'),
    pos(30, 6),
    layer('ui'),
    {
      value: 0,
    },
  ])
  
    add([text('level ' + parseInt(level+ 1)), pos(40, 6)])
    
  
    function big() {
      let timer = 0
      let isBig = false
      return {
        update() {
          if (isBig) {
            CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
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
          CURRENT_JUMP_FORCE = JUMP_FORCE
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
      pos(30, 0),
      //makes it fall with gravity
      body(),
      big(),
      origin("bot"),
    ])
  
    player.action(() => {
      camPos(player.pos)
    })
  
    action('mushroom', (m) => {
      m.move(10, 0)
    })
  
    // grow an mushroom or flower if player's head bumps into an obj with "surprise" tag
    player.on('headbump', (obj) => {
      if (obj.is('coin-surprise')) {
        gameLevel.spawn('$', obj.gridPos.sub(0, 1)),
        destroy(obj)
        gameLevel.spawn('}', obj.gridPos.sub(0, 0))
      }
      if (obj.is('mushroom-surprise')) {
        gameLevel.spawn('#', obj.gridPos.sub(0, 1))
        destroy(obj)
        gameLevel.spawn('}', obj.gridPos.sub(0, 0))
      }
    })
  
    // player grows big collides with an "mushroom" obj
    player.collides('mushroom', (m) => {
      destroy(m)
      // as we defined in the big() component
      player.biggify(6)
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
        go("game", level + 1, { score: score.value })
      })
    })
  
    // jump with space
    keyPress('space', () => {
      // these 2 functions are provided by body() component
      if (player.grounded()) {
        isJumping = true
        player.jump(CURRENT_JUMP_FORCE )
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
  });
  
  // start with "game" scene and pass a starting argument (level 0)
  start("game", 0);
  
  
  
