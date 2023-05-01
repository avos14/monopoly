function Square(index, name, price, color) {
	this.index = index;
	this.name = name;
	this.pricetext = price;
	if (index == 0)
		this.pricetext = "COLLECT $200 SALARY AS YOU PASS."
	this.color = color;
	this.owner = 0;
	this.price = (price || 0);
	this.baserent = (price*0.1);
	
	this.fromJson = function (jsn) {
		this.owner = jsn.owner;
	}
}

var square = [];

function Game() {
	var die1;
	var die2;
	var areDiceRolled = false;

	this.rollDice = function() {
		die1 = Math.floor(Math.random() * 6) + 1;
		die2 = Math.floor(Math.random() * 6) + 1;
		areDiceRolled = true;
	};

	this.resetDice = function() {
		areDiceRolled = false;
	};

	this.next = function() {
		if (areDiceRolled && doublecount === 0) {
			play();
		} else {
			roll();
		}
	};


	this.getDie = function(die) {
		if (die === 1) {
			return die1;
		} else {
			return die2;
		}
	};

	this.resign = function() {
		popup("<p>Are you sure you want to resign?</p>", game.bankruptcy, "Yes/No");
		endGame(3 - turn);
	};
	
	this.saveGame = function() {
		playerJson = JSON.stringify(player);
		localStorage.setItem("player", playerJson);
		localStorage.setItem("square", JSON.stringify(square));
		localStorage.setItem("turn", turn);
		localStorage.setItem("doublecount", doublecount);
		localStorage.setItem("selectedtheme", document.getElementById("gametheme").selectedIndex);
		popup("<p>Game saved</p>");
	};
}

function endGame(winningPlayerNum) {
	popup("<p>Congratulations, " + player[winningPlayerNum].name + ", you have won the game.</p><div>");
	document.getElementById("control").style.display = "none";
}

function loadGame() {
	selectedTheme = localStorage.getItem("selectedtheme");
	document.getElementById("gametheme").selectedIndex = selectedTheme;
	setup();
	playerJson = localStorage.getItem("player");
	console.log(playerJson);
	players = JSON.parse(playerJson);
	players.forEach (jsn => { player[jsn.index].fromJson(jsn); });
	squareJson = localStorage.getItem("square");
	squares = JSON.parse(squareJson);
	squares.forEach (jsn => { square[jsn.index].fromJson(jsn); });
	turn = localStorage.getItem("turn");
	doublecount = localStorage.getItem("doublecount");
	updatePosition();
	updateMoney();
	updateOwned();
};

var game;

function Player(name, color) {
	this.name = name;
	this.color = color;
	this.position = 0;
	e = document.getElementById("initialmoney");
	this.money = e.options[e.selectedIndex].text;
	this.creditor = -1;

	this.pay = function (amount, creditor) {
		if (amount <= this.money) {
			this.money -= amount;
			updateMoney();
		} else {
			endGame(3 - this.index);
		}
	};
	this.fromJson = function(jsn) {
		this.name = jsn.name;
		this.color = jsn.color;
		this.position = jsn.position;
		this.money = jsn.money;
		this.creditor =jsn.creditor;
	}
}

// paramaters:
// initiator: object Player
// recipient: object Player
// money: integer, positive for offered, negative for requested
// property: array of integers, length: 20

var player = [];
var pcount = 2;
var turn = 0, doublecount = 0;
// Overwrite an array with numbers from one to the array's length in a random order.
Array.prototype.randomize = function(length) {
	length = (length || this.length);
	var num;
	var indexArray = [];

	for (var i = 0; i < length; i++) {
		indexArray[i] = i;
	}

	for (var i = 0; i < length; i++) {
		// Generate random number between 0 and indexArray.length - 1.
		num = Math.floor(Math.random() * indexArray.length);
		this[i] = indexArray[num] + 1;

		indexArray.splice(num, 1);
	}
};

function addAlert(alertText) {
	$alert = $("#alert");

	$(document.createElement("div")).text(alertText).appendTo($alert);

	// Animate scrolling down alert element.
	$alert.stop().animate({"scrollTop": $alert.prop("scrollHeight")}, 1000);

}

