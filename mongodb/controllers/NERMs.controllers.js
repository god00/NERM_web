// Accessing the Service that we just created
var NERMService = require('../services/NERM.service')
var NERMProject = require('../models/NERM.model')
var NERMDict = require('../models/NERMDict.model')
var NERM = require('../models/NERMUser.model')
var config = require('../config.json');
var multer = require('multer');
var fs = require('fs');
var path = require('path')

// genarate template script
var NERMGenerateTemplate = require('../scripts/NERM.generateTemplate');

// genarate distlist script
var NERMGenerateDictList = require('../scripts/NERM.generateDictList');

// var PythonShell = require('python-shell');
const { spawn } = require('child_process');

var DIR = `${config.DIR}`;
var extractScriptPath = config.extractScriptPath;

// Saving the context of this module inside the _the variable

_this = this


// Async Controller function to get the To do List

exports.getItems = async function (req, res, next) {
    // Check the existence of the query parameters, If the exists doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 99999999;

    try {
        if (req.param('collections') == 'nerms') {
            var query = NERMProject.find({ email: req.param('email') });
            query.exec(async function (err, items) {
                if (err) {
                    return res.status(400).json({ status: 400, message: err });
                }
                else if (items) {
                    return res.status(200).json({ status: 200, data: items, message: "Succesfully nermsdb Recieved" });
                }
                else {
                    return res.status(200).json({ status: 200, message: "No Project in database" });
                }
            })
        }
        else {
            var items = await NERMService.getItemFromDB({}, page, limit, req.param('collections'));
            return res.status(200).json({ status: 200, data: items, message: "Succesfully nermsdb Recieved" });
        }
        // Return the todos list with the appropriate HTTP Status Code and Message.



    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.

        return res.status(400).json({ status: 400, message: e.message });

    }
}

exports.createUser = async function (req, res, next) {

    // Req.Body contains the form submit values.
    var user = {
        email: req.body.email,
        password: req.body.password,
    }

    var page = req.query.page ? req.query.page : 1;
    var limit = req.query.limit ? req.query.limit : 99999999;

    try {
        // Calling the Service function with the new object from the Request Body
        var query = NERM.findOne({ email: user.email });
        query.exec(async function (err, userDB) {
            if (err)
                return res.status(400).json({ status: 400., message: err });
            else if (userDB) {
                return res.status(201).json({ status: 201, data: false, message: "This user already exists" })
            }
            else {
                var createdNERM = await NERMService.createUser(user)
                return res.status(201).json({ status: 201, data: true, message: "Succesfully Created User" })
            }
        })
    } catch (e) {

        //Return an Error Response Message with Code and the Error Message.
        return res.status(400).json({ status: 400, message: "Project Creation was Unsuccesfull" });
    }
}

exports.createProject = async function (req, res, next) {

    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 99999999;

    var nerm = {
        email: req.body.email,
        projectName: req.body.projectName,
        date: req.body.date,
        selectedDict: req.body.selectedDict,
        corpus: req.body.corpus
    }

    try {
        var query = NERMProject.findOne({ email: nerm.email, projectName: nerm.projectName });
        query.exec(async function (err, project) {
            if (err)
                return res.status(400).json({ status: 400., message: err });
            else if (project) {
                return res.status(202).json({ status: 202., duplicate: true, message: "This project name already exists" });
            }
            else {
                var nermTmp = await NERMService.createProject(nerm);
                return res.status(202).json({ status: 202, message: "Succesfully Create Project" });
            }
        })
    } catch (e) {
        return res.status(400).json({ status: 400., message: e.message });
    }
}

exports.removeNERM = async function (req, res, next) {

    var id = req.params.id;

    try {
        var deleted = await NERMService.deleteNERM(id)
        return res.status(204).json({ status: 204, message: "Succesfully User Deleted" })
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message })
    }

}

exports.loginNERM = async function (req, res, next) {
    try {
        await NERM.findOne({ email: req.body.email }, async function (err, userDB) {
            if (err) {
                return res.status(400).json({ status: 400., message: err.message });
            }
            else if (userDB) {
                NERMService.loginNERM(req.body.password, userDB._id, userDB.password)
                    .then((token) => {
                        var usertmp = {
                            email: req.body.email,
                            token
                        }
                        if (token !== undefined)
                            return res.status(201).json({ status: 201, data: usertmp, message: "Succesfully Login" })
                        else
                            return res.status(201).json({ status: 201, data: usertmp, message: "Wrong Password. Try again" })
                    })
                    .catch((err) => {
                        return res.status(400).json({ status: 400, data: err, message: "Login Failed" })
                    });
            }
            else {
                return res.status(201).json({ status: 201, message: "Email or Password is incorrect. Try again" });
            }
        });

    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.

        return res.status(400).json({ status: 400, message: "Login as unsuccesfull" })
    }

}

