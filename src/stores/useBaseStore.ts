import { defineStore } from 'pinia';
import { useBlockchain } from '@/stores';
import { decodeTxRaw, type DecodedTxRaw } from '@cosmjs/proto-signing';
import dayjs from 'dayjs';
import type { Block, MessageValue } from '@/types';
import { hashTx } from '@/libs';
import { fromBase64 } from '@cosmjs/encoding';
import { useRouter } from 'vue-router';
import { decodeValueMessageSend } from '@/libs/utils';

export const useBaseStore = defineStore('baseStore', {
    state: () => {
        return {
            earlest: {} as Block,
            latest: {} as Block,
            recents: [] as Block[],
            theme: (window.localStorage.getItem('theme') || 'dark') as
                | 'light'
                | 'dark',
            connected: true,
        };
    },
    getters: {
        blocktime(): number {
            if (this.earlest && this.latest) {
                if (
                    this.latest.block?.header?.height !==
                    this.earlest.block?.header?.height
                ) {
                    const diff = dayjs(this.latest.block?.header?.time).diff(
                        this.earlest.block?.header?.time
                    );
                    const blocks = Number(this.latest.block.header.height) - Number(this.earlest.block.header.height)
                    return diff / (blocks);
                }
            }
            return 6000;
        },
        blockchain() {
            return useBlockchain();
        },
        currentChainId(): string {
            return this.latest.block?.header.chain_id || '';
        },
        txsInRecents() {
            const txs = [] as {
                height: string;
                hash: string;
                tx: DecodedTxRaw;
            }[];
            console.log('txsInRecents')
            this.recents.forEach((b) =>
                b.block?.data?.txs.forEach((tx: string) => {
                    if (tx) {
                        const raw = fromBase64(tx);
                        try {
                            txs.push({
                                height: b.block.header.height,
                                hash: hashTx(raw),
                                tx: decodeTxRaw(raw),
                            });
                        } catch (e) {
                            console.error(e);
                        }
                    }
                })
            );
            console.log(txs)
            return txs.sort((a, b) => {return Number(b.height) - Number(a.height)});
        },
    },
    actions: {
        async initial() {
            this.fetchLatest()
        },
        async clearRecentBlocks() {
            this.recents = [];
        },
        async fetchLatest() {
            try{
                this.latest = await this.blockchain.rpc?.getBaseBlockLatest();
                this.connected = true
            }catch(e) {
                this.connected = false
            }
            if (
                !this.earlest ||
                this.earlest?.block?.header?.chain_id !=
                    this.latest?.block?.header?.chain_id
            ) {
                //reset earlest and recents
                this.earlest = this.latest;
                this.recents = [];
            }
            //check if the block exists in recents
            if (
                this.recents.findIndex(
                    (x) => x?.block_id?.hash === this.latest?.block_id?.hash
                ) === -1
            ) {
                if (this.recents.length >= 50) {
                    this.recents.shift();
                }
                this.recents.push(this.latest);
            }
            return this.latest;
        },

        async fetchValidatorByHeight(height?: number, offset = 0) {
            return this.blockchain.rpc.getBaseValidatorsetAt(
                String(height),
                offset
            );
        },
        async fetchLatestValidators(offset = 0) {
            return this.blockchain.rpc.getBaseValidatorsetLatest(offset);
        },
        async fetchBlock(height?: number | string) {
            return this.blockchain.rpc.getBaseBlockAt(String(height));
        },
        async fetchAbciInfo() {
            return this.blockchain.rpc.getBaseNodeInfo();
        },
        async fetchListTransaction() {
            console.log('fetchListTransaction')
            const txs = [] as {
                height: string,
                hash: string,
                tx: DecodedTxRaw,
                data: MessageValue
            }[];
            let heightLast = this.latest
            if (!heightLast?.block) {
                heightLast = await this.fetchLatest()
            }
            const height = parseInt(heightLast.block.header.height)
            for (let i = height; i > height - 20; i--) {
                let block = await this.fetchBlock(i)
                block?.block.data?.txs.forEach((tx: string) => {
                    if (tx) {
                        const raw = fromBase64(tx);
                        try {
                            const tx = decodeTxRaw(raw)
                            let data = {} as MessageValue
                            if (tx.body.messages.length < 2) {
                                data = decodeValueMessageSend(tx.body.messages[0].value)
                            }
                            console.log(tx.body.messages[0].typeUrl )
                            if (tx.body.messages[0].typeUrl.indexOf('MsgSend') >= 0) {
                                txs.push({
                                    height: block.block.header.height,
                                    hash: hashTx(raw),
                                    tx: tx,
                                    data: data
                                });
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                })
            }
            return txs
        },
        // async fetchNodeInfo() {
        //     return this.blockchain.rpc.no()
        // }
    },
});
