const redis = require("redis");
const keys = require("../config/keys");


// const redisClient = redis.createClient(keys.RedisUrl);

const redisClient = redis.createClient({
    password: keys.redisPassword,
    socket: {
        host: keys.redisHost,
        port: keys.redisPort
    }
});


const getFromRedis = async (query, hashKey) => {

  const key = _getQueryKey(query);
  const cacheValue = await redisClient.hGet(JSON.stringify(hashKey), key);
  // return JSON.parse(cacheValue)

  // console.log('cacheValue: ', cacheValue)

  if (cacheValue) {
    const doc = JSON.parse(cacheValue);

    return Array.isArray(doc)
      ? doc.map((d) => new query.model(d))
      : new query.model(doc);
  }
};

const saveInRedis = async (query, hashKey, cacheValue) => {
  const key = _getQueryKey(query);
  const response = await redisClient.hSet(JSON.stringify(hashKey), key, JSON.stringify(cacheValue))
  console.log('response: ', response)
};

const clearDataInRedis = async (hashKey) => {
//   const key = _getQueryKey(query);
  await redisClient.del(JSON.stringify(hashKey));
};

const _getQueryKey = (query) => {
  const key = JSON.stringify(
    Object.assign({}, query.getQuery(), {
      collection: query.mongooseCollection.name,
    })
  );
  return key;
};

module.exports = {
  redisClient,
  getFromRedis,
  saveInRedis,
  clearDataInRedis,
};
