const solc = require("solc");

export class SolcRepository {
    public static solCompiler:any;

    static initialize(version:string){
        console.log("[Initializing] SolcRepository")

        solc.loadRemoteVersion(version,
            function (err: any, solcSnapshot: any) {
                if (err) throw err;
                SolcRepository.solCompiler = solcSnapshot;
            }
        );
    }
}
