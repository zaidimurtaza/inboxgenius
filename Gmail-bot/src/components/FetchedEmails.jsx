import { useState } from 'react'
import axios from 'axios'
import EmailCard from './EmailCard'

const FetchedEmails = ({ emails, onAnalysisComplete, onBack }) => {
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [error, setError] = useState(null)
  const [selectedEmails, setSelectedEmails] = useState(new Set())

  const handleAnalyzeEmails = async () => {
    setAnalyzing(true)
    setError(null)
    setAnalysisProgress(0)

    try {
      const response = await axios.post('http://localhost:8000/api/emails/analyze', {
        emails: emails
      }, {
        withCredentials: true
      })

      const analysisResult = response.data

      // Simulate progress updates
      const totalBatches = analysisResult.batches_processed
      for (let i = 1; i <= totalBatches; i++) {
        setAnalysisProgress((i / totalBatches) * 100)
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate batch processing time
      }

      onAnalysisComplete(analysisResult)

    } catch (err) {
      console.error('Error analyzing emails:', err)
      setError(err.response?.data?.error || 'Failed to analyze emails. Please try again.')
    } finally {
      setAnalyzing(false)
      setAnalysisProgress(0)
    }
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

  const handleSelectAll = () => {
    const allSelected = emails.every(email => selectedEmails.has(email.msg_id))

    if (allSelected) {
      setSelectedEmails(new Set())
    } else {
      setSelectedEmails(new Set(emails.map(email => email.msg_id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedEmails.size === 0) return

    if (window.confirm(`Are you sure you want to delete ${selectedEmails.size} selected email(s)? This action cannot be undone.`)) {
      try {
        const deletePromises = Array.from(selectedEmails).map(msgId =>
          axios.delete(`http://localhost:8000/api/emails/${msgId}/delete`, {
            withCredentials: true
          })
        )

        await Promise.all(deletePromises)

        // Remove deleted emails from the list
        const remainingEmails = emails.filter(email => !selectedEmails.has(email.msg_id))

        // Clear selection
        setSelectedEmails(new Set())

        alert(`${selectedEmails.size} email(s) deleted successfully!`)

        // Update the emails list (you might want to pass this back to parent)
        window.location.reload() // Simple refresh for now

      } catch (error) {
        console.error('Bulk delete error:', error)
        alert('Failed to delete some emails. Please try again.')
      }
    }
  }

  return (
    <div 
      className="space-y-6 w-full"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c0a09 100%)',
        minHeight: '100vh'
      }}
    >

      <div style={{width:"full"}}>
      {/* Header */}
      <div className="backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <i className="fas fa-envelope text-3xl text-primary-500"></i>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Fetched Emails</h1>
            </div>
            <p className="text-gray-300">
              {emails.length} latest emails fetched • Ready for AI analysis
            </p>
            <p className="text-sm text-gray-400 mt-1">
              These are your most recent emails from your inbox
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {selectedEmails.size > 0 && (
              <button
                className="btn btn-danger"
                onClick={handleBulkDelete}
              >
                <i className="fas fa-trash"></i>
                Delete Selected ({selectedEmails.size})
              </button>
            )}
            <button
              className={`btn ${analyzing ? 'loading' : 'btn-primary'}`}
              onClick={handleAnalyzeEmails}
              disabled={analyzing}
            >
              {analyzing ? (
                <>
                  <div className="spinner"></div>
                  Analyzing... ({Math.round(analysisProgress)}%)
                </>
              ) : (
                <>
                  <i className="fas fa-brain"></i>
                  Analyze with AI
                </>
              )}
            </button>
            <button className="btn btn-secondary" onClick={onBack}>
              <i className="fas fa-arrow-left"></i>
              Back
            </button>
          </div>
        </div>

        {analyzing && (
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-300 mt-2">
              Processing emails in batches of 10... {Math.round(analysisProgress)}% complete
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg flex items-center gap-2">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {/* Emails List */}
      <div className="backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <i className="fas fa-list"></i>
            Email List ({emails.length} emails)
          </h2>
          <button
            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            onClick={handleSelectAll}
          >
            {emails.every(email => selectedEmails.has(email.msg_id)) ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="space-y-6">
          {emails.map((email) => (
            <EmailCard
              key={email.msg_id}
              email={email}
              type="regular"
              onDelete={(msgId) => {
                // Remove from list
                const updatedEmails = emails.filter(e => e.msg_id !== msgId)
                // You might want to update the parent state here
                window.location.reload()
              }}
              selected={selectedEmails.has(email.msg_id)}
              onSelect={handleEmailSelect}
            />
          ))}
        </div>

        {emails.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <i className="fas fa-inbox text-4xl mb-4 text-gray-500"></i>
            <h3 className="text-lg font-semibold mb-2 text-gray-300">No emails to display</h3>
            <p className="text-gray-400">Try fetching emails first</p>
          </div>
        )}
      </div>

      {/* Analysis Info */}
      <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
          <i className="fas fa-info-circle"></i>
          AI Analysis Process
        </h3>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>• Emails will be processed in batches of 10 for optimal AI performance</li>
          <li>• Each batch takes approximately 2-5 seconds to analyze</li>
          <li>• AI will categorize emails as "Important" or "Suggested for Deletion"</li>
          <li>• You can review and manage the results after analysis</li>
        </ul>
      </div>
    </div></div>
  )
}

export default FetchedEmails 