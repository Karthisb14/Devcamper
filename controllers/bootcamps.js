const Bootcamp = require('../models/Bootcamp')
const errorResponse = require('../utilis/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utilis/geocoder')
const path = require('path')

// @desc Get bootcamps
// @route GET /api/v1/bootcamps
// access public

exports.getbootcamps = asyncHandler(async (req, res, next) => {

    res.status(200).json(res.advancedResults)

})

// @desc Get bootcamps
// @route GET /api/v1/bootcamps/:id
// access public

exports.getbootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(new errorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
    res.status(200).json({ success: true, data: bootcamp })

})

// @desc create new bootcamps
// @route POST /api/v1/bootcamps
// access private

exports.createbootcamp = asyncHandler(async (req, res, next) => {


    // Add user to req,body
    req.body.user = req.user.id

    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id })

    // If the user is not an admin, they can only add one bootcamp
    if (publishedBootcamp && req.user.role !== "admin") {
        return next(
            new errorResponse(
                `The user with ID ${req.user.id} has already published a bootcamp`,
                400
            )
        )
    }
    const bootcamp = await Bootcamp.create(req.body)
    res.status(201).json({ success: true, data: bootcamp })

})

// @desc update bootcamps
// @route UPDATE /api/v1/bootcamps/:id
// access private

exports.updatebootcamp = asyncHandler(async (req, res, next) => {

    let bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(new errorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(
            new errorResponse(
                `User ${req.params.id} is not authorized to update this bootcamp`,
                401
            )
        );
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({ success: true, data: bootcamp })

})

// @desc delete bootcamps
// @route DELETE /api/v1/bootcamps/:id
// access private

exports.deletebootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(new errorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(
            new errorResponse(
                `User ${req.params.id} is not authorized to delete this bootcamp`,
                401
            )
        );
    }
    bootcamp.remove()
    res.status(200).json({ success: true, data: {} })

})

// @desc get bootcamps within raduis
// @route GET /api/v1/bootcamps/radius/:zipcode/:distance
// access private

exports.getbootcampsinRadius = asyncHandler(async (req, res, next) => {

    const { zipcode, distance } = req.params

    // Get lat/log from geocoder
    const loc = await geocoder.geocode(zipcode)
    const lat = loc[0].latitude
    const lng = loc[0].longitude

    // calc radius using radians
    // divide dist by radius of earth
    // earth radius = 3963mil / 6378km
    const radius = distance / 3963

    const bootcamps = await Bootcamp.find({ location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } })

    res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps })

})

// @desc photoupload
// @route PUT /api/v1/bootcamps/:id/photo
// access private

exports.bootcampphotoupload = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(new errorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(
            new errorResponse(
                `User ${req.params.id} is not authorized to update this bootcamp`,
                401
            )
        );
    }
    if (!req.files) {
        return next(new errorResponse(`Please upload a file`, 400))
    }

    const file = req.files.file

    if (!file.mimetype.startsWith('image')) {
        return next(new errorResponse(`Please upload an image file`, 400))
    }

    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new errorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400))
    }

    // create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.log(err)
            return next(new errorResponse(`problem with file upload`, 500))
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })

        res.status(200).json({ success: true, data: file.name })
    })

})