function popup(HTML, action, option) {
	document.getElementById("popuptext").innerHTML = HTML;
	document.getElementById("popup").style.width = "300px";
	document.getElementById("popup").style.top = "0px";
	document.getElementById("popup").style.left = "0px";

	if (!option && typeof action === "string") {
		option = action;
	}

	option = option ? option.toLowerCase() : "";

	if (typeof action !== "function") {
		action = null;
	}

	// Yes/No
	if (option === "yes/no") {
		document.getElementById("popuptext").innerHTML += "<div><input type=\"button\" value=\"Yes\" id=\"popupyes\" /><input type=\"button\" value=\"No\" id=\"popupno\" /></div>";

		$("#popupyes, #popupno").on("click", function() {
			$("#popupwrap").hide();
			$("#popupbackground").fadeOut(400);
		});

		$("#popupyes").on("click", action);

	// Ok
	} else if (option !== "blank") {
		$("#popuptext").append("<div><input type='button' value='OK' id='popupclose' /></div>");
		$("#popupclose").focus();

		$("#popupclose").on("click", function() {
			$("#popupwrap").hide();
			$("#popupbackground").fadeOut(400);
		}).on("click", action);

	}

	// Show using animation.
	$("#popupbackground").fadeIn(400, function() {
		$("#popupwrap").show();
	});

}

function updatePosition() {
	// Reset borders
	for (var i = 0; i < 20; i++) {
		document.getElementById("cell" + i).style.border = "1px solid black";
		cell = document.getElementById("cell" + i + "positionholder");
		cell.innerHTML = "";
		img = cell.appendChild(document.createElement("img"));
		img.src = stations[i].imagepng;
		img.width = 130;
		img.height = 85;
	}

	var sq, left, top;

	for (var x = 0; x < 20; x++) {
		sq = square[x];
		left = 0;
		top = 0;

		for (var y = turn; y <= pcount; y++) {

			if (player[y].position == x)  {

				document.getElementById("cell" + x + "positionholder").innerHTML += "<div class='cell-position' title='" + player[y].name + "' style='background-color: " + player[y].color + "; left: " + left + "px; top: " + top + "px;'></div>";
				if (left == 36) {
					left = 0;
					top = 12;
				} else
					left += 12;
			}
		}

		for (var y = 1; y < turn; y++) {

			if (player[y].position == x)  {
				document.getElementById("cell" + x + "positionholder").innerHTML += "<div class='cell-position' title='" + player[y].name + "' style='background-color: " + player[y].color + "; left: " + left + "px; top: " + top + "px;'></div>";
				if (left == 36) {
					left = 0;
					top = 12;
				} else
					left += 12;
			}
		}
	}

	left = 0;
	top = 53;
	
	p = player[turn];

	document.getElementById("cell" + p.position).style.border = "1px solid " + p.color;

}

function updateMoney() {
	var p = player[turn];

	document.getElementById("pmoney").innerHTML = "$" + p.money;
	$(".money-bar-row").hide();

	for (var i = 1; i <= pcount; i++) {
		p_i = player[i];

		$("#moneybarrow" + i).show();
		document.getElementById("p" + i + "moneybar").style.border = "2px solid " + p_i.color;
		document.getElementById("p" + i + "money").innerHTML = p_i.money;
		document.getElementById("p" + i + "moneyname").innerHTML = p_i.name;
	}
	// show("moneybarrow9"); // Don't remove this line or make the first for-loop stop when i <= 8, because this affects how the table is displayed.

	if (document.getElementById("landed").innerHTML === "") {
		$("#landed").hide();
	}

	quickstats = document.getElementById("quickstats");
	quickstats.style.borderColor = p.color;

	$("#resignbutton").show();
	$("#nextbutton").show();
}

