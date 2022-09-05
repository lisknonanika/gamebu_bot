const { TwitterApi } = require('twitter-api-v2');
const { twitterApiString, JOB_TYPE, JOB_ACT } = require('./config');

/**
 * コマンド正規表現ルール
 */
const EXP_ADD_1 = new RegExp(/^追加\sSW-[0-9]{4}-[0-9]{4}-[0-9]{4}\s\S+\s\S+/);     // 例：追加 SW-1234-5678-9012 ばんじー 🦑
const EXP_ADD_2 = new RegExp(/^追加\sSW-[0-9]{4}-[0-9]{4}-[0-9]{4}\s\S+/);          // 例：追加 SW-1234-5678-9012 ばんじー
const EXP_UPD_1 = new RegExp(/^変更\sSW-[0-9]{4}-[0-9]{4}-[0-9]{4}\s\S+\s\S+/);     // 例：変更 SW-1234-5678-9012 ばんじー 🦑🐲
const EXP_UPD_2 = new RegExp(/^変更\sSW-[0-9]{4}-[0-9]{4}-[0-9]{4}\s\S+/);          // 例：変更 SW-1234-5678-9012 ばんじー
const EXP_NAME = new RegExp(/^名前変更\sSW-[0-9]{4}-[0-9]{4}-[0-9]{4}\s\S+/);       // 例：名前変更 SW-1234-5678-9012 ばんじー
const EXP_GAME_1 = new RegExp(/^ゲーム変更\sSW-[0-9]{4}-[0-9]{4}-[0-9]{4}\s\S+/);   // 例：ゲーム変更 SW-1234-5678-9012 🦑🐲
const EXP_GAME_2 = new RegExp(/^ゲーム変更\sSW-[0-9]{4}-[0-9]{4}-[0-9]{4}/);        // 例：ゲーム変更 SW-1234-5678-9012
const EXP_DELETE = new RegExp(/^削除\sSW-[0-9]{4}-[0-9]{4}-[0-9]{4}/);              // 例：削除 SW-1234-5678-9012
const EXP_TYPE_ADD = new RegExp(/^ゲーム種類追加\s+\S+\s+\S+/);                      // 例：ゲーム種類追加 🦑 スプラトゥーン2
const EXP_TYPE_UPD = new RegExp(/^ゲーム種類変更\s+\S+\s+\S+/);                      // 例：ゲーム種類変更 🦑 スプラトゥーン3
const EXP_TYPE_DEL = new RegExp(/^ゲーム種類削除\s+\S+/);                            // 例：ゲーム種類削除 🍄

/**
 * Twitterクライアント
 */
module.exports.client = new TwitterApi(twitterApiString);

/**
 * パラメータ取得
 * @param {string} msg 
 * @returns {any}
 */
module.exports.getParam = (msg) => {
    const command = msg.match(/^\S+/);
    if (command === null) return null;

    if (command[0] === '一覧') {
        return { type: JOB_TYPE.FRIEND, job: JOB_ACT.SELECT, param: null };
    }

    if (command[0] === '追加') {
        const commandParamText = msg.match(EXP_ADD_1) || msg.match(EXP_ADD_2);
        if (commandParamText === null) return null;
    
        const commandParams = commandParamText[0].split(' ');
        const param = { code:commandParams[1], name:commandParams[2], game:'' };
        if (commandParams.length > 3) param.game =commandParams[3];
        return { type: JOB_TYPE.FRIEND, job: JOB_ACT.INSERT, param: param };
    }

    if (command[0] === '変更') {
        const commandParamText = msg.match(EXP_UPD_1) || msg.match(EXP_UPD_2);
        if (commandParamText === null) return null;
    
        const commandParams = commandParamText[0].split(' ');
        const param = { code:commandParams[1], name:commandParams[2], game:'' };
        if (commandParams.length > 3) param.game =commandParams[3];
        return { type: JOB_TYPE.FRIEND, job: JOB_ACT.UPDATE, param: param };
    }

    if (command[0] === '名前変更') {
        const commandParamText = msg.match(EXP_NAME);
        if (commandParamText === null) return null;
    
        const commandParams = commandParamText[0].split(' ');
        const param = { code:commandParams[1], name:commandParams[2] };
        return { type: JOB_TYPE.FRIEND, job: JOB_ACT.UPDATE, param: param };
    }

    if (command[0] === 'ゲーム変更') {
        const commandParamText = msg.match(EXP_GAME_1) || msg.match(EXP_GAME_2);
        if (commandParamText === null) return null;
    
        const commandParams = commandParamText[0].split(' ');
        const param = { code:commandParams[1], game:'' };
        if (commandParams.length > 2) param.game =commandParams[2];
        return { type: JOB_TYPE.FRIEND, job: JOB_ACT.UPDATE, param: param };
    }

    if (command[0] === '削除') {
        const commandParamText = msg.match(EXP_DELETE);
        if (commandParamText === null) return null;
    
        const commandParams = commandParamText[0].split(' ');
        const param = { code:commandParams[1] };
        return { type: JOB_TYPE.FRIEND, job: JOB_ACT.DELETE, param: param };
    }

    if (command[0] === 'ゲーム種類追加') {
        const commandParamText = msg.match(EXP_TYPE_ADD);
        if (commandParamText === null) return null;
    
        const commandParams = commandParamText[0].split(' ');
        const param = { code:commandParams[1], name:commandParams[2] };
        return { type: JOB_TYPE.GAME, job: JOB_ACT.INSERT, param: param };
    }

    if (command[0] === 'ゲーム種類変更') {
        const commandParamText = msg.match(EXP_TYPE_UPD);
        if (commandParamText === null) return null;
    
        const commandParams = commandParamText[0].split(' ');
        const param = { code:commandParams[1], name:commandParams[2] };
        return { type: JOB_TYPE.GAME, job: JOB_ACT.UPDATE, param: param };
    }

    if (command[0] === 'ゲーム種類削除') {
        const commandParamText = msg.match(EXP_TYPE_DEL);
        if (commandParamText === null) return null;
    
        const commandParams = commandParamText[0].split(' ');
        const param = { code:commandParams[1] };
        return { type: JOB_TYPE.GAME, job: JOB_ACT.DELETE, param: param };
    }

    return null;
}
