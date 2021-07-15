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
      sentence: true,
      translation: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
      sentence: true,
      translation: true,
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
      sentence: true,
      translation: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
      sentence: true,
      translation: true,
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
      sentence: true,
      translation: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
      sentence: true,
      translation: true,
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
      sentence: true,
      translation: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: false,
      hint: false,
      meaning: false,
      meaning2: false,
      sentence: true,
      translation: true,
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
      sentence: true,
      translation: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: false,
      hint: false,
      meaning: false,
      meaning2: false,
      sentence: true,
      translation: true,
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
      sentence: true,
      translation: true,
    },
    focus: {
      word: false,
      word2: false,
      partOfSpeech: false,
      category: false,
      hint: false,
      meaning: false,
      meaning2: false,
      sentence: true,
      translation: true,
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
      sentence: true,
      translation: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
      sentence: true,
      translation: true,
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
      sentence: true,
      translation: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
      sentence: true,
      translation: true,
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
      sentence: true,
      translation: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
      sentence: true,
      translation: true,
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
      sentence: true,
      translation: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
      sentence: true,
      translation: true,
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
      sentence: true,
      translation: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
      sentence: true,
      translation: true,
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
      sentence: true,
      translation: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
      sentence: true,
      translation: true,
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
      sentence: true,
      translation: true,
    },
    focus: {
      word: true,
      word2: true,
      partOfSpeech: true,
      category: true,
      hint: true,
      meaning: true,
      meaning2: true,
      sentence: true,
      translation: true,
    },
  },
};

const db = new Dexie("talpi");
db.version(1).stores({
  finalStatus: `&id, book, step, difficulty, wordGap, lastIdx, round, auto, unitCnt`,
  baseStatuses: `&id, [book+step+difficulty], wordGap, lastIdx, round, auto, unitCnt`,
  lastStatuses: `&id, [book+step+difficulty], wordGap, lastIdx, round, auto, unitCnt`,
  words: `&id, word, word2, partOfSpeech, category, hint, meaning, meaning2, beginner_loc, beginner2_loc, unit, isHard, isCore, duplication, sentence, translation`,
  checkingWords: `[wordId+book+step+difficulty], knowCnt, nextRound`,
  checkWords: `[wordId+book+step+difficulty], knowCnt, nextRound`,
  playedTimes: "[book+step+difficulty+round], seconds, minutes, hours, days",
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
        wordGap: 1.5,
        lastIdx: 0,
        round: 1,
        auto: false,
        unitCnt: 5,
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
      wordGap: 1.5,
      lastIdx: 0,
      round: 10,
      auto: false,
      unitCnt: 5,
    });
  else {
    assign(status, o);
  }
});

const assign = (t, o) => {
  if (!o) return;
  for (let k in t)
    try {
      if (o[k] !== undefined) t[k] = o[k];
    } catch (e) {
      console.log("assign", e.message);
    }
};
const loading = ref(false);
const status = reactive({
  book: "beginner",
  step: "1-1",
  difficulty: 0,
  wordGap: 1.5,
  lastIdx: 0,
  round: 1,
  auto: false,
  unitCnt: 5,
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
        .modify(Object.assign({}, n));
    }
  }
);

db.baseStatuses.toArray().then((a) => {
  for (let o of a) {
    baseStatuses[o.id - 1] = o;
  }
});

const words = ref([]);
const willPlayCnt = ref(0);
const willPlayPer = computed(() => {
  if (words.value.length < 1) return 0;
  return Math.round((willPlayCnt.value / words.value.length) * 100);
});
const willPlayNextCnt = ref(0);
const willPlayNextPer = computed(() => {
  if (!words.value || words.value.length < 1) return 0;
  return Math.round((willPlayNextCnt.value / words.value.length) * 100);
});
const getWords = async (bookVal, difficultyVal, stepVal) => {
  const a = [bookVal, difficultyVal, stepVal];
  let col;
  if (a[2] === "1-5") {
    let wordIds = (
      await db.checkWords
        .filter(
          (o) =>
            o.book === a[0] &&
            o.step === "1-4" &&
            o.difficulty === a[1] &&
            o.knowCnt === 0
        )
        .toArray()
    ).map((o) => o.wordId);
    if (wordIds.length > 0) col = db.words.where("id").anyOf(wordIds);
    else col = db.words.toCollection();
  } else col = db.words.toCollection();
  // 전체 조회
  let ws = await col.sortBy(`${a[0]}_loc`);
  if (a[1] !== 0) {
    let k = "isHard",
      v = "Y";
    if (a[1] === 3 || a[1] === 4) k = "isCore";
    if (a[1] === 1 || a[1] === 4) v = "N";
    ws = ws.filter((w) => w[k] === v);
  }
  let wc = {
    book: status.book,
    step: status.step,
    difficulty: status.difficulty,
  };
  let wcs = await db.checkWords
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

  let nowCnt = 0;
  let nextCnt = 0;
  for (let w of ws) {
    wc.wordId = w.id;
    w.wordCheck =
      wcs[w.id] ||
      Object.assign({}, wc, {
        knowCnt: 0,
        nextRound: status.round,
      });
    if (w.wordCheck.nextRound <= status.round) {
      nowCnt++;
      w.willPlay = true;
    }
    if (w.wordCheck.nextRound <= status.round + 1) nextCnt++;
    w.display = Object.assign({}, display.value.default);
    w.visibility = false;
    w.focused = false;
  }
  nextCnt -= await db.checkingWords.count();
  willPlayCnt.value = nowCnt;
  willPlayNextCnt.value = nextCnt;
  return ws;
};
watch(
  () => [status.book, status.difficulty, status.step],
  async (a) => {
    loading.value = true;
    words.value = await getWords(a[0], a[1], a[2]);
    loading.value = false;
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

const playTimes = reactive({
  seconds: 0,
  minutes: 0,
  hours: 0,
  days: 0,
  months: 0,
  years: 0,
});
const txtTimes = computed(() => {
  let times = ` ${playTimes.days}일 ${playTimes.hours}시 ${playTimes.minutes}분 ${playTimes.seconds}초`;
  times = times.replace(/ 0[일시분]/g, "");
  if (/[일시분]/.test(times)) times = times.replace(" 0초", "");
  return times.trim();
});
watch(playTimes, (v) => {
  if (v.seconds === 60) {
    v.seconds = 0;
    v.minutes++;
  }
  if (v.minutes === 60) {
    v.minutes = 0;
    v.hours++;
  }
  if (v.hours === 24) {
    v.hours = 0;
    v.days++;
  }
});
watch(
  () => {
    return {
      book: status.book,
      step: status.step,
      difficulty: status.difficulty,
      round: status.round,
    };
  },
  async (n) => {
    assign(
      playTimes,
      (await db.playedTimes.get(n)) || {
        seconds: 0,
        minutes: 0,
        hours: 0,
        days: 0,
      }
    );
  }
);
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
  willPlayCnt,
  willPlayPer,
  willPlayNextCnt,
  willPlayNextPer,
  getWords,
  display,
  playTimes,
  txtTimes,
  db,
};
