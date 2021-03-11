
/*

    1.构件好基本的html结构和css样式
    2.js部分，利用面向对象的思想
        1.根据输入的行数、列数、雷数构造出基本的格子，用两个二位数组分别去存储格子和格子里面对应的信息
        2.从所有的格子里随机的选取对应的格子数作为雷
        3.利用坐标去更新所有雷周围八个格子的信息
        4.处理对应的点击事件
         ---- 点击左键---
            当点击到的是数字时
                (1)如果数字不是0，就正常显示
                (2)数字是0
                    1.显示自己
                    2.找出四周，显示四周
                        1.如果找出的四周中有0，则递归
                        2.找出的四周里有非0的，显示后，结束
            点击到的是雷
                显示所有的雷，并给点击到的雷加上一个背景，游戏结束
        ---点击右键----
            插入小红旗，当插入的小红旗的个数和雷数相等了，则判断是否插的位置全是雷
                是则游戏挑战成功，否则挑战失败
*/

var over = false;

function Mine(tr,td,mineNum){
    this.tr = tr;   //行数
    this.td = td;  //列数
    this.mineNum = mineNum;  //雷数

    this.squares = [];   // 用来存储每个格子的信息
    this.doms = [];    //  存储所有单元格的DOM
    this.mineArr = [];  //存储雷的信息的数组
    this.lastMine = mineNum;  //剩余的雷数
    this.body = document.getElementsByClassName('game-boxs')[0];
    this.mine = document.querySelector('.lastMine');
    this.flagMine = mineNum;
    this.curStyle = 0;
    this.over = false;
}


