<template>
  <q-layout view="lhh LpR lff" container style="height: 100vh">
    <q-header>
      <q-toolbar class="bg-primary glossy">
        <q-toolbar-title>
          {{ oBook.label }} Unit {{ unit }} {{ oStep.label }}단계
          {{ oDifficulity.label }} {{ round }}회독 재생 {{ willPlayPer }}%({{
            willPlayCnt
          }}/{{ words.length }}) {{ round + 1 }}회독 재생 {{ willPlayNextPer }}%({{
            willPlayNextCnt
          }}/{{ words.length }})
        </q-toolbar-title>
        <q-toggle
          v-if="!played"
          v-model="auto"
          visibility-icon="autorenew"
          color="info"
          label="자동"
          unchecked-icon="clear"
          left-label
        />
        <div v-show="auto" class="q-gutter-sm row items-center">
          <div class="col">단어 간격 {{ wordGap }}초</div>
          <q-btn
            round
            color="primary"
            class="glossy"
            size="xs"
            icon="keyboard_arrow_left"
            @mousedown.left="downSec"
          />
          <q-btn
            round
            color="primary"
            class="glossy"
            size="xs"
            icon="keyboard_arrow_right"
            @mousedown.left="upSec"
          />
        </div>
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
            <q-input label="회독" v-model.number="round" type="number" min="1" />
            <q-input
              label="공부할 유닛수"
              v-model.number="unitCnt"
              type="number"
              min="0"
            />
            <q-input
              label="최종 단어위치"
              :hint="lastNo + '/' + words.length"
              v-model.number="lastNo"
              type="number"
              min="1"
            />
            <q-input
              v-show="auto"
              label="단어 간격"
              hint="초"
              v-model.number="wordGap"
              type="number"
              step="0.1"
              min="-0.5"
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
              <q-item :class="{ 'bg-blue-grey glossy': item.focused }" :key="item.id">
                <q-item-section>
                  <audio
                    :ref="(el) => (words[index].audio = el)"
                    v-if="item.willPlay"
                    :src="
                      '/mp3/beginner2/' + item.id.toString().padStart(5, '0') + '.mp3'
                    "
                    type="audio/mpeg"
                    crossorigin="anonymous"
                  ></audio>
                  <div class="row items-center">
                    <div class="col-0">
                      <div class="row no-wrap">
                        <q-btn
                          round
                          size="md"
                          color="grey-8"
                          @click="visibleWord(index, item)"
                          :icon="item.visibility ? 'visibility' : 'visibility_off'"
                        />
                        <q-btn
                          v-if="!played"
                          flat
                          size="md"
                          icon="edit"
                          class="col"
                          @click="
                            editWord(
                              $event.target.closest('.q-item').getBoundingClientRect(),
                              item
                            )
                          "
                        ></q-btn>
                        <q-btn
                          v-if="!item.willPlay"
                          flat
                          size="md"
                          icon="next_plan"
                          class="col"
                        />
                      </div>
                    </div>
                    <div class="col-4 text-right" style="padding-right: 15px">
                      <div class="ht21"></div>
                      <div class="text-h5 ht32">
                        &nbsp;
                        <span v-show="item.display.word">{{ item.word }}</span>
                      </div>
                      <div class="ht21">
                        <span v-show="item.display.word2">{{ item.word2 }}</span>
                      </div>
                    </div>
                    <div class="col-0">
                      <q-btn
                        round
                        size="xs"
                        color="grey-8"
                        v-show="item.display.partOfSpeech"
                        >{{ item.partOfSpeech }}</q-btn
                      >
                    </div>
                    <div class="col" style="padding-left: 35px">
                      <div class="ht21">
                        <span v-show="item.display.category">{{
                          item.category || "" !== "" ? `[${item.category}]` : ""
                        }}</span>
                        <span v-show="item.display.hint">{{ item.hint }}</span>
                      </div>
                      <div class="text-h5 ht32">
                        <span v-show="item.display.meaning">{{ item.meaning }}</span>
                        &nbsp;
                      </div>
                      <div class="ht21">
                        <span v-show="item.display.meaning2">{{ item.meaning2 }}</span>
                      </div>
                    </div>
                    <div v-if="item.focused" class="col-1.5 q-gutter-xs">
                      <q-btn
                        round
                        size="md"
                        color="info"
                        :outline="isKnow !== 1"
                        @click="isKnow = 1"
                        :disable="disableKnow"
                      >
                        <span style="font-size: xx-large">!</span>
                      </q-btn>
                      <q-btn
                        round
                        color="info"
                        size="md"
                        :outline="isKnow !== 2"
                        @click="isKnow = 2"
                        :disable="disableKnow"
                        v-show="!auto"
                      >
                        <span style="font-size: xx-large">?</span>
                      </q-btn>
                    </div>
                    <div v-else class="col-1.5 q-gutter-xs">
                      <q-btn
                        round
                        color="grey-8"
                        size="md"
                        :outline="item.isKnow !== 1"
                        disable
                      >
                        <span style="font-size: xx-large">!</span>
                      </q-btn>
                      <q-btn
                        round
                        color="grey-8"
                        size="md"
                        :outline="item.isKnow !== 2"
                        disable
                        v-show="!auto"
                      >
                        <span style="font-size: xx-large">?</span>
                      </q-btn>
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </template>
          </q-virtual-scroll>
        </div>

        <q-page-sticky position="bottom-right" :offset="[30, 30]">
          <div class="q-gutter-sm">
            <q-btn
              v-show="!played"
              fab
              icon="gps_fixed"
              @click="gotoLastIdx"
              color="primary"
            />
            <q-badge v-show="played" outline align="middle" color="white">
              {{ txtTimes }}
            </q-badge>
            <q-btn
              fab
              :icon="played ? 'pause' : 'play_arrow'"
              @click="play"
              color="primary"
            />
          </div>
        </q-page-sticky>
      </q-page>
    </q-page-container>
  </q-layout>
  <div
    v-if="editorInfo.show"
    style="position: fixed; width: 100vw"
    :style="{ top: editorInfo.top, left: editorInfo.left }"
    class="bg-black glossy"
  >
    <div class="row" style="margin: 20px">
      <q-btn flat size="md" icon="cancel" @click="editorInfo.show = false" />
      <div class="col-1">{{ editorInfo.word.beginner2_loc }}</div>
      <q-input label="단어" v-model="editorInfo.word.word" />
      <q-input label="단어2" v-model="editorInfo.word.word2" />
      <q-input label="품사" v-model="editorInfo.word.partOfSpeech" />
      <q-input label="핵심" v-model="editorInfo.word.isCore" />
      <q-input label="난이도" v-model="editorInfo.word.isHard" />
      <q-input label="분류" v-model="editorInfo.word.category" />
      <q-input label="힌트" v-model="editorInfo.word.hint" />
      <q-input label="의미" v-model="editorInfo.word.meaning" />
      <q-input label="의미2" v-model="editorInfo.word.meaning2" />
      <q-btn flat size="md" icon="check" @click="saveWord(editorInfo.word)" />
    </div>
  </div>
