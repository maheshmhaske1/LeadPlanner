const { db, dbB } = require('./db')

exports.insert = (tableName, values, callback) => {
    const connection = tableName == 'xx_blog_details' || tableName == 'xx_blog_tag' || tableName == 'xx_blog' ? dbB : db;
    const query = `INSERT INTO \`${tableName}\` SET ?`;
    console.log(query)
    connection.query(query, values, (err, results) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, results);
    });
}

exports.get = (tableName, columns, condition, callback) => {
    const connection = tableName == 'xx_blog_details' || tableName == 'xx_blog_tag' || tableName == 'xx_blog' ? dbB : db;
    let columnStr = columns ? columns.join(', ') : '*';
    let query = `SELECT ${columnStr} FROM \`${tableName}\``;
    if (condition) {
        query += ` WHERE ${condition}`;
    }
    query += ` ORDER BY id DESC`;
    console.log(query)
    connection.query(query, (err, results) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, results);
    });
};

exports.update = (tableName, values, condition, callback) => {
    const connection = tableName == 'xx_blog_details' || tableName == 'xx_blog_tag' || tableName == 'xx_blog' ? dbB : db;
    let query = `UPDATE \`${tableName}\` SET ?`;
    if (condition) {
        query += ` WHERE ${condition}`;
    }
    console.log(query)
    connection.query(query, values, (err, results) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, results);
    });
};

exports.delete = (tableName, condition, callback) => {
    const connection = tableName == 'xx_blog_details' || tableName == 'xx_blog_tag' || tableName == 'xx_blog' ? dbB : db;
    let query = `DELETE FROM \`${tableName}\``;
    if (condition) {
        query += ` WHERE ${condition}`;
    }
    console.log(query);
    connection.query(query, (err, results) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, results);
    });
};
