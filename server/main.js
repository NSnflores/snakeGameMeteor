import { Meteor } from 'meteor/meteor';
import {Partidas} from '../imports/collections/partidas.js';


Meteor.startup(() => {
    var partidas = Partidas.find().fetch();
    while(partidas.length > 0)
        Partidas.remove({"_id": partidas.pop()._id});
    if(Partidas.find().count() === 0){
        Partidas.insert({
            "user": "Noe",
            "score": "Infinity"
        });
    }
});
