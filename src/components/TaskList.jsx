import React from 'react'
import { Check, Clock, AlertCircle, Trash2, Edit2 } from 'lucide-react'
import { format } from 'date-fns'

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
}

const priorityIcons = {
  low: <Clock className="h-4 w-4" />,
  medium: <AlertCircle className="h-4 w-4" />,
  high: <AlertCircle className="h-4 w-4" />
}

export default function TaskList({ tasks, onUpdate, onDelete }) {
  const toggleComplete = async (task) => {
    await onUpdate(task.id, { is_complete: !task.is_complete })
  }

  const updatePriority = async (task, priority) => {
    await onUpdate(task.id, { priority })
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
        <p className="text-gray-600">Create your first task using the form on the right!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`bg-white rounded-lg shadow p-4 border-l-4 ${
            task.is_complete 
              ? 'border-green-500 opacity-75' 
              : task.priority === 'high' 
                ? 'border-red-500' 
                : task.priority === 'medium' 
                  ? 'border-yellow-500' 
                  : 'border-green-500'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => toggleComplete(task)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    task.is_complete
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                  }`}
                >
                  {task.is_complete && <Check className="h-4 w-4 text-white" />}
                </button>
                <h3 className={`font-medium ${task.is_complete ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {task.title}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                  <span className="flex items-center gap-1">
                    {priorityIcons[task.priority]}
                    {task.priority}
                  </span>
                </span>
              </div>
              
              {task.description && (
                <p className="text-gray-600 text-sm ml-9 mb-2">{task.description}</p>
              )}
              
              <div className="flex items-center justify-between ml-9">
                <span className="text-xs text-gray-500">
                  Created {format(new Date(task.created_at), 'MMM d, yyyy')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updatePriority(task, 'low')}
                    className={`text-xs px-2 py-1 rounded ${task.priority === 'low' ? 'bg-green-100 text-green-800' : 'text-gray-500'}`}
                  >
                    Low
                  </button>
                  <button
                    onClick={() => updatePriority(task, 'medium')}
                    className={`text-xs px-2 py-1 rounded ${task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-500'}`}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => updatePriority(task, 'high')}
                    className={`text-xs px-2 py-1 rounded ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 'text-gray-500'}`}
                  >
                    High
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}