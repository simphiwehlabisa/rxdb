require('babel-polyfill');
const RxDB = require('../../../');
RxDB.plugin(require('pouchdb-adapter-node-websql'));
RxDB.plugin(require('pouchdb-adapter-http'));
RxDB.plugin(require('pouchdb-replication'));

const Database = {};

const heroSchema = {
    title: 'hero schema',
    description: 'describes a simple hero',
    version: 0,
    type: 'object',
    properties: {
        name: {
            type: 'string',
            primary: true
        },
        color: {
            type: 'string'
        }
    },
    required: ['color']
};

const SYNC_URL = 'http://localhost:10102/';

const create = async() => {
    const database = await RxDB
        .create({
            name: 'heroesdb',
            adapter: 'websql',
            password: 'myLongAndStupidPassword',
            multiInstance: true
        });
    await database.collection({
        name: 'heroes',
        schema: heroSchema,
        statics: {
            async addHero(name, color) {
                return this.upsert({
                    name,
                    color
                });
            }
        }
    });
    database.collections.heroes.sync(SYNC_URL + 'hero/');
    return database;
};

let createPromise = null;
Database.get = async() => {
    if (!createPromise) createPromise = create();
    return createPromise;
};


module.exports = Database;
