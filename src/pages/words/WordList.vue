<template>
  <q-layout view="lhh LpR lff" container style="height: 100vh">
    <q-header>
      <q-toolbar class="bg-primary glossy">
        <q-select v-model="book" :options="books" label="책" class="col-1"></q-select>
        <q-select v-model="step" :options="steps" label="단계" class="col-1"></q-select>
        <q-select
          v-model="difficulty"
          :options="difficultys"
          label="난이도"
          class="col-1"
        ></q-select>
        <q-toolbar-title></q-toolbar-title>
        <q-input
          label="재생 시간"
          hint="분"
          v-model.number="playMinutes"
          type="number"
          min="1"
          class="col-1"
        />
        <q-input
          label="단어 간격"
          hint="초"
          v-model.number="wordGap"
          type="number"
          step="0.1"
          min="-0.5"
          class="col-1"
        />
        <q-btn flat @click="downXlsx" round dense icon="file_download" />
        <q-btn flat @click="drawerRight = !drawerRight" round dense icon="settings" />
      </q-toolbar>
    </q-header>
    <q-drawer side="right" v-model="drawerRight" bordered :breakpoint="500">
      <q-scroll-area class="fit">
        <div class="q-pa-sm">
          <div v-for="n in 50" :key="n">Drawer {{ n }} / 50</div>
        </div>
      </q-scroll-area>
    </q-drawer>
    <q-page-container>
      <q-page>
        <div class="row" style="height: 90vh">
          <q-virtual-scroll
            ref="virtualListRef"
            component="q-list"
            :items="wordList"
            separator
            class="col"
            style="height: inherit"
          >
            <template v-slot="{ item, index }">
              <q-item
                v-if="index === currentIndex"
                class="bg-blue-grey"
                :key="'focus' + index"
              >
                <q-item-section>
                  <div class="row items-center">
                    <div class="col-3 text-right" style="padding-right: 15px">
                      <div>&nbsp;</div>
                      <div class="text-h5">
                        <span v-show="checkDisplay.word">{{ item.word }}</span
                        >&nbsp;
                      </div>
                      <div>
                        <span v-show="checkDisplay.word2">{{ item.word2 }}&nbsp;</span
                        >&nbsp;
                      </div>
                    </div>
                    <div class="col-0">
                      <q-btn
                        round
                        size="xs"
                        color="grey-8"
                        v-show="checkDisplay.partOfSpeech"
                      >
                        {{ item.partOfSpeech }}
                      </q-btn>
                    </div>
                    <div class="col" style="padding-left: 35px">
                      <div>
                        <span v-show="checkDisplay.category"
                          >{{
                            item.category || "" !== "" ? `[${item.category}]` : ""
                          }}&nbsp;</span
                        >
                        <span v-show="checkDisplay.hint">{{ item.hint }}&nbsp;</span
                        >&nbsp;
                      </div>
                      <div class="text-h5">
                        <span v-show="checkDisplay.meaning"
                          >{{ item.meaning }}&nbsp;</span
                        >
                      </div>
                      <div>
                        <span v-show="checkDisplay.meaning2"
                          >{{ item.meaning2 }}&nbsp;</span
                        >&nbsp;
                      </div>
                    </div>
                  </div>
                </q-item-section>
              </q-item>
              <q-item v-else :key="'default' + index">
                <q-item-section>
                  <div class="row items-center">
                    <div class="col-3 text-right" style="padding-right: 15px">
                      <div>&nbsp;</div>
                      <div class="text-h5">
                        <span v-show="display.default.word">{{ item.word }}</span
                        >&nbsp;
                      </div>
                      <div>
                        <span v-show="display.default.word2">{{ item.word2 }}&nbsp;</span
                        >&nbsp;
                      </div>
                    </div>
                    <div class="col-0">
                      <q-btn
                        round
                        size="xs"
                        color="grey-8"
                        v-show="display.default.partOfSpeech"
                      >
                        {{ item.partOfSpeech }}
                      </q-btn>
                    </div>
                    <div class="col" style="padding-left: 35px">
                      <div>
                        <span v-show="display.default.category"
                          >{{
                            item.category || "" !== "" ? `[${item.category}]` : ""
                          }}&nbsp;</span
                        >
                        <span v-show="display.default.hint">{{ item.hint }}&nbsp;</span
                        >&nbsp;
                      </div>
                      <div class="text-h5">
                        <span v-show="display.default.meaning"
                          >{{ item.meaning }}&nbsp;</span
                        >
                      </div>
                      <div>
                        <span v-show="display.default.meaning2"
                          >{{ item.meaning2 }}&nbsp;</span
                        >&nbsp;
                      </div>
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </template>
          </q-virtual-scroll>
        </div>
        <div class="row">
          <div class="col">
            <q-file
              label="엑셀파일 변환"
              filled
              style="max-width: 300px"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              @change="parseXlsx"
            />
          </div>
        </div>
        <q-page-sticky position="bottom-right" :offset="[30, 30]">
          <div class="q-gutter-sm">
            <q-btn
              fab
              :icon="played ? 'pause' : 'play_arrow'"
              @click="play"
              color="primary"
            />
            <q-btn
              v-if="played"
              fab
              icon="check"
              color="primary"
              @click="check = !check"
            />
          </div>
        </q-page-sticky>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, onBeforeMount, onMounted, watch, reactive, computed } from "vue";
import { throttle } from "quasar";
import XLSX from "xlsx";
import db from "../../common/db";
import { useQuasar } from "quasar";
import options from "../../common/options";

