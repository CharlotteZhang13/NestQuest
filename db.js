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

async function addHistory(roomCnt, roomUniqueId, newVar, newCode){
    await pool.query(
        'INSERT INTO Histories (Variable, Code, RoomCnt, RoomID) VALUES (?, ?, ?, ?)',
        [newVar, newCode, roomCnt, roomUniqueId]
    )
    const [rows] = await pool.query('SELECT * FROM Histories WHERE RoomID = ?', [roomUniqueId]);
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

module.exports = {
    createRoom,
    addHistory,
    revokeHistory
};




