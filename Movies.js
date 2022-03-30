var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose.set('useCreateIndex', true);



var MovieSchema = new Schema({
    title: {type: String, required: true},
    year: {type: Number, required: true},
    genre: {type: String, required: true},
    actorOne: { type: Array, required: true},
    actorTwo: { type: Array, required: true},
    actorThree: { type: Array, required: true}

});


module.exports = mongoose.model('Movie', MovieSchema);