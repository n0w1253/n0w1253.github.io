// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var favoriteSchema = new Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish'
        }]
}, {
    timestamps: true
});

favoriteSchema.methods.getDish = function (dishId) {
console.log("dishId "+dishId);
    for (var i = 0; i < this.dishes.length; i++) {
       console.log("dishes ["+i+"]"+this.dishes[i]);
        if (this.dishes[i]._id == dishId)
            return this.dishes[i];
    }
   
    return null;
};

favoriteSchema.methods.dishbyId = function (dishId) {
console.log("dishId "+dishId);
    for (var i = 0; i < this.dishes.length; i++) {
       console.log("dishes ["+i+"]"+this.dishes[i]);
        if (this.dishes[i] == dishId)
            return this.dishes[i];
    }
   
    return null;
};

favoriteSchema.methods.removeDishbyId = function (dishId) {
    for (var i = 0; i < this.dishes.length; i++) {       
        if (this.dishes[i] == dishId){
            this.dishes.splice(i, 1);
            return;
        }
    }
    
};

// the schema is useless so far
// we need to create a model using it
var Favorites = mongoose.model('Favorite', favoriteSchema);

// make this available to our Node applications
module.exports = Favorites;