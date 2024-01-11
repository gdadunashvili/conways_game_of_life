# Conway's Game of Life

This is a simple TypeScript implementation of Conways Game of Life.
I did it for fun to learn typescript.

[conways_game_of_life.webm](https://github.com/gdadunashvili/conways_game_of_life/assets/25377791/befea02b-bab6-4891-a369-eeac833f98b5)

## How to try it without building

You can see the deployed game on this GitHub-pages
[site](https://gdadunashvili.github.io/conways_game_of_life/).

## How to Build
To create a javascript file from the source, install TypeScript by running:
```
npm install -g typescript
```
and then run
```
tsc --project tsconfig.json
```
in the same folder as the `tsconfig.json` file.

To create a localhost server
run
```
python3 -m http.serve
```
in the same folder as the `index.html` file.
Note that the `index.html` file relies on the javascript file, which is located in the same folder folder and generated during the
build step.

## Working features
- drawing on the grid
- random initialization
- record a video of the canvas
- expose canvas size to the user
- eraser tooltip

## ToDo
- initialize from a selection of known configurations 
    - glider 
    - spaceship 
    ...

