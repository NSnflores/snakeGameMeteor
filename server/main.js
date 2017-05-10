import { Meteor } from 'meteor/meteor';
import {Partidas} from '../imports/collections/partidas';

Meteor.startup(() => {
  // code to run on server at startup
  if(Partidas.find().count() === 0){
  }

});
