const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'maggie12',
    database: "scratch_backend"
}).promise();

async function createRoom(roomUniqueId){
    await pool.query(
        'INSERT INTO Rooms (RoomID) VALUES (?)',
        [roomUniqueId]
    )
    const [rows] = await pool.query('SELECT * FROM Rooms WHERE RoomID = ?', [roomUniqueId]);
    return rows[0].RoomCnt;
}

async function addHistory(roomCnt, roomUniqueId, newVar, newCode, his){
    if(his != -1){
        var [old_rows] = await pool.query('SELECT * FROM Histories WHERE RoomID = ? ORDER BY HistoryCnt ASC', [roomUniqueId]);
        if(his != old_rows.length - 1){
            for(var i = his + 1; i < old_rows.length; i++){
                await pool.query('DELETE FROM Histories WHERE HistoryCnt = ?', [old_rows[i].HistoryCnt]);
            }
        }
    }
    await pool.query(
        'INSERT INTO Histories (Variable, Code, RoomCnt, RoomID) VALUES (?, ?, ?, ?)',
        [newVar, newCode, roomCnt, roomUniqueId]
    )
    const [rows] = await pool.query('SELECT * FROM Histories WHERE RoomID = ? ORDER BY HistoryCnt ASC', [roomUniqueId]);
    return rows.length - 1;
}

async function revokeHistory(roomUniqueId, his){
    his = his > 0? his - 1 : his;
    const [rows] = await pool.query('SELECT * FROM Histories WHERE RoomID = ? ORDER BY HistoryCnt ASC', [roomUniqueId]);
    var s = {
        variable: rows[his].Variable,
        code: rows[his].Code,
        his: his
    }
    return s;
}

async function restoreHistory(roomUniqueId, his){
    const [rows] = await pool.query('SELECT * FROM Histories WHERE RoomID = ? ORDER BY HistoryCnt ASC', [roomUniqueId]);
    his = his < rows.length - 1? his + 1 : rows.length - 1;
    var s = {
        variable: rows[his].Variable,
        code: rows[his].Code,
        his: his
    }
    return s;
}

module.exports = {
    createRoom,
    addHistory,
    revokeHistory,
    restoreHistory
};




