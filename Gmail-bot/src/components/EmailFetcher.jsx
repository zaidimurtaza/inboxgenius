import { useState } from 'react'
import axios from 'axios'

const EmailFetcher = ({ onEmailsFetched, onAnalysisComplete }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    count: 10,
    useDateFilter: false,
    dateRange: 'last_7_days',
    startDate: '',
    endDate: '',
    useCustomRange: false
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFetchEmails = async () => {
    setLoading(true)
    setError(null)

    try {
      const requestData = {
        count: parseInt(formData.count)
      }

      // Only add date filters if user explicitly wants to use them
      if (formData.useDateFilter) {
        if (formData.useCustomRange && formData.startDate && formData.endDate) {
          requestData.start_date = formData.startDate
          requestData.end_date = formData.endDate
        } else if (!formData.useCustomRange) {
          requestData.date_range = formData.dateRange
        }
      }

      const response = await axios.post('http://localhost:8000/api/emails/fetch', requestData, {
        withCredentials: true
      })

      const { emails, total_fetched } = response.data

      if (total_fetched === 0) {
        setError('No emails found for the specified criteria. Try adjusting your search parameters.')
        return
      }

      // Pass fetched emails to parent component
      onEmailsFetched(emails, total_fetched)

    } catch (err) {
      console.error('Error fetching emails:', err)
      setError(err.response?.data?.error || 'Failed to fetch emails. Please try again.')

      if (err.response?.status === 401) {
        // Handle authentication error
        window.location.href = 'http://localhost:8000/authorize'
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeEmails = async (emails) => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.post('http://localhost:8000/api/emails/analyze', {
        emails: emails
      }, {
        withCredentials: true
      })

      const analysisResult = response.data
      onAnalysisComplete(analysisResult)

    } catch (err) {
      console.error('Error analyzing emails:', err)
      setError(err.response?.data?.error || 'Failed to analyze emails. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="backdrop-blur-sm p-6 shadow-2xl border border-white/20"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c0a09 100%)',
        minHeight: '100vh',

      }}>

      <div style={{
        margin: "10px"

      }}>
      <div className="m-18">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <i className="fas fa-search text-primary-500"></i>
          Fetch & Analyze Emails
        </h2>
        <p className="text-white">Configure your email search and AI analysis preferences</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {/* Email Count - Primary Setting */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">
          Number of Emails to Analyze
        </label>
        <select
          name="count"
          value={formData.count}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-white rounded-lg bg-transparent text-white focus:ring-2 focus:ring-white focus:border-white"
        >
          <option value={10} className="bg-gray-800 text-white">Latest 10 emails</option>
          <option value={25} className="bg-gray-800 text-white">Latest 25 emails</option>
          <option value={50} className="bg-gray-800 text-white">Latest 50 emails</option>
          <option value={100} className="bg-gray-800 text-white">Latest 100 emails</option>
          <option value={200} className="bg-gray-800 text-white">Latest 200 emails</option>
          <option value={500} className="bg-gray-800 text-white">Latest 500 emails</option>
        </select>
        <p className="text-sm text-white mt-1">
          Will fetch the most recent emails from your inbox
        </p>
      </div>

      {/* Optional Date Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="useDateFilter"
              checked={formData.useDateFilter}
              onChange={handleInputChange}
              className="mr-2"
            />
            <span className="text-sm font-medium text-white">
              Filter by date range (optional)
            </span>
          </label>
        </div>

        {formData.useDateFilter && (
          <div className="pl-6 border-l-2 border-white">
            {/* Date Range Type */}
            <div className="mb-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="useCustomRange"
                    checked={formData.useCustomRange}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Custom Date Range
                </label>
              </div>
            </div>

            {/* Date Range Options */}
            {!formData.useCustomRange ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">
                  Predefined Date Range
                </label>
                <select
                  name="dateRange"
                  value={formData.dateRange}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="last_7_days">Last 7 days</option>
                  <option value="last_30_days">Last 30 days</option>
                  <option value="last_90_days">Last 90 days</option>
                  <option value="last_year">Last year</option>
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex gap-4">
        <button
          onClick={handleFetchEmails}
          disabled={loading}
          className={`btn ${loading ? 'loading' : 'btn-primary'} flex-1`}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              Fetching Emails...
            </>
          ) : (
            <>
              <i className="fas fa-download"></i>
              Fetch {formData.count} Latest Emails
            </>
          )}
        </button>
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <i className="fas fa-info-circle"></i>
          How it works
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• By default, fetches the most recent emails from your inbox</li>
          <li>• Optionally filter by date range if you want specific time periods</li>
          <li>• Emails are processed in batches of 10 for optimal AI performance</li>
          <li>• AI categorizes emails as "Important" or "Suggested for Deletion"</li>
        </ul>
      </div>
    </div>
    </div>

  )
}

export default EmailFetcher 