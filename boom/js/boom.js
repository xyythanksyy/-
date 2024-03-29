function Mine(tr,td,mineNum){
    this.tr=tr;//行数
    this.td=td;//列数
    this.mineNum=mineNum;//雷的数量

    this.squares=[];  //存储所有方块的信息，它是一个二维数组，按行和列的顺序排放，存取都使用行和列的形式
    this.tds=[];      //存储所有单元格的DOM
    this.surplusMine=mineNum;  //剩余雷的数量
    this.allRight=false;  //有标记的小红旗是否全是雷,用来判断用户是否成功
     
    this.parent=document.querySelector('.gameBox');
     
}
//生成n个不重复的数字
Mine.prototype.randomNum=function(){
 var square=new Array(this.tr*this.td);//生成一个长度为格子总数的空数组
 for(var i=0;i<square.length;i++){
   square[i]=i;
 }
 square.sort(function(){return 0.5-Math.random()});
 //console.log(square);
 return square.slice(0,this.mineNum);
}
Mine.prototype.init=function(){
  //this.randomNum();
  var rn=this.randomNum(); //雷在格子里的位置
  var n=0; //用来找到格子对应的索引
  for(var i=0;i<this.tr;i++){
    this.squares[i]=[];
    for(var j=0;j<this.td;j++){
    // this.squares[i][j]=;
        n++;
        
        //取一个方块在数组里的数据要使用行和列的形式去取，找方块周围的方块的时候要用坐标的形式去取，行和列的形式跟坐标的形式x，y是刚好相反的
    if(rn.indexOf(n)!=-1){
      //如果这个条件成立，说明现在循环到这个索引在雷的数组里找到了，那就表示这个索引对应的是个雷
      this.squares[i][j]={type:'mine',x:j,y:i};
    }
    else{
      this.squares[i][j]={type:'number',x:j,y:i,value:0};
    }
    }
  }
  
  //console.log(this.squares);
  this.updataNum();
  this.createDom();
  this.parent.oncontextmenu=function(){
    return false;
  }
  //剩余雷数
  this.mineNumDom=document.querySelector('.mineNum');
  this.mineNumDom.innerHTML=this.surplusMine;
};
//创建表格
Mine.prototype.createDom=function(){
  var This=y=this;
 var table=document.createElement('table');
 for(var i=0;i<this.tr;i++){//行
   var domTr=document.createElement('tr');
   this.tds[i]=[];
   for(var j=0;j<this.td;j++){ //列
    var domTd=document.createElement('td');
    //domTd.innerHTML=0;
    domTd.pos=[i,j];  //表示把格子对应的行和列存到格子身上，为了下面通过这个值去数组里取到对应的数据

    domTd.onmousedown=function(){
     This.play(event,this); //This指实例对象 this指点击的td
    };
    this.tds[i][j]=domTd; //这里是把所有创建的td添加到数组当中
  
    /* if(this.squares[i][j].type=='mine'){
       domTd.className='mine';
     }
     if (this.squares[i][j].type=='number') {
       domTd.innerHTML=this.squares[i][j].value;
    }*/
    
    domTr.appendChild(domTd);
   }
   table.appendChild(domTr);

 }
 this.parent.innerHTML='';//避免多次点击创建
 this.parent.appendChild(table);
};

//找某个方格周围的8个方格
 Mine.prototype.getAround=function(square){
   var x=square.x;
   var y=square.y;
   var result=[];//找到的格子的坐标返回出去(二维数组)
   //通过坐标去循环九宫格
   for (var i = x-1; i <=x+1; i++) {
     for (var j = y-1; j <=y+1; j++) {
       if (
          i<0||
          j<0||
          i>this.td-1||
          j>this.tr-1||
         (i == x && j == y) ||
         this.squares[j][i].type=='mine'
       ) {
         continue;
       }
       result.push([j,i]);//要以行和列的形式返回出去，因为到时候需要用它去取数组里的数据
     }
     
   }
   return result;
 };
