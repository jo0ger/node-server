/* eslint-disable */

/**
 * 1. create custom user
 * 2. create collection (Before MongoDB can save your new database, a collection name must also be specified at the time of creation.)
 */
db.createUser({
    user: 'node-server',
    pwd: 'node-server',
    roles: [{
        role: 'readWrite',
        db: 'node-server'
    }]
})
