import {ethers} from "ethers";
import {Web3Repository} from "../repository/Web3Repository";
import {Erc20Abi} from "../contracts/abi/Erc20AbiContract";
import {CreateRequestModel} from "../controllers/dto/CreateDto";
import {RewriteFile} from "../utils/RewriteTXT";
import {CodeCreator} from "../contracts/CodeCreator";
import {SolcCompilerService} from "./SolcCompilerService";
import {Web3Service} from "./Web3Service";
import {ContractRepository} from "../repository/ContractRepository";
import {AuthTelegramService} from "./AuthTelegramService";
import {FactoryAbi} from "../contracts/abi/FactoryAbiContract";
import {ContractMethodArgs} from "ethers/src.ts/contract/types";

export class ContractService {
    private readonly solcCompilerService:SolcCompilerService = new SolcCompilerService();
    private readonly web3Service:Web3Service = new Web3Service();
    private readonly authTelegramService:AuthTelegramService = new AuthTelegramService();

    private async getBalanceInContract(contract:ethers.Contract,address:string){

        while (true) {
            try {
                return await contract.getFunction("balanceOf").call(null, address);
            } catch (error) {}
            await new Promise((r) => setTimeout(r, 3000));
        }

    }

    private async getContractFactory(contract_code:string){
        const bytecode = await this.solcCompilerService.bytecodeByContractCode(contract_code,"Elon");
        return new ethers.ContractFactory(Erc20Abi,bytecode,Web3Repository.wallet);
    }

    private async deployContract(factory:ethers.ContractFactory){
        console.log("Deploying contract")

        try {
            const deploy = await factory.deploy();
            await (deploy).waitForDeployment()
            return deploy;
        } catch (e) {
            // @ts-ignore
            throw new Error(e.shortMessage + " on create contract")
        }
    }

    private async createAndDeployToken(createDTO:CreateRequestModel){
        console.log("Creating Token")

        const contract_code = this.getContractWithNameAndSymbol(createDTO.name,createDTO.symbol);
        const factory:ethers.ContractFactory = await this.getContractFactory(contract_code)
        const deployed:ethers.BaseContract = await this.deployContract(factory);

        await this.setStaticLastCreatedContract(deployed)
        RewriteFile(contract_code, "token_code.txt");

        return deployed;
    }

    public async setStaticLastCreatedContract(deployed:ethers.BaseContract){
        console.log("Setting static created contract")
        const addr = await deployed.getAddress();

        ContractRepository.lastCreatedContractAddress = addr;
        ContractRepository.lastCreatedContract = new ethers.Contract(addr,Erc20Abi,Web3Repository.wallet);
    }

    private async transferTokensToContract(contract:ethers.Contract,quantity:number,chainId:bigint){
        console.log("Transfering Tokens")
        const tokenBalance = await this.getTokenBalance(contract,Web3Repository.wallet.address)

        const formatBalance = ethers.formatUnits(tokenBalance.inAddress, 9) as any;
        const toSend = (formatBalance * quantity) / 100;

        const parseSend = ethers.parseUnits(toSend.toString(), 9);

        return await this.sendContractTransaction("transfer",contract,await contract.getAddress(),parseSend);
    }

    private getContractWithNameAndSymbol(token_name:string,symbol:string){
        console.log("Replacing name, symbol and router from CodeCreator")

        let modified = CodeCreator
            .split('unicode"NAME_TOKEN"')
            .join(`unicode"${token_name}"`);

        modified = modified
            .split('unicode"TICKER_TOKEN"')
            .join(`unicode"${symbol}"`);

        modified = modified
            .split('unicode"ROUTER_ADDRESS"')
            .join(Web3Repository.networkRouterAddress);

        return modified;
    }

    private async getTokenBalance(contract:ethers.Contract,walletAddress:string):Promise<{inAddress:bigint,inContract:bigint}>{
        console.log("Getting token balance in address")

        let balanceInAddress:bigint = 0n;
        let balanceInContract:bigint = 0n;

        balanceInAddress = await this.getBalanceInContract(contract,walletAddress)
        balanceInContract = await this.getBalanceInContract(contract,await contract.getAddress());

        return {
            inAddress:balanceInAddress,
            inContract:balanceInContract
        };
    }

