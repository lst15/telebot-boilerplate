import {message} from "telegram/client";
import {ethers} from "ethers";

interface ListWalletsResponseInterface {
    address:string
    assets: {
        name:string,
        balance:bigint,
        decimal:number,
        valueInUsd:ethers.Result
    }[]
}

export const WalletsAssetListResponse = (listWalletsWithAssets:ListWalletsResponseInterface[]) => {
    let message = ""
    let totalUsd = BigInt(0)
    listWalletsWithAssets.forEach((walletWithAssets) => {

        message += "`" + walletWithAssets.address + "`\n";
        walletWithAssets.assets.forEach((asset) => {

            message += "`" + asset.name + "`: " + ethers.formatUnits(asset.balance,asset.decimal) + " (UST$" + ethers.formatUnits(asset.valueInUsd[2],6) + ")\n";
            totalUsd += asset.valueInUsd[2]
        });
        message += "\n";
    })
    message += "`Total in UST$: `" + ethers.formatUnits(totalUsd, 6) + "\n"
    return message;

}
