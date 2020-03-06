//initialization of all global variables
var canvas, ctx, start, end;
var map = [];
var walls = [];
var squareSize = 10;
var mapBlueprint = [];
var drawMode = 1;
var mouseDown = false;
var fWeight = 0.5

//load the canvas with the map when we load the page
document.addEventListener('DOMContentLoaded',function(){
	console.log('DOM Ready');
	canvas = document.getElementById('gameCanvas');
	ctx = canvas.getContext('2d');

	//generate the map that they will draw on
	generate_map();
});

document.onkeypress = function(e) {
	e.preventDefault();
	if (e.keyCode == 32) {
		//find path on 'space bar'
		find_path();
	} else if (e.keyCode == 114) {
		//reset the program map if they press 'r'
		generate_map();
	} else if (e.keyCode == 119) {
		//draw walls on 'w'
		drawMode = 1;
	} else if (e.keyCode == 115) {
		//move start on 's'
		drawMode = 2;
	} else if (e.keyCode == 97) {
		//move end on 'a'
		drawMode = 3;
	} else if (e.keyCode == 100) {
		//delete walls on 'd'
		drawMode = 0;
	}
}

function mouse_down(event) {
	//mark that the mouse has been clicked, and draw on that square
	mouseDown = true;
	mouse_draw(event);
	console.log(event);
}

function mouse_up() {
	//remove the marker showing the mouse was clicked
	mouseDown = false;
}

function mouse_draw(e) {
	//check if we are holding down the mouse
	if (mouseDown) {
		//get the x and y coords in terms of my map from the mouse
		var mouseX = Math.floor((e.layerX)/squareSize);
		var mouseY = Math.floor((e.layerY)/squareSize);
		var mouseCoords = [mouseX,mouseY];

		//make sure we are not selecting a region outside
		if (mouseX < map.length - 1 && mouseX > 0 && mouseY < map[0].length - 1 && mouseY > 0) {
			//detect which draw mode we are in to see what we draw
			switch (drawMode) {
				case 0:
					//if we are in delete mode, delete anything that is included in the list of wall objects
					if (list_includes(walls,mouseCoords)) {
						for (var i = 0; i < walls.length; i++) {
							if (same_points(walls[i],mouseCoords)) {
								walls.splice(i,1);
							}
						}
						map[mouseX][mouseY].fillColor = 'white';
						map[mouseX][mouseY].draw();
					}
					break;
				case 1:
					//if we are in wall draw mode, draw a wall if the selected point is empty
					if (!list_includes(walls,mouseCoords) && !same_points(start,mouseCoords) && !same_points(end,mouseCoords)) {
						walls.push(mouseCoords);
						map[mouseX][mouseY].fillColor = 'black';
						map[mouseX][mouseY].draw();
					}
					break;
				case 2:
					//make sure that I am not placing the end and start on top of each other. Then move the start and recolor
					if (!same_points(end,mouseCoords)) {
						map[start[0]][start[1]].fillColor = 'white';
						map[start[0]][start[1]].draw()
						map[mouseX][mouseY].fillColor = 'blue';
						map[mouseX][mouseY].draw()
						start = mouseCoords;
						for (var i = 0; i < walls.length; i++) {
							if (same_points(start,walls[i])) {
								walls.splice(i,1);
								break;
							}
						}
					}
					break;
				case 3:
					//Performing same check for end as I did with start (case 2)
					if (!same_points(start,mouseCoords)) {
						map[end[0]][end[1]].fillColor = 'white';
						map[end[0]][end[1]].draw()
						map[mouseX][mouseY].fillColor = 'gold';
						map[mouseX][mouseY].draw()
						end = mouseCoords;
						for (var i = 0; i < walls.length; i++) {
							if (same_points(end,walls[i])) {
								walls.splice(i,1);
								break;
							}
						}
					}
					break;
				default:
					//how did you do that? Shouldn't be able to get into any other draw mode.
					console.log('How did you do that?')
			}
		}
	}
}