function updateDice() {
	var die0 = game.getDie(1);
	var die1 = game.getDie(2);

	$("#die0").show();
	$("#die1").show();

	if (document.images) {
		var element0 = document.getElementById("die0");
		var element1 = document.getElementById("die1");

		element0.classList.remove("die-no-img");
		element1.classList.remove("die-no-img");

		element0.title = "Die (" + die0 + " spots)";
		element1.title = "Die (" + die1 + " spots)";

		if (element0.firstChild) {
			element0 = element0.firstChild;
		} else {
			element0 = element0.appendChild(document.createElement("img"));
		}

		element0.src = "images/Die_" + die0 + ".png";
		element0.alt = die0;

		if (element1.firstChild) {
			element1 = element1.firstChild;
		} else {
			element1 = element1.appendChild(document.createElement("img"));
		}

		element1.src = "images/Die_" + die1 + ".png";
		element1.alt = die0;
	} else {
		document.getElementById("die0").textContent = die0;
		document.getElementById("die1").textContent = die1;

		document.getElementById("die0").title = "Die";
		document.getElementById("die1").title = "Die";
	}
}

function updateOwned() {
	var p = player[turn];
	var checkedproperty = getCheckedProperty();
	$("#option").show();
	$("#owned").show();

	var HTML = "",
	firstproperty = -1;

	var sq;

	for (var i = 0; i < 20; i++) {
		sq = square[i];
		if (sq.owner === 0) {
			$("#cell" + i + "owner").hide();
		} else if (sq.owner > 0) {
			var currentCellOwner = document.getElementById("cell" + i + "owner");

			currentCellOwner.style.display = "block";
			currentCellOwner.style.backgroundColor = player[sq.owner].color;
			currentCellOwner.title = player[sq.owner].name;
		}
	}


}

//function updateOption() {
//	$("#option").show();

//	var checkedproperty = getCheckedProperty();

//	if (checkedproperty < 0 || checkedproperty >= 20) {
//		for (var i = 0; i < 20; i++) {
//			s = square[i];
//		}

//		return;
//	}
//}

function addamount(amount, cause) {
	var p = player[turn];

	p.money += amount;

	addAlert(p.name + " received $" + amount + " from " + cause + ".");
}

function subtractamount(amount, cause) {
	var p = player[turn];

	p.pay(amount, 0);

	addAlert(p.name + " lost $" + amount + " from " + cause + ".");
}

function advance(destination, pass) {
	var p = player[turn];

	if (typeof pass === "number") {
		if (p.position < pass) {
			p.position = pass;
		} else {
			p.position = pass;
			p.money += 200;
			addAlert(p.name + " collected a $200 salary for passing GO.");
		}
	}
	if (p.position < destination) {
		p.position = destination;
	} else {
		p.position = destination;
		p.money += 200;
		addAlert(p.name + " collected a $200 salary for passing GO.");
	}

	land();
}

function showStats() {
	var HTML, sq, p;
	var write;
	HTML = "<table align='center'><tr>";

	for (var x = 1; x <= pcount; x++) {
		write = false;
		p = player[x];
		if (x == 5) {
			HTML += "</tr><tr>";
		}
		HTML += "<td class='statscell' id='statscell" + x + "' style='border: 2px solid " + p.color + "' ><div class='statsplayername'>" + p.name + "</div>";

		for (var i = 0; i < 20; i++) {
			sq = square[i];

			if (sq.owner == x) {

				if (!write) {
					write = true;
					HTML += "<table>";
				}
				HTML += "<tr><td class='statscellcolor' style='background: " + sq.color + ";";
				HTML += " border: 1px solid grey;";
				HTML += "></td><td class='statscellname' >" + sq.name + "</td></tr>";
			}
		}

		if (!write) {
			HTML += p.name + " dosen't have any properties.";
		} else {
			HTML += "</table>";
		}

		HTML += "</td>";
	}
	HTML += "</tr></table>";

	document.getElementById("statstext").innerHTML = HTML;
	// Show using animation.
	$("#statsbackground").fadeIn(400, function() {
		$("#statswrap").show();
	});
}

function buy() {
	var p = player[turn];
	var property = square[p.position];
	var cost = property.price;

	if (p.money >= cost) {
		p.pay(cost, 0);

		property.owner = turn;
		updateMoney();
		addAlert(p.name + " bought " + property.name + " for " + property.pricetext + ".");

		updateOwned();

		$("#landed").hide();

	} else {
		popup("<p>" + p.name + ", you need $" + (property.price - p.money) + " more to buy " + property.name + ".</p>");
	}
}

