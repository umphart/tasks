// src/pages/ConfirmEmail.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { CheckCircle, XCircle } from 'lucide-react'

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (type === 'signup' && token_hash) {
      confirmSignup(token_hash)
    } else {
      setStatus('error')
      setMessage('Invalid confirmation link')
    }
  }, [searchParams])

  const confirmSignup = async (token_hash) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'signup'
      })

      if (error) {
        throw error
      }

      setStatus('success')
      setMessage('Email confirmed successfully! Redirecting to login...')
      setTimeout(() => navigate('/login'), 3000)
    } catch (error) {
      console.error('Confirmation error:', error)
      setStatus('error')
      setMessage(error.message || 'Failed to confirm email')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Confirming your email...
            </h2>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Email Confirmed!
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Login
            </button>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Confirmation Failed
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Go to Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Sign Up Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}