const { CronJob } = require('cron');
const mysql = require('./common/mysql');
const twitter = require('./common/twitter');
const { TWITTER_ID, JOB_TYPE, JOB_ACT } = require('./common/config');

/**
 * 実行
 * @returns 
 */
const run = async() => {
    const mysqlConnection = await mysql.connection();

    try {
        // 管理情報を取得
        const manage = await mysql.findManage(mysqlConnection);

        // ゲーム種類情報を取得
        const games = await mysql.findGame(mysqlConnection);

        // TwitterのDMを取得
        const dms = await twitter.client.v1.listDmEvents({ count: 50 });
        if (dms._realData.events.length === 0) return;

        // TwitterのDMから最新50件取得
        const msgs = [];
        for (let event of dms._realData.events) {
            if (event.message_create.sender_id === TWITTER_ID) continue;
            if (manage !== null && event.id <= manage.id) break;
            msgs.push({
                sender: event.message_create.sender_id,
                text: event.message_create.message_data.text.replace(/\s+/g, ' ').trim()
            });
        }

        // 取得したDMを処理
        for (let msg of msgs.reverse()) {
            const data = twitter.getParam(msg.text);
            if (data === null) continue;

            try {
                if (data.type === JOB_TYPE.FRIEND) {
                    if (data.job === JOB_ACT.SELECT) {
                        const friends = await mysql.findFriend(mysqlConnection);
                        let text = '📌ゲーム部\r\nフレンドコード一覧(敬称略)\r\n\r\n';

                        text += '【ゲームの種類】\r\n';
                        for (let game of games) {
                            text += `${game.code} ${game.name}\r\n`;
                        }
                        text += '\r\n';

                        for (let friend of friends) {
                            text += `${friend.name} ${friend.game}\r\n${friend.code}\r\n\r\n`;
                        }

                        text += 'フレンドコードは順次追加します。\r\n';
                        text += `(最終更新日：${manage.upd.toLocaleString()})`;
                        await twitter.client.v1.sendDm({ recipient_id: msg.sender, text: text });
    
                    } else if (data.job === JOB_ACT.INSERT || data.job === JOB_ACT.UPDATE) {
                        await mysql.updateFriend(mysqlConnection, data.param);
                        await twitter.client.v1.sendDm({
                            recipient_id: msg.sender,
                            text: `> ${msg.text}\r\nこれやりました。\r\n${new Date().toLocaleString()}`
                        });
    
                    } else if (data.job === JOB_ACT.DELETE) {
                        await mysql.deleteFriend(mysqlConnection, data.param);
                        await twitter.client.v1.sendDm({
                            recipient_id: msg.sender,
                            text: `> ${msg.text}\r\nこれやりました。\r\n${new Date().toLocaleString()}`
                        });
                    }
                } else if (data.type === JOB_TYPE.GAME) {
                    if (data.job === JOB_ACT.INSERT || data.job === JOB_ACT.UPDATE) {
                        await mysql.updateGame(mysqlConnection, data.param);
                        await twitter.client.v1.sendDm({
                            recipient_id: msg.sender,
                            text: `> ${msg.text}\r\nこれやりました。\r\n${new Date().toLocaleString()}`
                        });
    
                    } else if (data.job === JOB_ACT.DELETE) {
                        await mysql.deleteGame(mysqlConnection, data.param);
                        await twitter.client.v1.sendDm({
                            recipient_id: msg.sender,
                            text: `> ${msg.text}\r\nこれやりました。\r\n${new Date().toLocaleString()}`
                        });
                    }
                }
            } catch(err) {
                console.log(err);
            }
        }

        // 管理情報を更新
        await mysql.updateManage(mysqlConnection, {id: dms._realData.events[0].id, upd: new Date()});

    } catch(err) {
        console.log(err);

    } finally {
        if (mysqlConnection) mysqlConnection.end();
    }
}

/**
 * CronJob
 */
const job = new CronJob('*/3 * * * *', async() => await run());

/**
 * 起動
 */
(async() => {
    try {
        if (!job.running) job.start();

    } catch(err) {
        console.error(err);
        process.exit(1);
    }
})();
