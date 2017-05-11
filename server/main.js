import { Meteor } from 'meteor/meteor';
import {Partidas, Users} from '../imports/collections/partidas.js';


Meteor.startup(() => {
    // code to run on server at startup

    var users = Users.find().fetch();
    var partidas = Partidas.find().fetch();

    while(users.length > 0)
        Users.remove({"_id": users.pop()._id});
    while(partidas.length > 0)
        Partidas.remove({"_id": partidas.pop()._id});
    if(Partidas.find().count() === 0){
        Partidas.insert({
            "user": "Noe",
            "score": "Infinity"
        });
    }

    if(Users.find().count() === 0){
    }

});
