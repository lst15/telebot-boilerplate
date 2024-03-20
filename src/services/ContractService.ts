import {Contract, ethers} from "ethers";
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

    private async getContractTransaction(functionName:string,retries:number,thrownable:boolean,contract:ethers.Contract,...args: ContractMethodArgs<any>){
        let tries = 0
        let lastMessageError = ""

        while (tries < retries) {
            try {
                return await contract.getFunction(functionName).call(null,...args);
            } catch (e) {
                // @ts-ignore
                console.log(e.message + " on getContractTransaction")
                // @ts-ignore
                lastMessageError = e.shortMessage;
            }
            await new Promise((r) => setTimeout(r, 3000));
            tries += 1;
        }
        if(thrownable) throw new Error("error on call " + functionName + " in " + await contract.getAddress() + "\n\n" + lastMessageError);
    }

    public initializeNetworkContract(){
        if(!ContractRepository.tokenAddresses.get(Web3Repository.networkName)) {
            ContractRepository.tokenAddresses.set(Web3Repository.networkName,[])
        }
    }

    public listContractTokensInRepository(){
        this.initializeNetworkContract()
        console.log( ContractRepository.tokenAddresses.get(Web3Repository.networkName))

        return ContractRepository.tokenAddresses.get(Web3Repository.networkName)?.map(token => token.address)
    }

    public addContractTokenInRepository(tokenAddress:string,decimal:number){
        this.initializeNetworkContract()
        if(!ethers.isAddress(tokenAddress)) throw new Error("invalid address")
        ContractRepository.tokenAddresses.get(Web3Repository.networkName)?.filter(token => token.address == tokenAddress).map(token => {throw new Error("Already exists")})
        let newList = ContractRepository.tokenAddresses.get(Web3Repository.networkName)

        if(newList === undefined){
            newList = []
        }

        newList.push({
            address:tokenAddress,
            decimal:decimal
        })

        ContractRepository.tokenAddresses.set(Web3Repository.networkName,newList)
    }

    // public removeContractTokenInRepository(token_address:string){
    //     this.initializeNetworkContract()
    //
    //     if(!ethers.isAddress(token_address)) throw new Error("invalid address")
    //
    //     ContractRepository.tokenAddresses.get(Web3Repository.networkName)?.
    //     map((element, index) => {
    //         if(element.address == token_address) {
    //
    //         }
    //     })
    //
    //     ContractRepository.tokenAddresses[Web3Repository.networkName] = ContractRepository.tokenAddresses[Web3Repository.networkName].filter((tokenAddress: string) => tokenAddress !== token_address);
    // }

    public async getBalanceOfContractsInRepository(){
        this.initializeNetworkContract()

        if(Web3Repository.walletAddresses.length == 0 || ContractRepository.tokenAddresses.get(Web3Repository.wethAddress)?.length == 0){
            throw new Error("You need to set token and token contractes")
        }

        const walletAssets = []

        for(const indexWalletAddress in Web3Repository.walletAddresses){
            const walletAddress = Web3Repository.walletAddresses[indexWalletAddress]
            const assets:any = []

            // @ts-ignore
            for(const contractInfo of ContractRepository.tokenAddresses.get(Web3Repository.networkName)){
                const contractToken:ethers.Contract = new ethers.Contract(contractInfo.address,Erc20Abi,Web3Repository.wallet)

                const contractName = await this.getContractTransaction("name",3,true,contractToken);
                const walletAssetBalance = await this.getContractTransaction("balanceOf",3,false,contractToken,walletAddress);

                if(walletAssetBalance){
                    assets.push({
                        name:contractName,
                        balance:walletAssetBalance,
                        decimal:contractInfo.decimal,
                        valueInUsd:await this.getContractTransaction("getAmountsOut",3,false,ContractRepository.contractRouter,walletAssetBalance,[contractInfo.address,Web3Repository.wethAddress,await ContractRepository.contractUsd.getAddress()])
                    })
                }

            }

            walletAssets.push({
                address:walletAddress,
                assets
            })

        }

        return walletAssets
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

        balanceInAddress = await this.getContractTransaction("balanceOf",3,true,contract,walletAddress)
        balanceInContract = await this.getContractTransaction("balanceOf",3,true,   contract,await contract.getAddress());

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