export default {
  setup() {
    const $q = useQuasar();
    $q.dark.set(true);

    const books = options.books;
    const steps = options.steps;
    const difficultys = options.difficultys;

    const book = ref(books[0]);
    const step = ref(steps[0]);
    const difficulty = ref(difficultys[0]);
    const playMinutes = ref(0);
    const wordGap = ref(0);
    const currentIndex = ref(0);

    watch([book, difficulty], async () => {
      wordList.value = await selectWords();
    });

    let lastConfigId;
    watch([book, step, difficulty, playMinutes, wordGap, currentIndex], () => {
      db.configs.put({
        id: lastConfigId,
        group: "last",
        book: book.value.value,
        step: step.value.value,
        difficulty: difficulty.value.value,
        playMinutes: playMinutes.value,
        wordGap: wordGap.value,
        currentIndex: currentIndex.value,
      });
    });
    onBeforeMount(async () => {
      const d = await db.configs.where("group").equals("last").last();
      lastConfigId = d.id;
      book.value = books.filter((o) => o.value === d.book)[0];
      step.value = steps.filter((o) => o.value === d.step)[0];
      difficulty.value = difficultys.filter((o) => o.value === d.difficulty)[0];
      playMinutes.value = d.playMinutes;
      wordGap.value = d.wordGap;
      currentIndex.value = d.currentIndex;
    });

    const display = reactive({
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
    });
    const check = ref(false);
    const checkDisplay = computed(() => {
      let fcs = Object.assign({}, display.focus);
      if (check.value) {
        for (let k in fcs) {
          fcs[k] = true;
        }
      } else {
        fcs = display.focus;
      }
      return fcs;
    });
    watch([currentIndex], () => {
      if (check.value) check.value = !check.value;
    });

    const virtualListRef = ref(null);

    const wordList = ref([]);
    const selectWords = async () => {
      const diff = difficulty.value.value;
      let col;
      // 일부 조회
      if (diff !== 0) {
        let w = {};
        w[/[12]/.test(diff.toString()) ? "isHard" : "isCore"] = /[23]/.test(
          diff.toString()
        )
          ? "Y"
          : "N";
        col = db.words.where(w);
      } else col = db.words.toCollection();
      // 전체 조회
      return await col.sortBy(`${book.value.value}_loc`);
    };
    watch(wordList, () => {
      setTimeout(gotoIndex, 50);
    });

    onMounted(async () => {
      wordList.value = await selectWords();
    });

    const gotoIndex = (idx) => {
      if (idx === undefined) idx = currentIndex.value;
      virtualListRef.value.scrollTo(idx, "center-force");
    };
    const played = ref(false);
    let playTimeoutId = 0;
    const play = throttle(() => {
      played.value = !played.value;
      if (played.value) {
        playTimeoutId = setTimeout(() => {
          played.value = false;
        }, playMinutes.value * 60000);
      } else {
        clearTimeout(playTimeoutId);
      }
      talkWords();
    }, 3000);

    const talkWords = async () => {
      if (played.value) {
        try {
          gotoIndex();
          await talkWord(wordList.value[currentIndex.value].id);
          while (played.value) {
            gotoIndex(++currentIndex.value);
            await talkWord(wordList.value[currentIndex.value].id);
          }
        } catch (e) {
          played.value = false;
          currentIndex.value = 0;
          virtualListRef.value.scrollTo(0);
          console.log(e);
        }
      }
    };

    const talkWord = (id) => {
      return new Promise((res, rej) => {
        try {
          const ad = new Audio(`/mp3/beginner2/${id.toString().padStart(5, "0")}.mp3`);
          let dura = 0;
          ad.addEventListener("canplay", () => {
            dura = Math.ceil(ad.duration * 1000);
          });
          ad.addEventListener("ended", (event) => {
            setTimeout(() => {
              res();
            }, wordGap.value * 1000 + dura);
          });
          ad.addEventListener("error", (event) => {
            rej(event);
          });
          ad.play();
        } catch (err) {
          rej(err);
        }
      });
    };

    const parseXlsx = (event) => {
      let reader = new FileReader();
      reader.onload = (e) => {
        let data = new Uint8Array(e.target.result);
        let wb = XLSX.read(data, { type: "array" });
        let rslt = XLSX.utils
          .sheet_to_json(wb.Sheets["beginner2"])
          .filter((o) => o.meaning);

        const toId = (s) => {
          let ss = s.split("-");
          return `${ss[0].padStart(4, "0")}-${ss[1].padStart(2, "0")}`;
        };

        let i = 0;
        for (let o of rslt) {
          i++;
          for (let k in o) {
            o[k] = o[k].trim().replace(/:/g, "·");
          }
          if ((o.isHard || "") === "") o.isHard = "N";
          if ((o.isCore || "") === "") o.isCore = "N";
          o.beginner_loc = toId(o.beginner_loc);
          o.beginner2_loc = toId(o.beginner2_loc);
          o.id = i;
        }

        db.words
          .clear()
          .then(() => db.words.bulkAdd(rslt))
          .then(selectWords)
          .then((arr) => (wordList.value = arr));
      };
      reader.readAsArrayBuffer(event.target.files[0]);
    };
    const downXlsx = () => {
      let wb = XLSX.utils.book_new();
      let sh = XLSX.utils.json_to_sheet(wordList.value);
      XLSX.utils.book_append_sheet(wb, sh, "beginner2");
      XLSX.writeFile(wb, "talpi.xlsx");
    };

    return {
      book,
      books,
      step,
      steps,
      difficulty,
      difficultys,
      playMinutes,
      wordGap,
      display,
      checkDisplay,
      check,
      played,
      play,
      wordList,
      virtualListRef,
      currentIndex,
      parseXlsx,
      downXlsx,
      drawerRight: ref(false),
    };
  },
};
</script>

<style scoped lang="scss">
.q-item div {
  color: $grey-10;
}
.q-item.bg-blue-grey div {
  color: white;
}
</style>
