export default class Cache {
  constructor(redis, log) {
    this.redis = redis;
    this.log = log;
  }

  serialize(person) {
    return JSON.stringify(person);
  }

  deserialize(s) {
    const data = JSON.parse(s);
    return {
      ...data,
      modified: new Date(data.modified),
      created: new Date(data.created),
    };
  }

  idToKey(id) {
    return `PERSON:${id}`;
  }

  async get(id) {
    const result = await this.redis.get(this.idToKey(id));
    if (result) {
      this.log.debug(`Retrieved Person ${id} from cache`);
      return this.deserialize(result);
    } else {
      this.log.debug(`Cache miss for Person ${id}`);
    }
  }

  async set(person) {
    const key = this.idToKey(person.id);
    await this.redis.set(key, this.serialize(person), 'EX', 60);
    this.log.debug(`Inserted Person ${person.id} in cache`);
  }

  async del(id) {
    await this.redis.del(this.idToKey(id));
    this.log.debug(`Removed Person ${id} from cache`);
  }
}
