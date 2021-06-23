<template>
  <q-layout view="lhh LpR lff" container style="height: 100vh">
    <q-header>
      <q-toolbar class="bg-primary glossy">
        <q-toolbar-title>
          {{ oBook.label }} Unit {{ unit }} {{ oStep.label }}단계
          {{ oDifficulity.label }} {{ readRound }}회독
        </q-toolbar-title>
        <div class="q-gutter-sm row items-center">
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
          <q-btn
            v-if="!played"
            flat
            @click="drawerRight = !drawerRight"
            round
            dense
            icon="settings"
          />
        </div>
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
              <q-item :class="{ 'bg-blue-grey glossy': item.focused }" :key="item.id">
                <q-item-section @click="checkWord(index, item)">
                  <audio
                    :ref="(el) => (words[index].audio = el)"
                    type="audio/mpeg"
                    crossorigin="anonymous"
                  ></audio>
                  <div class="row items-center">
                    <div class="col-1">
                      <q-badge
                        color="white"
                        outline
                        rounded
                        v-show="readRound < item.wordCheck.showRound"
                        >{{ item.wordCheck.showRound }}</q-badge
                      >
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
                        <span v-show="item.display.category">
                          {{ item.category || "" !== "" ? `[${item.category}]` : "" }}
                        </span>
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
                    <div class="col-1">
                      <q-icon
                        :name="item.checked ? 'check_box' : 'crop_din'"
                        style="font-size: 30px"
                      />
                      <q-badge
                        rounded
                        outline
                        color="yellow"
                        v-show="item.wordCheck.cnt > 0"
                        :label="item.wordCheck.cnt"
                      />
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
              >{{ playMinutes }}분 {{ playSeconds % 60 }}초</q-badge
            >
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
</template>

<script>
import { ref, toRefs, watch, nextTick, computed, onMounted } from "vue";
import { throttle, useQuasar } from "quasar";
import XLSX from "xlsx";
import {
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
} from "../../common/db";

export default {
  setup() {
    const $q = useQuasar();
    $q.dark.set(true);

    watch(loading, (v) => {
      if (v) $q.loading.show();
      else $q.loading.hide();
    });

    const {
      book,
      step,
      difficulty,
      playSeconds,
      wordGap,
      currentIndex,
      readRound,
    } = toRefs(status);

    const playMinutes = computed({
      get: () => Math.floor(playSeconds.value / 60),
      set: (val) => {
        playSeconds.value = val * 60 + (playSeconds.value % 60);
      },
    });
    const inputPm = ref(null);
    let intervalId = 0;
    watch(playSeconds, (pm) => {
      if (pm <= 0 || isNaN(pm)) {
        clearInterval(intervalId);
        playSeconds.value = baseStatus.value.playSeconds;
        played.value = false;
        inputPm.value.blur();
      }
    });
    const unit = computed(() =>
      words.value.length === 0 ? 0 : words.value[currentIndex.value].unit || 0
    );

    const assign = (t, o) => {
      if (!o) return;
      for (let k of Object.keys(t)) if (o[k] !== undefined) t[k] = o[k];
    };
    onMounted(async () => {
      assign(status, await db.finalStatus.get({ id: 1 }));
    });

    const checked = ref(false);

    const virtualListRef = ref(null);
    const setAudio = (cnt) => {
      cnt = cnt || 10;
      let w;
      for (let i = currentIndex.value; i < words.value.length; i++) {
        if (cnt === 0) break;
        w = words.value[i];
        if (w.readable) {
          w.audio.src = `/mp3/beginner2/${w.id.toString().padStart(5, "0")}.mp3`;
          cnt--;
        }
      }
    };
    watch(words, () => {
      setTimeout(() => {
        words.value[currentIndex.value].focused = true;
        virtualListRef.value.scrollTo(currentIndex.value, "center-force");
      }, 500);
    });
    watch(currentIndex, (n, o) => {
      const ow = words.value[o];
      if (ow) {
        ow.focused = false;
        if (!ow.checked) ow.display = Object.assign({}, display.value.default);
      }
      const nw = words.value[n];
      if (!nw) return;
      nw.focused = true;
      nw.display = Object.assign({}, display.value.focus);
      if (virtualListRef.value) virtualListRef.value.scrollTo(n, "center-force");
    });

    const played = ref(false);
    const drawerRight = ref(false);
    const play = throttle(() => {
      played.value = !played.value;
      if (played.value) drawerRight.value = false;
    }, 3000);
    const playIdx = { first: 0, last: 0 };

    watch(played, async (p) => {
      if (words.value.length <= currentIndex.value) currentIndex.value = 0;
      let w;
      if (!p) {
        clearInterval(intervalId);
        loading.value = true;
        for (let i = playIdx.first; i <= playIdx.last; i++) {
          w = words.value[i];
          let wc = w.wordCheck;
          if (step.value === "1-4") {
            if (w.checked) {
              w.checked = false;
            } else {
              wc.cnt++;
              wc.showRound = readRound.value + wc.cnt + 1;
              await db.wordChecks.put(Object.assign({}, wc));
            }
          }
        }
        loading.value = false;
        return;
      }

      intervalId = setInterval(() => (playSeconds.value -= 1), 1000);
      words.value[currentIndex.value].focused = true;
      virtualListRef.value.scrollTo(currentIndex.value, "center-force");
      try {
        setAudio();
        playIdx.first = currentIndex.value;
        while (played.value) {
          if (words.value.length <= currentIndex.value) {
            played.value = false;
            currentIndex.value = 0;
            readRound.value++;
            break;
          }

          w = words.value[currentIndex.value];
          if (!w.readable) {
            currentIndex.value++;
            continue;
          }

          await new Promise((resolve, reject) => {
            w.audio.addEventListener("ended", () => {
              setTimeout(
                resolve,
                Math.ceil(w.audio.duration * 1000) + wordGap.value * 1000
              );
            });
            w.audio.addEventListener("error", reject);
            w.audio.play();
          });

          currentIndex.value++;
          playIdx.last = currentIndex.value;
          setAudio(1);
        }
      } catch (e) {
        played.value = false;
        console.log(e);
      }
    });

    const checkWord = (i, w) => {
      if (i > currentIndex.value) return;
      w.checked = !w.checked;
      if (w.checked) {
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
      let tNms = ["finalStatus", "baseStatuses", "lastStatuses", "words", "wordChecks"];
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

    return {
      book,
      step,
      difficulty,
      playSeconds,
      wordGap,
      currentIndex,
      readRound,
      oBook,
      books,
      oStep,
      oDifficulity,
      playMinutes,
      display,
      checked,
      played,
      play,
      inputPm,
      unit,
      words,
      checkWord,
      virtualListRef,
      parseXlsx,
      downXlsx,
      initDB,
      drawerRight,
      downSec: () => {
        let tmp = Number((wordGap.value - 0.1).toFixed(1));
        if (tmp < -0.5) tmp = -0.5;
        wordGap.value = tmp;
      },
      upSec: () => (wordGap.value = Number((wordGap.value + 0.1).toFixed(1))),
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
