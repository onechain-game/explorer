<script lang="ts" setup>
import { onMounted, ref, computed, onUnmounted, onUpdated } from 'vue';
import { useBlockchain, useFormatter, useStakingStore, useBaseStore, useSaw } from '@/stores';
import { decodeTxRaw, type DecodedTxRaw } from '@cosmjs/proto-signing';
import type { ActionLog } from '@/types';

const format = useFormatter();
const chainStore = useBlockchain();
const stakingStore = useStakingStore();
const baseStore = useBaseStore();
const saw = useSaw();
const props = defineProps(['chain']);

let listActionLog = ref([] as ActionLog[]);

let indexPage = 0

onMounted(async () => {
  console.log('onMounted')
  await fetchPosition();
});

onUpdated(() => {
  console.log('onUpdate')
})

async function fetchPosition() {
  listActionLog.value = (await saw.fetchListActionLog()).actionLogs.sort((a, b) => parseInt(b.claimTime) - parseInt(a.claimTime))
}
</script>

<template>
  <div class="overflow-x-auto mt-7">
    <table class="table w-full" density="compact">
      <thead class="bg-base-200">
        <tr>
          <th style="position: relative; z-index: 2;">{{ $t('saw.Id') }}</th>
          <th style="position: relative; z-index: 2;">{{ $t('saw.GameId') }}</th>
          <th>{{ $t('saw.QuestId') }}</th>
          <th>{{ $t('saw.GamePublisherId') }}</th>
          <th>{{ $t('saw.ReceiveAddress') }}</th>
          <th>{{ $t('saw.ApAmount') }}</th>
          <th>{{ $t('saw.ClaimTime') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in listActionLog" :index="index">
          <td>{{ item.id }}</td>
          <td>{{ item.gameId }}</td>
          <td>{{ item.questId }}</td>
          <td>{{ item.gamePublisherId }}</td>
          <td class="text-sm text-primary"><RouterLink :to="`/${props.chain}/account/${item.receiveAddress}`">{{ item.receiveAddress }}</RouterLink></td>
          <td>{{ item.apAmount }}</td>
          <td>{{ Boolean(item.claimTime) ? format.toDay(parseInt(item.claimTime), 'from') : '' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
<!--   <label class="btn !bg-yes !border-yes text-white" @click="changePage()">{{ $t('account.btn_send') }}</label> -->
</template>

<route>
  {
    meta: {
      i18n: 'ap',
    }
  }
</route>
