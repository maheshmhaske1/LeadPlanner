const db = require('../db')

exports.insert = (tableName, values, callback) => {
    const query = `INSERT INTO \`${tableName}\` SET ?`;
    console.log(query)
    db.query(query, values, (err, results) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, results);
    });
}

exports.get = (tableName, columns, condition, callback) => {
    let columnStr = columns ? columns.join(', ') : '*';
    let query = `SELECT ${columnStr} FROM \`${tableName}\``;
    if (condition) {
        query += ` WHERE ${condition}`;
    }
    console.log(query)
    db.query(query, (err, results) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, results);
    });
};

exports.update = (tableName, values, condition, callback) => {
    let query = `UPDATE \`${tableName}\` SET ?`;
    if (condition) {
        query += ` WHERE ${condition}`;
    }
    console.log(query)
    db.query(query, values, (err, results) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, results);
    });
};