//更新所有的数字
Mine.prototype.updataNum=function(){
  for(var i=0 ;i<this.tr;i++){
    for(var j=0 ;j<this.td;j++){
      //只更新雷周围的数字
      if(this.squares[i][j].type=='number'){
        continue;
      }
      var num=this.getAround(this.squares[i][j]);//获取到每一个雷周围的数字
      for (var k = 0; k <num.length; k++) {
        
        this.squares[num[k][0]][num[k][1]].value+=1;
        
      }
    }
  }
 // console.log(this.squares);
}
Mine.prototype.play=function(ev,obj){
   var This=this;
  if (ev.which==1 && obj.className!='flag') {
    //点击的左键
    //console.log(obj);
    var curSquare=this.squares[obj.pos[0]][obj.pos[1]];
    var cl=['zero','one','two','three','four','five','six','seven','eigth']
    if (curSquare.type=='number') {
      //用户点击的是数字
      //console.log('你点到数字了')
      obj.innerHTML=[curSquare.value];
      obj.className=cl[curSquare.value];
      if (curSquare.value==0) {
        /*
        点到了数字0
        1.显示自己
        2.找四周
          2.1显示四周(如果四周的值不为0，就不用再找)
          2.2如果值为0 
             显示自己
             找四周
        */
       obj.innerHTML='';//如果数字为0 就不显示

      function getAllZero(square){
       var around=This.getAround(square);//找到了四周的n个格子
       for(var i=0;i<around.length;i++){
         //around[i]=[0,0]
         var x=around[i][0]; //行
         var y=around[i][1];//列
         This.tds[x][y].className=cl[This.squares[x][y].value];

         if (This.squares[x][y].value==0) {
           //如果以某个格子为中心找到格子值为0，那就需要接着调用函数（递归）
          if(!This.tds[x][y].check){
            //给对应的td添加一个属性，这条属性用于决定这个格子有没有被找过
            This.tds[x][y].check=true;
            getAllZero(This.squares[x][y]);
           }
         } else{
           //如果以某个格子为中心找到的值不为0，则显示该数字
           This.tds[x][y].innerHTML=This.squares[x][y].value;
         }
       }

      }
      getAllZero(curSquare);
      }
          
    }else{
    //用户点击的是雷
    //console.log('你点到雷了')
    this.gameOver(obj);
    }
  }
  //表示用户点击的是右键
  if (ev.which==3) {
    //如果右击的是一个数字，那就不能点击
    if (obj.className && obj.className!='flag') {
      return;
    }
    obj.className=obj.className=='flag'?'':'flag';//切换class
    if(this.squares[obj.pos[0]][obj.pos[1]].type=='mine'){
    this.allRight=true;//用户标的小红旗背后都是雷

    }else{
      this.allRight=false;
    }
    if (obj.className=='flag') {
      this.mineNumDom.innerHTML=--this.surplusMine;
    }else{
      this.mineNumDom.innerHTML=++  this.surplusMine;
    }
    if (this.surplusMine==0) {
      //剩余的雷的数量为0表示用户已经标完小红旗了，然后判断游戏成功或者结束
      if(this.allRight){
      //证明游戏成功
      alert('恭喜你，游戏成功');
      }else{
        alert('游戏失败');
        this.gameOver();
      }
    }
  }

};
//游戏失败函数
Mine.prototype.gameOver=function(clickTd){
  /*
  1.显示所有的雷
  2.取消所有格子的点击事件
  3.给点中的雷标红
  */
 for(var i=0;i<this.tr;i++){
   for(var j=0;j<this.td;j++){
    if(this.squares[i][j].type=='mine'){
      this.tds[i][j].className='mine';
   }
   this.tds[i][j].onmousedown=null;
   }
 }
 if (clickTd) {
   clickTd.style.background='#f00';
 }
}
//添加上面button的功能
var btns=document.querySelectorAll('.level button');
var mine=null;
var ln=0;
var arr=[[9,9,10],[16,16,40],[28,28,99]]; //不同级别的行数和列数的级别
for (let i = 0; i < btns.length-1; i++) {
 btns[i].onclick=function(){
   btns[ln].className='';
   this.className='active';
   mine=new Mine(...arr[i]);
   mine.init();
   ln=i;
 }
  
}
btns[0].onclick(); //初始化一下
btns[3].onclick=function(){
  mine.init();
  
}

/*var mine= new Mine(28,28,99);
mine.init();*/
//console.log(mine.getAround(mine.squares[0][0]));