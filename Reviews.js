// name of the reviewer
// small quote about what they thought
// rating out of 5

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

try{
    mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose.set('useCreateIndex', true);


var ReviewSchema = new Schema({
    name: {type: String, required: true},
    review: {type: String, required: true},
    rating: {type: Number, required: true}
});


module.exports = new mongoose.model('Reviews', ReviewSchema);