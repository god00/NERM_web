class NERMModel {
    _id: string;
    email: String;
    date: Date;
    projectName: String;
    corpus: Object[];
    dictionary: Object[];       // dicts have only on front-end
    selectedDict: Object[];
    summitPreProcessing: boolean;
    featureSelection : Object
    constructor(
    ) {
        this.email = "";
        this.projectName = "";
        this.corpus = [];
        this.dictionary = [];
        this.selectedDict = [];
        this.date = new Date();
        this.summitPreProcessing = false;
        this.featureSelection = {};
    }
}

export default NERMModel;