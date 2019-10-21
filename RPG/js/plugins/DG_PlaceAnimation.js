//=====================================================================
// Driftwood Gaming - PlaceAnimation
// DG_PlaceAnimation.js
//=====================================================================

var Imported = Imported || {};
Imported.DG_PlaceAnimation = true;

var DG = DG || {};
DG.PlaceAnimation = DG.PlaceAnimation || {};

//=====================================================================
/*:
 * @plugindesc BETA v0.80 This is used to place an animation
 * anywhere without requiring a player or an event as a target.
 * @author Driftwood Gaming
 * 
 * @param Default Animation
 * @desc Sets the animation to be used if none is specified.
 * Default: 4
 * @default 4
 *
 * @param Default X Location
 * @desc Sets the X location to be used if none is specified.
 * Default: 640
 * @default 640
 *
 * @param Default Y Location
 * @desc Sets the Y location to be used if none is specified.
 * Default: 360
 * @default 360
 *
 * @param Mirror Options
 * @desc Sets the mirror options. 0 = not mirrored; 1 = mirrored.
 * Default: 0
 * @default 0
 *
 * @param Animation Delay
 * @desc Sets the animation delay to be used if none is specified.
 * Default: 5
 * @default 5
 *
 * @param Wait For Completion
 * @desc Wait for completion on animations?   no wait = 0  wait = 1
 * Default: 0  (This doesn't work yet.)
 * @default 0
 *
 * @help
 * =====================================================================
 * Instructions
 * =====================================================================
 *
 * Driftwood Gaming Plugins - PlaceAnimation is to be used with RPG Maker MV. 
 * This plugin is used to show an animation anywhere on the screen without 
 * having to target a player sprite or event location.
 *
 *     You can design your animations inside of:
 *      RPG Maker MV > Database > Animations
 *
 * You may send me your Bug Reports by any of these methods:	
 * Private Message:     http://driftwoodgaming.com
 * Private Message:     http://www.youtube.com/DriftwoodGamingMV
 * Direct Message:      http://www.twitter.com/DriftwoodGaming
 * Private Message:     http://www.patreon.com/DriftwoodGaming
 *
 * I hope you find a use for this plugin. Thanks for your support.
 *
 * ========================================================================
 * What are X and Y locations?
 * ========================================================================
 *
 * Here is how the engine defines where x location and y location are:
 * The top left-most part of the screen is 0,0. The bottom right-most
 * part of the screen is your current resolution. I.E. 1280,720. (HD)
 *
 * 0,0                                                             1280,0
 *
 *
 *
 *
 *                                640,360	
 * 
 *
 *
 *
 * 0,720                                                          1280,720
 *
 * ========================================================================
 * Plugin Commands:
 * ========================================================================
 *
 * PlaceAnim animation#, x-location, y-location, mirror?, delay.
 *
 * I.E.     PlaceAnim 12 640 360 0 5
 *
 * This places the animation #12 (which can be made in the database) at 
 * the location 640, 360. It's not mirrored and has a 5 frame delay before
 * it starts to play.
 *
 * ========================================================================
 * Script Calls:
 * ========================================================================
 *
 * If you want to use this plugin dynamically with your plugins or the in
 * game editor you can use the Script Call:
 *
 * this.PlaceAnimation(anim, x, y, mirror, delay);
 *
 * I.E.   this.PlaceAnimation(4, 640, 360, 0, 0);
 *
 * Using that script call will play animation #4 in the center of the screen
 * (If you using standard HD resolution) without mirroring the animation and
 * give no delay before playing.
 *
 * Alternatively you can execute most Plugin Commands as a Script call.
 * To do this for PlaceAnim you would use:
 *
 *    this.pluginCommand('PlaceAnim', [anim, x, y, mirror, delay]);
 *
 *   I.E. this.pluginCommand('PlaceAnim', [4, 640, 360, 0, 0]);
 *
 * Keep in mind the arguments must be referenced as an array. ( [] )
 *
 * ========================================================================
 * Known Issues:
 * ========================================================================
 * - Wait for completion isn't implemented yet.
 *
 * - Sprites will remain in memory until a scene change.
 *
 * - Some animations that have flash screen properties will only display
 *   on the left side of the screen. 
 *
 * ========================================================================
 * Changelog
 * ========================================================================
 *
 * Version 0.80:
 * - Script Call functionality added.
 *
 * Version 0.70:
 * - Plugin Command functionality added.
 * - Default Parameter options added.
 *
 * Version 0.60:
 * - PlaceAnim functions added.
 * 
 * Version 0.50:
 * - Plugin prototype has been created.
 *
 */
 //========================================================================
 // Parameter Variables
 //========================================================================

 DG.Parameters = PluginManager.parameters('DG_PlaceAnimation');
 DG.Param = DG.Param || {};

 DG.Param.DefaultAnim = Number(DG.Parameters['Default Animation']);
 DG.Param.DefaultX = Number(DG.Parameters['Default X Location']);
 DG.Param.DefaultY = Number(DG.Parameters['Default Y Location']);
 DG.Param.Mirror = Number(DG.Parameters['Mirror Options']);
 DG.Param.AnimDelay = Number(DG.Parameters['Animation Delay']);
 DG.Param.WaitForComp = Number(DG.Parameters['Wait For Completion']);  //move parameters into the function

 //========================================================================
 // Plugin Commands
 //========================================================================

