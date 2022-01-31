const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const fileupload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')
const errorhandler = require('./middleware/error')
const path = require('path')
const  mongoSanitize= require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')

dotenv.config({path:'./config/config.env'})

const app = express()

// connect to db
connectDB()

// Router
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const users = require('./routes/users')
const reviews = require('./routes/reviews')


// dev logging middleware
if(process.env.NODE_ENV = 'development'){
    app.use(morgan('dev'))
}

// data parser
app.use(express.json())

// cookie parser
app.use(cookieParser())

// fileuploading
app.use(fileupload())

// sanitize data
app.use(mongoSanitize())

// set security for headers
app.use(helmet())

// Prevent xss clean
app.use(xss())

// rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10min
    max: 100
})

app.use(limiter)

// prevents http param pollution
app.use(hpp())

// cors
app.use(cors())

// set static folder
app.use(express.static(path.join(__dirname, 'public')))

// mount route
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)
app.use('/api/v1/reviews', reviews)


app.use(errorhandler)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is Running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})