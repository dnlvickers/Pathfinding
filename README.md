# Pathfinding
Pathfinding algorithm

In this program, I implement a modified version of the A* path finding algorithm. Primarily, I do not allow diagonal motion. Also, I do not update the f-score values after each iteration of the loop in order to make it run significantly faster, but there is a low possibility that my program does not find the shortest path; however it does it in much less time.

I also added in the ability for the user top adjust the dimensions of the map you path find around, as well as draw in their own obstacles for the algorithm to solve around. There is also a slider to adjust the weight that the path-finding function places on the distance from the origin. In theory, the f-weight being set to zero should have the algorith check the lest number of extrenuous squares, but it makes it less likely to find the shortest path to the end. Using a high f-weight would mean the reverse.

An example of the code can be found here: http://www.danieljvickers.com/path/