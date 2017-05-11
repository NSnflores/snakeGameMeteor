import angular from 'angular';
import angularMeteor from 'angular-meteor';
import {MainScene} from '../imports/mainscene';
import {GameScene} from '../imports/GameScene';
import {Partidas} from '../imports/collections/partidas.js';
import {Users} from '../imports/collections/partidas.js';

var app = angular.module('preexamen', [
    angularMeteor
]);

app.controller('PartiesCont', ['$scope', function($scope) {

    $scope.x1 = 0.0;
    $scope.helpers({
        partidas(){
            return Partidas.find({});
        }
    });


    $scope.jugar = function (){
        
        var user = $scope.user;
        if(user == undefined || user == "")
            user = "Guest";
        
        Users.insert({
           user: user 
        });
        
        document.getElementById("gameCanvas").focus();
        
        cc.game.onStart = GameScene.scene;
        cc.game.run('gameCanvas');
    }
}]);
