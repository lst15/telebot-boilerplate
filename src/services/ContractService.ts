import {Contract, ethers} from "ethers";
import {Web3Repository} from "../repository/Web3Repository";
import {Erc20Abi} from "../contracts/abi/Erc20AbiContract";
import {Web3Service} from "./Web3Service";
import {ContractRepository} from "../repository/ContractRepository";
import {ContractMethodArgs} from "ethers/src.ts/contract/types";


export class ContractService {
    private readonly web3Service:Web3Service = new Web3Service();

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

    validHasTokenAddressInRepository(){
        const tokenAddressesInNetwork =  ContractRepository.tokenAddresses.get(Web3Repository.networkName)
        //
        // if(tokenAddressesInNetwork){
        //     const isValid:boolean = tokenAddressesInNetwork.length == 0
        //     if(isValid)throw new Error("You need to set a token address");
        // } else throw new Error("Network is undefined");

    }

    validateAmountsOutToEth(amountsOutToEth:bigint[]){
        if(!amountsOutToEth) throw new Error("Amounts Out to ETH is undefined")
        if(!amountsOutToEth[1]) throw new Error("Amounts Out on ETH is undefined")
    }

    async getAssetsTokenOfAnAddress(walletAddress:string,ethUsdRate:number):Promise<any>{
        this.validHasTokenAddressInRepository()

        const tokenAddressesInNetwork =  ContractRepository.tokenAddresses.get(Web3Repository.networkName);
        const assets:any = [];

        // @ts-ignore because validHasTokenAddressInRepository()
        for(const tokenAddress of tokenAddressesInNetwork) {
            const currentAsset:any = {}
            if(tokenAddress.address.toLowerCase() === Web3Repository.wethAddress.toLowerCase()) {
                const ethBalance = await this.web3Service.getBalance(walletAddress);

                currentAsset.name = "ETH"
                currentAsset.balance = ethBalance;
                currentAsset.decimal = tokenAddress.decimal
                currentAsset.valueInUsd = Number(ethers.formatUnits(ethBalance,tokenAddress.decimal)) * ethUsdRate

                assets.push(currentAsset);
                continue;
            };

            const contract = new ethers.Contract(tokenAddress.address,Erc20Abi,Web3Repository.wallet)
            const contractName = await this.getContractTransaction("name",3,true,contract);
            const assetBalance = await this.getContractTransaction("balanceOf",3,false,contract,walletAddress);

            if(assetBalance != 0n) {
                const amountsOutToEth = await this.getContractTransaction("getAmountsOut",3,false,ContractRepository.contractRouter,assetBalance,[tokenAddress.address,Web3Repository.wethAddress]);
                this.validateAmountsOutToEth(amountsOutToEth);
                const assetToEth = amountsOutToEth[1];
                currentAsset.valueInUsd = assetToEth * ethUsdRate
            } else {
                currentAsset.valueInUsd = 0;
            }

            currentAsset.name = contractName
            currentAsset.balance = assetBalance;
            currentAsset.decimal = tokenAddress.decimal

            assets.push(currentAsset);
        }

        return assets;
    }

    public async getBalanceOfContractsInRepository(){
        this.web3Service.validHasAddressInRepository();
        this.initializeNetworkContract()

        const {USD} = await this.web3Service.getEthPrice();
        const walletAssets: { address: string; assets: any; }[] = []
        let got = 0

        Web3Repository.walletAddresses.forEach(async (address) => {
            const assets = await this.getAssetsTokenOfAnAddress(address,USD)
            walletAssets.push({address, assets})
            got += 1;
        })

        // for (const address of Web3Repository.walletAddresses) {
        //     const assets = await this.getAssetsTokenOfAnAddress(address,USD)
        //     walletAssets.push({address, assets})
        //     got += 1;
        // }

        while(got != Web3Repository.walletAddresses.length){
            await new Promise((r) => setTimeout(r, 100));
        }

        return walletAssets
    }

    removeToken(address:string) {
        this.validHasTokenAddressInRepository();
        const tokenAddressesInNetwork =  ContractRepository.tokenAddresses.get(Web3Repository.networkName);
        const newAddresses = tokenAddressesInNetwork?.filter(tokenAddress => tokenAddress.address != address)

        // @ts-ignore
        ContractRepository.tokenAddresses.set(Web3Repository.networkName,newAddresses)
    }

    clearTokens() {
        this.validHasTokenAddressInRepository();
        ContractRepository.tokenAddresses.set(Web3Repository.networkName,[])
    }

}
