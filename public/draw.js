// Great resource from https://stackoverflow.com/a/40700068
// Thank you ConnorFan

var strokeWidth = 8;
var bufferSize;

var svgElement = document.getElementById("svgElement");
var rect = svgElement.getBoundingClientRect();
var path = null;
var strPath;
var buffer = []; // Contains the last positions of the mouse cursor

const startDrawing = (e) => {
	e.preventDefault();
	// console.log("start");
	bufferSize = 2;
	path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	path.setAttribute("fill", "none");
	path.setAttribute("stroke", "currentColor");
	path.setAttribute("stroke-width", strokeWidth);
	buffer = [];
	var pt = getMousePosition(e);
	appendToBuffer(pt);
	strPath = "M" + pt.x + " " + pt.y;
	path.setAttribute("d", strPath);
	svgElement.appendChild(path);
};

const draw = (e) => {
	e.preventDefault();
	if (path) {
		// console.log("draw");
		appendToBuffer(getMousePosition(e));
		updateSvgPath();
	}
};

const stopDrawing = () => {
	if (path) {
		// console.log("stop");
		path = null;
	}
};

var getMousePosition = function (e) {
	return {
		x: (e.pageX || e?.changedTouches[0]?.pageX) - rect.left,
		y: (e.pageY || e?.changedTouches[0]?.pageY) - rect.top,
	};
};

var appendToBuffer = function (pt) {
	buffer.push(pt);
	while (buffer.length > bufferSize) {
		buffer.shift();
	}
};

// Calculate the average point, starting at offset in the buffer
var getAveragePoint = function (offset) {
	var len = buffer.length;
	if (len % 2 === 1 || len >= bufferSize) {
		var totalX = 0;
		var totalY = 0;
		var pt, i;
		var count = 0;
		for (i = offset; i < len; i++) {
			count++;
			pt = buffer[i];
			totalX += pt.x;
			totalY += pt.y;
		}
		return {
			x: totalX / count,
			y: totalY / count,
		};
	}
	return null;
};

var updateSvgPath = function () {
	var pt = getAveragePoint(0);

	if (pt) {
		// Get the smoothed part of the path that will not change
		strPath += " L" + pt.x + " " + pt.y;

		// Get the last part of the path (close to the current mouse position)
		// This part will change if the mouse moves again
		var tmpPath = "";
		for (var offset = 2; offset < buffer.length; offset += 2) {
			pt = getAveragePoint(offset);
			tmpPath += " L" + pt.x + " " + pt.y;
		}

		// Set the complete current path coordinates
		path.setAttribute("d", strPath + tmpPath);
	}
};

svgElement.addEventListener("mousedown", (e) => startDrawing(e));
svgElement.addEventListener("touchstart", (e) => startDrawing(e), { passive: false });

svgElement.addEventListener("mousemove", (e) => draw(e));
svgElement.addEventListener("touchmove", (e) => draw(e), { passive: false });

svgElement.addEventListener("mouseup", () => stopDrawing());
svgElement.addEventListener("mouseleave", () => stopDrawing());
svgElement.addEventListener("touchend", () => stopDrawing());
