import { ethers } from "ethers";
import { WalletRepository } from "../WalletRepository";

export class EthersWalletRepository implements WalletRepository {

    getInstance_fromMnemonic(mnemonic: string) {
        return ethers.Wallet.fromPhrase(mnemonic);
    }

}