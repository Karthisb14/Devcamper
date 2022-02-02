const express = require('express')
const {getCourses, getCourse, addcourse, updatecourse, deletecourse} = require('../controllers/courses')

const Course = require('../models/course')
const advancedResults = require('../middleware/advancedResults')

const router = express.Router({ mergeParams: true })

const { protect, authorize } = require('../middleware/auth')

router.route('/')
    .get(advancedResults(Course, {path: 'bootcamp', select: 'name description'}),getCourses)
    .post(protect, authorize('publisher'), addcourse)
    
router.route('/:id')
    .get(getCourse)
    .put(protect, authorize('publisher'),updatecourse)
    .delete(protect, authorize('publisher'), deletecourse)

module.exports = router