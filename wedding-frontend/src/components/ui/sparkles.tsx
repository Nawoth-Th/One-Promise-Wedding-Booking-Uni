"use client"

import React, { useId } from "react"
import { useEffect, useState } from "react"

interface SparklesCoreProps {
  id?: string
  background?: string
  minSize?: number
  maxSize?: number
  speed?: number
  particleColor?: string
  particleDensity?: number
  className?: string
}

export const SparklesCore = ({
  id,
  background = "transparent",
  minSize = 1,
  maxSize = 3,
  speed = 1,
  particleColor = "#467889", // Using the primary color from local theme
  particleDensity = 120, // Particles per 1000px roughly
  className,
}: SparklesCoreProps) => {
  const [init, setInit] = useState(false)
  
  // Use a stable ID
  const generatedId = useId()
  const canvasId = id || generatedId

  useEffect(() => {
    setInit(true)
  }, [])

  useEffect(() => {
    if (init) {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      let animationId: number
      let particles: Particle[] = []
      let mouseX = 0
      let mouseY = 0
      let windowWidth = window.innerWidth
      let windowHeight = window.innerHeight

      // Resize observer
      const handleResize = () => {
        windowWidth = window.innerWidth
        windowHeight = window.innerHeight
        canvas.width = windowWidth
        canvas.height = windowHeight
        initParticles()
      }

      const handleMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX
        mouseY = e.clientY
      }

      window.addEventListener("resize", handleResize)
      window.addEventListener("mousemove", handleMouseMove)

      // 4-pointed star shape (Diamond/Star)
      class Particle {
        x: number
        y: number
        size: number
        speedX: number
        speedY: number
        opacity: number
        fadeSpeed: number
        
        constructor() {
          this.x = Math.random() * windowWidth
          this.y = Math.random() * windowHeight
          this.size = Math.random() * (maxSize - minSize) + minSize
          // Slow floating movement
          this.speedX = (Math.random() - 0.5) * speed * 0.5
          this.speedY = (Math.random() - 0.5) * speed * 0.5
          this.opacity = Math.random()
          this.fadeSpeed = (Math.random() * 0.01) + 0.005
        }

        update() {
          this.x += this.speedX
          this.y += this.speedY

          // Interaction: simple gentle push away from mouse
          const dx = this.x - mouseX
          const dy = this.y - mouseY
          const distance = Math.sqrt(dx * dx + dy * dy)
          const forceDirectionX = dx / distance
          const forceDirectionY = dy / distance
          const maxDistance = 150
          const force = (maxDistance - distance) / maxDistance
          
          if (distance < maxDistance) {
              this.x += forceDirectionX * force * 2
              this.y += forceDirectionY * force * 2
          }

          // Wrap around screen
          if (this.x > windowWidth) this.x = 0
          if (this.x < 0) this.x = windowWidth
          if (this.y > windowHeight) this.y = 0
          if (this.y < 0) this.y = windowHeight

          // Pulse opacity
          this.opacity += this.fadeSpeed
          if (this.opacity > 1 || this.opacity < 0.2) {
             this.fadeSpeed = -this.fadeSpeed
          }
        }

        draw() {
          if (!ctx) return
          ctx.save()
          ctx.translate(this.x, this.y)
          // Draw 4-pointed star
          ctx.beginPath()
          ctx.moveTo(0, -this.size) // Top
          ctx.quadraticCurveTo(this.size * 0.1, -this.size * 0.1, this.size, 0) // Right
          ctx.quadraticCurveTo(this.size * 0.1, this.size * 0.1, 0, this.size) // Bottom
          ctx.quadraticCurveTo(-this.size * 0.1, this.size * 0.1, -this.size, 0) // Left
          ctx.quadraticCurveTo(-this.size * 0.1, -this.size * 0.1, 0, -this.size) // Back to Top
          ctx.closePath()
          
          // Use hex to rgb for opacity handling if needed, but ctx.globalAlpha works
          ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity))
          ctx.fillStyle = particleColor
          ctx.fill()
          ctx.restore()
        }
      }

      const initParticles = () => {
        particles = []
        // Calculate number of particles based on screen area to keep density consistent
        const area = windowWidth * windowHeight
        const count = Math.floor((area / 1000000) * particleDensity) * 10 // Multiply by factor for better coverage
        
        for (let i = 0; i < count; i++) {
          particles.push(new Particle())
        }
      }

      const animate = () => {
        if (!ctx) return
        ctx.clearRect(0, 0, windowWidth, windowHeight)
        
        particles.forEach(particle => {
          particle.update()
          particle.draw()
        })
        
        animationId = requestAnimationFrame(animate)
      }

      // Initial setup
      handleResize()
      initParticles()
      animate()

      return () => {
        window.removeEventListener("resize", handleResize)
        window.removeEventListener("mousemove", handleMouseMove)
        cancelAnimationFrame(animationId)
      }
    }
  }, [init, canvasId, maxSize, minSize, particleColor, particleDensity, speed])

  return (
    <div className={className} style={{ background }}>
      <canvas
        id={canvasId}
        className="w-full h-full block"
        style={{ background: "transparent" }}
      />
    </div>
  )
}
