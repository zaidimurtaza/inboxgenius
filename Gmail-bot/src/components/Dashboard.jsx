import { useState, useEffect } from 'react'
import axios from 'axios'
import EmailCard from './EmailCard'
import StatsCard from './StatsCard'
import EmailFetcher from './EmailFetcher'
import FetchedEmails from './FetchedEmails'

const Dashboard = ({ setIsAuthenticated }) => {
  const [emails, setEmails] = useState({
    all: [],
    toDelete: [],
    important: []
  })
  const [stats, setStats] = useState({
    total: 0,
    toDelete: 0,
    important: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedEmails, setSelectedEmails] = useState(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  // New state for the enhanced workflow
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard', 'fetcher', 'fetched'
  const [fetchedEmails, setFetchedEmails] = useState([])
  const [analysisResults, setAnalysisResults] = useState(null)

  const fetchEmails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get('http://localhost:8000/api/emails', {
        withCredentials: true
      })

      const data = response.data
      setEmails({
        all: data.all_emails || [],
        toDelete: data.to_delete_emails || [],
        important: data.important_emails || []
      })

      setStats({
        total: data.total_emails || 0,
        toDelete: data.to_delete_count || 0,
        important: data.important_count || 0
      })
    } catch (err) {
      console.error('Error fetching emails:', err)
      setError('Failed to load emails. Please try again.')

      if (err.response?.status === 401) {
        setIsAuthenticated(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchEmails()
    setRefreshing(false)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    // Clear any stored credentials
    window.location.href = 'http://localhost:8000/logout'
  }

  const handleEmailDelete = (msgId) => {
    // Remove the deleted email from all email lists
    setEmails(prevEmails => ({
      all: prevEmails.all.filter(email => email.msg_id !== msgId),
      toDelete: prevEmails.toDelete.filter(email => email.msg_id !== msgId),
      important: prevEmails.important.filter(email => email.msg_id !== msgId)
    }))

    // Update stats
    setStats(prevStats => ({
      total: prevStats.total - 1,
      toDelete: prevStats.toDelete - (emails.toDelete.find(email => email.msg_id === msgId) ? 1 : 0),
      important: prevStats.important - (emails.important.find(email => email.msg_id === msgId) ? 1 : 0)
    }))

    // Remove from selected emails
    setSelectedEmails(prev => {
      const newSet = new Set(prev)
      newSet.delete(msgId)
      return newSet
    })
  }

  const handleEmailSelect = (msgId, checked) => {
    setSelectedEmails(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(msgId)
      } else {
        newSet.delete(msgId)
      }
      return newSet
    })
  }

  const handleBulkDelete = async () => {
    if (selectedEmails.size === 0) return

    if (window.confirm(`Are you sure you want to delete ${selectedEmails.size} selected email(s)? This action cannot be undone.`)) {
      setBulkDeleting(true)
      try {
        const deletePromises = Array.from(selectedEmails).map(msgId =>
          axios.delete(`http://localhost:8000/api/emails/${msgId}/delete`, {
            withCredentials: true
          })
        )

        await Promise.all(deletePromises)

        // Remove all selected emails from state
        setEmails(prevEmails => ({
          all: prevEmails.all.filter(email => !selectedEmails.has(email.msg_id)),
          toDelete: prevEmails.toDelete.filter(email => !selectedEmails.has(email.msg_id)),
          important: prevEmails.important.filter(email => !selectedEmails.has(email.msg_id))
        }))

        // Clear selection
        setSelectedEmails(new Set())

        alert(`${selectedEmails.size} email(s) deleted successfully!`)
      } catch (error) {
        console.error('Bulk delete error:', error)
        alert('Failed to delete some emails. Please try again.')
      } finally {
        setBulkDeleting(false)
      }
    }
  }

  const handleSelectAll = (section) => {
    const sectionEmails = emails[section] || []
    const allSelected = sectionEmails.every(email => selectedEmails.has(email.msg_id))

    if (allSelected) {
      // Deselect all
      setSelectedEmails(prev => {
        const newSet = new Set(prev)
        sectionEmails.forEach(email => newSet.delete(email.msg_id))
        return newSet
      })
    } else {
      // Select all
      setSelectedEmails(prev => {
        const newSet = new Set(prev)
        sectionEmails.forEach(email => newSet.add(email.msg_id))
        return newSet
      })
    }
  }

  // New handlers for enhanced workflow
  const handleEmailsFetched = (emails, totalFetched) => {
    setFetchedEmails(emails)
    setCurrentView('fetched')
  }

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results)
    // Update the main dashboard with new results
    setEmails(prevEmails => ({
      ...prevEmails,
      toDelete: results.to_delete_emails || [],
      important: results.important_emails || []
    }))

    setStats(prevStats => ({
      ...prevStats,
      toDelete: results.to_delete_count || 0,
      important: results.important_count || 0
    }))

    // Switch back to dashboard view
    setCurrentView('dashboard')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    setFetchedEmails([])
    setAnalysisResults(null)
  }

  useEffect(() => {
    fetchEmails()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex flex-col items-center justify-center text-white">
        <div className="spinner mb-4"></div>
        <p className="text-lg">Loading your emails...</p>
      </div>
    )
  }

  // Render different views based on currentView state
  if (currentView === 'fetcher') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 p-4">
        <div className="max-w-full mx-auto">
          <div className="mb-6">
            {/* <button
              className="btn btn-secondary mb-4"
              onClick={() => setCurrentView('dashboard')}
            >
              <i className="fas fa-arrow-left"></i>
              Back to Dashboard
            </button> */}
          </div>
          <EmailFetcher
            onEmailsFetched={handleEmailsFetched}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </div>
      </div>
    )
  }

  if (currentView === 'fetched') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 p-4">
        <div className="max-w-full mx-auto">
          <FetchedEmails
            emails={fetchedEmails}
            onAnalysisComplete={handleAnalysisComplete}
            onBack={handleBackToDashboard}
          />
        </div>
      </div>
    )
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c0a09 100%)',
    }}>
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className=" rounded-2xl p-6 shadow-2xl border border-white/20 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <i className="fas fa-envelope-open text-3xl text-primary-500"></i>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Email Dashboard</h1>
              </div>
              <p className="text-white">AI-powered email analysis and management</p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                className="btn btn-success"
                onClick={() => setCurrentView('fetcher')}
              >
                <i className="fas fa-plus"></i>
                New Analysis
              </button>
              {selectedEmails.size > 0 && (
                <button
                  className={`btn ${bulkDeleting ? 'loading' : 'btn-danger'}`}
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                >
                  {bulkDeleting ? (
                    <>
                      <div className="spinner"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash"></i>
                      Delete Selected ({selectedEmails.size})
                    </>
                  )}
                </button>
              )}
              <button
                className={`btn ${refreshing ? 'loading' : 'btn-primary'}`}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <>
                    <div className="spinner"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync"></i>
                    Refresh
                  </>
                )}
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        {/* Stats */}
        {/* <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c0a09 100%)',
          padding: '2rem'
        }}> */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatsCard
                title="Total Emails"
                value={stats.important + stats.toDelete}
                icon="fas fa-inbox"
                color="primary"
              />
              <StatsCard
                title="Suggested Delete"
                value={stats.toDelete}
                icon="fas fa-trash-alt"
                color="danger"
              />
              <StatsCard
                title="Important"
                value={stats.important}
                icon="fas fa-star"
                color="success"
              />
            </div>
          </div>
        {/* </div> */}
        </div>
          {/* Email Sections */}
          <div className="space-y-6">
            {emails.toDelete.length > 0 && (
              <section className="backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/90">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                    <div style={{marginLeft:"4px"}}>
                    <i className="fas fa-trash-alt text-danger-500 text-lg" style={{ marginRight: '8px' }}></i>
                    </div>
                    Suggested for Deletion
                  </h2>
                  <div style={{marginRight:"9px"}}>
                  <button
                    className="text-sm text-white hover:text-primary-700 font-medium"
                    onClick={() => handleSelectAll('toDelete')}
                  >
                    {emails.toDelete.every(email => selectedEmails.has(email.msg_id)) ? 'Deselect All' : 'Select All'}
                  </button>
                  </div>
                </div>
                <div style={{margin:"8px"}}>
                  <div className="space-y-6">
                    {emails.toDelete.map((email) => (
                      <EmailCard
                        key={email.msg_id}
                        email={email}
                        type="delete"
                        onDelete={handleEmailDelete}
                        selected={selectedEmails.has(email.msg_id)}
                        onSelect={handleEmailSelect}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {emails.important.length > 0 && (
              <section className="backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/90">
                <div className="flex items-center justify-between mb-4">
  
                  <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                    <div style={{marginLeft:"4px"}}>
                    <i className="fas fa-star text-success-500 text-lg" style={{ margin: '8px' }}></i>
                    Important Emails
                    </div>
                  </h2>
                  <button
                    className="text-sm text-white hover:text-primary-700 font-medium"
                    onClick={() => handleSelectAll('important')}
                  >
                    {emails.important.every(email => selectedEmails.has(email.msg_id)) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div style={{ margin: '8px' }}>
                <div className="space-y-6">
                  {emails.important.map((email) => (
                    <EmailCard
                      key={email.msg_id}
                      email={email}
                      type="important"
                      onDelete={handleEmailDelete}
                      selected={selectedEmails.has(email.msg_id)}
                      onSelect={handleEmailSelect}
                    />
                  ))}
                </div></div>
              </section>
            )}

            {emails.all.length > 0 && (
              <section className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                    <i className="fas fa-inbox text-lg" style={{ marginRight: '8px' }}></i>
                    All Recent Emails
                  </h2>
                  <button
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    onClick={() => handleSelectAll('all')}
                  >
                    {emails.all.every(email => selectedEmails.has(email.msg_id)) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="space-y-6">
                  {/* {emails.all.map((email) => (
                    <EmailCard
                      key={email.msg_id}
                      email={email}
                      type="regular"
                      onDelete={handleEmailDelete}
                      selected={selectedEmails.has(email.msg_id)}
                      onSelect={handleEmailSelect}
                    />
                  ))} */}
                </div>
              </section>
            )}

            {emails.all.length === 0 && !loading && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-12 shadow-2xl border border-white/20 text-center text-gray-500">
                <i className="fas fa-inbox text-5xl mb-4 text-gray-300"></i>
                <h3 className="text-xl font-semibold mb-2 text-gray-600">No emails analyzed yet</h3>
                <p className="text-gray-500 mb-4">Start by fetching and analyzing your latest emails</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentView('fetcher')}
                >
                  <i className="fas fa-plus"></i>
                  Start New Analysis
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      )
}

      export default Dashboard 