function land() {
	
	var p = player[turn];
	var s = square[p.position];

	var die1 = game.getDie(1);
	var die2 = game.getDie(2);

	$("#landed").show();
	document.getElementById("landed").innerHTML = "You landed on " + s.name + ".";
	s.landcount++;
	addAlert(p.name + " landed on " + s.name + ".");

	// Allow player to buy the property on which he landed.
	if (s.price !== 0 && s.owner === 0) {
		document.getElementById("landed").innerHTML = "<div>You landed on " + s.name + ".<input type='button' onclick='buy();' value='Buy ($" + s.price + ")' title='Buy " + s.name + " for " + s.pricetext + ".'/></div>";
	}

	// Collect rent
	if (s.owner !== 0 && s.owner != turn ) {
		var rent = s.baserent;

		addAlert(p.name + " paid $" + rent + " rent to " + player[s.owner].name + ".");
		p.pay(rent, s.owner);
		player[s.owner].money += rent;

		document.getElementById("landed").innerHTML = "You landed on " + s.name + ". " + player[s.owner].name + " collected $" + rent + " rent.";
	}

	updateMoney();
	updatePosition();
	updateOwned();
}

function roll() {
	var p = player[turn];

	$("#option").hide();
	$("#buy").show();
	$("#manage").hide();

	document.getElementById("nextbutton").focus();
	document.getElementById("nextbutton").value = "End turn";
	document.getElementById("nextbutton").title = "End turn and advance to the next player.";

	game.rollDice();
	var die1 = game.getDie(1);
	var die2 = game.getDie(2);

	doublecount++;

	if (die1 == die2) {
		addAlert(p.name + " rolled " + (die1 + die2) + " - doubles.");
	} else {
		addAlert(p.name + " rolled " + (die1 + die2) + ".");
	}

	if (die1 == die2) {
		updateDice(die1, die2);

		if (doublecount < 3) {
			document.getElementById("nextbutton").value = "Roll again";
			document.getElementById("nextbutton").title = "You threw doubles. Roll again.";

		// If player rolls doubles three times in a row,  pay 20$ fine
		} else if (doublecount === 3) {
			p.money -= 20;
			doublecount = 0;
			addAlert(p.name + " rolled doubles three times in a row.");
			updateMoney();

			popup("You rolled doubles three times in a row. you neet to pay 20$ fine");

			return;
		}
	} else {
		document.getElementById("nextbutton").value = "End turn";
		document.getElementById("nextbutton").title = "End turn and advance to the next player.";
		doublecount = 0;
	}

	updatePosition();
	updateMoney();
	updateOwned();
	
	updateDice(die1, die2);

	// Move player
	p.position += die1 + die2;

	// Collect $200 salary as you pass GO
	if (p.position >= 20) {
		p.position -= 20;
		p.money += 200;
		addAlert(p.name + " collected a $200 salary for passing GO.");
	}

	land();
	
}

function play() {
	turn++;
	if (turn > pcount) {
		turn -= pcount;
	}

	var p = player[turn];
	game.resetDice();

	document.getElementById("pname").innerHTML = p.name;

	addAlert("It is " + p.name + "'s turn.");

	// Check for bankruptcy.
	p.pay(0, p.creditor);

	$("#landed, #option, #manage").hide();
	$("#board, #control, #moneybar, #viewstats, #buy").show();

	doublecount = 0;
	document.getElementById("nextbutton").focus();
	document.getElementById("nextbutton").value = "Roll Dice";
	document.getElementById("nextbutton").title = "Roll the dice and move your token accordingly.";

	$("#die0").hide();
	$("#die1").hide();

	updateMoney();
	updatePosition();
	updateOwned();

	$(".money-bar-arrow").hide();
	$("#p" + turn + "arrow").show();
}