class Rectangle {
	constructor (x = 0, y = 0, width = 50, height = 50, fillColor = 'white') {
		this.x = Number(x);
		this.y = Number(y);
		this.width = Number(width);
		this.height = Number(height);
		this.fillColor = fillColor;
		this.toStart,this.toEnd;
		this.fscore;
	}
	draw() {
		//draw rectangle based on it's own color
		ctx.beginPath();
		ctx.fillStyle = this.fillColor;
		ctx.lineWidth = '0.4';
		ctx.strokeStyle = 'grey';
		ctx.rect(this.x*this.width,this.y*this.height,this.width,this.height);
		ctx.fill();
		ctx.stroke();
	}
	update_fscore() {
		//find the 'fscore' which tells us how likely we are to pick this square. the fweight determins how sure we want to have the shortest path drawn.
		//fWeight = 1 means that we are garunteed to find the shortest path, //fWeight = 0 should check less total squares
		this.fscore = fWeight*this.toStart + this.toEnd;
	}
}

function generate_map () {
	//we start by getting teh dimentions of our map and resetting out wall list, start and end points. Also confirm that square size was a valid value
	squareSize = document.getElementById('pixelSize').value
	//if the square size the chose is invalid, default to 25
	if (squareSize < 1 || squareSize > canvas.height || squareSize > canvas.width) {
		squareSize = 25;
	}

	var x = Math.floor(canvas.width/squareSize);
	var y = Math.floor(canvas.height/squareSize);
	walls = [];
	start = [1,1];
	end = [x - 2,y - 2];

	//begin generating the map. Leave it empty, and we will load in rows of x and y squares
	map = [];
	for (var i = 0; i < x; i++) {
		var row = [];
		for (var j = 0; j < y; j++) {
			var color;
			//find out what type of square it is, and color it appropriately
			if (i == 0 || i == x - 1 || j == 0 || j == y - 1) {
				color = 'black';
				walls.push([i,j]);
			} else if (same_points(start,[i,j])) {
				color = 'blue'
			} else if (same_points(end,[i,j])) {
				color = 'gold'
			} else {
				color = 'white';
			}
			//add the square to our map and draw it
			row.push(new Rectangle(i,j,squareSize,squareSize,color));
			row[j].draw();
		}
		map.push(row);
	}
	return;
}

function get_neighbors(coordinate) {
	//returns the list of neighboring coordinates for a particular coordinate pair given
	x = coordinate[0];
	y = coordinate[1];
	var neighbors=[[x + 1,y]];
	neighbors.push([x - 1,y]);
	neighbors.push([x,y + 1]);
	neighbors.push([x,y - 1]);
	return neighbors
}

function get_distance(point1,point2) {
	//calculates the pythagorean distance between two sqaures. Used to find end distace
	return Math.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)
}

function same_points(points1,points2) {
	//a quick boolean retrned if the two sets of coordinates are the same
	if (points1[0] == points2[0] && points1[1] == points2[1]) {
		return true;
	} else {
		return false;
	}
}

function list_includes(list,element) {
	//checks if the 'list' contains the coordinate 'element'
	contained = false;
	for (var i = 0; i < list.length; i++) {
		if (list[i][0] == element[0] && list[i][1] == element[1]) {
			contained = true;
		}
	}
	return contained;
}

