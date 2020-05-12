const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cell = 10;
const vcells = cell;
const hcells = cell;
const width = 600;
const height = 600;

const unitLength = width / vcells;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		wireframes: true,
		width,
		height
	}
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
	Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
	Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
	Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
	Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
];
World.add(world, walls);

// Maze Generation

const shuffel = (arr) => {
	let counter = arr.length;

	while (counter > 0) {
		const index = Math.floor(Math.random() * counter);

		counter--;

		const temp = arr[counter];
		arr[counter] = arr[index];
		arr[index] = temp;
	}

	return arr;
};

const grid = Array(vcells).fill(null).map(() => Array(hcells).fill(false));

const verticals = Array(vcells).fill(null).map(() => Array(hcells - 1).fill(false));

const horizontals = Array(vcells - 1).fill(null).map(() => Array(hcells).fill(false));

const startRow = Math.floor(Math.random() * vcells);
const startColumn = Math.floor(Math.random() * hcells);

const stepThroughCell = (row, column) => {
	// If I have visted the cell at [row, column], then return.
	if (grid[row][column]) {
		return;
	}

	// Mark this cell as being visited
	grid[row][column] = true;

	// Assemble randomly-ordered list of neighbors
	const neighbors = shuffel([
		[ row - 1, column, 'up' ],
		[ row, column + 1, 'right' ],
		[ row + 1, column, 'down' ],
		[ row, column - 1, 'left' ]
	]);

	// For each neighbor...
	for (let neighbor of neighbors) {
		const [ nextRow, nextColumn, direction ] = neighbor;

		// See if that neighbor is out of bounds
		if (nextRow < 0 || nextRow >= vcells || nextColumn < 0 || nextColumn >= hcells) {
			continue;
		}

		// If we have visted that neighbor, continue to next neighbor
		if (grid[nextRow][nextColumn]) {
			continue;
		}

		// Remoce a wall from either horizontals or verticals
		if (direction === 'left') {
			verticals[row][column - 1] = true;
		} else if (direction === 'right') {
			verticals[row][column] = true;
		} else if (direction === 'up') {
			horizontals[row - 1][column] = true;
		} else if (direction === 'down') {
			horizontals[row][column] = true;
		}

		stepThroughCell(nextRow, nextColumn);
	}

	// Visit that next cell
};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
	row.forEach((open, columnIndex) => {
		if (open) {
			return;
		}

		const wall = Bodies.rectangle(
			columnIndex * unitLength + unitLength / 2,
			rowIndex * unitLength + unitLength,
			unitLength,
			5,
			{
				label: 'wall',
				isStatic: true
			}
		);
		World.add(world, wall);
	});
});

verticals.forEach((row, rowIndex) => {
	row.forEach((open, columnIndex) => {
		if (open) {
			return;
		}

		const wall = Bodies.rectangle(
			columnIndex * unitLength + unitLength,
			rowIndex * unitLength + unitLength / 2,
			5,
			unitLength,
			{
				label: 'wall',
				isStatic: true
			}
		);
		World.add(world, wall);
	});
});

// Goal

const goal = Bodies.rectangle(width - unitLength / 2, height - unitLength / 2, unitLength * 0.5, unitLength * 0.5, {
	label: 'goal',
	isStatic: true
});
World.add(world, goal);

// Ball

const ball = Bodies.circle(unitLength / 2, unitLength / 2, unitLength * 0.25, { label: 'ball' });
World.add(world, ball);

document.addEventListener('keydown', (e) => {
	const { x, y } = ball.velocity;

	if (e.keyCode === 87 || e.keyCode === 38) {
		Body.setVelocity(ball, { x, y: y - 5 });
	}

	if (e.keyCode === 68 || e.keyCode === 39) {
		Body.setVelocity(ball, { x: x + 5, y });
	}

	if (e.keyCode === 83 || e.keyCode === 40) {
		Body.setVelocity(ball, { x, y: y + 5 });
	}

	if (e.keyCode === 65 || e.keyCode === 37) {
		Body.setVelocity(ball, { x: x - 5, y });
	}
});

// Win Condition

Events.on(engine, 'collisionStart', (e) => {
	e.pairs.forEach((collision) => {
		const labels = [ 'ball', 'goal' ];

		if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
			world.gravity.y = 1;
			world.bodies.forEach((body) => {
				if (body.label === 'wall') {
					Body.setStatic(body, false);
				}
			});
		}
	});
});