function setup() {

	selectedTheme = 0
	if (document.getElementById("gametheme").selectedIndex == 1)
		selectedTheme = 1;

	if (selectedTheme == 0){
		stations = theme1_stations;
		document.getElementById("board").style.backgroundImage ="url('images/soccer1.jpg')"
	}else {
		stations = theme2_stations;
		document.getElementById("board").style.backgroundImage = "url('images/music-colour-splash.jpg')";
	}

	// init squares
	for (var i = 0; i < 20; i++) {
		square[i] = new Square(i, stations[i].name, stations[i].price, stations[i].color);
	}

	var currentCell;
	var currentCellAnchor;
	var currentCellPositionHolder;
	var currentCellName;
	var currentCellOwner;

	for (var i = 0; i < 20; i++) {
		s = square[i];

		currentCell = document.getElementById("cell" + i);

		currentCellAnchor = currentCell.appendChild(document.createElement("div"));
		currentCellAnchor.id = "cell" + i + "anchor";
		currentCellAnchor.className = "cell-anchor";

		currentCellPositionHolder = currentCellAnchor.appendChild(document.createElement("div"));
		currentCellPositionHolder.id = "cell" + i + "positionholder";
		currentCellPositionHolder.className = "cell-position-holder";

		currentCellName = currentCellAnchor.appendChild(document.createElement("div"));
		currentCellName.id = "cell" + i + "name";
		currentCellName.className = "cell-name";
		currentCellName.textContent = s.name;

//todo: not allow to but "start" square
		currentCellOwner = currentCellAnchor.appendChild(document.createElement("div"));
		currentCellOwner.id = "cell" + i + "owner";
		currentCellOwner.className = "cell-owner";
	}

	var playerArray = new Array(pcount);
	var p;

	playerArray.randomize();

	for (var i = 1; i <= pcount; i++) {
		p = player[playerArray[i - 1]];
		p.color = document.getElementById("player" + i + "color").value.toLowerCase();
		p.name = document.getElementById("player" + i + "name").value;
		p.money = document.getElementById("initialmoney").value;
	}

	$("#board, #moneybar").show();
	$("#setup").hide();

	document.getElementById("stats").style.width = "454px";
	document.getElementById("stats").style.top = "0px";
	document.getElementById("stats").style.left = "0px";

	play();
}

function getCheckedProperty() {
	for (var i = 0; i < 22; i++) {
		if (document.getElementById("propertycheckbox" + i) && document.getElementById("propertycheckbox" + i).checked) {
			return i;
		}
	}
	return -1; // No property is checked.
}

window.onload = function() {
	game = new Game();
	
	for (var i = 0; i <= 2; i++) {
		player[i] = new Player("", "");
		player[i].index = i;
	}
	
	player[0].name = "the bank";

	for (var i = 1; i <= pcount; i++) {
		$("#player" + i + "input").show();
	}

	$("#nextbutton").click(game.next);
	$("#noscript").hide();
	$("#setup, #noF5").show();

	var drag, dragX, dragY, dragObj, dragTop, dragLeft;

	document.getElementById("statsdrag").onmousedown = function(e) {
		dragObj = document.getElementById("stats");
		dragObj.style.position = "relative";

		dragTop = parseInt(dragObj.style.top, 10) || 0;
		dragLeft = parseInt(dragObj.style.left, 10) || 0;

		if (window.event) {
			dragX = window.event.clientX;
			dragY = window.event.clientY;
		} else if (e) {
			dragX = e.clientX;
			dragY = e.clientY;
		}

		drag = true;
	};

	document.getElementById("popupdrag").onmousedown = function(e) {
		dragObj = document.getElementById("popup");
		dragObj.style.position = "relative";

		dragTop = parseInt(dragObj.style.top, 10) || 0;
		dragLeft = parseInt(dragObj.style.left, 10) || 0;

		if (window.event) {
			dragX = window.event.clientX;
			dragY = window.event.clientY;
		} else if (e) {
			dragX = e.clientX;
			dragY = e.clientY;
		}

		drag = true;
	};

	$("#viewstats").on("click", showStats);
	$("#statsclose, #statsbackground").on("click", function() {
		$("#statswrap").hide();
		$("#statsbackground").fadeOut(400);
	});

	$("#info").click(function() {
		$("#buy").show();
		$("#manage").hide();

		// Scroll alerts to bottom.
		$("#alert").scrollTop($("#alert").prop("scrollHeight"));
	});

	$("#manage-menu-item").click(function() {
		$("#manage").show();
		$("#buy").hide();
	});

};
