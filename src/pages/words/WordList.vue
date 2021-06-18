<template>
  <q-layout view="lhh LpR lff" container style="height: 100vh">
    <q-header>
      <q-toolbar class="bg-primary glossy">
        <q-toolbar-title>
          {{ oBook.label }} {{ oStep.label }}단계 {{ oDifficulity.label }}
          {{ readRound }}회독
        </q-toolbar-title>
        단어 간격 : {{ wordGap }}초
        <q-btn
          v-if="!played"
          flat
          @click="drawerRight = !drawerRight"
          round
          dense
          icon="settings"
        />
      </q-toolbar>
    </q-header>
    <q-drawer side="right" v-model="drawerRight" bordered :breakpoint="500">
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="q-gutter-y-md column">
            <q-select v-model="oBook" :options="books" label="책"></q-select>
            <q-select v-model="oStep" :options="oBook.steps" label="단계"></q-select>
            <q-select
              v-model="oDifficulity"
              :options="oBook.difficulties"
              label="난이도"
            ></q-select>
            <q-input
              label="재생 시간"
              hint="분"
              v-model.number="playMinutes"
              type="number"
              min="0"
              ref="inputPm"
            />
            <q-input
              label="단어 간격"
              hint="초"
              v-model.number="wordGap"
              type="number"
              step="0.1"
              min="-0.5"
            />
            <q-input label="회독" v-model.number="readRound" type="number" min="0" />
            <q-input
              label="현위치"
              :hint="currentIndex + '/' + words.length"
              v-model.number="currentIndex"
              type="number"
              min="0"
            />
            <q-btn @click="downXlsx" icon="file_download" class="glossy" color="teal"
              >DB정보 엑셀 다운로드</q-btn
            >
            <q-btn
              @click="initDB"
              icon="settings_applications"
              class="glossy"
              color="accent"
              >DB정보 초기화</q-btn
            >
            <!-- <q-file
              label="단어추가"
              filled
              style="max-width: 300px"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              @change="parseXlsx"
            />-->
          </div>
        </div>
      </q-scroll-area>
    </q-drawer>
    <q-page-container>
      <q-page>
        <div class="row" style="height: 90vh">
          <q-virtual-scroll
            ref="virtualListRef"
            component="q-list"
            :items="words"
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
                        >{{ item.partOfSpeech }}</q-btn
                      >
                    </div>
                    <div class="col" style="padding-left: 35px">
                      <div>
                        <span v-show="checkDisplay.category">
                          {{
                            item.category || "" !== "" ? `[${item.category}]` : ""
                          }}&nbsp;
                        </span>
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
                        >{{ item.partOfSpeech }}</q-btn
                      >
                    </div>
                    <div class="col" style="padding-left: 35px">
                      <div>
                        <span v-show="display.default.category">
                          {{ item.category || "" !== "" ? `[${item.category}]` : "" }}
                        </span>
                        <span v-show="display.default.hint">{{ item.hint }}</span
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

        <q-page-sticky position="bottom-right" :offset="[30, 30]">
          <div class="q-gutter-sm">
            <q-badge v-show="played" outline align="middle" color="white"
              >{{ playMinutes }}분 {{ Math.ceil(playMiliseconds / 1000) % 60 }}초</q-badge
            >
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
              @click="checked = !checked"
            />
          </div>
        </q-page-sticky>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, toRefs, watch, reactive, computed, onMounted } from "vue";
import { throttle, debounce, useQuasar } from "quasar";
import XLSX from "xlsx";
import {
  baseStatus,
  status,
  books,
  oBook,
  oStep,
  oDifficulity,
  words,
  db,
} from "../../common/db";

