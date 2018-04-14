
// Gettign the Newly created Mongoose Model we just created 
var NERM = require('../models/NERMUser.model');
var NERMModel = require('../models/NERM.model')
var config = require('../config.json');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var multer = require('multer');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the To do List
exports.getItemFromDB = async function (query, page, limit, collections) {


    // Options setup for the mongoose paginate

    var options = {
        page,
        limit
    }

    // Try Catch the awaited promise to handle the error 

    try {
        if (collections == "users") {
            var users = await NERM.paginate(query, options);
            return users;
        }
        else if (collections == "nerms") {
            var nerms = await NERMModel.paginate(query, options);
            return nerms;
        }

        // Return the users list that was retured by the mongoose promise

    } catch (e) {

        // return a Error message describing the reason 

        throw Error('Error while Paginating Nerms');
    }
}

exports.createUser = async function (user) {
    var newPassword = await hashPassword(user.password)

    var newUser = new NERM({
        email: user.email,
        password: newPassword,
        date: new Date(),
    })

    // Creating a new Mongoose Object by using the new keyword


    try {

        // Saving the user 
        var savedUser = await newUser.save()
        return savedUser;
    } catch (e) {

        // return a Error message describing the reason     
        throw Error("Error while Creating User")
    }
}

exports.createModel = async function (nerm) {
    var newModel = new NERMModel({
        email: nerm.email,
        ModelName: nerm.ModelName,
        date: new Date(),
        corpus: [],
        dictionary: [],
    })

    try {
        // Saving the model 
        var savedModel = await newModel.save()
        return savedModel;
    } catch (e) {

        // return a Error message describing the reason     
        throw Error("Error while Creating Model")
    }
}

exports.updateModel = async function (nerm) {
    try {
        var savedNERM = await nerm.save()
        return savedNERM;
    } catch (e) {
        throw Error("And Error occured while updating the Todo");
    }
}

exports.deleteNERM = async function (id) {

    // Delete the Todo
    try {
        var deleted = await NERM.remove({ _id: id })
        if (deleted.result.n === 0) {
            throw Error("Todo Could not be deleted")
        }
        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the Todo")
    }
}

exports.loginNERM = async function (password, id, hash) {

    try {

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hash).then(bool => {
                if (bool) {
                    let token = jwt.sign({ sub: id }, config.secret)
                    resolve(token);
                }
                else {
                    reject();
                }
            })
                .catch(err => {
                    reject();
                })

        })


    }
    catch (e) {
        throw Error("Error Occured while Login")
    }
}

function hashPassword(password) {
    try {
        return bcrypt.hash(password, 10).then(hash => {
            return hash;
        })
    } catch (e) {
        throw Error("And Error occured while hashing Password");
    }
}