function find_path() {
	//create a new boundary and checked-elemnt list for reference
	var boundary = [start];
	var checked = [];
	var finalPath = [];

	//get the fWeight from the console
	fWeight = document.getElementById('fWeight').value / 100;

	//I need to erase any previous coloring done if we have already found a path on the same map
	for (var x = 0; x < map.length; x++) {
		for (var y = 0; y < map[x].length; y++) {
			if (!list_includes(walls,[x,y]) && !same_points(start,[x,y]) && !same_points(end,[x,y])) {
				map[x][y].fillColor = 'white';
				map[x][y].draw();
			}
		}
	}

	//initialize my calculations for counting fscore values
	map[start[0]][start[1]].toStart = 0;
	map[start[0]][start[1]].toEnd = get_distance(start,end);
	map[start[0]][start[1]].update_fscore();
	var foundPath = false;

	//start searching for a path. Keep going until you find the end block
	while (!foundPath) {
		//Usually for A* path finding, you would be updating the fscores of all the checked points to ensure that
		//they have appropriate values. I moved this to the end to make it run MUCH faster on larger maps, but
		//that means I am risking not necessarily finding the shortest path, although that chence is low. I
		//simply re-calculate these values once I have found the end.

		//check if the boundary is empty. If it is, there are no more points to check
		if (boundary.length == 0) {
			console.log('No path found');
			break;
		}

		//now we check the lowest fscore of the squares in the boundary. This will be the next square we check
		var lowestScore = canvas.width*canvas.height + 1;
		var nextPointIndex = 0;
		for (var i = 0; i < boundary.length; i++) {
			//check if they have the lowest score yet
			if (map[boundary[i][0]][boundary[i][1]].fscore < lowestScore){
				lowestScore = map[boundary[i][0]][boundary[i][1]].fscore;
				nextPointIndex = i;
			}
		}
		nextPoint = boundary[nextPointIndex];

		//add this to the list of checked points,remove it from the boundary, and check if this point is the end, if so, we are done
		checked.push(nextPoint);
		boundary.splice(nextPointIndex,1);
		if (same_points(end,nextPoint)) {
			finalPath.push(nextPoint);
			found = true;
			break;
		}

		//since it is not the end, we now recolor it to show the checked region		
		if (!same_points(start,nextPoint)) {
			map[nextPoint[0]][nextPoint[1]].fillColor = 'red';
			map[nextPoint[0]][nextPoint[1]].draw();
		}

		//now we get the neighbors and check if they should be added to the list
		var neighbors = get_neighbors(nextPoint);
		//go ahread and grab the previous toStart value so that we can update the new points
		var previousToStart = map[nextPoint[0]][nextPoint[1]].toStart;
		for (var i = 0; i < 4 && !foundPath; i++) {
			var possibleNeighbor = neighbors[i];
			//make sure the possible new boundary points isn't a wall, already a boundary point, or already checked
			if (!list_includes(checked,possibleNeighbor) && !list_includes(boundary,possibleNeighbor) && !list_includes(walls,possibleNeighbor)) {
				if (same_points(end,possibleNeighbor)) {
					foundPath = true;
					finalPath.push(end);
					break;
				}
				//calculate the new scores for these points if it isn't the end point
				boundary.push(possibleNeighbor);
				map[possibleNeighbor[0]][possibleNeighbor[1]].toStart = previousToStart + 1;
				map[possibleNeighbor[0]][possibleNeighbor[1]].toEnd = get_distance(possibleNeighbor,end);
				map[possibleNeighbor[0]][possibleNeighbor[1]].update_fscore();
			}
		}
	}

	//update the f-score of all previously checked values, runs until no updates needed
	var didUpadate = true;
	while (didUpadate) {
		//set the update value to false, and only update again if the scores still haven't all updated
		didUpadate = false;
		for (var i = 0; i < checked.length; i++) {
			//we are going to pull out the neighbors and compare scores
			var neighbors = get_neighbors(checked[i]);
			for (var j = 0; j < 4; j++) {
				//make sure this neighbor is in the checked region
				if (list_includes(checked,neighbors[j])) {
					//if we look at another neighbor and our score is > their score + 1, then our score changes
					var neighboringRectangle = map[neighbors[j][0]][neighbors[j][1]];
					if (map[checked[i][0]][checked[i][1]].toStart > 1 + neighboringRectangle.toStart) {
						map[checked[i][0]][checked[i][1]].toStart = 1 + neighboringRectangle.toStart;
						map[checked[i][0]][checked[i][1]].update_fscore()
						didUpadate = true;
					}
				}
			}
		}
	}


	//now that we have the end point, we just work backwards with the lowest tostart values. Make sure that our points aren't next to each other
	var reachedStart = true;
	if (checked.length > 1) {
		reachedStart = false;
	}
	while (!reachedStart) {
		//get the neighbors of the last element checked
		var neighbors = get_neighbors(finalPath[finalPath.length - 1]);
		var lowScoreIndex = 0;
		var lowestScore = canvas.width*canvas.height + 1;
		//find the lowest score of the neighbors
		for (var i = 0; i < 4; i++) {
			if (list_includes(checked,neighbors[i]) && !list_includes(finalPath,neighbors[i])) {
				if (map[neighbors[i][0]][neighbors[i][1]].toStart < lowestScore) {
					lowestScore = map[neighbors[i][0]][neighbors[i][1]].toStart;
					lowScoreIndex = i;
				}
			}
		}
		var newPoint = neighbors[lowScoreIndex];

		//see if that is the start, else add it to the path, draw it in green, and continue
		if (same_points(newPoint,start)) {
			reachedStart = true;
			break
		} else {
			map[neighbors[lowScoreIndex][0]][neighbors[lowScoreIndex][1]].fillColor = 'green';
			map[neighbors[lowScoreIndex][0]][neighbors[lowScoreIndex][1]].draw();
			finalPath.push(newPoint)
		}
	}
}