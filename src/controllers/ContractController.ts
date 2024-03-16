import {TelebotRouterDeco} from "../deco/TelebotRouterDeco";
import {CreateDto} from "./dto/CreateDto";
import {ContractService} from "../services/ContractService";
import {CreateResponse} from "./response/contract/CreateResponse";
import SystemConfigs from "nconf";
import {RemoveLimitsResponse} from "./response/contract/RemoveLimitsResponse";
import {RenounceOwnershipResponse} from "./response/contract/RenounceOwnershipResponse";
import {OpenTradingResponse} from "./response/contract/OpenTradingResponse";
import {Web3Service} from "../services/Web3Service";
import {Web3Repository} from "../repository/Web3Repository";
import {EstimateDeployResponse} from "./response/contract/estimateDeployResponse";
import {GetBalanceResponse} from "./response/web3/GetBalanceResponse";
import {ChangeNetworkResponse} from "./response/web3/ChangeNetworkResponse";
import {estimateDto} from "./dto/estimateDto";
import {BurnDto} from "./dto/BurnDto";
import {BurnResponse} from "./response/contract/BurnResponse";
import {AuthTelegramService} from "../services/AuthTelegramService";

const service = new ContractService();

export class ContractController {

    @TelebotRouterDeco("opentrade")
    async openTrade(arg:string){
        const opened = await service.openTrade(arg);

        const message = OpenTradingResponse(opened.to as string,Web3Repository.networkBlockscan,opened.hash);
        return {message}
    }

    @TelebotRouterDeco("rmlimits")
    async removeLimits(arg:string){
        const removed = await service.removeLimits(arg);

        const message = RemoveLimitsResponse(removed.to as string,Web3Repository.networkBlockscan,removed.hash)
        return {message}
    }

    @TelebotRouterDeco("renounce")
    async renounceOwnership(arg:string){
        const renounced = await service.renounceOwnership(arg);

        const message = RenounceOwnershipResponse(renounced.to as string,Web3Repository.networkBlockscan,renounced.hash);
        return {message}
    }

    @TelebotRouterDeco("create")
    async createTokenWithLinearProccess(arg:string){
        const createDTO = CreateDto(arg);
        const created = await service.createTokenWithLinearProccess(createDTO);

        const message = CreateResponse(
            await created.deployed.getAddress(),
            created.transferTokens.hash,
            created.transferETH?.hash,
            Web3Repository.networkBlockscan,
            created.userChannel
        )

        return {message,filePath:created.filePath};
    }

    @TelebotRouterDeco("estimateContract")
    async estimateContract(arg:string){
        const dto = await estimateDto(arg)
        const estimated = await service.estimateContract(dto.functionName,dto.contractAddress);

        const message = EstimateDeployResponse(estimated,Web3Repository.networkDecimals)
        return {message}
    }

    @TelebotRouterDeco("burn")
    async burnTokens(arg:string){
        const dto = BurnDto(arg);
        const burned = await service.burnTokens(dto.contractAddress,dto.percentage)

        const message = BurnResponse(burned.to as string,Web3Repository.networkBlockscan,burned.hash)
        return {message};
    }
    async estimateRmLimits(arg:string){}

    getContractCode(){

    }

}