</template>

<script>
import { ref, toRefs, reactive, watch, computed, onMounted, nextTick } from "vue";
import { throttle, useQuasar } from "quasar";
import XLSX from "xlsx";
import {
  loading,
  status,
  baseStatus,
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
} from "../../common/db";

const assign = (t, o) => {
  if (!o) return;
  for (let k of Object.keys(t)) if (o[k] !== undefined) t[k] = o[k];
};

export default {
  setup() {
    const $q = useQuasar();
    $q.dark.set(true);

    watch(loading, (v) => {
      if (v) $q.loading.show();
      else $q.loading.hide();
    });

    const { book, step, difficulty, wordGap, lastIdx, round, unitCnt, auto } = toRefs(
      status
    );
    const lastNo = computed({
      get: () => lastIdx.value + 1,
      set: (v) => (lastIdx.value = v < 1 ? 0 : v - 1),
    });
    const virtualListRef = ref(null);
    const gotoLastIdx = () =>
      virtualListRef.value.scrollTo(lastIdx.value, "center-force");

    watch(words, (ws) => {
      setTimeout(() => {
        ws[lastIdx.value].focused = true;
        virtualListRef.value.scrollTo(lastIdx.value, "center-force");
      }, 500);
    });
    watch(lastIdx, (n, o) => {
      const ow = words.value[o];
      if (ow) {
        ow.focused = false;
        if (!ow.visibility) ow.display = Object.assign({}, display.value.default);
      }
      const nw = words.value[n];
      if (!nw) return;
      nw.focused = true;
      nw.display = Object.assign({}, display.value.focus);
      if (virtualListRef.value) virtualListRef.value.scrollTo(n, "center-force");
    });

    const playIdx = { first: 0, last: 0 };
    const isKnow = ref(0);
    const disableKnow = ref(true);
    const drawerRight = ref(false);
    const played = ref(false);
    let intervalId = 0;
    watch(played, (v) => {
      clearInterval(intervalId);
      if (v) intervalId = setInterval(() => playTimes.seconds++, 1000);
    });

    const unit = computed(() =>
      words.value.length === 0 ? 1 : (words.value[lastIdx.value] || { unit: 1 }).unit
    );
    watch(unit, () => {
      if (played.value) {
        unitCnt.value--;
        if (unitCnt.value <= 0) {
          played.value = false;
          unitCnt.value = baseStatus.value.unitCnt;
        }
      }
    });

    const play = throttle(async () => {
      played.value = !played.value;
      if (!played.value) {
        if (!auto.value) {
          setTimeout(() => {
            if (isKnow.value === 0) isKnow.value = 2;
          }, 2000);
        }
        return;
      }

      drawerRight.value = false;
      await nextTick();

      let w;
      let stopWatch;
      try {
        playIdx.first = lastIdx.value;
        while (played.value) {
          w = words.value[lastIdx.value];
          if (!w.willPlay) {
            lastIdx.value++;
            continue;
          }

          isKnow.value = 0;
          disableKnow.value = true;
          await new Promise((resolve, reject) => {
            w.audio.addEventListener("ended", () => {
              disableKnow.value = false;
              if (auto.value) {
                setTimeout(
                  resolve,
                  Math.ceil(w.audio.duration * 1000) + wordGap.value * 1000
                );
              } else {
                stopWatch = watch(isKnow, () => {
                  resolve();
                });
              }
            });
            w.audio.addEventListener("error", reject);
            w.audio.play();
          });

          if (!auto.value) {
            stopWatch();
          }
          if (isKnow.value === 1) {
            w.wordCheck.knowCnt++;
            w.isKnow = 1;
            willPlayNextCnt.value--;
          } else {
            if (w.wordCheck.knowCnt > 0) w.wordCheck.knowCnt--;
            w.isKnow = 2;
          }

          disableKnow.value = true;
          w.visibility = false;
          playIdx.last = lastIdx.value;
          lastIdx.value++;
          await nextTick();
          if (words.value.length === lastIdx.value) {
            played.value = false;
            lastIdx.value = 0;
            await nextTick();
            break;
          }
        }
      } catch (e) {
        played.value = false;
        console.log(e);
      } finally {
        loading.value = true;
        for (let i = playIdx.first; i <= playIdx.last; i++) {
          w = words.value[i];
          if (w.isKnow !== 1) continue;
          let wc = w.wordCheck;
          wc.nextRound = round.value + wc.knowCnt + 1;
          await db.checkingWords.put(Object.assign({}, wc));
        }
        if (words.value.length <= lastIdx.value) {
          await db.checkWords.bulkPut(await db.checkingWords.toArray());
          await db.checkingWords.clear();
          lastIdx.value = 0;
          round.value++;
          words.value = await getWords(book.value, difficulty.value);
        }
        await db.playedTimes.put(
          Object.assign(
            {},
            {
              book: book.value,
              step: step.value,
              difficulty: difficulty.value,
              round: round.value,
            },
            playTimes
          )
        );
        await nextTick();
        loading.value = false;
      }
    }, 3000);

    const visibleWord = (i, w) => {
      w.visibility = !w.visibility;
      if (w.visibility) {
        for (let k in w.display) w.display[k] = true;
      } else {
        w.display = Object.assign({}, display.value[w.focused ? "focus" : "default"]);
      }
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
          .then((v) => {
            console.log(v);
            status.difficulty = 0;
          });
      };
      reader.readAsArrayBuffer(event.target.files[0]);
    };
    const downXlsx = async () => {
      let wb = XLSX.utils.book_new();
      let tNms = [
        "finalStatus",
        "baseStatuses",
        "lastStatuses",
        "words",
        "checkingWords",
        "checkWords",
        "playedTimes",
      ];
      for (let nm of tNms) {
        let datas = await db[nm].toArray();
        let sh = XLSX.utils.json_to_sheet(datas);
        XLSX.utils.book_append_sheet(wb, sh, nm);
      }
      XLSX.writeFile(wb, "talpi_datas.xlsx");
    };

    const initDB = () => {
      loading.value = true;
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
          if (nm === "words") {
            for (let w of datas) {
              for (let k in w) {
                if (typeof w[k] === "string" && w[k].indexOf("'") > 0) w[k] = "'" + w[k];
              }
            }
          }
          let rslt = await db[nm].bulkPut(datas);
        }
        loading.value = false;
        window.location.reload();
      };
      req.send();
    };

    const editorInfo = reactive({
      show: false,
      top: "0",
      left: "0",
      word: null,
    });
    const editWord = (p, w) => {
      editorInfo.top = Math.ceil(p.top) + "px";
      editorInfo.left = Math.ceil(p.left) + "px";
      editorInfo.word = w;
      editorInfo.show = true;
    };
    const saveWord = (w) => {
      editorInfo.show = false;

      db.words.get(w.id).then((item) => {
        assign(item, w);
        db.words.put(item);
      });
    };
    return {
      auto,
      book,
      step,
      difficulty,
      wordGap,
      lastNo,
      round,
      unitCnt,
      oBook,
      books,
      oStep,
      oDifficulity,
      display,
      played,
      play,
      playTimes,
      txtTimes,
      unit,
      words,
      willPlayCnt,
      willPlayPer,
      willPlayNextCnt,
      willPlayNextPer,
      visibleWord,
      virtualListRef,
      parseXlsx,
      downXlsx,
      initDB,
      drawerRight,
      isKnow,
      disableKnow,
      gotoLastIdx,
      downSec: () => {
        let tmp = Number((wordGap.value - 0.1).toFixed(1));
        if (tmp < -0.5) tmp = -0.5;
        wordGap.value = tmp;
      },
      upSec: () => (wordGap.value = Number((wordGap.value + 0.1).toFixed(1))),
      editorInfo,
      editWord,
      saveWord,
    };
  },
};
</script>

<style scoped lang="scss">
.q-item div {
  color: $grey-8;
}
.q-item.bg-blue-grey div {
  color: white;
}
div.ht21 {
  height: 21px;
}
div.ht32 {
  height: 32px;
}
</style>
