import Phaser from 'phaser';
import type { Subject } from '../store/useAppStore';

export type QuestNpcId = Subject;

export type QuestGameNpcInteract = {
  npcId: QuestNpcId;
};

export type QuestGameOptions = {
  parent: HTMLElement;
  width?: number;
  height?: number;
  /** Return current unlocked_level for a subject. */
  getUnlockedLevel: (subject: Subject) => number;
  onNpcInteract: (e: QuestGameNpcInteract) => void;
};

type GateKey = Subject;

class WorldScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    jump: Phaser.Input.Keyboard.Key;
  };
  private jumpCount = 0;
  private maxJumps = 2;
  private lastOnGroundAt = 0;
  private lastJumpPressedAt = 0;
  private coyoteMs = 120;
  private jumpBufferMs = 140;
  private jumpSpeed = 480;
  private moveAccel = 1600;
  private moveMax = 320;
  private moveDrag = 1400;
  private externalPackOk = true;
  private requiredTextureKeys = [
    'tex_sky',
    'tex_platform',
    'tex_player',
    'tex_npc_math',
    'tex_npc_english',
    'tex_npc_mandarin',
    'tex_gate',
  ] as const;

  private npcBodies = new Map<QuestNpcId, Phaser.GameObjects.Rectangle>();
  private gateBodies = new Map<GateKey, Phaser.GameObjects.Rectangle>();
  private gateSprites = new Map<GateKey, Phaser.GameObjects.Sprite>();
  private hintText!: Phaser.GameObjects.Text;
  private worldInfoText!: Phaser.GameObjects.Text;

  private options: QuestGameOptions;
  private nearNpc: QuestNpcId | null = null;

  constructor(options: QuestGameOptions) {
    super('WorldScene');
    this.options = options;
  }

  preload() {
    // Optional external texture pack (CC0/permissive assets user can drop in).
    // If any load fails, we fall back to generated textures.
    this.externalPackOk = true;
    this.load.on('loaderror', () => {
      this.externalPackOk = false;
    });

    // Users can create these files under: public/quest-pack/
    this.load.image('tex_sky', '/quest-pack/sky.png');
    this.load.image('tex_platform', '/quest-pack/platform.png');
    this.load.image('tex_player', '/quest-pack/player.png');
    this.load.image('tex_npc_math', '/quest-pack/npc_math.png');
    this.load.image('tex_npc_english', '/quest-pack/npc_english.png');
    this.load.image('tex_npc_mandarin', '/quest-pack/npc_mandarin.png');
    this.load.image('tex_gate', '/quest-pack/gate.png');
  }

  private hasValidExternalPack(): boolean {
    for (const key of this.requiredTextureKeys) {
      if (!this.textures.exists(key)) return false;
      const t = this.textures.get(key);
      const img = t?.source?.[0]?.image as any;
      // When Vite serves HTML or the file is missing, Phaser often ends up with a
      // missing/empty texture source, producing the green grid placeholder.
      if (!img || typeof img.width !== 'number' || img.width <= 1) return false;
      if (!img || typeof img.height !== 'number' || img.height <= 1) return false;
    }
    return true;
  }

  private ensureGeneratedTextures() {
    // Remove any bad textures so our generated ones take precedence.
    for (const key of this.requiredTextureKeys) {
      if (this.textures.exists(key)) {
        try {
          this.textures.remove(key);
        } catch {
          // ignore
        }
      }
    }
    this.createTexturePack();
  }

  private createTexturePack() {
    // Sky gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0xdcd7fc, 0xdcd7fc, 0xb1f2e6, 0xb1f2e6, 1);
    bg.fillRect(0, 0, 64, 64);
    bg.generateTexture('tex_sky', 64, 64);
    bg.destroy();

    // Platform tile
    const plat = this.add.graphics();
    plat.fillStyle(0xffffff, 1);
    plat.fillRoundedRect(0, 0, 64, 24, 10);
    plat.lineStyle(2, 0xe0ddf5, 1);
    plat.strokeRoundedRect(1, 1, 62, 22, 10);
    plat.generateTexture('tex_platform', 64, 24);
    plat.destroy();

    // Player
    const p = this.add.graphics();
    p.fillStyle(0x5c4ce5, 1);
    p.fillRoundedRect(0, 0, 34, 46, 10);
    p.fillStyle(0xffffff, 1);
    p.fillCircle(12, 18, 4);
    p.fillCircle(22, 18, 4);
    p.generateTexture('tex_player', 34, 46);
    p.destroy();

    // NPCs by subject
    const mkNpc = (key: string, color: number) => {
      const g = this.add.graphics();
      g.fillStyle(color, 1);
      g.fillRoundedRect(0, 0, 44, 54, 12);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(16, 20, 4);
      g.fillCircle(28, 20, 4);
      g.generateTexture(key, 44, 54);
      g.destroy();
    };
    mkNpc('tex_npc_math', 0x3b82f6);
    mkNpc('tex_npc_english', 0x22c55e);
    mkNpc('tex_npc_mandarin', 0xef4444);

    // Gate
    const gate = this.add.graphics();
    gate.fillStyle(0x111827, 1);
    gate.fillRoundedRect(0, 0, 26, 680, 10);
    gate.lineStyle(2, 0x334155, 1);
    gate.strokeRoundedRect(1, 1, 24, 678, 10);
    gate.generateTexture('tex_gate', 26, 680);
    gate.destroy();
  }

  create() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyE = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keys = {
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      jump: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };

    // World bounds & camera
    this.physics.world.setBounds(0, 0, 2200, 720);
    this.cameras.main.setBounds(0, 0, 2200, 720);
    this.cameras.main.setBackgroundColor('#f4f3ff');

    if (!this.externalPackOk || !this.hasValidExternalPack()) {
      this.ensureGeneratedTextures();
    }

    const sky = this.add.tileSprite(0, 0, 2200, 720, 'tex_sky').setOrigin(0, 0);
    sky.setScrollFactor(0.2, 0.2);

    // Ground/platforms
    const platforms = this.physics.add.staticGroup();
    const mkPlatform = (x: number, y: number, w: number, h: number) => {
      const tile = this.add.tileSprite(x, y, w, h, 'tex_platform').setOrigin(0.5, 0.5);
      platforms.add(tile);
      return tile;
    };
    mkPlatform(1100, 700, 2200, 40);
    mkPlatform(400, 560, 380, 30);
    mkPlatform(900, 460, 420, 30);
    mkPlatform(1500, 520, 420, 30);
    mkPlatform(1900, 420, 320, 30);

    // Player (placeholder)
    const playerSprite = this.physics.add.sprite(120, 620, 'tex_player');
    this.player = playerSprite as any;
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(34, 46);
    this.player.body.setOffset(0, 0);
    (this.player.body as Phaser.Physics.Arcade.Body).setMaxVelocity(this.moveMax, 900);
    (this.player.body as Phaser.Physics.Arcade.Body).setDragX(this.moveDrag);

    this.physics.add.collider(this.player, platforms);

    // NPCs (placeholders)
    const mkNpc = (id: QuestNpcId, x: number, y: number, color: number) => {
      const key =
        id === 'Math' ? 'tex_npc_math' : id === 'English' ? 'tex_npc_english' : 'tex_npc_mandarin';
      const npc = this.add.rectangle(x, y, 44, 54, color).setOrigin(0.5, 0.5);
      // We keep a rectangle as the interaction body, but render a sprite above it for visuals.
      const sprite = this.add.sprite(x, y, key);
      sprite.setDepth(2);
      this.physics.add.existing(npc, true);
      this.npcBodies.set(id, npc);
      const label = this.add.text(x, y - 56, id, { fontFamily: 'system-ui', fontSize: '14px', fontStyle: '700', color: '#334155' }).setOrigin(0.5, 1);
      label.setScrollFactor(1);
      return npc;
    };

    mkNpc('Math', 420, 518, 0x3b82f6);
    mkNpc('English', 980, 418, 0x22c55e);
    mkNpc('Mandarin', 1540, 478, 0xef4444);

    // Gates: each subject has a small “barrier” that disappears once level 1 is completed (unlocked_level >= 2).
    const mkGate = (subject: GateKey, x: number) => {
      const gate = this.add.rectangle(x, 680, 26, 680, 0x111827).setOrigin(0.5, 1);
      const sprite = this.add.sprite(x, 680, 'tex_gate').setOrigin(0.5, 1);
      sprite.setDepth(3);
      this.physics.add.existing(gate, true);
      this.gateBodies.set(subject, gate);
      this.gateSprites.set(subject, sprite);
    };
    mkGate('Math', 650);
    mkGate('English', 1220);
    mkGate('Mandarin', 1780);

    for (const subj of ['Math', 'English', 'Mandarin'] as const) {
      this.syncGate(subj);
    }

    // Collide with locked gates
    for (const gate of this.gateBodies.values()) {
      this.physics.add.collider(this.player, gate as any);
    }

    // Camera follow
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(180, 90);

    // HUD texts
    this.hintText = this.add
      .text(16, 16, '', {
        fontFamily: 'system-ui',
        fontSize: '16px',
        color: '#334155',
        backgroundColor: 'rgba(255,255,255,0.75)',
        padding: { x: 10, y: 8 },
      })
      .setScrollFactor(0)
      .setDepth(10)
      .setVisible(false);

    this.worldInfoText = this.add
      .text(16, 64, 'Move: ← → or A/D • Jump: ↑ or Space (double jump) • E to talk', {
        fontFamily: 'system-ui',
        fontSize: '14px',
        color: '#475569',
        backgroundColor: 'rgba(255,255,255,0.6)',
        padding: { x: 10, y: 8 },
      })
      .setScrollFactor(0)
      .setDepth(10);
  }

  update() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const now = this.time.now;

    // Reset jumps when grounded
    if (body.blocked.down) {
      this.jumpCount = 0;
      this.lastOnGroundAt = now;
    }

    const left = this.cursors.left.isDown || this.keys.left.isDown;
    const right = this.cursors.right.isDown || this.keys.right.isDown;

    if (left && !right) {
      body.setAccelerationX(-this.moveAccel);
      this.player.setFlipX(true);
    } else if (right && !left) {
      body.setAccelerationX(this.moveAccel);
      this.player.setFlipX(false);
    } else {
      body.setAccelerationX(0);
    }

    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.jump);
    const jumpHeld = this.cursors.up.isDown || this.keys.jump.isDown;

    if (jumpPressed) {
      this.lastJumpPressedAt = now;
    }

    const withinJumpBuffer = now - this.lastJumpPressedAt <= this.jumpBufferMs;
    const withinCoyote = now - this.lastOnGroundAt <= this.coyoteMs;

    const canGroundJump = withinCoyote && this.jumpCount === 0;
    const canAirJump = this.jumpCount < this.maxJumps;

    if (withinJumpBuffer && (canGroundJump || canAirJump)) {
      body.setVelocityY(-this.jumpSpeed);
      this.jumpCount += 1;
      this.lastJumpPressedAt = 0; // consume buffer
    }

    // Variable jump height: if you release early, cut upward velocity.
    if (!jumpHeld && body.velocity.y < -120) {
      body.setVelocityY(body.velocity.y * 0.6);
    }

    // Determine nearest NPC
    const near = this.findNearbyNpc();
    if (near !== this.nearNpc) {
      this.nearNpc = near;
      if (near) {
        this.hintText.setText(`Press E to talk to ${near} NPC`);
        this.hintText.setVisible(true);
      } else {
        this.hintText.setVisible(false);
      }
    }

    if (this.nearNpc && Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.options.onNpcInteract({ npcId: this.nearNpc });
    }
  }

  private findNearbyNpc(): QuestNpcId | null {
    const px = (this.player as any).x as number;
    const py = (this.player as any).y as number;
    for (const [id, npc] of this.npcBodies.entries()) {
      const dx = (npc.x - px);
      const dy = (npc.y - py);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 90) return id;
    }
    return null;
  }

  syncGate(subject: Subject) {
    const gate = this.gateBodies.get(subject);
    if (!gate) return;
    const sprite = this.gateSprites.get(subject);
    const unlockedLevel = this.options.getUnlockedLevel(subject);
    const isOpen = unlockedLevel >= 2; // level 1 completed unlocks level 2
    gate.setVisible(!isOpen);
    sprite?.setVisible(!isOpen);
    (gate.body as Phaser.Physics.Arcade.StaticBody).enable = !isOpen;
  }
}

export class QuestGame {
  private phaserGame: Phaser.Game;
  private scene: WorldScene;
  private opts: QuestGameOptions;

  constructor(opts: QuestGameOptions) {
    this.opts = opts;
    this.scene = new WorldScene(opts);

    this.phaserGame = new Phaser.Game({
      type: Phaser.AUTO,
      parent: opts.parent,
      width: opts.width ?? 980,
      height: opts.height ?? 560,
      backgroundColor: '#f4f3ff',
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 900 }, debug: false },
      },
      scene: [this.scene],
      pixelArt: true,
    });
  }

  syncGates() {
    this.scene.syncGate('Math');
    this.scene.syncGate('English');
    this.scene.syncGate('Mandarin');
  }

  destroy() {
    this.phaserGame.destroy(true);
  }
}

