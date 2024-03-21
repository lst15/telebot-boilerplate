import {ethers} from "ethers";
import {Web3Repository} from "../repository/Web3Repository";
import SystemConfigs from "nconf";
import {envUpdate} from "../utils/env-update";
import {ContractRepository} from "../repository/ContractRepository";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const HTTP_PROTOCOLS = ['http','https']
const WSS_PROTOCOLS = ['ws','wss']

export class Web3Service {

    public async getEthPrice(){

        try {
            const response = await axios.get(process.env.endpoint_ethprice as string);
            return response.data as {USD:number}
        } catch (e) {
            throw new Error("Error on catch ETH rate")
        }

    }

    public addWalletAddressInRepository(address:string){
        if(!ethers.isAddress(address)) throw new Error("invalid address")
        if(Web3Repository.walletAddresses.includes(address)) throw new Error("Address already added");

        Web3Repository.walletAddresses.push(address);
    }

    validHasAddressInRepository(){
        const isValid:boolean = Web3Repository.walletAddresses.length == 0;
        if(isValid)throw new Error("You need to set a walletAddress address");
    }

    public removeWalletAddressInRepository(address:string){
        this.validHasAddressInRepository()

        if(!ethers.isAddress(address)) throw new Error("invalid address")
        if(!Web3Repository.walletAddresses.includes(address)) throw new Error("Address not added");

        Web3Repository.walletAddresses = Web3Repository.walletAddresses.filter(walletAddress => walletAddress !== address);
    }

    public clearWalletAdressesInRepository(){
        this.validHasAddressInRepository()

        Web3Repository.walletAddresses = []
    }

    public listWallets():string[] {
        return Web3Repository.walletAddresses
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
        ContractRepository.initialize(rpc.factoryAddress,rpc.routerAddress,rpc.usdAddress,Web3Repository.wallet)

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

    private async getInitializedWebsocketProvider (rpcUrl: string) {

        return new Promise<ethers.WebSocketProvider>((resolve, reject) => {
            const provider = new ethers.WebSocketProvider(rpcUrl);

            (provider.websocket as unknown as any)
                .once('open', () => {
                    resolve(provider);
                })
                .once('error', (error: any) => {
                    reject(error);
                })
                .once('close', (error: any) => {
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
