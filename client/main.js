import angular from 'angular';
import angularMeteor from 'angular-meteor';
import {MainScene} from '../imports/mainscene';
import {GameScene, User} from '../imports/GameScene';
import {Partidas} from '../imports/collections/partidas.js';

var app = angular.module('preexamen', [
    angularMeteor
]);

app.controller('PartiesCont', ['$scope', function($scope) {
    $scope.x1 = 0.0;
    $scope.helpers({
        partidas(){
            var games = Partidas.find().fetch();
            var scores = [{
                place: 0,
                user: "Noe",
                score: "Infinity"
            }];
            for(var i = 1; i<games.length-1 && i<9; i++){
                for(var j = i+1; j<games.length; j++){
                    if(games[i].score < games[j].score){
                        var tmp = games[i];
                        games[i] = games[j];
                        games[j] = tmp;
                    }
                }
                scores.push({
                    place: i,
                    user: games[i].user.substring(0,10),
                    score: games[i].score
                });
            }
            return scores;
        }
    });

    $scope.jugar = function (){

        var user = $scope.user;
        if(user == undefined || user == "")
            user = "Guest";

        User.name = user;

        document.getElementById("gameCanvas").focus();

        cc.game.onStart = GameScene.scene;
        cc.game.run('gameCanvas');
    }
}]);