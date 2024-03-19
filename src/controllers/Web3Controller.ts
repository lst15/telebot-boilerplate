import {Web3Service} from "../services/Web3Service";
import {TelebotRouterDeco} from "../deco/TelebotRouterDeco";
import {ChangeNetworkResponse} from "./response/web3/ChangeNetworkResponse";
import {GetBalanceResponse} from "./response/web3/GetBalanceResponse";
import {Web3Repository} from "../repository/Web3Repository";
import {NetworkListResponse} from "./response/web3/NetworkListResponse";
import {ApplyRpcResponse} from "./response/web3/ApplyRpcResponse";
import {CurrentNetworkResponse} from "./response/web3/CurrentNetworkResponse";
import {message} from "telegram/client";

const service = new Web3Service();

export class Web3Controller {

    @TelebotRouterDeco("changeNetwork")
    async changeNetwork(arg:string){
        await service.changeNetwork(arg);
        const message = ChangeNetworkResponse();

        return {message}
    }

    @TelebotRouterDeco("getBalance")
    async getBalance(arg:string){
        const balance = await service.getBalance(arg)
        const message = GetBalanceResponse(balance,Web3Repository.networkDecimals)

        return {message}
    }

    @TelebotRouterDeco("networkList")
    async networkList(arg:string){
        const networks = service.listNetworks();
        const message:string = NetworkListResponse(networks)

        return {message}
    }

    @TelebotRouterDeco("applyRpc")
    async applyRpcAndKeepConfigurations(arg:string){
        await service.setEndpointAndKeepConfigurations(arg);
        const message:string = ApplyRpcResponse()

        return {message}
    }

    @TelebotRouterDeco("currentNetwork")
    async currentNetwork(arg:string) {
        const message = CurrentNetworkResponse()
        return {message}
    }

    @TelebotRouterDeco("setPrivateKey")
    async setPrivateKey(arg:string){
        await service.setPrivateKey(arg);
        const message = "Private key set successfully";
        return {message};
    }

    @TelebotRouterDeco("runNodeCrawler")
    async runNodeCrawler(arg:string) {
        service.startNodeCrawler()

        return {
            message:"Running"
        }
    }

    @TelebotRouterDeco("stopNodeCrawler")
    async stopNodeCrawler(arg:string) {
        service.stopNodeCrawler()

        return {
            message:"Running"
        }
    }

}
