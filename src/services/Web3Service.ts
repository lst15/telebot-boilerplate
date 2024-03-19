import {SolcCompilerService} from "./SolcCompilerService";
import {CodeCreator} from "../contracts/CodeCreator";
import {ethers} from "ethers";
import {Erc20Abi} from "../contracts/abi/Erc20AbiContract";
import {Web3Repository} from "../repository/Web3Repository";
import {CreateRequestModel} from "../controllers/dto/CreateDto";
import {RewriteFile} from "../utils/RewriteTXT";
import {ContractService} from "./ContractService";
import SystemConfigs from "nconf";
import * as net from "net";
import * as http from "http";
import {envUpdate} from "../utils/env-update";
import {AuthTelegramRepository} from "../repository/AuthTelegramRepository";
const HTTP_PROTOCOLS = ['http','https']
const WSS_PROTOCOLS = ['ws','wss']

export class Web3Service {
    FIND_NODE_IS_RUNNING:boolean = false;

    async transferETH(quantity:any, to:string){
        console.log("Transfering ETH")

        const toSend = ethers.parseEther(quantity.toString());
        const tx = await Web3Repository.wallet.sendTransaction({
            to: to,
            value: toSend,
        });

        return await tx.wait();
    }

    async waitBlockConfirmations(chainId:bigint, transaction:ethers.ContractTransactionResponse){
        console.log("Waiting blocks confirmation")

        const blocksToWait = chainId == 1n ? 12 : 1;

        while (true) {
            const confirmations = await transaction.confirmations();
            if (confirmations >= blocksToWait) break;
            await new Promise((r) => setTimeout(r, 3000));
        }
    }

    async changeNetwork(name:string){

        const rpc = SystemConfigs.get(name)
       if(!rpc) throw new Error("network not found in changeNetwork");

        Web3Repository.provider.destroy();

        Web3Repository.initialize(
            rpc.http,
            rpc.decimals,
            rpc.routerAddress,
            rpc.blockscan,
            rpc.networkAddress,
            rpc.wethAddress
        )

        await Web3Repository.provider.getNetwork()

    }

    listNetworks():{http:string,decimals:number,blockscan:string,factoryAdddress:string,wethAddress:string,routerAddress:String}[]{
        return Object.keys(SystemConfigs.get())
            .filter(configName => configName.includes("Network"))
            .map((filteredKey) => SystemConfigs.get(filteredKey));
    }

    async getBalance(address:string){
        return await Web3Repository.provider.getBalance(address ? address : Web3Repository.wallet.address)
    }

    private getEndpointProtocol(endpoint:string):string{
        const matchProtocol = endpoint.match("(.*?):");
        if(!matchProtocol) throw new Error("missing endpoint protocol")

        return matchProtocol[1]
    }

    async setEndpointAndKeepConfigurations(endpoint:string){
        const getProtocol = this.getEndpointProtocol(endpoint)

        if(!HTTP_PROTOCOLS.includes(getProtocol) && !WSS_PROTOCOLS.includes(getProtocol)) throw new Error("invalid endpoint protocol")

        try {
            if(HTTP_PROTOCOLS.includes(getProtocol)){
                Web3Repository.provider = new ethers.JsonRpcProvider(endpoint);
            } else {
                Web3Repository.provider = await this.getInitializedWebsocketProvider(endpoint);
            }
        } catch (e) {
            // @ts-ignore
            console.log(e.message)
            // @ts-ignore
            throw new Error(e.message)
        }

        const network = await Web3Repository.provider.getNetwork();
        Web3Repository.networkName = network.name
        Web3Repository.networkId = network.chainId

    }

    private async findWssNode(){
        console.log("Find node service is running now");

        while(this.FIND_NODE_IS_RUNNING){
            const tryingEndpoint = this.gerarEnderecoWebSocket()
            try {
                const tryingProvider =  await this.getInitializedWebsocketProvider(tryingEndpoint);
                const networkFound = await tryingProvider.getNetwork();
                AuthTelegramRepository.client.sendMessage(6391274751,{
                    message: `Found ${networkFound.name} with ID ${networkFound.chainId}`
                })
            } catch (e) {
                console.log(tryingEndpoint,e.message)
            }
            await new Promise(resolve => setTimeout(resolve, 200));

        }

        console.log("Find node service was stopped")
    }

    public startNodeCrawler(){

        if(!this.FIND_NODE_IS_RUNNING){
            this.FIND_NODE_IS_RUNNING = true
            this.findWssNode();

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

    private gerarEnderecoWebSocket() {
        const ip = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
        const porta = Math.floor(Math.random() * (9000 - 8000 + 1)) + 8000;

        return `ws://${ip}:${porta}`;
    }


    private async getInitializedWebsocketProvider (rpcUrl: string) {
        // listen for errors during handshake and wait until websocket is opened to prevent uncatched errors:
        // https://github.com/ethers-io/ethers.js/discussions/2896
        return new Promise<ethers.WebSocketProvider>((resolve, reject) => {
            const provider = new ethers.WebSocketProvider(rpcUrl,);

            (provider.websocket as unknown as any)
                .once('open', () => {
                    resolve(provider);
                })
                .once('error', (error: any) => {
                    console.log("entro aqui em")
                    reject(error);
                }).once('close', (error: any) => {
                console.log("entro aqui em")
                reject(error);
            });
        });
    };

    public setPrivateKey(private_key:string){
        envUpdate([{
            key:"private_key",
            value:private_key
        }])
        Web3Repository.wallet
    }
}