    async estimateContract(functionName:string,contractAddress:string){
        const contract_code = this.getContractWithNameAndSymbol("teste","test");
        const factory:ethers.ContractFactory = await this.getContractFactory(contract_code)

        let estimate:bigint;

        switch (functionName){
            case 'deploy':
                estimate =  await Web3Repository.provider.estimateGas(await factory.getDeployTransaction());
                break;
            default:
                const contract = new ethers.Contract(contractAddress,Erc20Abi,Web3Repository.wallet);

                try {
                    estimate = await contract.getFunction(functionName).estimateGas();
                    break;
                }catch (e) {
                    // @ts-ignore
                    console.log(e.message)
                    // @ts-ignore
                    throw new Error(e.shortMessage)
                }
        }

        const feeData = await Web3Repository.provider.getFeeData();
        return feeData.gasPrice as bigint * estimate
    }

    async createTokenWithLinearProccess(createDTO:CreateRequestModel):Promise<{deployed:ethers.BaseContract,transferTokens:ethers.ContractTransactionResponse,transferETH:ethers.TransactionReceipt | null,userChannel:string,filePath:string}>{
        console.log("Creating token with linear proccess")

        const deployed = await this.createAndDeployToken(createDTO);
        const {chainId} = await Web3Repository.provider.getNetwork()

        const transferTokens = await this.transferTokensToContract(ContractRepository.lastCreatedContract,createDTO.supply,chainId);
        const transferETH:ethers.TransactionReceipt | null = await this.web3Service.transferETH(createDTO.eth,ContractRepository.lastCreatedContractAddress);
        const userChannel = await this.authTelegramService.createChannel(createDTO.name);

        console.log("Created")

        return {deployed,transferTokens,transferETH,userChannel,filePath:"./token_code.txt"}
    }

    async openTrade(contract_address:string){
        const contract:ethers.Contract = contract_address ? new ethers.Contract(contract_address,Erc20Abi,Web3Repository.wallet) : ContractRepository.lastCreatedContract;
        return await this.sendContractTransaction("openTrading",contract)
    }

    async burnTokens(contract_address:string,percentage:number){
        const pairAddress:string = await this.getPairAddress(contract_address);
        const pairContract = new ethers.Contract(pairAddress,Erc20Abi,Web3Repository.wallet)

        const balancePair = await this.getTokenBalance(pairContract,Web3Repository.wallet.address)
        const formatBalancePair = ethers.formatUnits(balancePair.inAddress, Web3Repository.networkDecimals) as any;

        const toSend = ((formatBalancePair * percentage) / 100).toFixed(Web3Repository.networkDecimals);
        const parseSend = ethers.parseUnits(toSend.toString(), Web3Repository.networkDecimals);

        return await this.sendContractTransaction("transfer",pairContract,Web3Repository.deadAddress,parseSend)
    }

    async getPairAddress(contract_address:string){
        return await ContractRepository.contractFactory.getFunction("getPair").call(null,contract_address,Web3Repository.wethAddress);
    }

    async sendContractTransaction(functionName:string,contract:ethers.Contract,...args: ContractMethodArgs<any>){
        try {
            const transaction = await contract.getFunction(functionName).send(...args);
            await this.web3Service.waitBlockConfirmations(Web3Repository.networkId,transaction);
            return transaction;
        }catch (e) {
            // @ts-ignore
            console.log(e.message);
            // @ts-ignore
            throw new Error(e.shortMessage + " on " + functionName)
        }
    }

    async renounceOwnership(contract_address:string){
        const contract:ethers.Contract = contract_address ? new ethers.Contract(contract_address,Erc20Abi,Web3Repository.wallet) : ContractRepository.lastCreatedContract;
        return await this.sendContractTransaction("renounceOwnership",contract)
    }

    async removeLimits(contract_address:string){
        const contract:ethers.Contract = contract_address ? new ethers.Contract(contract_address,Erc20Abi,Web3Repository.wallet) : ContractRepository.lastCreatedContract;
        return await this.sendContractTransaction("removeLimits",contract)
    }

}
