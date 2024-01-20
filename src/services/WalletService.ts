import { ConfigurationRepository } from "../repository/ConfigurationRepository";
import { EthersWalletRepository } from "../repository/ethers/EthersWalletRepository";

const walletRepository = new EthersWalletRepository()
const configurationRepository = new ConfigurationRepository()

export class WalletService {

    async WalletGetAddresses(mnemonic_byConfigName: string, quantity: number) {
        const wallets = [];

        const mnemonic = configurationRepository.getConfig(mnemonic_byConfigName)
        const instance = walletRepository.getInstance_fromMnemonic(mnemonic);
        wallets.push(instance.address);

        for (var i = 1; i < quantity; i++) {
            wallets.push(instance.derivePath(`m/44'/60'/0'/${i}`).address)
        }

        return {
            status: 200,
            message: wallets.join("\n"),
            code_error: null
        }
    }

}

