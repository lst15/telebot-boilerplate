export const NetworkListResponse = (networkList:{http:string,decimals:number,blockscan:string,factoryAdddress:string,wethAddress:string,routerAddress:String}[]) => {
    let networkMessage:string = "";
    networkList.map((network) => {
        networkMessage += `http: ${network.http}\ndecimals: ${network.decimals}\nblockscan: ${network.blockscan}\nfactoryAdddress: ${network.factoryAdddress}\nwethAddress: ${network.wethAddress}\nrouterAddress: ${network.routerAddress}\n\n`;
    });

    return networkMessage
}
