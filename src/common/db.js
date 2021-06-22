import { ref, reactive, watch, computed } from "vue";
import Dexie from "dexie";

const books = [
  {
    label: "초급편",
    value: "beginner",
    steps: [
      { label: "1-1", value: "1-1" },
      { label: "1-2", value: "1-2" },
      { label: "1-3", value: "1-3" },
      { label: "1-4", value: "1-4" },
      { label: "1-5", value: "1-5" },
      { label: "1-6", value: "1-6" },
      { label: "2-1", value: "2-1" },
      { label: "2-2", value: "2-2" },
      { label: "2-2 추가", value: "2-2a" },
      { label: "2-3", value: "2-3" },
      { label: "2-4", value: "2-4" },
      { label: "2-5", value: "2-5" },
      { label: "한국어-영어", value: "k-e" },
    ],
    difficulties: [{ label: "전체", value: 0 }],
  },
  {
    label: "초급편 특허2",
    value: "beginner2",
    steps: [
      { label: "1-1", value: "1-1" },
      { label: "1-2", value: "1-2" },
      { label: "1-3", value: "1-3" },
      { label: "1-4", value: "1-4" },
      { label: "1-5", value: "1-5" },
      { label: "1-6", value: "1-6" },
      { label: "2-1", value: "2-1" },
      { label: "2-2", value: "2-2" },
      { label: "2-2 추가", value: "2-2a" },
      { label: "2-3", value: "2-3" },
      { label: "2-4", value: "2-4" },
      { label: "2-5", value: "2-5" },
      { label: "한국어-영어", value: "k-e" },
    ],
    difficulties: [
      { label: "전체", value: 0 },
      { label: "쉬움", value: 1 },
      { label: "어려움", value: 2 },
      { label: "핵심", value: 3 },
      { label: "비핵심", value: 4 },
    ],
  },
];
const displays = {
  "1-1": {
    default: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
  },
  "1-2": {
    default: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
  },
  "1-3": {
    default: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
  },
  "1-4": {
    default: {
      word: true,
      word2: true,
      partOfSpeech: false,
      category: false,
      hint: false,
      meaning: false,
      meaning2: false,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: false,
      hint: false,
      meaning: false,
      meaning2: false,
    },
  },
  "1-5": {
    default: {
      word: true,
      word2: true,
      partOfSpeech: false,
      category: false,
      hint: false,
      meaning: false,
      meaning2: false,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: false,
      hint: false,
      meaning: false,
      meaning2: false,
    },
  },
  "1-6": {
    default: {
      word: false,
      word2: false,
      partOfSpeech: false,
      category: false,
      hint: false,
      meaning: false,
      meaning2: false,
    },
    focus: {
      word: false,
      word2: false,
      partOfSpeech: false,
      category: false,
      hint: false,
      meaning: false,
      meaning2: false,
    },
  },
  "2-1": {
    default: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
  },
  "2-2": {
    default: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
  },
  "2-2a": {
    default: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
  },
  "2-3": {
    default: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
  },
  "2-4": {
    default: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
  },
  "2-5": {
    default: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
  },
  "k-e": {
    default: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
    },
  },
};

const db = new Dexie("talpi");
db.version(1).stores({
  finalStatus: `&id, book, step, difficulty, playMiliseconds, wordGap, currentIndex, readRound`,
  baseStatuses: `&id, [book+step+difficulty], playMiliseconds, wordGap, currentIndex, readRound`,
  lastStatuses: `&id, [book+step+difficulty], playMiliseconds, wordGap, currentIndex, readRound`,
  words: `&id, word, word2, partOfSpeech, category, hint, meaning, meaning2, beginner_loc, beginner2_loc, isHard, isCore`,
  wordChecks: `[wordId+book+step+difficulty], cnt, showRound`,
});

db.version(2)
  .stores({
    finalStatus: `&id, book, step, difficulty, playSeconds, wordGap, currentIndex, readRound`,
    baseStatuses: `&id, [book+step+difficulty], playSeconds, wordGap, currentIndex, readRound`,
    lastStatuses: `&id, [book+step+difficulty], playSeconds, wordGap, currentIndex, readRound`,
    words: `&id, word, word2, partOfSpeech, category, hint, meaning, meaning2, beginner_loc, beginner2_loc, isHard, isCore`,
    wordChecks: `[wordId+book+step+difficulty], cnt, showRound`,
  })
  .upgrade(async (tx) => {
    await tx
      .table("finalStatus")
      .toCollection()
      .modify((s) => {
        s.playSeconds = Math.ceil(s.playMiliseconds / 1000);
        delete s.playMiliseconds;
      });
    await tx
      .table("baseStatuses")
      .toCollection()
      .modify((s) => {
        s.playSeconds = Math.ceil(s.playMiliseconds / 1000);
        delete s.playMiliseconds;
      });
    return await tx
      .table("lastStatuses")
      .toCollection()
      .modify((s) => {
        s.playSeconds = Math.ceil(s.playMiliseconds / 1000);
        delete s.playMiliseconds;
      });
  });

