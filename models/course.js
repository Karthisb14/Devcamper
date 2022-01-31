const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add  course title"]
  },
  description: {
    type: String,
    required: [true, "Please add a description"]
  },

  weeks: {
    type: String,
    required: [true, "Please add number of weeks"]
  },
  tuition: {
    type: Number,
    required: [true, "Please add a tuition cost"]
  },
  minimumSkill: {
    type: String,
    required: [true, "Please add a minimum skill"],
    enum: ["beginner", "intermediate", "advanced"]
  },
  scholarShipsAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true
  }
})

// static method to get average of course tuitions
CourseSchema.statics.getAveragecost = async function (bootcampId) {
  console.log('average cost')

  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' }
      }
    }

  ])

  try {

    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10
    })
  } catch (err) {
    console.error(err)
  }
}



// call getAverage cost after save
CourseSchema.post('save', function () {
  this.constructor.getAveragecost(this.bootcamp)
})

// call getAverage cost before save
CourseSchema.pre('remove', function () {
  this.constructor.getAveragecost(this.bootcamp)
})

module.exports = mongoose.model('course', CourseSchema)