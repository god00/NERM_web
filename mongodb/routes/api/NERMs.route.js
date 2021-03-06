var express = require('express')

var router = express.Router()

// Getting the Todo Controller that we just created

var NERMController = require('../../controllers/NERMs.controllers');


// Map each API to the Controller FUnctions

router.get('/', NERMController.getItems)

router.post('/', NERMController.createUser)

router.delete('/:id', NERMController.removeNERM)

router.post('/project', NERMController.createProject)

router.get('/project', NERMController.getProject)

router.put('/project', NERMController.updateProject)

router.post('/templates', NERMController.genarateTemplate)

router.post('/testmodel', NERMController.testModel)

router.post('/predict', NERMController.predictModel)

router.post('/model', NERMController.createModel)

router.post('/dictionary', NERMController.genarateDictList)

router.delete('/corpus/:id', NERMController.removeCorpus)

router.get('/testdata', NERMController.getTestData)

router.delete('/testdata/:id', NERMController.removeTestData)

router.post('/login', NERMController.loginNERM)

router.post('/uploads', NERMController.uploadsFile)

router.get('/download', NERMController.downloadModel)


// Export the Router

module.exports = router;
