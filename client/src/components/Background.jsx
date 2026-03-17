import { motion } from 'framer-motion'

const orbs = [
  {
    color: 'from-violet-600/30 to-violet-800/10',
    size: 'w-[500px] h-[500px]',
    position: 'top-[-10%] left-[-5%]',
    duration: 20,
  },
  {
    color: 'from-fuchsia-600/25 to-fuchsia-800/10',
    size: 'w-[450px] h-[450px]',
    position: 'top-[20%] right-[-8%]',
    duration: 25,
  },
  {
    color: 'from-indigo-600/20 to-indigo-800/10',
    size: 'w-[550px] h-[550px]',
    position: 'bottom-[-10%] left-[30%]',
    duration: 22,
  },
]

export default function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute inset-0 bg-gray-950" />
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute ${orb.size} ${orb.position} rounded-full bg-gradient-radial ${orb.color} blur-[128px]`}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
