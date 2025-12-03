import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import TaskList from '../components/TaskList'
import TaskForm from '../components/TaskForm'
import Profile from '../components/Profile'
import { LogOut, Menu, X } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tasks')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    fetchTasks()
    setupRealtimeSubscription()
  }, [user, navigate])

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (!error) setTasks(data || [])
    setLoading(false)
  }

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [payload.new, ...prev])
          }
          if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(task => 
              task.id === payload.new.id ? payload.new : task
            ))
          }
          if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => task.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const addTask = async (taskData) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...taskData, user_id: user.id }])
      .select()
    
    if (!error) {
      return data[0]
    }
    throw error
  }

  const updateTask = async (taskId, updates) => {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .eq('user_id', user.id)
    
    if (error) throw error
  }

  const deleteTask = async (taskId) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id)
    
    if (error) throw error
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-white shadow-md"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform lg:transform-none transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-gray-800">TaskMaster</h1>
              <p className="text-gray-600 text-sm mt-1">Manage your tasks efficiently</p>
            </div>
            
            <nav className="flex-1 p-4">
              <button
                onClick={() => { setActiveTab('tasks'); setSidebarOpen(false) }}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 flex items-center ${activeTab === 'tasks' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                📝 Tasks
              </button>
              <button
                onClick={() => { setActiveTab('profile'); setSidebarOpen(false) }}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                👤 Profile
              </button>
            </nav>
            
            <div className="p-4 border-t">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                {activeTab === 'tasks' ? 'Your Tasks' : 'Your Profile'}
              </h2>
              <p className="text-gray-600 mt-2">
                {activeTab === 'tasks' 
                  ? `You have ${tasks.filter(t => !t.is_complete).length} pending tasks`
                  : 'Manage your account settings'
                }
              </p>
            </header>

            {activeTab === 'tasks' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <TaskList
                    tasks={tasks}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                  />
                </div>
                <div>
                  <TaskForm onSubmit={addTask} />
                </div>
              </div>
            ) : (
              <Profile user={user} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}