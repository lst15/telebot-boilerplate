import {message} from "telegram/client";
import {ethers} from "ethers";

interface ListWalletsResponseInterface {
    address:string
    assets: {
        name:string,
        balance:bigint,
        decimal:number,
        valueInUsd:number
    }[]
}

export const WalletsAssetListResponse = (listWalletsWithAssets:ListWalletsResponseInterface[]) => {
    let message = ""
    let totalUsd: number = 0;
    listWalletsWithAssets.forEach((walletWithAssets) => {

        message += "`" + walletWithAssets.address + "`\n";
        walletWithAssets.assets.forEach((asset) => {

            message += "`" + asset.name + "`: " + ethers.formatUnits(asset.balance,asset.decimal) + " (UST$" + asset.valueInUsd.toFixed(2) + ")\n";
            totalUsd += asset.valueInUsd
        });
        message += "\n";
    })
    message += "`Total in UST$: `" + totalUsd.toFixed(2) + "\n"
    return message;

}
