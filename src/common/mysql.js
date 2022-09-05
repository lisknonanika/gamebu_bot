const mysql = require('mysql2/promise');
const config = require('./config');

/**
 * MySQLコネクション
 * @returns {Connection}
 */
module.exports.connection = async() => {
    try {
        const connection = await mysql.createConnection(config.mysqlConnectionString);
        await connection.connect();
        return connection;

    } catch(err) {
        console.error(err);
        return null;
    }
};

/**
 * ゲーム情報取得
 * @param {Connection} con 
 * @param {any} param 
 * @returns {any}
 */
module.exports.findGame = async(con, param) => {
    let rows;
    if (param) {
        const query = 'SELECT * FROM `game` WHERE `code` = ?';
        [rows] = await con.query(query, param.code);

    } else {
        const query = 'SELECT * FROM `game` ORDER BY `name`';
        [rows] = await con.query(query);
    }
    return rows.length > 0? rows: [];
};

/**
 * ゲーム情報更新
 * @param {Connection} con 
 * @param {any} param 
 * @returns {any}
 */
module.exports.updateGame = async(con, param) => {
    const games = await this.findGame(con, param);
    if (games.length > 0) {
        const query = 'UPDATE `game` SET ?  WHERE `code` = ?';
        await con.query(query, [param, games[0].code]);

    } else {
        const query = 'INSERT INTO `game` SET ?';
        await con.query(query, param);
    }
};

/**
 * ゲーム情報削除
 * @param {Connection} con 
 * @param {any} param 
 * @returns {any}
 */
module.exports.deleteGame = async(con, param) => {
    const query = 'DELETE FROM `game` WHERE `code` = ?';
    await con.query(query, param.code);
};

/**
 * フレンド情報検索
 * @param {Connection} con 
 * @param {any} param 
 * @returns {any}
 */
module.exports.findFriend = async(con, param) => {
    let rows;
    if (param) {
        const query = 'SELECT * FROM `friend` WHERE `code` = ?';
        [rows] = await con.query(query, param.code);

    } else {
        const query = 'SELECT * FROM `friend` ORDER BY `code`';
        [rows] = await con.query(query);
    }
    return rows.length > 0? rows: [];
};

/**
 * フレンド情報更新
 * @param {Connection} con 
 * @param {any} param 
 * @returns {any}
 */
module.exports.updateFriend = async(con, param) => {
    if (param.game) {
        const games = await this.findGame(con);
        let newGame = '';
        for (let data of games) {
            if (param.game.indexOf(data.code) >= 0) newGame += data.code;
        }
        param.game = newGame;
    }

    const friends = await this.findFriend(con, param);
    if (friends.length > 0) {
        const query = 'UPDATE `friend` SET ?  WHERE `code` = ?';
        await con.query(query, [param, friends[0].code]);
        
    } else {
        const query = 'INSERT INTO `friend` SET ?';
        await con.query(query, param);
    }
};

/**
 * フレンド情報削除
 * @param {Connection} con 
 * @param {any} param 
 * @returns {any}
 */
module.exports.deleteFriend = async(con, param) => {
    const query = 'DELETE FROM `friend` WHERE `code` = ?';
    await con.query(query, param.code);
    return true;
};

/**
 * 管理情報取得
 * @param {Connection} con 
 * @param {any} param 
 * @returns {any}
 */
module.exports.findManage = async(con) => {
    const query = 'SELECT * FROM `manage`';
    const [rows] = await con.query(query);
    return rows.length > 0? rows[0]: null;
};

/**
 * 管理情報更新
 * @param {Connection} con 
 * @param {any} param 
 * @returns {any}
 */
module.exports.updateManage = async(con, param) => {
    const manage = await this.findManage(con);
    if (manage !== null) {
        const query = 'UPDATE `manage` SET ? WHERE `id` = ?';
        await con.query(query, [param, manage.id]);

    } else {
        const query = 'INSERT INTO `manage` SET ?';
        await con.query(query, param);
    }
};