export default {
  setup() {
    const $q = useQuasar();
    $q.dark.set(true);

    const {
      book,
      step,
      difficulty,
      playMiliseconds,
      wordGap,
      currentIndex,
      readRound,
    } = toRefs(status);

    const playMinutes = computed({
      get: () => Math.floor(playMiliseconds.value / 60000),
      set: (val) => {
        playMiliseconds.value = val * 60000 + (playMiliseconds.value % 60000);
      },
    });
    const inputPm = ref(null);
    watch(playMiliseconds, (pm) => {
      if (pm <= 0 || isNaN(pm)) {
        playMiliseconds.value = baseStatus.value.playMiliseconds;
        played.value = false;
        inputPm.value.blur();
      }
    });

    const assign = (t, o) => {
      for (let k of Object.keys(t)) if (o[k] !== undefined) t[k] = o[k];
    };
    onMounted(async () => {
      assign(status, await db.finalStatus.get({ id: 1 }));
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
    const checked = ref(false);
    const checkDisplay = computed(() => {
      let fcs = Object.assign({}, display.focus);
      if (checked.value) {
        for (let k in fcs) {
          fcs[k] = true;
        }
      } else {
        fcs = display.focus;
      }
      return fcs;
    });

    const virtualListRef = ref(null);
    const setAudio = (cnt) => {
      cnt = cnt || 3;
      let w;
      for (let i = currentIndex.value; i < words.value.length; i++) {
        if (cnt === 0) break;
        w = words.value[i];
        if (w.readable && !w.audio) {
          w.audio = new Audio(`/mp3/beginner2/${w.id.toString().padStart(5, "0")}.mp3`);
          cnt--;
        }
      }
    };
    watch(words, async () => {
      $q.loading.show();
      let wc = {
        book: book.value,
        step: step.value,
        difficulty: difficulty.value,
      };
      let wcs = await db.wordChecks
        .filter(
          (o) =>
            o.book === book.value &&
            o.step === step.value &&
            o.difficulty === difficulty.value
        )
        .toArray();
      wcs = wcs.reduce((result, v) => {
        result[v.wordId] = v;
        return result;
      }, {});
      for (let w of words.value) {
        wc.wordId = w.id;
        w.wordCheck =
          wcs[w.id] || Object.assign({}, wc, { cnt: 0, showRound: readRound.value });
        w.readable = w.wordCheck.showRound <= readRound.value;
      }
      $q.loading.hide();
      virtualListRef.value.scrollTo(currentIndex.value, "center-force");
    });
    watch(currentIndex, (idx) => {
      let w = words.value[idx];
      if (!w) return;
      if (virtualListRef.value) virtualListRef.value.scrollTo(idx, "center-force");
    });

    const played = ref(false);
    const drawerRight = ref(false);
    const play = throttle(() => {
      played.value = !played.value;
      if (played.value) drawerRight.value = false;
    }, 3000);

    watch(played, async (p) => {
      if (words.value.length <= currentIndex.value) currentIndex.value = 0;
      if (!p) return;
      try {
        setAudio();
        let w, wc;
        while (played.value) {
          if (words.value.length <= currentIndex.value) {
            played.value = false;
            currentIndex.value = 0;
            readRound.value++;
            break;
          }

          w = words.value[currentIndex.value];
          wc = w.wordCheck;
          if (!w.readable) {
            currentIndex.value++;
            continue;
          }

          let elapsedTime = await new Promise((resolve, reject) => {
            w.audio.addEventListener("ended", () => {
              resolve(Math.ceil(w.audio.duration * 1000));
            });
            w.audio.addEventListener("error", reject);
            w.audio.play();
          });
          playMiliseconds.value -= elapsedTime;
          playMiliseconds.value -= await new Promise((resolve) =>
            setTimeout(() => resolve(elapsedTime), elapsedTime)
          );
          playMiliseconds.value -= await new Promise((resolve) =>
            setTimeout(() => resolve(wordGap.value * 1000), wordGap.value * 1000)
          );
          w.audio = undefined;

          if (step.value === "1-4") {
            if (!checked.value) {
              wc.cnt++;
              wc.showRound = readRound.value + wc.cnt + 1;
            }
            db.wordChecks.put(Object.assign({}, wc));
          }
          checked.value = false;
          currentIndex.value++;
          setAudio(1);
        }
      } catch (e) {
        played.value = false;
        console.log(e);
      }
    });

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
          .then((v) => {
            console.log(v);
            status.difficulty = 0;
          });
      };
      reader.readAsArrayBuffer(event.target.files[0]);
    };
    const downXlsx = async () => {
      let wb = XLSX.utils.book_new();
      let tNms = ["finalStatus", "baseStatuses", "lastStatuses", "words", "wordChecks"];
      for (let nm of tNms) {
        let datas = await db[nm].toArray();
        let sh = XLSX.utils.json_to_sheet(datas);
        XLSX.utils.book_append_sheet(wb, sh, nm);
      }
      XLSX.writeFile(wb, "talpi_datas.xlsx");
    };

    const initDB = () => {
      $q.loading.show();
      let req = new XMLHttpRequest();
      req.open("GET", "/talpi_datas.xlsx", true);
      req.responseType = "arraybuffer";
      req.onload = async (e) => {
        let data = new Uint8Array(req.response);
        let workbook = XLSX.read(data, { type: "array" });
        let shNms = workbook.SheetNames;
        for (let nm of shNms) {
          let sh = workbook.Sheets[nm];
          let datas = XLSX.utils.sheet_to_json(sh);
          let rslt = await db[nm].bulkPut(datas);
          console.log(rslt);
        }
        $q.loading.hide();
        window.location.reload();
      };
      req.send();
    };

    return {
      book,
      step,
      difficulty,
      playMiliseconds,
      wordGap,
      currentIndex,
      readRound,
      oBook,
      books,
      oStep,
      oDifficulity,
      playMinutes,
      display,
      checkDisplay,
      checked,
      played,
      play,
      inputPm,
      words,
      virtualListRef,
      parseXlsx,
      downXlsx,
      initDB,
      drawerRight,
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
