const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

//validate deliverTo
function validateDeliverTo(req, res, next) {
    const { data: { deliverTo } } = req.body;

    if(deliverTo) {
        res.locals.deliverTo = deliverTo;
        next();
    }

    next({
        status: 400,
        message: `Order must include a deliverTo`
    })
}

//validate mobileNumber
function validateMobileNumber(req, res, next) {
    const { data: { mobileNumber } } = req.body;

    if(mobileNumber) {
        res.locals.mobileNumber = mobileNumber;
        next();
    }

    next({
        status: 400,
        message: `Order must include a mobileNumber`
    })
}

//validate dishes
function validateDishes(req, res, next) {
    const { data: { dishes } } = req.body;

    if(Array.isArray(dishes) && dishes.length > 0) {
        res.locals.dishes = dishes;
        next();
    }

    if(dishes === undefined) {
        next({
            status: 400,
            message: `Order must include a dish`
        })
    }

    next({
        status: 400,
        message: `Order must include at least one dish`
    })
}

//validate quantities
function validateQuantities(req, res, next) {
    const dishes = res.locals.dishes;
    dishes.forEach((dish, index) => {
        if(typeof(dish.quantity) !== "number"|| dish.quantity < 1 || !dish.quantity) {
            next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            })
        }
    })

    next();
}

//validate id
function validateId(req, res, next) {
    const { orderId } = req.params;
    const { data: { id } = {} } = req.body;
    const foundOrder = orders.find((order) => order.id === orderId);

    if(!foundOrder) {
        next({
            status: 404,
            message: `Order ${orderId} not found`
        })
    }

    if(id && id !== orderId) {
        next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
        })
    }

    res.locals.foundOrder = foundOrder;
    next();
}

//validate status
function validateStatus(req, res, next) {
    const { data: { status } } = req.body;
    const foundOrder = res.locals.foundOrder;

    if(foundOrder.status === "delivered") {
        next({
            status: 400,
            message: `A delivered order cannot be changed`
        })
    }
    
    if(status === "pending" || status === "preparing" || status === "out-for-delivery" || status === "delivered") {
        res.locals.status = status;
        next();
    }

    next({
        status: 400,
        message: ` 	Order must have a status of pending, preparing, out-for-delivery, delivered`
    })
}

//validate deleteStatus
function validateDeleteStatus(req, res, next) {
    const foundOrder = res.locals.foundOrder;

    if(foundOrder.status === "pending") {
        next();
    }

    next({
        status: 400,
        message: `An order cannot be deleted unless it is pending`
    })
}

//list orders
function list(req, res, next) {
    res.json({ data: orders })
}

//read an order
function read(req, res, next) {
    const foundOrder = res.locals.foundOrder;
    res.json({ data: foundOrder });
}

//post a new order
function post(req, res, next) {
    const newOrder = {
        id: nextId(),
        deliverTo: res.locals.deliverTo, 
        mobileNumber: res.locals.mobileNumber, 
        "status": "pending", 
        dishes: res.locals.dishes
    }

    orders.push(newOrder);

    res.status(201).json({ data: newOrder });
}

//update an order
function update(req, res, next) {
    let foundOrder = res.locals.foundOrder;

    foundOrder.deliverTo = res.locals.deliverTo;
    foundOrder.mobileNumber = res.locals.mobileNumber;
    foundOrder.status = res.locals.status;
    foundOrder.dishes = res.locals.dishes;

    res.status(200).json({ data: foundOrder });
}

//delete an order
function destroy(req, res, next) {
    const foundOrder = res.locals.foundOrder;
    const index = orders.findIndex((order) => order.id === foundOrder.id);
    const deletedOrder = orders.splice(index, 1);
    res.sendStatus(204);
}

module.exports = {
    list,
    update: [validateId, validateDeliverTo, validateMobileNumber, validateDishes, validateQuantities, validateStatus, update],
    read: [validateId, read],
    post: [validateDeliverTo, validateMobileNumber, validateDishes, validateQuantities, post],
    destroy: [validateId, validateDeleteStatus, destroy]
};
