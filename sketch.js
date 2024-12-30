let player1, player2;
let backgroundImg;
let collisionEffect; // 新增碰撞特效圖片
let isColliding = false; // 碰撞狀態
let effectFrame = 0; // 特效動畫幀
let CANVAS_WIDTH, CANVAS_HEIGHT;
let effectImg; // 特效圖片
let player1Effect = {active: false, frame: 0};
let player2Effect = {active: false, frame: 0};

function preload() {
  // 預先載入所有圖片
  backgroundImg = loadImage('3498.png');
  effectImg = loadImage('boom.png'); // 載入特效圖片
}

function setup() {
  // 設定全螢幕畫布
  CANVAS_WIDTH = windowWidth;
  CANVAS_HEIGHT = windowHeight;
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // 創建兩個角色，位置設定在畫面中央偏左和偏右
  const centerY = CANVAS_HEIGHT * 0.7; // 角色在畫面70%的高度位置
  player1 = new Player1(CANVAS_WIDTH * 0.3, centerY, 'left');
  player2 = new Player2(CANVAS_WIDTH * 0.7, centerY, 'right');
}

function draw() {
  // 繪製背景，覆蓋整個畫面
  image(backgroundImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  player1.update();
  player2.update();
  
  // 檢查碰撞
  checkCollision();
  
  player1.display();
  player2.display();
  
  // 顯示碰撞特效
  if (isColliding) {
    displayCollisionEffect();
  }
  
  handleInput();
  drawControlHints();
}

// 視窗大小改變時調整畫布
function windowResized() {
  CANVAS_WIDTH = windowWidth;
  CANVAS_HEIGHT = windowHeight;
  resizeCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // 重新調整角色位置
  const centerY = CANVAS_HEIGHT * 0.7;
  player1.x = CANVAS_WIDTH * 0.3;
  player1.y = centerY;
  player2.x = CANVAS_WIDTH * 0.7;
  player2.y = centerY;
  
  // 更新角色移動邊界
  player1.minX = CANVAS_WIDTH * 0.1;  // 左邊界為螢幕10%位置
  player1.maxX = CANVAS_WIDTH * 0.45; // 右邊界為螢幕45%位置
  player2.minX = CANVAS_WIDTH * 0.55; // 左邊界為螢幕55%位置
  player2.maxX = CANVAS_WIDTH * 0.9;  // 右邊界為螢幕90%位置
}

// 處理鍵盤輸入
function handleInput() {
  // 玩家1控制
  if (keyIsDown(81)) { // Q鍵 - 向左移動
    player1.moveLeft();
  }
  if (keyIsDown(69)) { // E鍵 - 向右移動
    player1.moveRight();
  }
  
  // 玩家2控制
  if (keyIsDown(75)) { // K鍵 - 向左移動
    player2.moveLeft();
  }
  if (keyIsDown(76)) { // L鍵 - 向右移動
    player2.moveRight();
  }
}

// 按鍵按下時觸發
function keyPressed() {
  // 玩家1動作控制
  switch(keyCode) {
    case 65: // A鍵 - 待機
      player1.setAction(0);
      break;
    case 83: // S鍵 - 攻擊
      player1.setAction(1);
      break;
    case 68: // D鍵 - 防禦
      player1.setAction(2);
      break;
    case 71: // G鍵 - 玩家1特效
      if (!player1Effect.active) {
        player1Effect.active = true;
        player1Effect.frame = 0;
      }
      break;
  }
  
  // 玩家2動作控制
  switch(keyCode) {
    case 37: // 左方向鍵 - 待機
      player2.setAction(0);
      break;
    case 40: // 下方向鍵 - 攻擊
      player2.setAction(1);
      break;
    case 39: // 右方向鍵 - 防禦
      player2.setAction(2);
      break;
    case 72: // H鍵 - 玩家2特效
      if (!player2Effect.active) {
        player2Effect.active = true;
        player2Effect.frame = 0;
      }
      break;
  }
}

// 按鍵放開時觸發
function keyReleased() {
  // 玩家1回到待機狀態
  if ([65, 83, 68].includes(keyCode)) { // A, S, D
    player1.setAction(0);
  }
  
  // 玩家2回到待機狀態
  if ([37, 40, 39].includes(keyCode)) { // 左, 下, 右方向鍵
    player2.setAction(0);
  }
}

// 玩家1類別
class Player1 {
  constructor(x, y, side) {
    this.x = x;
    this.y = y;
    this.side = side;
    this.currentAction = 0;
    this.frameIndex = 0;
    this.health = 100;
    this.isHurt = false;
    this.moveSpeed = 5;
    this.minX = 50;
    this.maxX = CANVAS_WIDTH/2 - 100;
    
    // 簡化動作設定
    this.actions = [
      {
        sprite: loadImage('wave.png'),
        frameCount:5,
        frameWidth: 151,
        frameHeight: 140
      },
      {
        sprite: loadImage('kick.png'),
        frameCount: 10,
        frameWidth: 123,
        frameHeight: 110
      },
      {
        sprite: loadImage('ready.png'),
        frameCount: 9,
        frameWidth: 84,
        frameHeight: 86
      }
    ];
    this.animationSpeed = 0.2;
  }
  
  update() {
    this.frameIndex = (this.frameIndex + this.animationSpeed) % this.actions[this.currentAction].frameCount;
  }
  
  display() {
    push();
    
    // 受傷效果
    if (this.isHurt) {
      tint(255, 0, 0);
    }
    
    const currentAction = this.actions[this.currentAction];
    const frameIndex = Math.floor(this.frameIndex);
    
    // 確保圖片在正確位置顯示
    image(
      currentAction.sprite,
      this.x - currentAction.frameWidth/2, // 中心點對齊
      this.y - currentAction.frameHeight,  // 底部對齊地面
      currentAction.frameWidth,
      currentAction.frameHeight,
      frameIndex * currentAction.frameWidth,
      0,
      currentAction.frameWidth,
      currentAction.frameHeight
    );
    
    pop();
    
    // 顯示生命值條
    this.displayHealthBar();
  }
  
  displayHealthBar() {
    const barWidth = 100;
    const barHeight = 10;
    const x = this.x - barWidth/2; // 生命值條置中
    const y = this.y - this.actions[this.currentAction].frameHeight - 20;
    
    // 背景條
    fill(100);
    rect(x, y, barWidth, barHeight);
    
    // 生命值條
    const healthWidth = (this.health / 100) * barWidth;
    fill(this.health > 30 ? color(0, 255, 0) : color(255, 0, 0));
    rect(x, y, healthWidth, barHeight);
    
    // 顯示數值
    fill(255);
    textAlign(CENTER);
    textSize(12);
    text(this.health, x + barWidth/2, y + barHeight - 1);
  }
  
  setAction(actionIndex) {
    if (this.currentAction !== actionIndex) {
      this.currentAction = actionIndex;
      this.frameIndex = 0;
    }
  }
  
  moveLeft() {
    this.x = Math.max(this.minX, this.x - this.moveSpeed);
  }
  
  moveRight() {
    this.x = Math.min(this.maxX, this.x + this.moveSpeed);
  }
  
  displayEffect() {
    if (player1Effect.active) {
      const EFFECT_FRAME_WIDTH = 192;
      const EFFECT_FRAME_HEIGHT = 192;
      const TOTAL_FRAMES = 8;
      
      // 繪製特效
      image(
        effectImg,
        this.x - EFFECT_FRAME_WIDTH/2,
        this.y - EFFECT_FRAME_HEIGHT,
        EFFECT_FRAME_WIDTH,
        EFFECT_FRAME_HEIGHT,
        Math.floor(player1Effect.frame) * EFFECT_FRAME_WIDTH,
        0,
        EFFECT_FRAME_WIDTH,
        EFFECT_FRAME_HEIGHT
      );
      
      // 更新特效幀
      player1Effect.frame += 0.5;
      
      // 特效結束
      if (player1Effect.frame >= TOTAL_FRAMES) {
        player1Effect.active = false;
        player1Effect.frame = 0;
      }
    }
  }
}

// 玩家2類別
class Player2 {
  constructor(x, y, side) {
    this.x = x;
    this.y = y;
    this.side = side;
    this.currentAction = 0;
    this.frameIndex = 0;
    this.health = 100;
    this.isHurt = false;
    this.moveSpeed = 5;
    this.minX = CANVAS_WIDTH * 0.6; // 限制移動範圍
    this.maxX = CANVAS_WIDTH;
    
    // 確保圖片載入
    this.actions = [
      { // 待機動作
        sprite: loadImage('fall.png'),
        frameCount: 6,
        frameWidth: 166,
        frameHeight: 135
      },
      {
        sprite: loadImage('wing.png'),
        frameCount: 6,
        frameWidth: 129,
        frameHeight: 148
      },
      {
        sprite: loadImage('jump.png'),
        frameCount: 8,
        frameWidth: 125,
        frameHeight: 129
      }
    ];
    this.animationSpeed = 0.2;
  }
  
  update() {
    this.frameIndex = (this.frameIndex + this.animationSpeed) % this.actions[this.currentAction].frameCount;
  }
  
  display() {
    push();
    
    if (this.isHurt) {
      tint(255, 0, 0);
    }
    
    const currentAction = this.actions[this.currentAction];
    const frameIndex = Math.floor(this.frameIndex);
    
    // 翻轉玩家2的圖片
    translate(this.x, this.y);
    scale(-1, 1);
    
    image(
      currentAction.sprite,
      -currentAction.frameWidth/2, // 考慮翻轉後的位置
      -currentAction.frameHeight,
      currentAction.frameWidth,
      currentAction.frameHeight,
      frameIndex * currentAction.frameWidth,
      0,
      currentAction.frameWidth,
      currentAction.frameHeight
    );
    
    pop();
    
    this.displayHealthBar();
  }
  
  displayHealthBar() {
    // 與 Player1 相同的生命值條顯示邏輯
    const barWidth = 100;
    const barHeight = 10;
    const x = this.x - barWidth/2;
    const y = this.y - this.actions[this.currentAction].frameHeight - 20;
    
    fill(100);
    rect(x, y, barWidth, barHeight);
    
    const healthWidth = (this.health / 100) * barWidth;
    fill(this.health > 30 ? color(0, 255, 0) : color(255, 0, 0));
    rect(x, y, healthWidth, barHeight);
    
    fill(255);
    textAlign(CENTER);
    textSize(12);
    text(this.health, x + barWidth/2, y + barHeight - 1);
  }
  
  setAction(actionIndex) {
    if (this.currentAction !== actionIndex) {
      this.currentAction = actionIndex;
      this.frameIndex = 0;
    }
  }
  
  moveLeft() {
    this.x = Math.max(this.minX, this.x - this.speed);
  }
  
  moveRight() {
    this.x = Math.min(this.maxX, this.x + this.speed);
  }
  
  moveUp() {
    this.y = Math.max(this.minY, this.y - this.moveSpeed);
  }
  
  moveDown() {
    this.y = Math.min(this.maxY, this.y + this.moveSpeed);
  }
  
  displayEffect() {
    if (player2Effect.active) {
      const EFFECT_FRAME_WIDTH = 192;
      const EFFECT_FRAME_HEIGHT = 192;
      const TOTAL_FRAMES = 8;
      
      push();
      translate(this.x, this.y);
      scale(-1, 1); // 水平翻轉特效
      
      // 繪製特效
      image(
        effectImg,
        -EFFECT_FRAME_WIDTH/2,
        -EFFECT_FRAME_HEIGHT,
        EFFECT_FRAME_WIDTH,
        EFFECT_FRAME_HEIGHT,
        Math.floor(player2Effect.frame) * EFFECT_FRAME_WIDTH,
        0,
        EFFECT_FRAME_WIDTH,
        EFFECT_FRAME_HEIGHT
      );
      
      pop();
      
      // 更新特效幀
      player2Effect.frame += 0.5;
      
      // 特效結束
      if (player2Effect.frame >= TOTAL_FRAMES) {
        player2Effect.active = false;
        player2Effect.frame = 0;
      }
    }
  }
}

function checkCollision() {
  // 獲取兩個角色的碰撞範圍
  const p1Action = player1.actions[player1.currentAction];
  const p2Action = player2.actions[player2.currentAction];
  
  // 計算碰撞範圍
  const p1Right = player1.x + p1Action.frameWidth;
  const p1Left = player1.x;
  const p2Right = player2.x + p2Action.frameWidth;
  const p2Left = player2.x;
  
  // 檢查是否碰撞
  if (p1Right > p2Left && p1Left < p2Right) {
    if (!isColliding) {
      // 開始新的碰撞
      isColliding = true;
      effectFrame = 0;
    }
  } else {
    isColliding = false;
  }
}

function displayCollisionEffect() {
  // 特效設定
  const EFFECT_FRAME_COUNT = 5; // 特效總幀數
  const EFFECT_FRAME_WIDTH = 106; // 特效每幀寬度
  const EFFECT_FRAME_HEIGHT = 184; // 特效每幀高度
  const EFFECT_SPEED = 0.5; // 特效動畫速度
  
  // 計算特效位置（兩個角色的中間）
  const effectX = (player1.x + player2.x) / 2 - EFFECT_FRAME_WIDTH / 2;
  const effectY = Math.min(player1.y, player2.y) - EFFECT_FRAME_HEIGHT / 4;
  
  // 繪製特效
  image(
    collisionEffect,
    effectX,
    effectY,
    EFFECT_FRAME_WIDTH,
    EFFECT_FRAME_HEIGHT,
    Math.floor(effectFrame) * EFFECT_FRAME_WIDTH,
    0,
    EFFECT_FRAME_WIDTH,
    EFFECT_FRAME_HEIGHT
  );
  
  // 更新特效幀
  effectFrame += EFFECT_SPEED;
  
  // 特效播放完畢
  if (effectFrame >= EFFECT_FRAME_COUNT) {
    effectFrame = 0;
  }
}

function drawControlHints() {
  textSize(16);
  fill(255);
  textAlign(LEFT);
  
  // 玩家1控制提示
  text('玩家1：', 20, 30);
  text('移動：Q (左) / E (右) / W (上) / S (下)', 20, 50);
  text('動作：A (待機) / D (攻擊) / F (防禦)', 20, 70);
  text('特效：G', 20, 90); // 新增特效按鍵提示
  
  // 玩家2控制提示
  textAlign(RIGHT);
  text('玩家2：', CANVAS_WIDTH - 20, 30);
  text('移動：K (左) / L (右) / I (上) / J (下)', CANVAS_WIDTH - 20, 50);
  text('動作：← (待機) / ↓ (攻擊) / → (防禦)', CANVAS_WIDTH - 20, 70);
  text('特效：H', CANVAS_WIDTH - 20, 90); // 新增特效按鍵提示
}
