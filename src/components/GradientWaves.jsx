import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import "./GradientWaves.css";

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 uMouse;
uniform vec3 uHorizonColor;
uniform vec3 uWaveColor;
uniform vec3 uCrestColor;
uniform float uSpeed;
uniform float uOpacity;
uniform float uBrightness;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uParallax;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float aspect = iResolution.x / iResolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  p.x += (uMouse.x - 0.5) * uParallax * 0.08;
  p.y += (uMouse.y - 0.5) * uParallax * 0.05;

  float time = iTime * uSpeed;
  float wave = sin(p.x * (5.0 + uWaveScale * 3.0) + time) * 0.035;
  wave += sin(p.x * (10.0 + uWaveScale * 2.0) - time * 0.72) * 0.018;
  wave += sin(p.x * 2.2 + time * 0.42) * 0.055;
  float shoreline = 0.42 + wave * uAmplitude;
  float crest = smoothstep(shoreline - 0.18, shoreline + 0.24, uv.y);
  float foam = 1.0 - smoothstep(0.0, 0.012, abs(uv.y - shoreline));

  vec3 color = mix(uWaveColor, uHorizonColor, crest);
  color = mix(color, uCrestColor, foam * 0.18);
  float glow = exp(-abs(uv.y - shoreline) * 8.0) * 0.16;
  color += vec3(0.18, 0.65, 0.54) * glow;
  float grain = (hash(gl_FragCoord.xy + mod(iTime, 64.0)) - 0.5) * 0.018;
  color = clamp(color * uBrightness + grain, 0.0, 1.0);

  float alpha = clamp(0.25 + crest * 0.62 + foam * 0.08, 0.0, 1.0) * uOpacity;
  fragColor = vec4(color * alpha, alpha);
}`;

const hexToRgb = (hex) => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return [1, 1, 1];
  return [
    Number.parseInt(match[1], 16) / 255,
    Number.parseInt(match[2], 16) / 255,
    Number.parseInt(match[3], 16) / 255,
  ];
};

const GradientWaves = ({
  horizonColor = "#0b5961",
  waveColor = "#10b981",
  crestColor = "#a5f3fc",
  speed = 0.4,
  amplitude = 2.5,
  waveScale = 0.6,
  brightness = 1,
  opacity = 1,
  mouseInteraction = true,
  parallaxStrength = 0.5,
  className = "",
}) => {
  const containerRef = useRef(null);
  const settingsRef = useRef({
    horizonColor,
    waveColor,
    crestColor,
    speed,
    amplitude,
    waveScale,
    brightness,
    opacity,
    mouseInteraction,
    parallaxStrength,
  });

  useEffect(() => {
    settingsRef.current = {
      horizonColor,
      waveColor,
      crestColor,
      speed,
      amplitude,
      waveScale,
      brightness,
      opacity,
      mouseInteraction,
      parallaxStrength,
    };
  }, [
    horizonColor,
    waveColor,
    crestColor,
    speed,
    amplitude,
    waveScale,
    brightness,
    opacity,
    mouseInteraction,
    parallaxStrength,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const probe = document.createElement("canvas");
    const probeContext = probe.getContext("webgl2");
    if (!probeContext) return undefined;
    probeContext.getExtension("WEBGL_lose_context")?.loseContext();

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new Float32Array([1, 1]) },
      uMouse: { value: new Float32Array([0.5, 0.5]) },
      uHorizonColor: { value: new Float32Array([0, 0, 0]) },
      uWaveColor: { value: new Float32Array([0, 0, 0]) },
      uCrestColor: { value: new Float32Array([0, 0, 0]) },
      uSpeed: { value: speed },
      uOpacity: { value: opacity },
      uBrightness: { value: brightness },
      uAmplitude: { value: amplitude },
      uWaveScale: { value: waveScale },
      uParallax: { value: parallaxStrength },
    };
    const program = new Program(gl, { vertex, fragment, uniforms });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const canvas = gl.canvas;
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.pointerEvents = "none";
    container.appendChild(canvas);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(Math.max(1, Math.floor(width)), Math.max(1, Math.floor(height)));
      uniforms.iResolution.value[0] = gl.drawingBufferWidth;
      uniforms.iResolution.value[1] = gl.drawingBufferHeight;
      renderer.render({ scene: mesh });
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const mouse = uniforms.uMouse.value;
    const onPointerMove = (event) => {
      const bounds = container.getBoundingClientRect();
      mouse[0] = (event.clientX - bounds.left) / Math.max(bounds.width, 1);
      mouse[1] = 1 - (event.clientY - bounds.top) / Math.max(bounds.height, 1);
    };
    const resetMouse = () => {
      mouse[0] = 0.5;
      mouse[1] = 0.5;
    };
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", resetMouse);

    let frameId = 0;
    let isInView = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startTime = performance.now();
    const updateColors = () => {
      const settings = settingsRef.current;
      const setColor = (uniform, hex) => {
        const rgb = hexToRgb(hex);
        uniform.value[0] = rgb[0];
        uniform.value[1] = rgb[1];
        uniform.value[2] = rgb[2];
      };
      setColor(uniforms.uHorizonColor, settings.horizonColor);
      setColor(uniforms.uWaveColor, settings.waveColor);
      setColor(uniforms.uCrestColor, settings.crestColor);
      uniforms.uSpeed.value = settings.speed;
      uniforms.uOpacity.value = settings.opacity;
      uniforms.uBrightness.value = settings.brightness;
      uniforms.uAmplitude.value = settings.amplitude;
      uniforms.uWaveScale.value = settings.waveScale;
      uniforms.uParallax.value = settings.mouseInteraction ? settings.parallaxStrength : 0;
    };
    updateColors();

    const render = (now) => {
      uniforms.iTime.value = (now - startTime) / 1000;
      if (!settingsRef.current.mouseInteraction) resetMouse();
      renderer.render({ scene: mesh });
      frameId = reducedMotion ? 0 : requestAnimationFrame(render);
    };
    const start = () => {
      if (isInView && !document.hidden && frameId === 0) {
        frameId = requestAnimationFrame(render);
      }
    };
    const stop = () => {
      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting;
      if (isInView) {
        if (reducedMotion) {
          uniforms.iTime.value = 0;
          renderer.render({ scene: mesh });
        } else {
          start();
        }
      } else {
        stop();
      }
    });
    intersectionObserver.observe(container);
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else if (!reducedMotion) start();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    if (reducedMotion) renderer.render({ scene: mesh });
    else start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", resetMouse);
      if (canvas.parentElement === container) container.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div ref={containerRef} className={`gradient-waves-container ${className}`.trim()} aria-hidden="true" />;
};

export default GradientWaves;
