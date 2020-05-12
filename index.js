const { Engine, Render, Runner, World, Bodies } = Matter;

const vcells = 3;
const hcells = 3;
const width = 600;
const height = 600;

const engine = Engine.create();
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
	Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }),
	Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }),
	Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }),
	Bodies.rectangle(width, height / 2, 40, height, { isStatic: true })
];
World.add(world, walls);

// Maze Generation

const grid = Array(vcells).fill(null).map(() => Array(hcells).fill(false));

const verticals = Array(vcells).fill(null).map(() => Array(hcells - 1).fill(false));

const horizontals = Array(vcells - 1).fill(null).map(() => Array(hcells).fill(false));
