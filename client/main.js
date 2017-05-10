import angular from 'angular';
import angularMeteor from 'angular-meteor';
import {MainScene} from '../imports/mainscene';
import {GameScene} from '../imports/GameScene';
import {Partidas} from '../imports/collections/partidas';

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
        
        document.getElementById("gameCanvas").focus();
        
        cc.game.onStart = GameScene.scene;
        cc.game.run('gameCanvas');
    }
}]);
