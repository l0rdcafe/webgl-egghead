const vertexCount = 25000;
let mouseX = 0;
let mouseY = 0;

function map(value, minSrc, maxSrc, minDst, maxDst) {
  return ((value - minSrc) / (maxSrc - minSrc)) * (maxDst - minDst) + minDst;
}

function initGl() {
  const canvas = document.getElementById("canvas");
  const gl = canvas.getContext("webgl");
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 1, 1, 1);

  canvas.addEventListener("mousemove", (e) => {
    mouseX = map(e.clientX, 0, canvas.width, -1, 1);
    mouseY = map(e.clientY, 0, canvas.height, 1, -1);
  });
  return gl;
}

function draw(gl, vertices) {
  for (let i = 0; i < vertexCount * 2; i += 2) {
    const dx = vertices[i] - mouseX;
    const dy = vertices[i + 1] - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.05) {
      vertices[i] = mouseX + (dx / dist) * 0.2;
      vertices[i + 1] = mouseY + (dy / dist) * 0.2;
    } else {
      vertices[i] += Math.random() * 0.01 - 0.005;
      vertices[i + 1] += Math.random() * 0.01 - 0.005;
    }
  }
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, vertexCount);
  requestAnimationFrame(() => {
    draw(gl, vertices);
  });
}

function createShaders(gl) {
  const vs =
    "attribute vec4 coords; attribute float pointSize; void main(void) { gl_Position = coords; gl_PointSize = pointSize;}";
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vs);
  gl.compileShader(vertexShader);

  const fs =
    "precision mediump float; uniform vec4 color; void main(void) { gl_FragColor = color;}";
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fs);
  gl.compileShader(fragmentShader);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);
  return program;
}

function createVertices(gl, program) {
  const vertices = [];

  for (let i = 0; i < vertexCount; i++) {
    vertices.push(Math.random() * 2 - 1, Math.random() * 2 - 1);
  }
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  const coords = gl.getAttribLocation(program, "coords");
  gl.vertexAttribPointer(coords, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coords);

  const pointSize = gl.getAttribLocation(program, "pointSize");
  gl.vertexAttrib1f(pointSize, 2);

  const color = gl.getUniformLocation(program, "color");
  gl.uniform4f(color, 0.54, 0, 0.54, 1);
  return vertices;
}

function main() {
  const gl = initGl();
  const program = createShaders(gl);
  const vertices = createVertices(gl, program);
  draw(gl, vertices);
}

main();
