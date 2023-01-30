const router = require('express').Router()
const mongoose = require('mongoose')
const { rawListeners } = require('../app')
const app = require('../app')
const Festival = require('../models/Festival.model')

router.get('/festivals/create',(req,res)=>{
    res.render('festivals/new-festival-form')
})

router.post('/festivals/create',(req,res)=>{

    console.log(req.body)

    if (req.body.minPrice && !req.body.maxPrice){

        message = "Maximum Price has been set to " + req.body.minPrice
        errorType = "warning"
        res.render('festivals/new-festival-form', {errorMessage: message, errorType});
        req.body.maxPrice = req.body.minPrice
        return;
    }
    else if (!req.body.minPrice && req.body.maxPrice){
        message = "Minimum Price has been set to " + req.body.maxPrice
        errorType = "warning"
        res.render('festivals/new-festival-form', {errorMessage: message, errorType});
        req.body.minPrice = req.body.maxPrice
        return;
    }
    else if (Number(req.body.minPrice) > Number(req.body.maxPrice)) {
        message = "Maximum Price cannot be lower than Minimum. Max price has been set to " + req.body.minPrice
        errorType = "warning"
        res.render('festivals/new-festival-form', {errorMessage: message, errorType});
        req.body.maxPrice = req.body.minPrice
        return;
    }

    if (req.body.startDate && !req.body.endDate) {
        message = "End Date has been set to " + req.body.startDate
        errorType = "warning"
        res.render('festivals/new-festival-form', {errorMessage: message, errorType});
        req.body.endDate = req.body.startDate
        return;
    }
    else if (!req.body.startDate && req.body.endDate) {
        message = "Start Date has been set to " + req.body.endDate
        errorType = "warning"
        res.render('festivals/new-festival-form', {errorMessage: message, errorType});
        req.body.startDate = req.body.endDate
        return;
    }
    else if (req.body.startDate > req.body.endDate) {
        message = "End Date cannot be before the Start Date. End Date has been set to " + req.body.startDate
        errorType = "warning"
        res.render('festivals/new-festival-form', {errorMessage: message, errorType});
        req.body.endDate = req.body.startDate
        return;
    }

    if (!req.body.name) {
        message = "You must enter a name for your Festival"
        errorType="error"
        res.render('festivals/new-festival-form', {errorMessage: message, errorType});
    }
    else if (!req.body.startDate) {
        message = "You must enter a Start Date"
        errorType="error"
        res.render('festivals/new-festival-form', {errorMessage: message, errorType});
    }       
    else if (!res.body.country) {     // theoretically impossible because of Dropdown menu?
        message = "You must select a country"
        errorType="error"
        res.render('festivals/new-festival-form', {errorMessage: message, errorType});    
    }
    else if (!res.body.city) {
        message = "You must enter a city"
        errorType="error"
        res.render('festivals/new-festival-form', {errorMessage: message, errorType}); 
    }
    else if (!res,body.website) {
        message = "You must enter a website"
        errorType="error"
        res.render('festivals/new-festival-form', {errorMessage: message, errorType}); 
    }

    else {
        const {name,imageURL,startDate,endDate,country, city, address,currency,minPrice,maxPrice,website,mustKnow,genre} = req.body

        Festival.create({name:name, imageURL: imageURL, startDate: startDate, endDate:endDate, location: {city:city, country:country, address:address}, currency: currency, minPrice: minPrice,maxPrice: maxPrice,website: website,mustKnow: mustKnow,genre:genre })
        .then((createdFestival)=>{  
            res.redirect('/festivals/list')
            // res.redirect(`/festivals/${createdFestival._id}`)
        })
        .catch(err=> console.log('An error occured creating the festival:', err)) 
    }

})


router.get('/festivals/list',(req,res)=>{
    Festival.find()
    .then((allFestivals)=>{
        res.render('festivals/all-festivals',{allFestivals})
    })
    .catch(err=>console.log('Error occured retrieving all festivals:', err))
})

router.get('/festivals/:festivalId', (req,res)=>{
    console.log('Req.params is:', req.params)
    Festival.findById(req.params.festivalId)
    .then((festivalDetails)=>{
        console.log(festivalDetails)
        res.render('festivals/festival-detail', festivalDetails)
    })
    .catch(err=>console.log('Error getting the festival detail is:', err))
})

router.get('/delete-festival/:id', (req, res)=>{
    const festivalId = req.params.id
    Festival.findByIdAndDelete(festivalId)
    .then((festivalToDelete)=>{
        res.redirect('/festivals/list')
    })
    .catch(err=> console.log('Delete error is', err))
})

router.get('/festivals/:id/edit/', (req,res)=>{
    Festival.findById(req.params.id)
    .then((festivalToEdit)=>{
        res.render('festivals/edit-festival', festivalToEdit)
    })
    .catch(err=>console.log('Error occured retrieving the data to edit festival:', err))
})

router.post('/festivals/:id/edit', (req,res)=>{

    const {name,imageURL,startDate,endDate,country, city, address,currency,minPrice,maxPrice,website,mustKnow,genre} = req.body
    Festival.findByIdAndUpdate(req.params.id, {name:name, imageURL: imageURL, startDate: startDate, endDate:endDate, location: {city:city, country:country, address:address}, currency: currency, minPrice: minPrice,maxPrice: maxPrice,website: website,mustKnow: mustKnow,genre:genre })
    .then((festivalToUpdate)=>{
        res.redirect(`/festivals/${festivalToUpdate._id}`)
    })
    .catch(err=>console.log('Editing error is:', err))
})



module.exports = router