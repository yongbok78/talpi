import Dexie from "dexie";

const db = new Dexie("talpi");
db.version(1).stores({
  words: `&id, word, word2, partOfSpeech, hint, meaning, meaning2, &beginner_loc, &beginner2_loc, isHard, isCore`,
});

export default db;
