<script lang="ts" setup>
import { fromBase64, toBase64 } from '@cosmjs/encoding';
import { decodeTxRaw } from '@cosmjs/proto-signing';
import { computed } from '@vue/reactivity';
import { hashTx } from '@/libs';
import { useBlockchain, useFormatter } from '@/stores';
import { decodeValueMessageSend } from '@/libs/utils';
import type { MessageValue } from '@/types'

const chainStore = useBlockchain()
const props = defineProps({
  value: { type: Array<string> },
});

const txs = computed(() => {
  return props.value?.map((x) => {
    let item = {
      hash: hashTx(fromBase64(x)),
      tx: decodeTxRaw(fromBase64(x)),
      data: {} as MessageValue
    }

    if (item.tx.body.messages.length < 2) {
      const data = decodeValueMessageSend(item.tx.body.messages[0].value)
      item.data = data
    }
    return item
  }) || []
});

const format = useFormatter();
const chain = useBlockchain();

</script>
<template>
  <div class="overflow-x-auto mt-4">
    <table class="table w-full" density="compact" v-if="txs.length > 0">
      <thead>
        <tr>
          <th style="position: relative; z-index: 2;">Hash</th>
          <th>Msgs</th>
          <th>From</th>
          <th>To</th>
          <th>Value</th>
          <th>Memo</th>
        </tr>
      </thead>
      <tbody class="text-sm">
        <tr v-for="item in txs">
          <td>
            <RouterLink :to="`/${chain.chainName}/tx/${item.hash}`" class="text-primary dark:invert">{{
              format.formatSortHash(item.hash)
            }}</RouterLink>
          </td>
          <td>
            {{
              format.messages(
                item.tx.body.messages.map((x) => ({ '@type': x.typeUrl }))
              )
            }}
          </td>
          <td><RouterLink :to="`/${chainStore.chainName}/account/${item.data.from}`">{{ format.formatSortAddress(item.data.from || '') }}</RouterLink></td>
          <td><RouterLink :to="`/${chainStore.chainName}/account/${item.data.to.replaceAll('','')}`">{{ format.formatSortAddress(item.data.to.replaceAll('','') || '') }}</RouterLink></td>
          <td>
            <p v-for="element in item.data.amount">{{`${element[1]}${element[0]} `}} </p>
          </td>
          <td>{{ item.tx.body.memo }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else class="text-center">No Transactions</div>
  </div>
</template>
