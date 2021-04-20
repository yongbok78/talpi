<template>
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
          <q-item :class="{ 'shadow-24': index === virtualListIndex }">
            <q-item-section>
              <div class="row items-center">
                <div class="col-3 text-right" style="padding-right: 15px">
                  <div>&nbsp;</div>
                  <div class="text-h6 text-pink">
                    {{ item.word }}
                  </div>
                  <div class="text-grey-6">{{ item.word2 }}&nbsp;</div>
                </div>
                <div class="col-0">
                  <q-btn round size="xs" color="pink-3">
                    {{ item.partOfSpeech }}
                  </q-btn>
                </div>
                <div class="col" style="padding-left: 35px">
                  <div class="text-pink-2">
                    {{ item.class }} {{ item.hint }}&nbsp;
                  </div>
                  <div class="text-h6 text-pink">
                    {{ item.meaning }}
                  </div>
                  <div class="text-grey-6">{{ item.meaning2 }}&nbsp;</div>
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
    <q-btn fab icon="pause" color="primary" />
  </q-page-sticky>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import XLSX from "xlsx";
import db from "../../common/db";

export default {
  setup() {
    const virtualListRef = ref(null);
    const virtualListIndex = ref(0);
    const wordList = ref([]);

    onMounted(() => {
      db.words.toArray((arr) => (wordList.value = arr));
    });

    onUnmounted(() => {});

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
      wordList,
      virtualListRef,
      virtualListIndex,
      parseXlsx,
    };
  },
};
</script>
