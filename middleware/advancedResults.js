const advancedResults = (model, populate) => async(req, res, next) => {
    let query

    // copy reqquery
    const reqQuery = {... req.query} 
    // console.log(reqQuery)
    // fields excluded
    const removefield = ['select', 'sort', 'page', 'limit']

    // loops over removefield and delete them from reqQuery
    removefield.forEach((param) => {
        delete reqQuery[param]
    })

    // create query string
    let queryStr = JSON.stringify(reqQuery)
    // console.log(queryStr)

    // Create Operator
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

    // Finding resource
    query = model.find(JSON.parse(queryStr))
    // console.log(query)
    

    // select fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)
    }

    // sort
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    }else{
        query = query.sort('-createdAt')
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1
    // console.log(page);
    const limit = parseInt(req.query.limit, 10) || 25
    // console.log(limit);
    const startIndex = (page - 1) * limit
    // console.log(startIndex);
    const endIndex = page * limit
    // console.log(endIndex)
    const total = await model.countDocuments()
    // console.log(total)

    query = query.skip(startIndex).limit(limit)
    // console.log(query)

    if(populate){
        query = query.populate(populate)
    }

    // executing query
    const results = await query
    // console.log(results)

    // Pagination result
    let pagination = {}

    if(endIndex < total){
        pagination.next = {
            page : page + 1,
            limit
        }
    }

    if(startIndex > 0){
        pagination.prev = {
            page : page - 1,
            limit
        }
    }

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next()
    
}

module.exports = advancedResults