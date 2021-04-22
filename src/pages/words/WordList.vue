<template>
  <q-toolbar class="bg-primary glossy">
    <q-select v-model="book" :options="books" label="책"></q-select>
    <q-select v-model="step" :options="steps" label="단계"></q-select>
    <q-select v-model="difficulty" :options="difficultys" label="난이도"></q-select>
  </q-toolbar>
  <div class="q-ma-sm row justify-center">
    <div class="col">
      <q-virtual-scroll
        ref="virtualListRef"
        component="q-list"
        :items="wordList"
        style="max-height: 85vh"
        separator
      >
        <template v-slot="{ item, index }">
          <q-item :class="{ 'bg-blue-grey': index === virtualListIndex }">
            <q-item-section>
              <div class="row items-center">
                <div class="col-3 text-right" style="padding-right: 15px">
                  <div>&nbsp;</div>
                  <div class="text-h5">
                    {{ item.word }}
                  </div>
                  <div class="text-grey-2">{{ item.word2 }}&nbsp;</div>
                </div>
                <div class="col-0">
                  <q-btn round size="xs" color="grey-8">
                    {{ item.partOfSpeech }}
                  </q-btn>
                </div>
                <div class="col" style="padding-left: 35px">
                  <div>{{ item.class }} {{ item.hint }}&nbsp;</div>
                  <div class="text-h5">
                    {{ item.meaning }}
                  </div>
                  <div>{{ item.meaning2 }}&nbsp;</div>
                </div>
              </div>
            </q-item-section>
          </q-item>
        </template>
      </q-virtual-scroll>
    </div>
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
    <q-btn fab :icon="played ? 'pause' : 'play_arrow'" @click="play" color="primary" />
  </q-page-sticky>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { throttle } from "quasar";
import XLSX from "xlsx";
import db from "../../common/db";
import { useQuasar } from "quasar";

export default {
  setup() {
    const books = [
      { label: "초급편", value: "beginner" },
      {
        label: "초급편2",
        value: "beginner2",
      },
    ];
    const steps = [
      { label: "1-1", value: "1-1" },
      { label: "1-2", value: "1-2" },
      { label: "1-3", value: "1-3" },
      { label: "1-4", value: "1-4" },
      { label: "1-5", value: "1-5" },
      { label: "1-6", value: "1-6" },
      { label: "2-1", value: "2-1" },
      { label: "2-2", value: "2-2" },
      { label: "2-2a", value: "2-2a" },
      { label: "k-e", value: "k-e" },
      { label: "2-3", value: "2-3" },
      { label: "2-4", value: "2-4" },
      { label: "2-5", value: "2-5" },
    ];
    const difficultys = [
      { label: "전체", value: 0 },
      { label: "쉬움", value: 1 },
      { label: "어려움", value: 2 },
      { label: "핵심", value: 3 },
    ];
    const book = ref(books[1]);
    const step = ref(steps[3]);
    const difficulty = ref(difficultys[1]);

    useQuasar().dark.set(true);

    const virtualListRef = ref(null);
    const virtualListIndex = ref(38);

    const wordList = ref([]);
    onMounted(() => {
      db.words.toArray((arr) => (wordList.value = arr));
    });

    const played = ref(false);
    const play = throttle(() => {
      played.value = !played.value;
      changeWord();
    }, 3000);

    let playInterval = 0;
    watch(played, (played) => {
      if (played) {
        tellWord(wordList[virtualListIndex.value].id).then(() => {
          playInterval = setInterval(() => {}, 1500);
        });
      } else {
        clearInterval(playInterval);
      }
    });
    const tellWord = (id) => {
      return new Promise((res, rej) => {
        try {
          const ad = new Audio(
            `/mp3/${book.value.value}/${book.value.value}_${id
              .toString()
              .padStart(3, "0")}.mp3`
          );

          ad.addEventListener("ended", (event) => {
            setTimeout(() => {
              res();
            }, 1500);
          });
          ad.play();
        } catch (err) {
          rej();
        }
      });
    };

    const stopMinutes = ref(25);

    const parseXlsx = (event) => {
      let reader = new FileReader();
      reader.onload = (e) => {
        let data = new Uint8Array(e.target.result);
        let wb = XLSX.read(data, { type: "array" });
        let rslt = XLSX.utils.sheet_to_json(wb.Sheets["beginner2"]);

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
          o.isHard = o.isHard === "Y";
          o.isCore = o.isCore === "Y";
          o.beginner_loc = toId(o.beginner_loc);
          o.beginner2_loc = toId(o.beginner2_loc);
          o.id = i;
        }

        db.words.clear().then(() => {
          db.words.bulkAdd(rslt).then(() => {
            db.words.toArray((arr) => {
              console.log(arr);
              wordList.value = arr;
            });
          });
        });
      };
      reader.readAsArrayBuffer(event.target.files[0]);
    };

    return {
      book,
      books,
      step,
      steps,
      difficulty,
      difficultys,
      played,
      play,
      stopMinutes,
      wordList,
      virtualListRef,
      virtualListIndex,
      parseXlsx,
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
