<script lang="ts" setup>
import { onMounted, ref, computed, onUnmounted, onUpdated } from 'vue';
import { useBlockchain, useFormatter, useStakingStore, useBaseStore } from '@/stores';
import { decodeTxRaw, type DecodedTxRaw } from '@cosmjs/proto-signing';

const format = useFormatter();
const chainStore = useBlockchain();
const stakingStore = useStakingStore();
const baseStore = useBaseStore();
const props = defineProps(['chain']);

let listTransaction = ref([] as {
  height: string,
  hash: string,
  tx: DecodedTxRaw,
  data: {}
}[]);

let listAllTransaction = [] as {
  height: string,
  hash: string,
  tx: DecodedTxRaw,
  data: {}
}[]

let indexPage = 0

onMounted(async () => {
  console.log('onMounted')
  await fetchPosition();
});

onUpdated(() => {
  console.log('onUpdate')
  console.log(listAllTransaction.length)
})

async function changePage() {
  indexPage++
  console.log(indexPage)
  listTransaction.value = []
  listTransaction.value = listAllTransaction.slice(indexPage * 10, indexPage * 10 + 10)
}

async function fetchPosition() {
  listAllTransaction = await baseStore.fetchListTransaction()
  listTransaction.value = listAllTransaction.slice(indexPage * 10,indexPage * 10 + 10)
  console.log(listAllTransaction.length)
}
</script>

<template>
  <div class="overflow-x-auto mt-4">
    <table class="table w-full" density="compact">
      <thead class="bg-base-200">
        <tr>
          <th style="position: relative; z-index: 2;">{{ $t('account.height') }}</th>
          <th style="position: relative; z-index: 2;">{{ $t('account.hash') }}</th>
          <th>{{ $t('account.messages') }}</th>
          <th>{{ $t('account.from') }}</th>
          <th>{{ $t('account.to') }}</th>
          <th>{{ $t('account.totalAmount') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in listTransaction" :index="index">
          <td class="text-sm text-primary">
            <RouterLink :to="`/${props.chain}/block/${item.height}`">{{ item.height }}</RouterLink>
          </td>
          <td class="truncate text-primary" >
            <RouterLink :to="`/${props.chain}/tx/${item.hash}`">{{
              format.formatSortHash(item.hash)
            }}</RouterLink>
          </td>
          <td>{{ format.messages(item.tx.body.messages) }}</td>
          <td class="text-sm text-primary"><RouterLink :to="`/${chainStore.chainName}/account/${item.data.from}`">{{ format.formatSortAddress(item.data.from || '') }}</RouterLink></td>
          <td class="text-sm text-primary"><RouterLink :to="`/${chainStore.chainName}/account/${item.data.to.replaceAll('','')}`">{{ format.formatSortAddress(item.data.to.replaceAll('','') || '') }}</RouterLink></td>
          <td>
            <p v-for="element in item.data.amount">{{`${element[1]}${element[0]} `}} </p>
          </td>
        </tr>
      </tbody>
    </table>

  </div>
<!--   <label class="btn !bg-yes !border-yes text-white" @click="changePage()">{{ $t('account.btn_send') }}</label> -->
</template>

<route>
  {
    meta: {
      i18n: 'transactions',
    }
  }
</route>