let idCnt = 1;
let baseStatuses = [];
for (let b in books) {
  for (let s of books[b].steps) {
    for (let d of books[b].difficulties) {
      baseStatuses.push({
        id: idCnt++,
        book: books[b].value,
        step: s.value,
        difficulty: d.value,
        playSeconds: 1500,
        wordGap: 1.5,
        currentIndex: 0,
        readRound: 0,
      });
    }
  }
}

db.lastStatuses.count().then((c) => {
  if (c === 0) {
    db.lastStatuses.bulkAdd(baseStatuses).then(console.log);
  }
});
db.finalStatus.get({ id: 1 }).then((o) => {
  if (!o)
    db.finalStatus.add({
      id: 1,
      book: "beginner2",
      step: "1-4",
      difficulty: 1,
      playSeconds: 1500,
      wordGap: 1.5,
      currentIndex: 0,
      readRound: 9,
    });
});

const assign = (t, o) => {
  for (let k in t)
    try {
      t[k] = o[k];
    } catch (e) {
      console.log("assign", e.message);
    }
};
const loading = ref(false);
const status = reactive({
  book: "beginner",
  step: "1-1",
  difficulty: 0,
  playSeconds: 1500,
  wordGap: 1.5,
  currentIndex: 0,
  readRound: 0,
});
const oBook = computed({
  get: () => books.find((o) => o.value === status.book),
  set: (o) => (status.book = o.value),
});
const oStep = computed({
  get: () => {
    let s = oBook.value.steps.find((o) => o.value === status.step);
    if (!s) {
      status.step = "1-1";
      status.difficulty = 0;
      s = oBook.value.steps[0];
    }
    return s;
  },
  set: (o) => (status.step = o.value),
});
const oDifficulity = computed({
  get: () => {
    let d = oBook.value.difficulties.find((o) => o.value === status.difficulty);
    if (!d) {
      status.difficulty = 0;
      d = oBook.value.difficulties[0];
    }
    return d;
  },
  set: (o) => (status.difficulty = o.value),
});
watch(
  () => Object.assign({}, status),
  async (n, o) => {
    if (
      !baseStatuses.find(
        (ob) =>
          ob.book === n.book &&
          ob.step === n.step &&
          ob.difficulty === n.difficulty
      )
    )
      return;
    let stt;
    if (
      n.book !== o.book ||
      n.step !== o.step ||
      n.difficulty !== o.difficulty
    ) {
      stt = await db.lastStatuses.get({
        book: n.book,
        step: n.step,
        difficulty: n.difficulty,
      });
      assign(status, stt);
    } else {
      await db.finalStatus.put(Object.assign({ id: 1 }, n));
      await db.lastStatuses
        .where({
          book: n.book,
          step: n.step,
          difficulty: n.difficulty,
        })
        .modify(
          Object.assign(
            {
              playSeconds: null,
              wordGap: null,
              currentIndex: null,
              readRound: null,
            },
            n
          )
        );
    }
  }
);

db.baseStatuses.toArray().then((a) => {
  for (let o of a) {
    baseStatuses[o.id - 1] = o;
  }
});

const words = ref([]);
watch(
  () => [status.book, status.difficulty],
  async (a) => {
    loading.value = true;
    let col;
    if (a[1] !== 0) {
      let w = {};
      w[/[12]/.test(a[1].toString()) ? "isHard" : "isCore"] = /[23]/.test(
        a[1].toString()
      )
        ? "Y"
        : "N";
      col = db.words.where(w);
    } else col = db.words.toCollection();
    // 전체 조회
    const ws = await col.sortBy(`${a[0]}_loc`);
    let wc = {
      book: status.book,
      step: status.step,
      difficulty: status.difficulty,
    };
    let wcs = await db.wordChecks
      .filter(
        (o) =>
          o.book === status.book &&
          o.step === status.step &&
          o.difficulty === status.difficulty
      )
      .toArray();
    wcs = wcs.reduce((result, v) => {
      result[v.wordId] = v;
      return result;
    }, {});
    for (let w of ws) {
      wc.wordId = w.id;
      w.wordCheck =
        wcs[w.id] ||
        Object.assign({}, wc, { cnt: 0, showRound: status.readRound });
      w.readable = w.wordCheck.showRound <= status.readRound;
      w.display = Object.assign({}, display.value.default);
      w.checked = false;
    }
    loading.value = false;
    words.value = ws;
  }
);

const baseStatus = computed({
  get: () =>
    baseStatuses.find(
      (o) =>
        (o.book === status.book &&
          o.step === status.step &&
          o.difficulty === status.difficulty) ||
        (o.book === status.book && o.step === status.step) ||
        o.book === status.book
    ),
  set(o) {
    db.baseStatuses.put(o);
    baseStatuses[o.id - 1] = o;
  },
});

const display = computed({
  get: () => displays[status.step],
  set: (o) => (displays[status.step] = o),
});

export default db;
export {
  loading,
  baseStatus,
  status,
  books,
  oBook,
  oStep,
  oDifficulity,
  words,
  display,
  db,
};
