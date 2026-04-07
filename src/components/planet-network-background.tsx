"use client";

import { useEffect, useRef } from "react";

type Point3D = {
  x: number;
  y: number;
  z: number;
};

type Point2D = {
  x: number;
  y: number;
  z: number;
  scale: number;
};

const POINT_COUNT = 420;
const ROTATION_SPEED_Y = 0.00035;
const TILT_X = -0.72;
const TILT_Z = 0.42;

function rotateX(point: Point3D, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: point.x,
    y: point.y * cos - point.z * sin,
    z: point.y * sin + point.z * cos,
  };
}

function rotateY(point: Point3D, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: point.x * cos - point.z * sin,
    y: point.y,
    z: point.x * sin + point.z * cos,
  };
}

function rotateZ(point: Point3D, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos,
    z: point.z,
  };
}

export function PlanetNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) {
      return;
    }
    const canvas = canvasElement;

    const contextValue = canvas.getContext("2d");
    if (!contextValue) {
      return;
    }
    const context = contextValue;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let angleY = 0;
    let sphereRadius = 0;
    let points: Point3D[] = [];

    function createSpherePoints() {
      points = [];

      for (let index = 0; index < POINT_COUNT; index += 1) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        points.push({
          x: sphereRadius * Math.sin(phi) * Math.cos(theta),
          y: sphereRadius * Math.cos(phi),
          z: sphereRadius * Math.sin(phi) * Math.sin(theta),
        });
      }
    }

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      centerX = width / 2;
      centerY = height / 2;
      sphereRadius = Math.min(width, height) * 1.02;
      createSpherePoints();
    }

    function project(point: Point3D): Point2D {
      const depth = 1400;
      const scale = depth / (depth + point.z + 900);

      return {
        x: centerX + point.x * scale,
        y: centerY + point.y * scale,
        z: point.z,
        scale,
      };
    }

    function drawBackgroundGlow() {
      const glow = context.createRadialGradient(
        centerX,
        centerY,
        sphereRadius * 0.08,
        centerX,
        centerY,
        sphereRadius * 1.28,
      );
      glow.addColorStop(0, "rgba(93, 214, 255, 0.12)");
      glow.addColorStop(0.35, "rgba(93, 214, 255, 0.06)");
      glow.addColorStop(0.68, "rgba(93, 214, 255, 0.025)");
      glow.addColorStop(1, "rgba(93, 214, 255, 0)");

      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      drawBackgroundGlow();

      const projected = points.map((point) => {
        let rotated = rotateX(point, TILT_X);
        rotated = rotateZ(rotated, TILT_Z);
        rotated = rotateY(rotated, angleY);
        return project(rotated);
      });

      for (let leftIndex = 0; leftIndex < projected.length; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < projected.length; rightIndex += 1) {
          const left = projected[leftIndex];
          const right = projected[rightIndex];
          const deltaX = left.x - right.x;
          const deltaY = left.y - right.y;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (distance < sphereRadius * 0.22) {
            const alpha =
              (1 - distance / (sphereRadius * 0.22)) * 0.16 * Math.min(left.scale, right.scale);

            context.strokeStyle = `rgba(93, 214, 255, ${alpha})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(left.x, left.y);
            context.lineTo(right.x, right.y);
            context.stroke();
          }
        }
      }

      projected
        .sort((left, right) => left.z - right.z)
        .forEach((point) => {
          const size = 0.65 + point.scale * 1.9;
          const alpha = 0.18 + point.scale * 0.52;

          context.beginPath();
          context.arc(point.x, point.y, size, 0, Math.PI * 2);
          context.fillStyle = `rgba(231, 238, 249, ${alpha})`;
          context.shadowColor = "rgba(93, 214, 255, 0.6)";
          context.shadowBlur = 10;
          context.fill();
          context.shadowBlur = 0;
        });

      angleY += ROTATION_SPEED_Y;
      animationFrame = window.requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="planet-network-canvas" />;
}
