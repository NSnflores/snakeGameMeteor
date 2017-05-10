import {Keys} from '../imports/Keys';

export const MainScene = function(){
    //load resources
    cc.LoaderScene.preload([], function () {
        var MyScene = cc.Scene.extend({
            onEnter:function () {
                this._super();
                var size = cc.director.getWinSize();
                var sprite = cc.Sprite.create("cocos.png");
                sprite.setPosition(size.width / 2, size.height / 2);
                sprite.setScale(0.4);
                this.addChild(sprite, 0);

                var label = cc.LabelTTF.create("Hello World", "Arial", 40);
                label.setPosition(size.width / 2, size.height / 2);
                this.addChild(label, 1);


                //set listener for keyboard
                if (cc.sys.capabilities.hasOwnProperty('keyboard'))
                {
                    cc.eventManager.addListener(
                        {
                            event: cc.EventListener.KEYBOARD,
                            onKeyPressed: function(key, event)
                            {
                                sprite.stopAllActions();
                                switch(key) {
                                    case Keys.L:
                                        sprite.runAction(cc.MoveBy.create(0.2,cc.p(-40,0)));
                                        break;
                                    case Keys.U:
                                        sprite.runAction(cc.MoveBy.create(0.2,cc.p(0,40)));
                                        break;
                                    case Keys.R:
                                        sprite.runAction(cc.MoveBy.create(0.2,cc.p(40,0)));
                                        break;
                                    case Keys.D:
                                        sprite.runAction(cc.MoveBy.create(0.2,cc.p(0,-40)));
                                        break;
                                }
                            }
                        }, this);
                }
            }
        });
        cc.director.runScene(new MyScene());
    }, this);
};
