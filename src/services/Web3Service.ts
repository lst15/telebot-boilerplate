import {ethers} from "ethers";
import {Web3Repository} from "../repository/Web3Repository";
import {AuthTelegramRepository} from "../repository/AuthTelegramRepository";
import {Connection, PublicKey} from "@solana/web3.js";
import * as net from "net";

export class Web3Service {
    FIND_NODE_IS_RUNNING:boolean = false;

    private async testWssEndpoint(endpoint: string) {

        this.getInitializedWebsocketProvider(endpoint).then(async (network) => {
            const networkFound = await network.getNetwork();
            AuthTelegramRepository.client.sendMessage(6391274751, {
                message: `Found ${networkFound.name} with ID ${networkFound.chainId}\n${endpoint}`
            })
        }).catch((e) => {
            console.log("Tried:",endpoint)
        });
    }

    testSolanaHttpEndpoint(endpoint:string){
        const conn = new Connection(endpoint)

        conn.getFirstAvailableBlock().then(() => {
            AuthTelegramRepository.client.sendMessage(6391274751,{
                message: "Found a new RPC:\n\nName: `Solanna`\nRPC: " + endpoint
            })
        }).catch((e) => {
            console.log("Tried in sol:",endpoint)
        })

    }

    async testHttpEndpoint(endpoint:string){
        try {
            const provider = new ethers.JsonRpcProvider(endpoint)
            const networkFound = await provider.getNetwork();

            AuthTelegramRepository.client.sendMessage(6391274751,{
                message: "Found a new RPC:\n\nName: `" + networkFound.name + "`\nID: `" + networkFound.chainId + "`\nRPC: " + endpoint
            })
        } catch (e) {
            console.log("Tried:",endpoint)
        }
    }

    public async runNodeCrawler(){
        while(this.FIND_NODE_IS_RUNNING) {
            const tryingEndpoint = this.hostGenerator()

            this.testHttpEndpoint("http://" + tryingEndpoint + ":8545")
            this.testWssEndpoint("ws://" + tryingEndpoint + ":8546")
            this.testSolanaHttpEndpoint("http://" + tryingEndpoint + ":8899")

            await new Promise(resolve => setTimeout(resolve, 10));
        }
        console.log("Node crawler was stopped")
    }

    public startNodeCrawler(){

        if(!this.FIND_NODE_IS_RUNNING){
            this.FIND_NODE_IS_RUNNING = true
            this.runNodeCrawler()

            return "It's running right now"
        }

        throw new Error("It is already running right now")

    }

    public stopNodeCrawler(){
        if(this.FIND_NODE_IS_RUNNING){
            this.FIND_NODE_IS_RUNNING = false;
            return "It was stopped"
        }

        throw new Error("It isn't running right now")
    }

    private hostGenerator() {
        return  Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
    }

    private async getInitializedWebsocketProvider (rpcUrl: string) {

        return new Promise<ethers.WebSocketProvider>((resolve, reject) => {
            const provider = new ethers.WebSocketProvider(rpcUrl,);

            (provider.websocket as unknown as any)
                .once('open', () => {
                    resolve(provider);
                })
                .once('error', (error: any) => {
                    reject(error);
                }).once('close', (error: any) => {
                reject(error);
            });
        });
    };

}