exports.uploadsFile = async function (req, res, next) {
    try {
        // var test = await multer({}).any();
        // await test(req, res, function (err) {
        //     if (err) {
        //         return res.status(400).json({ status: 400, message: err.toString() })
        //     }

        //     checkDirectory(DIR + req.body.email[0]);
        //     checkDirectory(DIR + req.body.email[0] + '/' + req.body.projectName[0]);
        // });

        var storage = await multer.diskStorage({
            destination: function (req, file, cb) {
                if (req.body.mode == 'dictionary') {
                    cb(null, `${DIR}${req.body.email}/dictionary`);
                }
                else {
                    cb(null, `${DIR}${req.body.email}/${req.body.projectName}/${req.body.mode}`);
                }
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname);
            }
        });
        var upload = multer({ storage: storage }).any();
        upload(req, res, async function (err) {
            checkDirectory(DIR + req.body.email)
                .then(() => {
                    if (req.body.mode == 'dictionary') {
                        checkDirectory(DIR + req.body.email + '/' + req.body.mode)
                            .then(() => {
                                console.log('dict : uploading...')
                                if (err) {
                                    console.log(err.toString())
                                    return res.status(400).json({ status: 400, message: err.toString() })
                                }
                                getDictByUser(req.body.email)
                                    .then(async (dictObj) => {
                                        var mode = req.body.mode;
                                        var p = `${path.dirname(process.cwd())}/storage/uploads/${req.body.email}/${req.body.mode}/${req.files[0].originalname}`
                                        if (dictObj[mode].indexOf(p) == -1) {    //check if for no duplication path file in db
                                            dictObj[mode].push(p);
                                        }
                                        var query = NERMProject.findOne({ email: req.body.email, projectName: req.body.projectName });
                                        query.exec(async function (err, project) {
                                            if (err) {
                                                return res.status(400).json({ status: 400., message: err });
                                            }
                                            else if (project) {
                                                if (project['selectedDict'].indexOf(p) == -1) {    //check if for no duplication path file in db
                                                    project['selectedDict'].push(p);
                                                }
                                                NERMService.updateNERM(project);
                                            }
                                            else {
                                                return res.status(204).json({ status: 204, message: "Please create project before upload" });
                                            }
                                        })
                                        NERMService.updateNERM(dictObj);
                                        return res.status(201).json({ status: 201, message: "File is uploaded" });
                                    })
                                    .catch(err => {
                                        return res.status(400).json({ status: 400., message: err });
                                    })
                            })
                    }
                    else {
                        checkDirectory(DIR + req.body.email + '/' + req.body.projectName)
                            .then(() => {
                                checkDirectory(DIR + req.body.email + '/' + req.body.projectName + '/' + req.body.mode)
                                    .then(() => {
                                        console.log('other : uploading...')
                                        if (err) {
                                            console.log(err.toString())
                                            return res.status(400).json({ status: 400, message: err.toString() })
                                        }
                                        var query = NERMProject.findOne({ email: req.body.email, projectName: req.body.projectName });
                                        query.exec(async function (err, project) {
                                            if (err) {
                                                return res.status(400).json({ status: 400., message: err });
                                            }
                                            else if (project) {
                                                var mode = req.body.mode;
                                                var p = `${path.dirname(process.cwd())}/storage/uploads/${req.body.email}/${req.body.projectName}/${req.body.mode}/${req.files[0].originalname}`
                                                // if (mode == 'corpus') {
                                                //     var data = runPython(p)
                                                //     console.log("test data : ", data.toString('utf8'))
                                                // }
                                                if (project[mode].indexOf(p) == -1) {    //check if for no duplication path file in db
                                                    project[mode].push(p);
                                                }
                                                NERMService.updateNERM(project);
                                                return res.status(201).json({ status: 201, message: "File is uploaded" });
                                            }
                                            else {
                                                return res.status(204).json({ status: 204, message: "Please create project before upload" });
                                            }
                                        })
                                    })
                            })
                    }
                })
        });
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message })
    }

}

