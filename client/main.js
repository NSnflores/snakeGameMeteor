import angular from 'angular';
import angularMeteor from 'angular-meteor';
import {MainScene} from '../imports/mainscene';
import {GameScene, User, Audio, CocosScope} from '../imports/GameScene';
import {Partidas} from '../imports/collections/partidas.js';

let volume = {
    off: "volume_off",
    on: "volume_up"
};

var audio = true;

var app = angular.module('preexamen', [
    angularMeteor
]);

app.controller('PartiesCont', ['$scope', function($scope) {
    
    $scope.x1 = 0.0;
    $scope.score = "";
    
    $scope.helpers({
        partidas(){
            var games = Partidas.find().fetch();
            var scores = [];
            for(var i = 0; i<games.length && i<9; i++){
                for(var j = i+1; j<games.length; j++){
                    if(games[i].score < games[j].score){
                        var tmp = games[i];
                        games[i] = games[j];
                        games[j] = tmp;
                    }
                }
                scores.push({
                    place: i+1,
                    user: games[i].user.substring(0,10),
                    score: games[i].score
                });
            }
            return scores;
        }
    });
    
    $scope.audioEvent = function() {
        audio = !audio;
        Audio.on = audio;
        document.getElementById("audioicon").innerHTML = audio ? volume.on : volume.off;
    }

    $scope.jugar = function (){

        var user = $scope.user;
        if(user == undefined || user == "")
            user = "Guest";
        
        User.name = user;
        
        $scope.score = "Score: 0";
        
        CocosScope.value = $scope;

        document.getElementById("gameCanvas").focus();

        cc.game.onStart = GameScene.scene;
        cc.game.run('gameCanvas');
    }
}]);