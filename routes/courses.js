const express = require('express')
const {getCourses, getCourse, addcourse, updatecourse, deletecourse} = require('../controllers/courses')

const Course = require('../models/course')
const advancedResults = require('../middleware/advancedResults')

const router = express.Router({ mergeParams: true })

const { protect, authorize } = require('../middleware/auth')

router.route('/')
    .get(advancedResults(Course, {path: 'bootcamp', select: 'name description'}),getCourses)
    .post(protect, authorize('publisher', 'admin'), addcourse)
    
router.route('/:id')
    .get(getCourse)
    .put(protect, authorize('publisher', 'admin'),updatecourse)
    .delete(protect, authorize('publisher', 'admin'), deletecourse)

module.exports = router