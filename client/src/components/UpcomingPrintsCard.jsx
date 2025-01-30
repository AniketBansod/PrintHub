import { useState, useEffect } from "react"
import { motion } from "framer-motion"
const UpcomingPrintsCard = () => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Upcoming Prints</h2>
      <ul className="space-y-2">
        <li className="flex justify-between items-center">
          <span>Research_Paper.pdf</span>
          <span className="text-amber-400">Scheduled for tomorrow, 2 PM</span>
        </li>
        <li className="flex justify-between items-center">
          <span>Group_Project.ppt</span>
          <span className="text-amber-400">Queued for printing</span>
        </li>
      </ul>
    </div>
  )

  export default UpcomingPrintsCard