//按照输入的行和列创建格子
Mine.prototype.createTable = function(){
    var that = this;
    var num = 0;
    var table = document.createElement('table');
    for(var i = 0; i < this.tr; i++){
        var tr = document.createElement('tr');
        this.doms[i] = [];
        for(var j = 0; j < this.td; j++){
            var td = document.createElement('td');
            this.doms[i][j] = td;
            td.pos = [i,j];
            td.onmousedown = function(event){
                that.playGames(event,this);
            }
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    this.body.innerHTML = '';
    this.body.appendChild(table);
}

//随机的选出创建的雷的个数并返回
Mine.prototype.randomMine = function(){
    var arr = new Array(this.tr * this.td);
    for(var i = 0; i < arr.length; i++){
        arr[i] = i;
    }
    arr.sort(function(){return Math.random() - 0.5;});  //随机排序
    // console.log(arr.splice(0,this.mineNum));
    this.mineArr = arr.splice(0,this.mineNum);
}

//arr.indexOf()  找不到返回-1

//统计格子的信息
Mine.prototype.statisticsTd = function(){
    /*
        mine : {
            type : mine;
              x  :  0;   //x，y是坐标
              y  :  0;
        }
        
        number : {
            type : number;
              x  : 0;
              y  : 0;
            value: 0;
        }
    */
    for(var i = 0; i < this.tr; i++){
        this.squares[i] = [];
        for(var j = 0; j < this.td; j++){
            if(this.mineArr.indexOf(i * this.td + j) != -1){
                this.squares[i][j] = {
                    type : 'mine',
                      x  : j,
                      y  : i
                }
            }else{
                this.squares[i][j] = {
                    type : 'number',
                      x  : j,
                      y  : i,
                      value : 0
                }
            }
        }
    }
}

//更新所有的数字
Mine.prototype.updateNum = function(){
    var that = this;
    for(var i = 0; i < this.tr; i++){
        for(var j = 0; j < this.td; j++){
            if(this.squares[i][j].type == 'mine'){   //如果是雷，更新雷周围的数字
                var arr = this.getAround(this.squares[i][j]);
                for(var k = 0; k < arr.length; k++){
                    this.squares[arr[k][0]][arr[k][1]].value++;   
                }
            }
        }
    }
}


//找到某个方格周围的九个方格
Mine.prototype.getAround = function(td){
/*
  x-1,y-1     x,y-1    x+1,y-1
   x-1,y       x,y      x+1,y
  x-1,y+1     x,y+1    x+1,y+1

*/
var x = td.x;
var y = td.y;
var arr = [];
for(var i = x - 1; i <= x + 1; i++){
    for(var j = y - 1; j <= y + 1; j++){
        if(i < 0 ||
           j < 0 ||
           i > this.tr - 1 ||
           j > this.td - 1 ||
           i == x && j == y){
               continue;
           }
        else{
            arr.push([j,i]);  //行与列
        }
    }
  }
  return arr;
}



Mine.prototype.playGames = function(event,td){
    var that = this;
    var curTd = this.squares[td.pos[0]][td.pos[1]];
    var numberStyle = ['zero','one','two','three','four','five','six','seven','eight'];
    // console.log(curTd.type);
    if(event.button == 0 && td.className != 'flag'){  //按的左键
        if(curTd.type == 'number'){
            if(curTd.value != 0){   //点到的不是0
                td.className = numberStyle[curTd.value];
                td.innerHTML = curTd.value;
            }else{    //点到的是0,需要递归
                /*
                    1.显示自己
                    2.找四周，显示四周
                        1.依次显示其四周的每一个td(如果有td的value值不为0,则递归就到这了)
                        2.循环到的td的值，则递归
                */
               td.className = numberStyle[curTd.value];  //显示自己
               td.innerHTML = '';
               function seeAround(current){
                    var arr = that.getAround(current);
                    for(var i = 0; i < arr.length; i++){
                        var x = arr[i][0];
                        var y = arr[i][1];
                        that.doms[x][y].className = numberStyle[that.squares[x][y].value];
                        if(that.squares[x][y].value == 0){
                            if(!that.squares[x][y].watched){
                                // that.doms[x][y].innerHTML = '';
                                that.squares[x][y].watched = 1;
                                seeAround(that.squares[x][y]);
                            }
                        }else{
                            that.doms[x][y].innerHTML = that.squares[x][y].value;
                        }
                    }
               }
               seeAround(curTd);

            }
        }
        else{
            alert('挑战失败，再来一次吧！！');
            this.gameOver(td,'mine');
        }
        
    }if(event.button == 2){   //按的是右键
        if(td.className && td.className != 'flag'){
            return ;
        }
        this.lastMine = td.className == 'flag'? this.lastMine + 1 : this.lastMine - 1;
        td.className = td.className == 'flag'? '' : 'flag';
        this.mine.innerHTML = this.lastMine;
        if(curTd.type == 'mine'){
            this.flagMine --;
        }
        if(this.lastMine == 0){
            if(this.flagMine == 0){
                alert('挑战成功！！');
                over = true;
                
            }else{
                alert('挑战失败，再来一次吧');
                this.gameOver(td,'flag');
            }
        }
    }
}

Mine.prototype.gameOver = function(clickTd,overStyle){
    over = true;
    if(overStyle == 'mine'){
        for(var i=0;i<this.tr;i++){
            for(var j=0;j<this.td;j++){
                if(this.squares[i][j].type=='mine'){
                    this.doms[i][j].className='mine';
                }
                this.doms[i][j].onmousedown=null;
            }
        }
        if(clickTd){
            clickTd.style.backgroundColor='#f00';
        }
    }else if(overStyle == 'flag'){
        for(var i = 0; i < this.tr; i ++){
            for(var j = 0; j < this.td; j ++){
                if(this.squares[i][j].type == 'mine' && this.doms[i][j].className != 'flag'){
                    this.doms[i][j].className = 'mine';
                }
            }
        }
    }
}


//初始化
Mine.prototype.init = function(){
    this.createTable();
    this.randomMine();
    this.statisticsTd();
    this.updateNum();
    this.body.oncontextmenu = function(){
        return false;
    }
    this.mine.innerHTML = this.lastMine;
    over = false;
}


//处理四个button
var button = document.getElementsByTagName('button');
var buttonStyle = ['var mine = new Mine(9,9,10);','var mine = new Mine(16,16,40);','var mine = new Mine(28,28,99);']
for(var i = 0; i < button.length-1; i++){
    (function(j){
        button[j].onclick = function(){
            if(!over){
                mine.curStyle = j;
                for(var m = 0; m < button.length-1; m++){
                    button[m].className = '';
                }
                button[j].className = 'click-button';
                eval(buttonStyle[j]);
                mine.init();
            }
        }
    }(i))

}
this.button[3].onclick = function(){
    console.log(mine.curStyle);
    eval(buttonStyle[mine.curStyle]);
    mine.init();
}



var mine = new Mine(9,9,10);
mine.init();



