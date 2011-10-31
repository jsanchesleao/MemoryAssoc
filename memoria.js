Array.prototype.shuffle = function( level ){
	var _this = this;
	for( var i = 0; i < level; i++ ){
		var p1 = Math.round( Math.random() * ( _this.length - 1 ) );
		var p2 = Math.round( Math.random() * ( _this.length - 1 ) );

		var aux = _this[p1];
		_this[p1] = _this[p2];
		_this[p2] = aux;
	}
}

function Cell(x, y){
	this._x = x;
	this._y = y;
	this._flip = false;
	this._value = ""
	this._locked = false;
}

Cell.prototype = {
	attachTo : function(board, td){
		this._board = board;
		td.cell = this;
		this._td = td;
		var _this = this;
		td.onclick = function(){_this.onclick();};
		this.redraw();
	},
	onclick : function(){ 
		this._board.reveal( this._td );
	},
	toggleFlipped: function(){
		this._flip = !this._flip;
		this.redraw();
		return this._flip;
	},
	get flipped(){
		return this._flip; 
	},
	redraw: function(){
		this._td.className = this._td.className.replace(/(?:un)?flipped/, "");
		//this._td.innerHTML = (this._flip) ? this._value : "";
		var flipped = (this._flip) ? "flipped": "unflipped";
		this._td.className += " "+flipped;
		this._drawImage();
	},
	_drawImage: function(){
		var prefix = "./images/";
		var value = (this._value > 0) ? this._value : -this._value + '_';
		this._td.image.src = prefix + ( (this.flipped) ? "pic"+value+".jpg" : "unflipped.jpg" );
	},
	lock: function(){ this._locked = true; },
	get locked(){ return this._locked; },
	get value(){ return this._value; },
	set value(v){ this._value = v; }
}

function Board(xcells, ycells){
	this._xcells = xcells;
	this._ycells = ycells;
	this._try = [];		//registra quais cartas estao viradas numa tentativa de marcar um par.
	this._valueQueue = [];
	var t = xcells * ycells;
	if( t % 2 ) throw "impossivel criar jogo. numero impar de cartas";
	for( var i = 0; i < t/2; i++ ){ 
		var val = Math.round(  0.5 + i   ); 
		this._valueQueue.push(val); 
		this._valueQueue.push(-val); 
	}
	this._valueQueue.shuffle(100);
}


Board.prototype = {
	draw : function(div){
		var table = document.createElement("table");
		table.border=0;
		table.className = "boardgame";
		for( var i = 0; i < this._xcells; i++){
			var tr = document.createElement("tr");
			for( var j = 0; j < this._ycells; j++){
				var td = document.createElement("td");
				var img  = document.createElement("img");
				img.src = "./images/unflipped.jpg";
				td.appendChild(img);
				td.image = img;
				Board._generateCell(this, td, i, j);
				tr.appendChild(td);
			}
			table.appendChild(tr);
		}
		div.appendChild(table);

	},
	reveal: function(td){
		if( td.cell.flipped ) return;
		if( this._try.length < 2 ){
			this._try.push(td);
			td.cell.toggleFlipped();
		}
		if( this._try.length == 2 ){
			this.resolve();
		}
	},
	resolve: function(){
		var v1 = this._try[0].cell.value;
		var v2 = this._try[1].cell.value;
		if( v1 == -v2 ){
			this._try.pop().cell.lock();
			this._try.pop().cell.lock();
			return;
		}
		var _this = this;
		setTimeout(function(){ _this._try.pop().cell.toggleFlipped(); }, 700 );
		setTimeout(function(){ _this._try.pop().cell.toggleFlipped(); }, 400 );
	}
};


Board._generateCell = function(board, td, x, y){
	var cell = new Cell(x, y);
	cell.value = board._valueQueue.pop();
	cell.attachTo(board, td);
}
