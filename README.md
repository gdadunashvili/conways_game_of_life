# Conway's Game of Life

This is a simple tpescript implementaion of conways game of life.
I did it for fun to learn typescript.

[conways_game_of_life.webm](https://github.com/gdadunashvili/conways_game_of_life/assets/25377791/befea02b-bab6-4891-a369-eeac833f98b5)


## How to Build
To create a javascript file from source install
TypeScript, by running:
```
npm install -g typescript
```
and then run
```
tsc --project tsconfig.json
```
in the same folder as the `tsconfig.json` file.

In order to create a localhost server
run
```
python3 -m http.serve
```
in the same folder as the `index.html` file.
Note that `index.html` file relies on the javascript file, which is located in the same folder folder and generated during the
build step.

## working features
- drawing on the grid
- random initialization
- record video of the canvas
- expose canvas sizs to the user
- ereaser tooltip

## ToDo
- initialize from a selections of known configurations 
    - glider 
    - spaceship 
    ...

