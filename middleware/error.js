const errorResponse = require("../utilis/errorResponse")

const errorhandler = (err, req, res, next) => {

    let error = {... err}

    error.message = err.message

    console.log(err)
    // Mongoose bad ObjectId
    if(err.name === 'CastError'){
        const message = `Resources not found`
        error = new errorResponse(message, 404)
    }

    // Mongoose duplicate key
    if(err.code === 11000){
        const message = 'Duplicate field value entered'
        error = new errorResponse(message, 400)
    }

    // Mongoose Validation error
    if(err.name === 'ValidationError'){
        const message = Object.values(err.errors).map(val => val.message)
        error = new errorResponse(message, 400)
    }

    res.status(error.statusCode || 500 ).json({sucess: false, error: error.message || 'Server error'})
}

module.exports = errorhandler