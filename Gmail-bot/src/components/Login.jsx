import { useState } from 'react'

const Login = ({ setIsAuthenticated }) => {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      window.location.href = 'http://localhost:8000/authorize'
    } catch (error) {
      console.error('Login error:', error)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0c0a09 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          width: '16rem',
          height: '16rem',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
          top: '25%',
          left: '25%',
          filter: 'blur(40px)',
          animation: 'pulse 3s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '12rem',
          height: '12rem',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
          bottom: '25%',
          right: '25%',
          filter: 'blur(40px)',
          animation: 'pulse 3s ease-in-out infinite 1s'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '8rem',
          height: '8rem',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
          top: '75%',
          left: '50%',
          transform: 'translateX(-50%)',
          filter: 'blur(30px)',
          animation: 'pulse 3s ease-in-out infinite 0.5s'
        }}></div>
      </div>

      <div style={{
        maxWidth: '28rem',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          {/* AI Robot Icon with glow */}
          <div style={{
            position: 'relative',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              fontSize: '4rem',
              filter: 'blur(8px)',
              color: '#8b5cf6',
              opacity: 0.5,
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              🤖
            </div>
            <div style={{
              position: 'relative',
              fontSize: '4rem'
            }}>
              🤖
            </div>
          </div>
          
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            background: 'linear-gradient(45deg, #ffffff 0%, #d1d5db 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            Gmail AI Assistant
          </h1>
          <p style={{
            color: '#cbd5e1',
            fontSize: '1.125rem',
            fontWeight: '300'
          }}>
            Intelligent email management powered by AI
          </p>
        </div>
        
        {/* Main Card */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '1.5rem',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Card background gradient */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '1.5rem',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
            opacity: 0.8
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '1rem'
            }}>
              Welcome to the Future
            </h2>
            <p style={{
              color: '#cbd5e1',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              Connect your Gmail and let our advanced AI transform how you manage emails. 
              Experience intelligent automation like never before.
            </p>
            
            {/* Login Button */}
            <button 
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '2rem',
                fontWeight: '600',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading 
                  ? '#64748b' 
                  : 'linear-gradient(45deg, #8b5cf6 0%, #ec4899 100%)',
                boxShadow: loading ? 'none' : '0 10px 30px rgba(139, 92, 246, 0.3)',
                transition: 'all 0.3s ease',
                fontSize: '1rem'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'scale(1.05)'
                  e.target.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'scale(1)'
                  e.target.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.3)'
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem'
              }}>
                {loading ? (
                  <>
                    <div style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '1.25rem' }}>📧</span>
                    Connect with Gmail
                  </>
                )}
              </div>
            </button>
            
            {/* Feature Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: '🧠', text: 'AI-powered email analysis', color1: '#3b82f6', color2: '#8b5cf6' },
                { icon: '🗑️', text: 'Smart deletion suggestions', color1: '#8b5cf6', color2: '#ec4899' },
                { icon: '⭐', text: 'Important email identification', color1: '#ec4899', color2: '#ef4444' }
              ].map((feature, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: `linear-gradient(45deg, ${feature.color1}20 0%, ${feature.color2}20 100%)`,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                    e.target.style.boxShadow = `0 10px 25px ${feature.color1}30`
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ fontSize: '1.5rem' }}>{feature.icon}</div>
                  <span style={{ 
                    color: 'white', 
                    fontWeight: '500',
                    fontSize: '0.9rem'
                  }}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Login