Game_Interpreter.prototype.PlaceAnimation = function(anim, x, y, mirror, delay) {
	this.pluginCommand('PlaceAnim', [anim, x, y, mirror, delay]);
}

DG.PlaceAnimation.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
  	DG.PlaceAnimation.Game_Interpreter_pluginCommand.call(this, command, args);

  	if (command === 'PlaceAnim') {

    	var sprite = new Sprite_Base();
    	var animId = args[0] || DG.Param.DefaultAnim;

    	sprite.anim = $dataAnimations[animId];
		sprite.x = args[1] || DG.Param.DefaultX;
		sprite.y = args[2] || DG.Param.DefaultY;
		sprite.mirror = args[3] || DG.Param.Mirror;
		sprite.delay = args[4] || DG.Param.AnimDelay;
		sprite.waitFor = args[5] || DG.Param.WaitForComp;
		//How do I implement the use of Wait for Completion?

		sprite.dump = true;

		if(SceneManager._scene){  
		SceneManager._scene.addChild(sprite);
		sprite.startAnimation(sprite.anim, sprite.mirror, sprite.delay);
		}

		//How do I dump the sprite without locking the last frame on screen?

		//var alias_prototype_isAnimationPlaying = Game_CharacterBase.prototype.isAnimationPlaying;
		//Game_CharacterBase.prototype.isAnimationPlaying = function() {
    	//	//return this._animationId > 0 || this._animationPlaying;//this is from rpg_objects.js
    	//	alias_prototype_isAnimationPlaying.call(this); //call original method

		//}

		//for(var i = 0; i < SceneManager._scene.children.length; i++) {
		//	if((SceneManager._scene.children[i].dump === true) && (!this.isAnimationPlaying())) {
		//		SceneManager._scene.removeChild(SceneManager._scene.children[i]);
				
		//	}
		//}
	}
}
//===========================================================================
// Script Call
// call the plugin command as a script call with  this.pluginCommand('PlaceAnim', [x, y, mirror, delay]);
//===========================================================================

/*
(DG.PlaceAnimation.SC = function(anim, x, y, mirror, delay){
	var sprite = new Sprite_Base();
    var animId = this.anim || DG.Param.DefaultAnim;
    anim = 
    sprite.anim = $dataAnimations[animId];
	sprite.x = this.x || DG.Param.DefaultX;
	sprite.y = this.y || DG.Param.DefaultY;
	sprite.mirror = this.mirror || DG.Param.Mirror;
	sprite.delay = this.delay || DG.Param.AnimDelay;
	sprite.waitFor = this.waitFor || DG.Param.WaitForComp;
	//How do I implement the use of Wait for Completion?

	sprite.dump = true;

	if(SceneManager._scene){  
	SceneManager._scene.addChild(sprite);
	sprite.startAnimation(sprite.anim, sprite.mirror, sprite.delay);
	};
})();
*/