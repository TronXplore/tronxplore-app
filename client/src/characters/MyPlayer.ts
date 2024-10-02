import Phaser from 'phaser'
import PlayerSelector from './PlayerSelector'
import { PlayerBehavior } from '../../../types/PlayerBehavior'
import { sittingShiftData } from './Player'
import Player from './Player'
import Network from '../services/Network'
import Chair from '../items/Chair'

import { phaserEvents, Event } from '../events/EventCenter'
import store from '../stores'
import { pushPlayerJoinedMessage } from '../stores/ChatStore'
import { ItemType } from '../../../types/Items'
import { NavKeys } from '../../../types/KeyboardState'
import { JoystickMovement } from '../components/Joystick'

export default class MyPlayer extends Player {
  private playContainerBody: Phaser.Physics.Arcade.Body
  private chairOnSit?: Chair
  public joystickMovement?: JoystickMovement
  private popupPositions: { x: number; y: number; message: string; shown: boolean; button?: string,  taskKey: string; }[]
  private popupShown: boolean = false
  private popup?: Phaser.GameObjects.Container
  private closeButton?: Phaser.GameObjects.Text
  private popupTween?: Phaser.Tweens.Tween
  private popupTimer?: Phaser.Time.TimerEvent
  private popupCooldowns: Map<string, number> = new Map();
  private readonly POPUP_COOLDOWN = 5000; // 3 seconds cooldown

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, id, frame)
    this.playContainerBody = this.playerContainer.body as Phaser.Physics.Arcade.Body
    this.popupPositions = [
      {
        x: 705,
        y: 500,
        message:
          'Welcome to the tron Adventure! To begin your journey, head to the bottom-left room to complete your first three tasks.',
          shown: false,
          taskKey:"Popup-1"
      },
      {
        x: 402,
        y: 460,
        message:
          "You've reached the right place! Here you can complete your first three tasks. Look around for interactive objects to get started.",
          shown: false,
          taskKey:"Popup-2"
      },
      {
        x: 223,
        y: 562,
        message:'Your are reaching your first',
        shown: false,
        button:'Task 1',
        taskKey: 'is_create_wallet_task1'
      },
      {
        x: 548,
        y: 553,
        message:
          'Task 2: Connect Wallet to a Website. Find the website icon and click on it to connect your newly created wallet.',
        shown: false,
        button:'Task 2',
        taskKey: 'is_connect_wallet_task2'
      },
      {
        x: 524,
        y: 656,
        message:
          'Task 3: Sign a Transaction. Go to the transaction panel and try signing your first transaction.',
          shown: false,
          button:'Task 3',
          taskKey: 'is_sign_tx_task3'
      },
      {
        x: 767,
        y: 428,
        message:
          "Welcome to the TRX Transaction Hub! Here you'll learn about handling TRX and managing network resources.",
          shown: false,
          taskKey:"Popup-3"
      },
      {
        x: 952,
        y: 313,
        message:
          'Task 4: Get Test TRX. Find the TRX faucet to receive some test TRX for transactions. Look for a water tap or coin dispenser icon.',shown: false,
        button:'Task 4',
        taskKey:"is_get_trx_task4"

      },
      {
        x: 1095,
        y: 530,
        message:
          'Task 5: Send TRX to an Address. Go to the transfer station and try sending some TRX to a practice address.',
          shown: false,
        button:'Task 5',
        taskKey:"is_send_trx_task5"
      },
      {
        x: 1208,
        y: 789,
        message:
          'Task 6: Check Bandwidth and Energy Used. Find the resource monitor to see how much bandwidth and energy your transaction consumed.',
          shown: false,
        button:'Task 6',
        taskKey:"is_check_bandwidth_task6"
      },
      {
        x: 855,
        y: 840,
        message:
          'Task 7: Get Energy for Use by Staking. Go to the staking station to learn how to stake TRX for energy.',
          shown: false,
        button:'Task 7',
        taskKey:"is_get_energy_task7",
      },
      {
        x: 405,
        y: 371,
        message: "Welcome to the TRC20 Token Operations Room! Here you'll learn about creating and managing TRC20 tokens on the TRON network.",
        shown: false,
        taskKey:"Popup-4"
      },

      // {
      //   x: 397,
      //   y: 198,
      //   message:
      //     'Task 8: Mint TRC20 Tokens. Find the token minting station to create your own TRC20 tokens. Look for a coin press or token creation icon.',
      // },

      // {
      //   x: 552,
      //   y: 275,
      //   message:
      //     'Task 9: Approve and Transfer TRC20 Tokens. Go to the token management console to learn how to approve and transfer your newly minted TRC20 tokens.',
      // },
      // {
      //   x: 683,
      //   y: 315,
      //   message:
      //     'Welcome to the Transaction Review and Certification Center! Here you can examine your blockchain activity and receive recognition for your achievements.',
      // },

      // {
      //   x: 867,
      //   y: 82,
      //   message:
      //     'Task 10: View Transaction Details. Locate the blockchain explorer terminal to review the details of your previous transactions.',
      // },

      // {
      //   x: 968,
      //   y: 142,
      //   message:
      //     'Task 11: Claim Your Achievement Certificate. Find the certification kiosk to receive a special NFT certificate for completing all the tasks in the TRON Adventure.',
      // },
    ]
    this.popupPositions.forEach(pos => pos.shown = false)
  }

  setPlayerName(name: string) {
    this.playerName.setText(name)
    phaserEvents.emit(Event.MY_PLAYER_NAME_CHANGE, name)
    store.dispatch(pushPlayerJoinedMessage(name))
  }

  setPlayerTexture(texture: string) {
    this.playerTexture = texture
    this.anims.play(`${this.playerTexture}_idle_down`, true)
    phaserEvents.emit(Event.MY_PLAYER_TEXTURE_CHANGE, this.x, this.y, this.anims.currentAnim.key)
  }

  handleJoystickMovement(movement: JoystickMovement) {
    this.joystickMovement = movement
  }

  update(
    playerSelector: PlayerSelector,
    cursors: NavKeys,
    keyE: Phaser.Input.Keyboard.Key,
    keyR: Phaser.Input.Keyboard.Key,
    network: Network
  ) {
    if (!cursors) return

    const item = playerSelector.selectedItem

    switch (this.playerBehavior) {
      case PlayerBehavior.IDLE:
        if (Phaser.Input.Keyboard.JustDown(keyE) && item?.itemType === ItemType.CHAIR) {
          const chairItem = item as Chair
          this.scene.time.addEvent({
            delay: 10,
            callback: () => {
              // update character velocity and position
              this.setVelocity(0, 0)
              if (chairItem.itemDirection) {
                this.setPosition(
                  chairItem.x + sittingShiftData[chairItem.itemDirection][0],
                  chairItem.y + sittingShiftData[chairItem.itemDirection][1]
                ).setDepth(chairItem.depth + sittingShiftData[chairItem.itemDirection][2])
                // also update playerNameContainer velocity and position
                this.playContainerBody.setVelocity(0, 0)
                this.playerContainer.setPosition(
                  chairItem.x + sittingShiftData[chairItem.itemDirection][0],
                  chairItem.y + sittingShiftData[chairItem.itemDirection][1] - 30
                )
              }

              this.play(`${this.playerTexture}_sit_${chairItem.itemDirection}`, true)
              playerSelector.selectedItem = undefined
              if (chairItem.itemDirection === 'up') {
                playerSelector.setPosition(this.x, this.y - this.height)
              } else {
                playerSelector.setPosition(0, 0)
              }
              // send new location and anim to server
              network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
            },
            loop: false,
          })
          // set up new dialog as player sits down
          chairItem.clearDialogBox()
          // chairItem.setDialogBox('Press E to leave')
          this.chairOnSit = chairItem
          this.playerBehavior = PlayerBehavior.SITTING
          return
        }

        const speed = 200
        let vx = 0
        let vy = 0

        let joystickLeft = false
        let joystickRight = false
        let joystickUp = false
        let joystickDown = false

        if (this.joystickMovement?.isMoving) {
          joystickLeft = this.joystickMovement.direction.left
          joystickRight = this.joystickMovement.direction.right
          joystickUp = this.joystickMovement.direction.up
          joystickDown = this.joystickMovement.direction.down
        }

        if (cursors.left?.isDown || cursors.A?.isDown || joystickLeft) vx -= speed
        if (cursors.right?.isDown || cursors.D?.isDown || joystickRight) vx += speed
        if (cursors.up?.isDown || cursors.W?.isDown || joystickUp) {
          vy -= speed
          this.setDepth(this.y) //change player.depth if player.y changes
        }
        if (cursors.down?.isDown || cursors.S?.isDown || joystickDown) {
          vy += speed
          this.setDepth(this.y) //change player.depth if player.y changes
        }
        // update character velocity
        this.setVelocity(vx, vy)
        this.body.velocity.setLength(speed)
        // also update playerNameContainer velocity
        this.playContainerBody.setVelocity(vx, vy)
        this.playContainerBody.velocity.setLength(speed)

        // update animation according to velocity and send new location and anim to server
        if (vx !== 0 || vy !== 0) network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
        if (vx > 0) {
          this.play(`${this.playerTexture}_run_right`, true)
        } else if (vx < 0) {
          this.play(`${this.playerTexture}_run_left`, true)
        } else if (vy > 0) {
          this.play(`${this.playerTexture}_run_down`, true)
        } else if (vy < 0) {
          this.play(`${this.playerTexture}_run_up`, true)
        } else {
          const parts = this.anims.currentAnim.key.split('_')
          parts[1] = 'idle'
          const newAnim = parts.join('_')
          // this prevents idle animation keeps getting called
          if (this.anims.currentAnim.key !== newAnim) {
            this.play(parts.join('_'), true)
            // send new location and anim to server
            network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
          }
        }
        break

      case PlayerBehavior.SITTING:
        // back to idle if player press E while sitting
        if (Phaser.Input.Keyboard.JustDown(keyE)) {
          const parts = this.anims.currentAnim.key.split('_')
          parts[1] = 'idle'
          this.play(parts.join('_'), true)
          this.playerBehavior = PlayerBehavior.IDLE
          this.chairOnSit?.clearDialogBox()
          playerSelector.setPosition(this.x, this.y)
          playerSelector.update(this, cursors)
          network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
        }
        break
    }

    // Call the existing update logic
    super.update(playerSelector, cursors, keyE, keyR, network)

    // Check for popup triggers
  
    this.checkPopupTriggers()
  }
  private checkPopupTriggers() {
    if (this.popupShown) return;
    const playerX = Math.round(this.x);
    const playerY = Math.round(this.y);
    const taskStatus = this.getTaskStatus();
    const currentTime = this.scene.time.now;

    for (const position of this.popupPositions) {
      if (
        !position.shown &&
        Math.abs(playerX - position.x) <= 30 &&
        Math.abs(playerY - position.y) <= 30
      ) {
        const cooldownEndTime = this.popupCooldowns.get(position.taskKey) || 0;
        if (currentTime < cooldownEndTime) {
          continue; // Skip this popup if it's still in cooldown
        }

        const isCompleted = taskStatus[position.taskKey];
        const message = isCompleted
          ? `You've already completed this task: ${position.message}`
          : position.message;
        const buttonText = isCompleted ? 'View Task' : position.button;
        
        this.showPopup(message, position.x, position.y - 75, buttonText, position.taskKey);
        position.shown = true;
        break;
      }
    }
  }

  private getTaskStatus(): Record<string, boolean> {
    const taskStatus = localStorage.getItem('tasks_status');
    return taskStatus ? JSON.parse(taskStatus) : {};
  }
  private showPopup(message: string, x: number, y: number, buttonText?: string, taskKey?: string) {
    this.popupShown = true

    // Create a container for the popup
    this.popup = this.scene.add.container(x, y)

    const width = 300
    const height = buttonText ? 200 : 150
    const background = this.scene.add.graphics()
    background.fillGradientStyle(0x2980b9, 0x2980b9, 0x3498db, 0x3498db, 1)
    background.fillRoundedRect(-width / 2, -height / 2, width, height, 15)

    const glow = this.scene.add.graphics()
    glow.fillStyle(0xffffff, 0.1)
    glow.fillCircle(0, 0, Math.max(width, height) / 2 + 10)

    // Create the text
    const textStyle = {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 40 },
    }
    const text = this.scene.add.text(0, buttonText ? -30 : 0, message, textStyle)
    text.setOrigin(0.5)

    this.closeButton = this.scene.add.text(width / 2 - 30, -height / 2 + 10, '×', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
    })
    this.closeButton.setInteractive({ useHandCursor: true })
    this.closeButton.on('pointerdown', () => this.closePopup())

    const elements = [background, text, this.closeButton]

    if (buttonText) {
      const actionButton = this.scene.add.text(0, 50, buttonText, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#3498db',
        padding: { x: 10, y: 5 },
      });
      actionButton.setOrigin(0.5);
      actionButton.setInteractive({ useHandCursor: true });
      actionButton.on('pointerdown', () => this.handleButtonClick(buttonText, taskKey));
      elements.push(actionButton);
    }
  
  // Add the DOM element to the popup container
  this.popup.add(elements);
    // Add background and text to the container
    this.popup.add([glow, background, text, this.closeButton])
    this.popup.setDepth(1000)

    // Make the popup disappear after 3 seconds
    this.popup.setScale(0.8)
    this.popupTween = this.scene.tweens.add({
      targets: this.popup,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut',
    })

    // Make the popup disappear after 5 seconds if not closed manually
    // this.popupTimer = this.scene.time.delayedCall(7000, () => this.closePopup())
  }
  private handleButtonClick(buttonText: string, taskKey: string | undefined) {
    const taskStatus = this.getTaskStatus();
    const isCompleted = taskKey ? taskStatus[taskKey] : false;
    if(isCompleted){
      console.log(`Viewing completed task: ${taskKey}`);
      switch (taskKey) {
        case 'is_create_wallet_task1':
              this.scene.game.events.emit('setFrame', '/task1');
          break;
        case 'is_connect_wallet_task2':
              this.scene.game.events.emit('setFrame', '/task2');
            break;
        case 'is_sign_tx_task3':
              this.scene.game.events.emit('setFrame', '/task3');
              break;
        case 'is_get_trx_task4':
              this.scene.game.events.emit('setFrame', '/task4');
              break;  
        case 'is_send_trx_task5':
                this.scene.game.events.emit('setFrame', '/task5');
                break;
        case 'is_check_bandwidth_task6':
                this.scene.game.events.emit('setFrame', '/task6');
                break;   
        case 'is_get_energy_task7':
                  this.scene.game.events.emit('setFrame', '/task7');
                  break;                     

      }
    }
    else{
    switch (buttonText) {
      case 'Task 1':
        this.scene.game.events.emit('setFrame', '/task1');
        break;
      case 'Task 2':
        this.scene.game.events.emit('setFrame', '/task2');
        break;
      case 'Task 3':
        this.scene.game.events.emit('setFrame', '/task3');
        break;
      case 'Task 4':
        this.scene.game.events.emit('setFrame', '/task4');
        break;
      case 'Task 5':
        this.scene.game.events.emit('setFrame', '/task5');
        break;
      case 'Task 6':
        this.scene.game.events.emit('setFrame', '/task6');
        break;
      case 'Task 7':
        this.scene.game.events.emit('setFrame', '/task7');
        break;
    }
    this.closePopup();
  }
}
private closePopup() {
  if (this.popup && !this.popup.list.includes(this.closeButton!)) {
    return;
  }

  if (this.popupTween) {
    this.popupTween.stop();
  }

  if (this.popupTimer) {
    this.popupTimer.remove();
  }

  this.popupTween = this.scene.tweens.add({
    targets: this.popup,
    scale: 0.8,
    alpha: 0,
    duration: 200,
    ease: 'Back.easeIn',
    onComplete: () => {
      if (this.popup) {
        this.popup.destroy();
        this.popup = undefined;
      }
      this.closeButton = undefined;
      this.popupShown = false;
      
      // Reset the 'shown' status for all positions and set cooldown
      this.popupPositions.forEach(pos => {
        pos.shown = false;
        this.popupCooldowns.set(pos.taskKey, this.scene.time.now + this.POPUP_COOLDOWN);
      });
    },
  });
}
}

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      myPlayer(x: number, y: number, texture: string, id: string, frame?: string | number): MyPlayer
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'myPlayer',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    id: string,
    frame?: string | number
  ) {
    const sprite = new MyPlayer(this.scene, x, y, texture, id, frame)

    this.displayList.add(sprite)
    this.updateList.add(sprite)

    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

    const collisionScale = [0.5, 0.2]
    sprite.body
      .setSize(sprite.width * collisionScale[0], sprite.height * collisionScale[1])
      .setOffset(
        sprite.width * (1 - collisionScale[0]) * 0.5,
        sprite.height * (1 - collisionScale[1])
      )

    return sprite
  }
)
