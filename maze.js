'use strict';

function shuffle (array) {
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

/* eslint-disable-next-line no-unused-vars */
class Maze {
	constructor ({ height, width }) {
		this.maze = Array.from({ length: 2 * height + 1 }).map(() => Array.from({ length: 2 * width + 1 }).fill(1));
		const stack = [[1, 1]];
		// Generate closed maze
		while (stack.length) {
			const last = stack[stack.length - 1];
			const next = shuffle(this._neighbors(...last));
			let flag = false;
			for (let dir of next) {
				if (flag) break;
				let x, y;
				switch (dir) {
					/* eslint-disable array-bracket-spacing, no-multi-spaces, max-statements-per-line */
					case 'D': [x, y] = [ 1,  0]; break;
					case 'U': [x, y] = [-1,  0]; break;
					case 'R': [x, y] = [ 0,  1]; break;
					case 'L': [x, y] = [ 0, -1]; break;
					/* eslint-enable array-bracket-spacing, no-multi-spaces, max-statements-per-line */
					default: break;
				}
				if (this.maze[last[0] + 2 * x][last[1] + 2 * y]) {
					flag = true;
					this.maze[last[0] + x][last[1] + y] = 0;
					this.maze[last[0] + 2 * x][last[1] + 2 * y] = 0;
					stack.push([last[0] + 2 * x, last[1] + 2 * y]);
				}
			}
			if (!flag) stack.pop();
		}
	}
	toString () {
		return this.maze.map(row => row.map(cell => (cell ? 'X' : ' ')).join(' ')).join('\n');
	}
	_neighbors (x, y) {
		let out = [];
		if (this.maze[x + 2]?.[y] === 1) out.push('D');
		if (this.maze[x - 2]?.[y] === 1) out.push('U');
		if (this.maze[x]?.[y + 2] === 1) out.push('R');
		if (this.maze[x]?.[y - 2] === 1) out.push('L');
		return out;
	}
}

// Will need to review; closed loops are generating