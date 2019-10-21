/*【重み式ターン制システム ver.2017.11.18】
* 以下のコードについて，Demon's License (DMNL)を適用します。
* 動作の保証は致しません。
* 機能の追加は致しません。
* 権利の主張は致しません。
* その他，気分的に私じゃなくても出来ることは致しません。
* どうかご容赦ください。
* 上記以外で，何か不備がございましたらご連絡ください。
*/

(function() {
  'use strict';// 厳格モード

  // 番号は「pc キーボード コード 一覧」等でググって下さい。
  Input.keyMapper[67] = 'idle';// C

  /////////////////////////////////////////////////////////////////////////////
  // Game_Map

  var _Game_Map_setup = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function(mapId) {// mod.マップ開始時の初期化
    _Game_Map_setup.apply(this, arguments);
    this._turn = -1;// 現マップでの経過ターン
    $gamePlayer._stepAnime = true;// 常に足踏み（この辺りはエディタのスクリプトで設定しましょう）
    $gamePlayer.setMoveSpeed(4);// 通常速度（これも状態変化で変わるためイベントで書きましょう）
  };

  var _Game_Map_update = Game_Map.prototype.update;
  Game_Map.prototype.update = function(sceneActive) {// mod.毎フレームの更新
    $gameMap.checkNextTurn();// ターン進行チェック
    _Game_Map_update.apply(this, arguments);
  };

  // add.......................................................................

  Game_Map.prototype.checkNextTurn = function() {// add.
    if ($gamePlayer.isRestMover() || $gameMap.isEventRunning()) {
      return;// イベント実行中はターンを更新しません。
    }
    for (var i = 1; i < this._events.length; i++) {
      if (this._events[i].isRestMover()) {
        return;
      }
    }
    for (var i = 1; i < this._events.length; i++) {
      if (this._events[i].isNearThePlayer()) {
        this._events[i].addMoveWeight();
      } else {
        this._events[i].zeroWeight();
      }
    }
    if ($gamePlayer.getBaseWeight()) {
      $gamePlayer.addMoveWeight();
    }
    this._turn++;
  };

  /////////////////////////////////////////////////////////////////////////////
  // Game_CharacterBase

  var _Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
  Game_CharacterBase.prototype.initMembers = function() {// mod.
    _Game_CharacterBase_initMembers.apply(this, arguments);
    this._moveWeight = 0;// 行動量
  };

  var _Game_CharacterBase_setMovementSuccess = Game_CharacterBase.prototype.setMovementSuccess;
  Game_CharacterBase.prototype.setMovementSuccess = function(success) {// mod.
    _Game_CharacterBase_setMovementSuccess.apply(this, arguments);
    if (success) {// 移動に成功した際
      this.removeWeight();
    } else if (this.isSurrounded()) {
      this.removeWeight();
    }
  };

  var _Game_CharacterBase_realMoveSpeed = Game_CharacterBase.prototype.realMoveSpeed;
  Game_CharacterBase.prototype.realMoveSpeed = function() {// mod.
    var speed = _Game_CharacterBase_realMoveSpeed.apply(this, arguments);
    return (speed < 4) ? 4 : speed;// 標準未満は遅いので標準に合わせる
  };

  var _Game_CharacterBase_isDashing = Game_CharacterBase.prototype.isDashing;
  Game_CharacterBase.prototype.isDashing = function() {// mod.
    return $gamePlayer.isDashButtonPressed();// プレイヤーに合わせてダッシュ
  };

  // add.......................................................................

  Game_CharacterBase.prototype.getBaseWeight = function() {// add.
    if (this._moveType === 0) {
      return 0;// 固定
    }
    switch (this._moveSpeed) {
      case 1: return 0;// 停止
      case 2: return 18;// 1/3倍速
      case 3: return 12;// 1/2倍速
      case 4: return 6;// 通常
      case 5: return 3;// 2倍速
      case 6: return 2;// 3倍速
      case 7: return 1;// ダッシュ用
      default: throw new Error('The getBaseWeight() value is invalid');
    }
  };

  Game_CharacterBase.prototype.addMoveWeight = function() {// add.
    if (this.getBaseWeight()) {
      this._moveWeight += $gamePlayer.getBaseWeight() || 6;
    } else {
      this.initWeight();
    }
  };

  Game_CharacterBase.prototype.removeWeight = function(force) {// add.
    force = (force === undefined) ? false : force;// 強制フラグ（JSのデフォルト引数はFirefoxだけらしいので）
    if ($gameMap.isEventRunning() && !force) {
      return;
    }
    this._moveWeight -= this.getBaseWeight() || this._moveWeight;
  };

  Game_CharacterBase.prototype.initWeight = function() {// add.
    this._moveWeight = $gamePlayer.getBaseWeight() || 6;
  };

  Game_CharacterBase.prototype.zeroWeight = function() {// add.
    this._moveWeight = 0;
  };

  Game_CharacterBase.prototype.isRestMover = function() {// add.
    if (!this.getBaseWeight()) {
      this.initWeight();//「固定」「行動不能」を検知した時点で初期化
    }
    if ($gameMap.isEventRunning()) {
      return true;
    }
    return this.getBaseWeight() && this._moveWeight >= this.getBaseWeight();
  };

  Game_CharacterBase.prototype.isSurrounded = function() {// add.
    loop: for (var i = 1; i <= 9; i++) {
      var isDir8 = $gamePlayer.getInputDirection() === Input.dir8; // 8方向？
      var canPass = this.canPass(this.x, this.y, i);
      switch (i) {// 包囲判定（方向を示す数字はテンキー準拠）
        case 2: case 4: case 6: case 8: {// 上下左右
          if (canPass) {
            break loop;
          }
          continue;
        }
        case 1: case 3: case 7: {// 斜め
          if (isDir8 && canPass) {
            break loop;
          }
          continue;
        }
        case 9: {// 右上
          if (isDir8 && canPass) {
            break;
          }
          return true;// 囲まれている
        }
        default: {
          continue;
        }
      }
    }
    return false;
  };

  /////////////////////////////////////////////////////////////////////////////
  // Game_Player

  var _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
  Game_Player.prototype.moveByInput = function() {// mod.
    _Game_Player_moveByInput.apply(this, arguments);
    if (!this.isMoving() && this.canMove()) {
      if (Input.isRepeated('idle')) {// 「C」キーで足踏み
        this.removeWeight();
      }
    }
  };

  var _Game_Player_canMove = Game_Player.prototype.canMove;
  Game_Player.prototype.canMove = function() {// mod.
    return _Game_Player_canMove.apply(this, arguments) && this.isRestMover();
  };

  /////////////////////////////////////////////////////////////////////////////
  // Game_Event

  var _Game_Event_updateSelfMovement = Game_Event.prototype.updateSelfMovement;
  Game_Event.prototype.updateSelfMovement = function() {// mod.
    if (!this._locked && this.canMove()) {
      switch (this._moveType) {
        case 1: this.moveTypeRandom(); break;
        case 2: this.moveTypeTowardPlayer(); break;
        case 3: this.moveTypeCustom(); break;
        default:
      }
    }
  };

  // add.......................................................................

  Game_Event.prototype.canMove = function() {// add.
    return !$gamePlayer.isRestMover() && this.isRestMover();
  };

  /////////////////////////////////////////////////////////////////////////////
  // Scene_Map

  var _Scene_Map_updateCallMenu = Scene_Map.prototype.updateCallMenu;
  Scene_Map.prototype.updateCallMenu = function() {// mod.
    if (this.isMenuEnabled()) {
      if (this.isMenuCalled()) {
        this.menuCalling = true;
      }
      if (this.menuCalling && !$gamePlayer.isMoving() && $gamePlayer.canMove()) {
        this.callMenu();
      }
    } else {
      this.menuCalling = false;
    }
  };

  /////////////////////////////////////////////////////////////////////////////
  // Scene_ItemBase

  var _Scene_ItemBase_useItem = Scene_ItemBase.prototype.useItem;
  Scene_ItemBase.prototype.useItem = function() {// mod.
    _Scene_ItemBase_useItem.apply(this, arguments);
    $gamePlayer.removeWeight();
  };

})();
