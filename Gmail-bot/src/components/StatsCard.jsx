const StatsCard = ({ title, value, icon, color }) => {
  const getColorConfig = () => {
    switch (color) {
      case 'primary':
        return {
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
          glow: 'rgba(139, 92, 246, 0.3)',
          iconBg: 'rgba(139, 92, 246, 0.2)',
          accent: '#8b5cf6'
        }
      case 'danger':
        return {
          gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          glow: 'rgba(239, 68, 68, 0.3)',
          iconBg: 'rgba(239, 68, 68, 0.2)',
          accent: '#ef4444'
        }
      case 'success':
        return {
          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          glow: 'rgba(16, 185, 129, 0.3)',
          iconBg: 'rgba(16, 185, 129, 0.2)',
          accent: '#10b981'
        }
      case 'warning':
        return {
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          glow: 'rgba(245, 158, 11, 0.3)',
          iconBg: 'rgba(245, 158, 11, 0.2)',
          accent: '#f59e0b'
        }
      case 'info':
        return {
          gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          glow: 'rgba(6, 182, 212, 0.3)',
          iconBg: 'rgba(6, 182, 212, 0.2)',
          accent: '#06b6d4'
        }
      default:
        return {
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
          glow: 'rgba(139, 92, 246, 0.3)',
          iconBg: 'rgba(139, 92, 246, 0.2)',
          accent: '#8b5cf6'
        }
    }
  }

  const colorConfig = getColorConfig()

  // Check if icon is a Font Awesome class or emoji
  const isEmojiIcon = icon && !icon.includes('fa')
  
  return (
    <>
      {/* Load Font Awesome if needed */}
      {!isEmojiIcon && (
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      )}
      
      <div 
        className="stats-card"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `0 10px 30px ${colorConfig.glow}`,
          height: '100%'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
          e.currentTarget.style.boxShadow = `0 20px 40px ${colorConfig.glow}, 0 0 0 1px rgba(255, 255, 255, 0.1)`
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
          
          // Trigger shine effect
          const shineEl = e.currentTarget.querySelector('.shine-effect')
          if (shineEl) {
            shineEl.style.left = '100%'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          e.currentTarget.style.boxShadow = `0 10px 30px ${colorConfig.glow}`
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
          
          // Reset shine effect
          const shineEl = e.currentTarget.querySelector('.shine-effect')
          if (shineEl) {
            shineEl.style.left = '-100%'
          }
        }}
      >
        {/* Animated background gradient */}
        <div 
          className="bg-pulse"
          style={{
            position: 'absolute',
            inset: 0,
            background: colorConfig.gradient,
            opacity: 0.1,
            borderRadius: '1rem'
          }}
        ></div>

        {/* Shine effect */}
        <div 
          className="shine-effect"
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
            transition: 'left 0.6s ease-in-out',
            pointerEvents: 'none'
          }}
        ></div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Icon container with glow */}
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '1rem',
            background: colorConfig.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${colorConfig.accent}30`,
            flexShrink: 0
          }}>
            {/* Icon glow effect */}
            <div 
              className="icon-glow"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '1rem',
                background: colorConfig.gradient,
                opacity: 0.3,
                filter: 'blur(8px)'
              }}
            ></div>
            
            <div style={{
              fontSize: isEmojiIcon ? '1.5rem' : '1.25rem',
              position: 'relative',
              zIndex: 10,
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))',
              color: 'white'
            }}>
              {isEmojiIcon ? (
                icon || '📊'
              ) : (
                <i className={icon || 'fas fa-chart-bar'}></i>
              )}
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '0.25rem',
              color: 'white',
              background: colorConfig.gradient,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.1))',
              letterSpacing: '-0.025em',
              wordBreak: 'break-word'
            }}>
              {value}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              wordBreak: 'break-word'
            }}>
              {title}
            </div>
          </div>

          {/* Accent line */}
          <div 
            style={{
              width: '3px',
              height: '3rem',
              background: colorConfig.gradient,
              borderRadius: '2px',
              opacity: 0.6,
              boxShadow: `0 0 10px ${colorConfig.accent}50`,
              flexShrink: 0
            }}
          ></div>
        </div>

        {/* Floating particles effect */}
        <div 
          className="particle-1"
          style={{
            position: 'absolute',
            top: '20%',
            right: '20%',
            width: '4px',
            height: '4px',
            background: colorConfig.accent,
            borderRadius: '50%',
            opacity: 0.6
          }}
        ></div>
        <div 
          className="particle-2"
          style={{
            position: 'absolute',
            bottom: '30%',
            right: '40%',
            width: '2px',
            height: '2px',
            background: colorConfig.accent,
            borderRadius: '50%',
            opacity: 0.4
          }}
        ></div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }

        .bg-pulse {
          animation: pulse 4s ease-in-out infinite;
        }

        .icon-glow {
          animation: pulse 2s ease-in-out infinite;
        }

        .particle-1 {
          animation: float 3s ease-in-out infinite;
        }

        .particle-2 {
          animation: float 4s ease-in-out infinite 1s;
        }
      `}</style>
    </>
  )
}

// Demo component showing both emoji and Font Awesome icons
const StatsCardDemo = () => {
  const emailStats = {
    total: '12,543',
    toDelete: '2,847', 
    important: '1,205'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c0a09 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          color: 'white',
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Email Management Dashboard
        </h1>
        
        {/* Your actual usage pattern */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <StatsCard
            title="Total Emails"
            value={emailStats.total}
            icon="fas fa-inbox"
            color="primary"
          />
          <StatsCard
            title="Suggested Delete"
            value={emailStats.toDelete}
            icon="fas fa-trash-alt"
            color="danger"
          />
          <StatsCard
            title="Important"
            value={emailStats.important}
            icon="fas fa-star"
            color="success"
          />
        </div>

        {/* Additional examples with different colors and icons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          <StatsCard
            title="Processed Today"
            value="4,291"
            icon="fas fa-check-circle"
            color="info"
          />
          <StatsCard
            title="Spam Filtered"
            value="892"
            icon="fas fa-shield-alt"
            color="warning"
          />
        </div>
      </div>
    </div>
  )
}

export default StatsCard