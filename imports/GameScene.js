import {Keys} from '../imports/Keys';
import { Mongo } from 'meteor/mongo';
import {Partidas} from '../imports/collections/partidas.js';

let timeBetweenMovements = 0.06;
let distanceBetweenPoints = 40;

let headPath = "head1.png";
let bodyPath = "body1.png";
let applePath = "apple.png";
let gridPath = "grid2.png";
let musicPath = "music.ogg";
let eatAppleSoundPath = "pep.ogg";

let squaresTotal = 225;
let squaresWidth = 15;
let squaresHeight = 15;

export const CocosScope = {
    value: null
};

export const Audio = {
    on: true
}

export const User = {
    name: ""
}

let decomposePosition = function(x, y) {
    return Math.floor(Math.floor(((y-20))*(squaresWidth) / distanceBetweenPoints) + (x-20) / distanceBetweenPoints);
}

let composePosition = function(n) {
    return {
        x: Math.floor(n%squaresWidth) * distanceBetweenPoints + 20,
        y: Math.floor(Math.floor(n/squaresWidth) * distanceBetweenPoints + 20)
    };
}

let norm = function(x) {
    return Math.round((x-20)/40)*40 + 20;
}

let normRot = function(x) {
    return Math.round((x+90) / 90) * 90 - 90;
}

