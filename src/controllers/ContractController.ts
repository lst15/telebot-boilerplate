import {TelebotRouterDeco} from "../deco/TelebotRouterDeco";
import {ContractService} from "../services/ContractService";
import {AddContractTokenResponse} from "./response/contract/AddContractToken";
import {ContractTokenListResponse} from "./response/contract/ContractTokenList";
import {WalletsAssetListResponse} from "./response/contract/WalletsAssetListResponse";
import {AddContractTokenDto} from "./dto/AddContractTokenDto";

const service = new ContractService();

export class ContractController {

    @TelebotRouterDeco("addContractToken")
    addContractToken(arg:string){
        const dto = AddContractTokenDto(arg);

        service.addContractTokenInRepository(dto.address,dto.decimal);
        const message = AddContractTokenResponse();

        return {message};
    }

    @TelebotRouterDeco("listContracts")
    listContracts(arg:string){
        const contractAddresses:string[] = service.listContractTokensInRepository() as string[]
        const message = ContractTokenListResponse(contractAddresses)

        return {message}
    }

    @TelebotRouterDeco("getAllBalance")
   async getAllBalance(arg:string){
       const balances = await service.getBalanceOfContractsInRepository();
       console.log(balances)
       const message = WalletsAssetListResponse(balances)

        return {message}
    }

}
