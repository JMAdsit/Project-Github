const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

//validate name
function validateName(req, res, next) {
    const { data: { name } } = req.body
    res.locals.name = name;

    if (name) {
        next();
    }
    next({
        status: 400,
        message: "Dish must include a name"
    })
}

//validate description
function validateDescription(req, res, next) {
    const { data: { description } } = req.body
    res.locals.description = description;

    if (description) {
        return next();
    }
    next({
        status: 400,
        message: "Dish must include a description"
    })
}

//validate image
function validateImage(req, res, next) {
    const { data: { image_url } } = req.body
    res.locals.image_url = image_url;
    
    if (image_url) {
        return next();
    }
    next({
        status: 400,
        message: "Dish must include a image_url"
    })
}

//validate price
function validatePrice(req, res, next) {
    const { data: { price } } = req.body;
    res.locals.price = price;

    if(typeof(price) !== "number"){
        next({
            status: 400,
            message: "Dish must include a price"
        })
    }

    if (price >= 1) {
        return next();
    }

    next({
        status: 400,
        message: "Dish must have a price that is an integer greater than 0"
    })
}

//validate id
function validateId(req, res, next) {
    const { dishId } = req.params;
    const { data: { id } = {} } = req.body;
    const foundDish = dishes.find((dish) => dish.id === dishId);

    if(!foundDish) {
        next({
        status: 404,
        message: `Dish does not exist: ${dishId}.`
    })
    }

    if(id && id !== dishId) {
        next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
        })
    }

    res.locals.foundDish = foundDish;
    next();
}

//list dishes
function list(req, res, next) {
    res.json({ data: dishes })
}

//read dish
function read(req, res, next) {
    const foundDish = res.locals.foundDish;
    res.json({ data: foundDish });
}

//post new dish
function post(req, res, next) {
    const newDish = {
        id: nextId(),
        name: res.locals.name,
        description: res.locals.description,
        price: res.locals.price,
        image_url: res.locals.image_url
    }
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

//update a dish
function update(req, res, next) {
    const foundDish = res.locals.foundDish;
    const price = res.locals.price;
    const name = res.locals.name;
    const description = res.locals.description;
    const image_url = res.locals.image_url;

    foundDish.price = price;
    foundDish.name = name;
    foundDish.description = description;
    foundDish.image_url = image_url;

    res.status(200).json({ data: foundDish })
}


module.exports = {
    list,
    post: [validateName, validateDescription, validateImage, validatePrice, post],
    read: [validateId, read],
    update: [validateId, validateName, validateDescription, validateImage, validatePrice, update]
};