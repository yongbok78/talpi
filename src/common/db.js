import Dexie from "dexie";

const db = new Dexie("talpi");
db.version(1).stores({
  configs: `&id, [group+book+step+difficulty], playMiliseconds, wordGap, currentIndex`,
  words: `&id, word, word2, partOfSpeech, category, hint, meaning, meaning2, beginner_loc, beginner2_loc, isHard, isCore`,
});

const books = ["beginner", "beginner2"];
const steps = [
  "1-1",
  "1-2",
  "1-3",
  "1-4",
  "1-5",
  "1-6",
  "2-1",
  "2-2",
  "2-2a",
  "2-3",
  "2-4",
  "2-5",
  "k-e",
];
const difficultys = [0, 1, 2, 3, 4];
const configs = [];
let idCnt = 1;
for (let b of books) {
  for (let s of steps) {
    for (let d of difficultys) {
      db.configs.put({
        id: idCnt++,
        group: "default",
        book: b,
        step: s,
        difficulty: d,
        playMiliseconds: 1500000,
        wordGap: 1.5,
        currentIndex: 0,
      });
    }
  }
}
db.configs.bulkPut(configs).then(console.log).catch(console.log);

export default db;
