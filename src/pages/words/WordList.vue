<template>
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
      v-model.number="wordInterval"
      type="number"
      step="0.25"
      min="0.5"
      class="col-1"
    />
  </q-toolbar>
  <div
    ref="listRef"
    tabindex="0"
    class="q-ma-sm row justify-center"
    @keypress.prevent="cnt"
  >
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
                  <div>{{ item.word2 }}&nbsp;</div>
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
    const $q = useQuasar();
    $q.dark.set(true);

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
      { label: "비핵심", value: 4 },
    ];
    const book = ref(books[1]);
    const step = ref(steps[3]);
    const difficulty = ref(difficultys[1]);
    const playMinutes = ref(25);
    const wordInterval = ref(1.5);

    const listRef = ref(null);
    const virtualListRef = ref(null);
    const virtualListIndex = ref(0);

    const wordList = ref([]);
    const selectWords = async () => {
      const diff = difficulty.value.value;
      if (diff !== 0) {
        let w = {};
        w[/[12]/.test(diff.toString()) ? "isHard" : "isCore"] = /[23]/.test(
          diff.toString()
        )
          ? "Y"
          : "N";
        return db.words.where(w).sortBy(`${book.value.value}_loc`);
      }
      return await db.words.toCollection().sortBy(`${book.value.value}_loc`);
    };
    watch([book, difficulty], async () => {
      wordList.value = await selectWords();
    });
    onMounted(async () => {
      wordList.value = await selectWords();
    });

    const played = ref(false);
    let playTimeoutId = 0;
    const play = throttle(() => {
      played.value = !played.value;
      if (played.value) {
        listRef.value.focus();
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
          await talkWord(wordList.value[virtualListIndex.value].id);
          while (played.value) {
            virtualListRef.value.scrollTo(++virtualListIndex.value, "center-force");
            await talkWord(wordList.value[virtualListIndex.value].id);
          }
        } catch (e) {
          played.value = false;
          virtualListIndex.value = 0;
          virtualListRef.value.scrollTo(0);
          console.log(e);
        }
      }
    };

    const talkWord = (id) => {
      return new Promise((res, rej) => {
        try {
          const ad = new Audio(`/mp3/beginner2/${id.toString().padStart(5, "0")}.mp3`);

          ad.addEventListener("ended", (event) => {
            setTimeout(() => {
              res();
            }, wordInterval.value * 1000);
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

    return {
      book,
      books,
      step,
      steps,
      difficulty,
      difficultys,
      playMinutes,
      wordInterval,
      played,
      play,
      wordList,
      virtualListRef,
      virtualListIndex,
      listRef,
      parseXlsx,
      cnt() {
        console.log(listRef.value);
        $q.notify(wordList.value[virtualListIndex.value].word);
      },
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