export const GameScene = {
    scene: function(){
        //load resources
        cc.LoaderScene.preload([], function () {
            var MyScene = cc.Scene.extend({
                onEnter:function () {
                    var Username = User.name;
                    this._super();

                    cc.audioEngine.playMusic(musicPath, true);
                    cc.audioEngine.setMusicVolume(0.5);
                    
                    let updateScore = function(){
                        CocosScope.value.$apply();
                        CocosScope.value.score = "Score: " + sprites.length;
                    }

                    let Directions = {
                        R: cc.p(distanceBetweenPoints, 0),
                        U: cc.p(0,distanceBetweenPoints),
                        L: cc.p(-distanceBetweenPoints, 0),
                        D: cc.p(0,-distanceBetweenPoints),
                        Z: cc.p(0,0)
                    };

                    let setAudio = function() {

                        if(Audio.on){
                            cc.audioEngine.setMusicVolume(0.7);
                            cc.audioEngine.setEffectsVolume(1.0);
                        }
                        else {
                            cc.audioEngine.setMusicVolume(0);
                            cc.audioEngine.setEffectsVolume(0);
                        }
                    }
                    setAudio();

                    var directionQueue = [];
                    var size = cc.director.getWinSize();
                    var sprites = [];
                    var positionQueue = [];
                    var apple = null;
                    var label = null;
                    var directionQueue = [];
                    var lastDirection = Directions.Z;

                    let createSnakeBody = function(context){
                        var sprite = cc.Sprite.create(bodyPath);
                        sprite.setPosition(sprites[sprites.length-1].getPosition());
                        sprite.setRotation(sprites[sprites.length-1].getRotation());
                        sprites.push(sprite);
                        sprite.setGlobalZOrder(3);
                        directionQueue.push(cc.p(0,0));
                        positionQueue.push(positionQueue[positionQueue.length-1]);
                        context.addChild(sprite);
                    };

                    let createApple = function(context) {
                        
                        if(apple != null){
                            apple.runAction(cc.removeSelf(true));
                        }
                        apple = cc.Sprite.create(applePath);
                        var posApple = Math.floor(Math.random()*squaresTotal);
                        var repeated = false;
                        do {
                            posApple = (posApple+1)%squaresTotal;
                            repeated = false;
                            for(var i = 0; i < sprites.length; i++){
                                if(sprites[i].getPosition().x === composePosition(posApple).x &&
                                   sprites[i].getPosition().y === composePosition(posApple).y){
                                    repeated = true;
                                }
                            }
                        } while(repeated);
                        var composedPosition = composePosition(posApple);
                        apple.setPosition(composedPosition.x, composedPosition.y);
                        context.addChild(apple);
                    }

                    var endGame = function() {
                        var score1 = sprites.length;
                        Partidas.insert({
                            user: Username,
                            score: score1
                        });

                        //Game over animation
                        for(var i = 0; i<sprites.length; i++){
                            var del = cc.delayTime(i*0.05);
                            var delC = cc.delayTime(0.1);
                            var fade = cc.fadeOut(0.05);
                            var tint = cc.tintTo(0.05,255,0,0);
                            var remove = cc.removeSelf(true);
                            var anim = [del, tint, delC, fade, remove];
                            var sequence = cc.sequence(anim);
                            sprites[i].runAction(sequence);
                        }
                        label.setString("Game Over");
                        cc.audioEngine.end();
                    };

                    //update fuction to move the snake
                    var reRunActions = function() {
                        //schedule(reRunActions, timeBetweenMovements + 0.02);
                        setAudio();
                        for(var i = positionQueue.length-1; i>0; i--){
                            positionQueue[i] = positionQueue[i-1];
                        }
                        positionQueue[0] = decomposePosition(norm(sprites[0].getPosition().x),norm(sprites[0 ].getPosition().y));
                        for(var i = 0; i < sprites.length; i++){
                            sprites[i].stopAllActions();
                            sprites[i].setPosition(composePosition(positionQueue[i]).x, composePosition(positionQueue[i]).y);
                            var pi = sprites[i].getPosition();
                            var p0 = sprites[0].getPosition();
                            ////////////////////////////////////GAME OVER
                            if(pi.x === p0.x && pi.y === p0.y && i > 2){
                                endGame();
                                this.unschedule(reRunActions);
                                return;
                            }
                        };
                        var pa = sprites[0].getPosition();

                        ////apple eaten
                        if(apple.getPosition().x === sprites[0].getPosition().x &&
                           apple.getPosition().y === sprites[0].getPosition().y){
                            createApple(this);
                            createSnakeBody(this);
                            
                            updateScore();
                            cc.audioEngine.playEffect(eatAppleSoundPath, false);
                        }

                        //movements out of canvas
                        {
                            for(var j = 0; j < sprites.length; j++)
                                //goes left
                                if(sprites[j].getPosition().x - distanceBetweenPoints < 0 && directionQueue[j] === Directions.L){
                                    var mockSprt = cc.Sprite.create(j === 0 ? headPath : bodyPath);
                                    mockSprt.setPosition(sprites[j].getPosition());
                                    mockSprt.setRotation(sprites[j].getRotation());
                                    this.addChild(mockSprt);
                                    sprites[j].setPosition(sprites[j].getPosition().x + size.width, sprites[j].getPosition().y);
                                    mockSprt.runAction(cc.sequence(cc.moveBy(timeBetweenMovements,directionQueue[j]),cc.removeSelf(true)));
                                }


                            //goes right
                                else if(sprites[j].getPosition().x + distanceBetweenPoints > size.width && directionQueue[j] === Directions.R){
                                    var mockSprt = cc.Sprite.create(j === 0 ? headPath : bodyPath);
                                    mockSprt.setPosition(sprites[j].getPosition());
                                    mockSprt.setRotation(sprites[j].getRotation());
                                    this.addChild(mockSprt);
                                    sprites[j].setPosition(sprites[j].getPosition().x - size.width, sprites[j].getPosition().y);
                                    mockSprt.runAction(cc.sequence(cc.moveBy(timeBetweenMovements,directionQueue[j]),cc.removeSelf(true)));
                                }


                            //goes down
                                else if(sprites[j].getPosition().y - distanceBetweenPoints < 0 && directionQueue[j] === Directions.D){
                                    var mockSprt = cc.Sprite.create(j === 0 ? headPath : bodyPath);
                                    mockSprt.setPosition(sprites[j].getPosition());
                                    mockSprt.setRotation(sprites[j].getRotation());
                                    this.addChild(mockSprt);
                                    sprites[j].setPosition(sprites[j].getPosition().x, sprites[j].getPosition().y + size.height);
                                    mockSprt.runAction(cc.sequence(cc.moveBy(timeBetweenMovements,directionQueue[j]),cc.removeSelf(true)));
                                }

                            //goes up
                                else if(sprites[j].getPosition().y + distanceBetweenPoints > size.height && directionQueue[j] === Directions.U){
                                    var mockSprt = cc.Sprite.create(j === 0 ? headPath : bodyPath);
                                    mockSprt.setPosition(sprites[j].getPosition());
                                    mockSprt.setRotation(sprites[j].getRotation());
                                    this.addChild(mockSprt);
                                    sprites[j].setPosition(sprites[j].getPosition().x, sprites[j].getPosition().y - size.height);
                                    mockSprt.runAction(cc.sequence(cc.moveBy(timeBetweenMovements,directionQueue[j]),cc.removeSelf(true)));
                                }
                        }


                        ///////////////apple to be eaten
                        if(decomposePosition(sprites[0].getPosition().x + directionQueue[0].x, sprites[0].getPosition().y + directionQueue[0].y)
                           === decomposePosition(apple.getPosition().x     , apple.getPosition().y)){
                            apple.runAction(cc.fadeOut(0.05));

                        }

                        //movement actions
                        lastDirection = directionQueue[0];
                        for(var i = 0; i<sprites.length; i++){
                            sprites[i].runAction(cc.moveBy(timeBetweenMovements, directionQueue[i]));


                            switch(directionQueue[i]){
                                case Directions.L:
                                    if(sprites[i].getRotation() != 90)
                                        sprites[i].setRotation(90);
                                    break;
                                case Directions.R:
                                    if(sprites[i].getRotation() != -90)
                                        sprites[i].setRotation(-90);
                                    break;
                                case Directions.U:
                                    if(sprites[i].getRotation() != 180)
                                        sprites[i].setRotation(180);
                                    break;
                                case Directions.D:
                                    if(sprites[i].getRotation() != 0)
                                        sprites[i].setRotation(0);
                                    break;
                            }
                        }
                        for(var i = sprites.length-1; i>0; i--){
                            directionQueue[i] = directionQueue[i-1];
                        }
                    };

                    //init properties
                    var grid = cc.Sprite.create(gridPath);
                    grid.setPosition(size.width/2, size.height/2);
                    this.addChild(grid);

                    label = cc.LabelTTF.create("", "Arial", 40);
                    label.setPosition(size.width / 2, size.height / 2);
                    this.addChild(label, 1);
                    label.setFontFillColor(cc.color(0,0,0,255));

                    createApple(this);

                    var sprt = cc.Sprite.create(headPath);
                    sprt.setZOrder(2);
                    sprites.push(sprt);
                    var sprtInitPos = composePosition(127);
                    sprt.setPosition(sprtInitPos.x,sprtInitPos.y);
                    this.addChild(sprt, 0);
                    directionQueue.push(Directions.Z);
                    positionQueue.push(127);

                    //schedule update ActionScaleFrame
                    this.schedule(reRunActions, timeBetweenMovements+0.01);
                    //set listener for keyboard
                    if (cc.sys.capabilities.hasOwnProperty('keyboard'))
                        cc.eventManager.addListener({
                            event: cc.EventListener.KEYBOARD,
                            onKeyPressed: function(key, event){
                                switch(key) {
                                    case Keys.L:
                                        if(lastDirection !== Directions.R){
                                            directionQueue[0] = Directions.L;
                                            //reRunActions();
                                        }
                                        break;
                                    case Keys.U:
                                        if(lastDirection !== Directions.D){
                                            directionQueue[0] = Directions.U;
                                            //reRunActions();
                                        }
                                        break;
                                    case Keys.R:
                                        if(lastDirection !== Directions.L){
                                            directionQueue[0] = Directions.R;
                                            //reRunActions();
                                        }
                                        break;
                                    case Keys.D:
                                        if(lastDirection !== Directions.U){
                                            directionQueue[0] = Directions.D;
                                            //reRunActions();
                                        }
                                        break;
                                }
                            }
                        }, this);
                    updateScore();
                }
            });
            cc.director.runScene(new MyScene());
        }, this);
    }
};
