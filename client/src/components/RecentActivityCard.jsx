import { useState, useEffect } from "react"
import { motion } from "framer-motion"
const RecentActivityCard = () => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <ul className="space-y-2">
        <li className="flex justify-between items-center">
          <span>Printed Assignment.pdf</span>
          <span className="text-gray-400">2 hours ago</span>
        </li>
        <li className="flex justify-between items-center">
          <span>Added 100 print credits</span>
          <span className="text-gray-400">Yesterday</span>
        </li>
        <li className="flex justify-between items-center">
          <span>Uploaded Lecture_Notes.docx to cloud</span>
          <span className="text-gray-400">3 days ago</span>
        </li>
      </ul>
    </div>
  )
  export default RecentActivityCard