exports.getProject = async function (req, res, next) {

    try {
        var query = NERMProject.findOne({ email: req.param('email'), projectName: decodeURI(req.param('projectName')) });
        query.exec(async function (err, project) {
            if (err) {
                return res.status(400).json({ status: 400, message: err });
            }
            else if (project) {
                getDictByUser(project.email)
                    .then(async (dictObj) => {
                        await beforeSendToFront(project);
                        await beforeSendToFront(dictObj);
                        return res.status(200).json({ status: 200, data: { project, dictionary: dictObj.dictionary }, message: "Succesfully nermsdb Recieved" });
                    })
                    .catch(err => {
                        return res.status(200).json({ status: 200, message: "Cannot found dictionary. Please create new project" });
                    })
            }
            else {
                console.log("Please create project first")
                return res.status(204).json({ status: 204, message: "Please create project first" });
            }
        })
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
}

exports.updateProject = async function (req, res, next) {
    try {
        var query = NERMProject.findOne({ email: req.body.email, projectName: decodeURI(req.body.projectName) });
        query.exec(async function (err, project) {
            if (err) {
                return res.status(400).json({ status: 400, message: err });
            }
            else if (project) {
                let selectedDict = await req.body.selectedDict.map(item => { return item.fileName })
                getDictByUser(project.email)
                    .then(async (dictObj) => {
                        addPathsFromFileNames(selectedDict, dictObj.dictionary)
                            .then(async (pathsList) => {
                                project['selectedDict'] = pathsList;
                                project['summitPreProcessing'] = req.body.summitPreProcessing;
                                project['featureSelection'] = req.body.featureSelection;
                                await NERMService.updateNERM(project);
                                await beforeSendToFront(project);
                                await beforeSendToFront(dictObj);
                                return res.status(201).json({ status: 201, data: { project, dictionary: dictObj.dictionary }, message: `${decodeURI(req.body.projectName)} Updated` });
                            })
                    })
                    .catch(err => {
                        return res.status(204).json({ status: 204, message: "Cannot found dictionary. Please create new project" });
                    })
            }
            else {
                return res.status(204).json({ status: 204, message: "Please create project first" });
            }
        })

    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
}

exports.removeCorpus = async function (req, res, next) {

    var id = req.params.id;
    var filename = req.param('fileName')

    try {
        var query = NERMProject.findOne({ _id: id });
        query.exec(async function (err, project) {
            if (err) {
                return res.status(400).json({ status: 400, message: err });
            }
            else if (project) {
                var list = []
                matchFileNameFromPathsToArr(filename, project.corpus, list)
                    .then(() => {
                        if (list.length != 0) {
                            project.corpus.map((corpusPath, index) => {
                                if (corpusPath == list[0]) {
                                    project.corpus.splice(index, 1);
                                }
                            })
                            deleteFile(list[0]).then(() => {
                                NERMService.updateNERM(project)
                                beforeSendToFront(project).then(project => {
                                    if (project)
                                        return res.status(200).json({ status: 200, corpus: project.corpus, message: `${filename} was deleted from database & storage` });
                                })
                            }).catch((err) => {
                                return res.status(204).json({ status: 204, corpus: project.corpus, message: `ERROR: While delete ${filename}` });
                            })
                        }
                        else {
                            return res.status(204).json({ status: 204, corpus: project.corpus, message: `ERROR: Cannot found ${filename}` });
                        }
                    })
            }
            else {
                return res.status(204).json({ status: 204, message: "Please create project first" });
            }
        })
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message })
    }

}

exports.genarateTemplate = async function (req, res, next) {
    try {
        var query = NERMProject.findOne({ _id: req.body.id });
        query.exec(async function (err, project) {
            if (err) {
                return res.status(400).json({ status: 400, message: err });
            }
            else if (project) {
                NERMGenerateTemplate.genarateTemplate(project.featureSelection, project.email, project.projectName).then((pathTemplate) => {
                    console.log(pathTemplate)
                    return res.status(200).json({ status: 200, message: `${project.projectName} genarate template successful` });
                })
            }
            else {
                return res.status(204).json({ status: 204, message: "Please create project first" });
            }
        })
    }
    catch (e) {
        return res.status(400).json({ status: 400, message: e.message })
    }
}

exports.createModel = async function (req, res, next) {
    var modelname = req.body.modelname
    try {
        var query = NERMProject.findOne({ _id: req.body.id });
        query.exec(async function (err, project) {
            if (err) {
                return res.status(400).json({ status: 400, message: err });
            }
            else if (project) {
                project.model.push(modelname);
                project.isTraining = true;
                NERMService.updateNERM(project);

                // run extract (then crf_learn) here
                await runExtractFeaturePython(project, modelname)

                return res.status(200).json({ status: 200, message: `${modelname} is training` });
            }
            else {
                return res.status(204).json({ status: 204, message: "Please create project first" });
            }
        })
    }
    catch (e) {
        return res.status(400).json({ status: 400, message: e.message })
    }
}

