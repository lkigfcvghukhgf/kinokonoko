//=============================================================================
// Columns_Plural.js
//
//=============================================================================
/*:
 * @plugindesc 選択肢カラム数拡張
 * @author uta_asakayu
 * @thanks aebafuti, Sigureya
 * @version 
 * 2018/07/06   v1.0
 *
 * @help 選択肢のカラム数を増やしたり減らしたりします
 * プラグインコマンド
 * utaCOLMNS(大文字小文字判別なし) or 選択肢カラム数 [数字]
 * でカラム数を変えられます
 * 半角スペースを開けてね
 * 
 * 選択肢カラム数 2
 * で選択肢が2列になります
 * 変数を直接操作することでも対応可能です。お好みでどうぞ
 * 
 * 仕様：
 * ・ウィンドウの横幅が一番広いものに揃うので無駄なスペースが空く
 * ・幅が広くなると画面に収まらなくなる
 * 
 * @param columns_Variables
 * @desc 選択肢のカラム数を保存するゲーム内変数です
 * @default 11
 *
 */
//-----------------------------------------------------------------------------
(function(){

'use strict';

var parameters = PluginManager.parameters('Columns_Plural');
var _columns_Quantity = Number(parameters['columns_Variables'] || 11);

const _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if ((command || '').toUpperCase() === 'UTACOLMNS' || (command || '') === '選択肢カラム数' ) {
        //console.log('command')
        $gameVariables.setValue(_columns_Quantity, Number(args[0]) )
    }
};


const _Window_ChoiceList_updatePlacement = Window_ChoiceList.prototype.updatePlacement;
Window_ChoiceList.prototype.updatePlacement = function() {
    _Window_ChoiceList_updatePlacement.call(this);
    //console.log('updatePlacement')
    if ( $gameVariables.value(_columns_Quantity) >= 1 ) {
        this.width = this.width * $gameVariables.value(_columns_Quantity) - ( this.padding * 2)
        this.height = this.itemHeight() * Math.ceil( $gameMessage.choices().length / $gameVariables.value(_columns_Quantity) +1);
        if (this.x + this.width >= Graphics.boxWidth) { // 選択肢ウィンドウが画面からはみ出たら
            switch ($gameMessage.choicePositionType()) {
            case 0:
                this.x = 0;
                break;
            case 1:
                this.x = (Graphics.boxWidth - this.width) / 2;
                break;
            case 2:
                this.x = Graphics.boxWidth - this.width;
                break;
            }
        }
        var messageY = this._messageWindow.y;
        if (messageY >= Graphics.boxHeight / 2) {
            this.y = messageY - this.height;
        } else {
            this.y = messageY + this._messageWindow.height;

        }
    };
};



Window_ChoiceList.prototype.maxCols = function() {
    if ( $gameVariables.value(_columns_Quantity) >= 1 ){
        return Number( $gameVariables.value(_columns_Quantity) );
    }else{
        return 1;
    };
};

// 文字数が少ないときのウィンドウ幅をもっと狭めたい方は下のコメントアウトを外してください 
/* 
Window_ChoiceList.prototype.maxChoiceWidth = function() {
    var maxWidth = 96;
        if ( $gameVariables.value(_columns_Quantity) >= 1 ) {
            maxWidth = 36
        }
        var choices = $gameMessage.choices();
    for (var i = 0; i < choices.length; i++) {
        var choiceWidth = this.textWidthEx(choices[i]) + this.textPadding() * 2;
        if (maxWidth < choiceWidth) {
            maxWidth = choiceWidth;
        }
    }
    return maxWidth;
};
*/

} )();
