const express = require('express')
const {
    getbootcamp, 
    getbootcamps, 
    createbootcamp, 
    updatebootcamp, 
    deletebootcamp, 
    getbootcampsinRadius,
    bootcampphotoupload 
} = require('../controllers/bootcamps')

const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middleware/advancedResults')

// Include other resource router
const courseRouter = require('./courses')
const reviewRouter = require('./reviews')

const router = express.Router()

const { protect, authorize } = require('../middleware/auth')
// re-Router into other reesources router
router.use('/:bootcampId/courses', courseRouter)
router.use('/:bootcampId/reviews', reviewRouter)

router.route('/radius/:zipcode/:distance').get(getbootcampsinRadius)

router.route('/').get(advancedResults(Bootcamp, 'courses'),getbootcamps).post(protect, authorize('publisher', 'admin'), createbootcamp)

router.route('/:id').get(getbootcamp).put(protect, authorize('publisher', 'admin'), updatebootcamp).delete(protect, authorize('publisher', 'admin'),deletebootcamp)

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampphotoupload)

module.exports = router