import GLMesh from "../gl/GLMesh.js";
import GLProgram from "../gl/GLProgram.js";
import GLTexture from "../gl/GLTexture.js";

let style = document.createElement("style");
style.textContent = `
  dlib-webglimage {
    display: block;
    position: relative;
  }
`;
document.head.appendChild(style);

export default class WebGLImageElement extends HTMLElement {
  constructor({
    tagName = "img"
  } = {}) {
    super();

    this._resizeBinded = this.resize.bind(this);

    this._data = document.createElement(tagName);
    this._canvas = document.createElement("canvas");
    this._canvas.style.width = "100%";
    this._canvas.style.height = "100%";
    this.appendChild(this._canvas);

    const webGLOptions = {
      premultipliedAlpha: false
    };

    if(!/\bforcewebgl1\b/.test(window.location.search)) {
      this.gl = this._canvas.getContext("webgl2", webGLOptions);
    }
    if(!this.gl) {
      this.gl = this._canvas.getContext("webgl", webGLOptions) || this._canvas.getContext("experimental-webgl", webGLOptions);
    }

    this._mesh = new GLMesh({
      gl: this.gl,
      attributes: [
        ["position", {
          data: new Float32Array([
            -1, -1,
            -1, 1,
            1, -1,
            1, 1
          ]),
          size: 2
        }],
        ["uv", {
          data: new Float32Array([
            0, 1,
            0, 0,
            1, 1,
            1, 0
          ]),
          size: 2
        }]
      ]
    });

    this._texture = new GLTexture({
      gl: this.gl
    });
    this._texture.minFilter = this.gl.LINEAR;
    this._texture.wrapS = this._texture.wrapT = this.gl.CLAMP_TO_EDGE;

    this.program = new GLProgram({
      gl: this.gl,
      uniforms: [
        ["data", 0]
      ],
      vertexShader: `#version 300 es
        in vec2 position;
        in vec2 uv;

        out vec2 vUv;

        void main() {
          gl_Position = vec4(position, 0., 1.);
          vUv = uv;
        }
      `,
      fragmentShader: `#version 300 es
        precision highp float;

        uniform sampler2D data;

        in vec2 vUv;

        out vec4 fragColor;

        void main() {
          fragColor = texture(data, vUv);
          fragColor.rgb *= fragColor.a;
        }
      `
    });
    this.program.use();

    this.program.attributes.set(this._mesh.attributes);

    if(this.hasAttribute("src")) {
      this.src = this.getAttribute("src");
    }
  }

  connectedCallback() {
    window.addEventListener("resize", this._resizeBinded);
  }

  disconnectedCallback() {
    this.gl.getExtension("WEBGL_lose_context").loseContext();
    window.removeEventListener("resize", this._resizeBinded);
  }

  update() {
    this._texture.data = this._data;
    this.draw();
  }
  
  draw({
    width = this._canvas.width,
    height = this._canvas.height,
  } = {}) {
    this._texture.bind();
    this.gl.viewport(0, 0, width, height);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this._mesh.draw({
      mode: this.gl.TRIANGLE_STRIP,
      count: 4
    });
  }

  resize() {
    this._canvas.width = this.offsetWidth * window.devicePixelRatio;
    this._canvas.height = this.offsetHeight * window.devicePixelRatio;
    this.update();
  }

  get src() {
    return this._data.src;
  }

  set src(value) {
    this._data.src = value;

    const resizeCanvas = () => {
      this._data.removeEventListener("load", resizeCanvas);
      this.resize();
    }

    this._data.addEventListener("load", resizeCanvas);
  }

  addEventListener() {
    this._data.addEventListener(...arguments);
  }

  removeEventListener() {
    this._data.removeEventListener(...arguments);
  }
}

window.customElements.define("dlib-webglimg", WebGLImageElement);
