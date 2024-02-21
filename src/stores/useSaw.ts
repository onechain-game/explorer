import { defineStore } from 'pinia';
import { useBlockchain } from '@/stores';

export const useSaw = defineStore('saw', {
  state: () => {
    return {}
  },
  getters: {
    blockchain() {
      return useBlockchain();
    },
  },
  actions: {
    async initial() {
      
    },
    async fetchListActionLog() {
      return await this.blockchain.rpc.getListActionLog()
    }
  }
})