exports.genarateDictList = async function (req, res, next) {
    try {
        var query = NERMProject.findOne({ _id: req.body.id });
        query.exec(async function (err, project) {
            if (err) {
                return res.status(400).json({ status: 400, message: err });
            }
            else if (project) {
                NERMGenerateDictList.genarateDictList(project.selectedDict, project.email, project.projectName).then(() => {
                    return res.status(200).json({ status: 200, message: `${project.projectName} genarate dict-list successful` });
                })
            }
            else {
                return res.status(204).json({ status: 204, message: "Please create project first" });
            }
        })
    }
    catch (e) {
        return res.status(400).json({ status: 400, message: e.message })
    }
}

async function addPathsFromFileNames(fileNames, paths) {
    return new Promise((resolve, reject) => {
        let promise = [];
        let pathsList = [];
        for (let fileName of fileNames) {
            promise.push(matchFileNameFromPathsToArr(fileName, paths, pathsList));
        }
        Promise.all(promise).then(() => {
            resolve(pathsList)
        })
    })
}

async function matchFileNameFromPathsToArr(fileName, paths, pathsList) {
    return new Promise((resolve, reject) => {
        paths.forEach(path => {
            let filename = path.split('/');
            filename = filename[filename.length - 1]
            if (filename == fileName) {
                pathsList.push(path);
                resolve();
            }
        })
    });
}

async function checkDirectory(directory) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }
        resolve();
    })
}

async function deleteFile(directory) {
    return new Promise((resolve, reject) => {
        fs.unlink(directory, (err) => {
            if (err) {
                reject(err)
            }
            else {
                console.log(directory + ' was deleted');
                resolve()
            }
        });

    })
}

async function getDataFromPaths(paths) {
    return new Promise((resolve, reject) => {
        let files = [];
        let promise = [];
        for (let filePath of paths) {
            promise.push(readFile(filePath, files));
        }
        Promise.all(promise).then(() => {
            resolve(files)
        })
    })
}

async function readFile(filePath, files) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: 'utf-8' }, async function (err, data) {
            if (!err) {
                // console.log('received data: ' + data);
                let dataObj = {
                    data: data,
                    fileName: await getFileName(filePath)
                }
                await files.push(dataObj)
                resolve()
            } else {
                // files.push('ERROR : cannot read this' + filePath)
                // console.log(err);
                resolve()
            }
        });
    }
    )
}

async function beforeSendToFront(project) {
    if (project.dictionary && project.dictionary.length != 0) {
        await getDataFromPaths(project.dictionary).then(item => {
            project.dictionary = item
        })
    }
    if (project.corpus && project.corpus.length != 0) {
        await getDataFromPaths(project.corpus).then(item => {
            project.corpus = item
        })
    }
    if (project.selectedDict && project.selectedDict.length != 0) {
        await getDataFromPaths(project.selectedDict).then(item => {
            project.selectedDict = item
        })
    }
    return project;
}

async function runExtractFeaturePython(project, modelname) {
    var extractScriptPath = config.extractScriptPath;
    var pathCorpus = `${path.dirname(process.cwd())}/storage/uploads/${project.email}/${project.projectName}/corpus`;
    var pathDictList = `${path.dirname(process.cwd())}/storage/uploads/${project.email}/${project.projectName}/current_dictlist.txt`;
    const py = spawn('python', [extractScriptPath, pathCorpus, pathDictList], { detached: true });  // arg[1] : path of corpus folder , arg[2] : path of file dictionary
    // py.stdout.on('data', (data) => {
    //     // console.log(`stdout: ${data}`);
    //     return data;
    // });

    py.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
        return data;
    });

    py.on('exit', async (code) => {
        console.log(`child process exited with code ${code}`);
        crf_learn(project, modelname)
        py.kill()
    });

    py.unref();
}

async function crf_learn(project, modelname) {
    var template = `${config.templatePath}${project.email}/${project.projectName}/current_template.txt`
    var train_data = `${path.dirname(process.cwd())}/storage/uploads/${project.email}/${project.projectName}/feature.txt`
    var modelPath = `${path.dirname(process.cwd())}/storage/model/${project.email}/${project.projectName}/${modelname}`
    const crf = spawn('crf_learn', [template, train_data, modelPath], { detached: true})

    crf.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
        return data;
    });

    crf.on('exit', async (code) => {
        console.log(`child process exited with code ${code}`);
        project.isTraining = false;
        await NERMService.updateNERM(project);
        crf.kill()
    });

    crf.unref();
}

async function getDictByUser(email) {
    return new Promise((resolve, reject) => {
        var query = NERMDict.findOne({ email: email });
        query.exec(async function (err, dictObj) {
            if (err) {
                reject(err);
            }
            else if (dictObj) {
                resolve(dictObj);
            }
            else {
                reject();
            }
        })
    })
}


function getFileName(fullpath) {
    let fileName = fullpath.split('/')
    return fileName[fileName.length - 1];
}
