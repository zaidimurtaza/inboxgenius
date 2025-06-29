import { useState } from 'react'

const EmailCard = ({ email, type, onDelete, selected, onSelect }) => {
  const [expanded, setExpanded] = useState(false)
  const [showFullBody, setShowFullBody] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const truncateText = (text, maxLength = 150) => {
    if (!text) return 'No content'
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const isHTMLContent = (content) => {
    if (!content) return false
    return /<[a-z][\s\S]*>/i.test(content)
  }

  const extractTextFromHTML = (html) => {
    if (!html) return 'No content'
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText || 'No content'
  }

  const getEmailPreview = () => {
    if (!email.body) return 'No content'
    
    if (isHTMLContent(email.body)) {
      const textContent = extractTextFromHTML(email.body)
      return showFullBody ? textContent : truncateText(textContent)
    }
    
    return showFullBody ? email.body : truncateText(email.body)
  }

  const getCardClassName = () => {
    const baseClass = 'backdrop-blur-sm rounded-2xl p-6 shadow-2xl border transition-all duration-500 relative overflow-hidden'
    
    switch (type) {
      case 'delete':
        return `${baseClass} bg-gradient-to-br from-red-900/20 via-red-800/10 to-red-900/20 border-red-500/30 hover:border-red-400/50`
      case 'important':
        return `${baseClass} bg-gradient-to-br from-emerald-900/20 via-emerald-800/10 to-emerald-900/20 border-emerald-500/30 hover:border-emerald-400/50`
      default:
        return `${baseClass} bg-gradient-to-br from-slate-800/40 via-slate-700/20 to-slate-800/40 border-slate-600/30 hover:border-slate-500/50`
    }
  }

  const getBorderAccent = () => {
    switch (type) {
      case 'delete':
        return 'before:bg-gradient-to-b before:from-red-500 before:to-red-600'
      case 'important':
        return 'before:bg-gradient-to-b before:from-emerald-500 before:to-emerald-600'
      default:
        return 'before:bg-gradient-to-b before:from-blue-500 before:to-purple-600'
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this email? This action cannot be undone.')) {
      try {
        setDeleting(true)
        // Simulate API call with fetch
        const response = await fetch(`http://localhost:8000/api/emails/${email.msg_id}/delete`, {
          method: 'DELETE',
          credentials: 'include'
        })
        
        const data = await response.json()
        
        if (data.success) {
          if (onDelete) {
            onDelete(email.msg_id)
          }
          alert('Email deleted successfully!')
        } else {
          alert('Failed to delete email: ' + data.error)
        }
      } catch (error) {
        console.error('Error deleting email:', error)
        alert('Failed to delete email. Please try again.')
      } finally {
        setDeleting(false)
      }
    }
  }

  const handleMarkImportant = async () => {
    try {
      console.log('Marking email as important:', email.msg_id)
    } catch (error) {
      console.error('Error marking email as important:', error)
    }
  }

  const handleCheckboxChange = (e) => {
    if (onSelect) {
      onSelect(email.msg_id, e.target.checked)
    }
  }

  return (
    <div className={`${getCardClassName()} ${getBorderAccent()} before:absolute before:left-0 before:top-0 before:w-1 before:h-full before:rounded-l-2xl`}>
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-2xl pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex items-start gap-4">
          {/* Custom Checkbox */}
          <div className="relative mt-1">
            <input
              type="checkbox"
              checked={selected || false}
              onChange={handleCheckboxChange}
              className="sr-only"
              id={`checkbox-${email.msg_id}`}
            />
            <label
              htmlFor={`checkbox-${email.msg_id}`}
              className={`flex items-center justify-center w-5 h-5 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                selected 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-500 shadow-lg shadow-blue-500/25' 
                  : 'border-slate-500/50 hover:border-slate-400/70 bg-slate-800/50'
              }`}
            >
              {selected && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </label>
          </div>
          
          {/* Email Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white truncate mb-2 leading-tight">
                  {email.subject || '(No Subject)'}
                </h3>
                <div className="flex items-center gap-6 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="truncate font-medium">{email.sender || '(Unknown Sender)'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="font-medium">{formatDate(email.date)}</span>
                  </div>
                </div>
              </div>
              
              {/* Type Badge */}
              <div className="flex-shrink-0">
                {type === 'delete' && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border border-red-500/30">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </span>
                )}
                {type === 'important' && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-300 border border-emerald-500/30">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Important
                  </span>
                )}
              </div>
            </div>

            {/* Email Body */}
            <div className="mb-4">
              {isHTMLContent(email.body) && showFullBody ? (
                // HTML Email Renderer
                <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-700/30 overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-slate-800/40 border-b border-slate-700/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-slate-300 font-medium">HTML Email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
                        onClick={() => setShowFullBody(false)}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div 
                      className="prose prose-sm max-w-none"
                      style={{
                        backgroundColor: '#ffffff',
                        padding: '20px',
                        borderRadius: '8px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}
                      dangerouslySetInnerHTML={{ __html: email.body }}
                    />
                  </div>
                </div>
              ) : (
                // Text Preview
                <div className="text-sm text-slate-200 bg-slate-900/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {isHTMLContent(email.body) ? (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-xs text-slate-400">HTML</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                          <span className="text-xs text-slate-400">Text</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="max-h-32 overflow-y-auto">
                        {getEmailPreview()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {email.body && (
                <div className="flex items-center justify-between mt-2">
                  <button 
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium underline transition-colors duration-200"
                    onClick={() => setShowFullBody(!showFullBody)}
                  >
                    {showFullBody ? 'Show Preview' : (isHTMLContent(email.body) ? 'Show HTML Email' : 'Show Full Text')}
                  </button>
                  
                  {isHTMLContent(email.body) && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Rich Content
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button 
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-700/50 to-slate-600/50 hover:from-slate-600/60 hover:to-slate-500/60 text-white text-sm font-medium rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10"
                onClick={() => setExpanded(!expanded)}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Details
              </button>
              
              {type === 'delete' && (
                <button 
                  className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600/60 to-red-700/60 hover:from-red-500/70 hover:to-red-600/70 text-white text-sm font-medium rounded-lg border border-red-500/30 hover:border-red-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 ${deleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </>
                  )}
                </button>
              )}
              
              {type === 'important' && (
                <button 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600/60 to-emerald-700/60 hover:from-emerald-500/70 hover:to-emerald-600/70 text-white text-sm font-medium rounded-lg border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
                  onClick={handleMarkImportant}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Mark Important
                </button>
              )}
              
              {type === 'regular' && (
                <>
                  <button 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600/60 to-emerald-700/60 hover:from-emerald-500/70 hover:to-emerald-600/70 text-white text-sm font-medium rounded-lg border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
                    onClick={handleMarkImportant}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Mark Important
                  </button>
                  <button 
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600/60 to-red-700/60 hover:from-red-500/70 hover:to-red-600/70 text-white text-sm font-medium rounded-lg border border-red-500/30 hover:border-red-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 ${deleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Expanded Details */}
            {expanded && (
              <div className="mt-6 pt-4 border-t border-slate-700/50 animate-fadeIn">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                    <span className="text-slate-400 font-medium min-w-[60px]">To:</span>
                    <span className="text-slate-200 truncate font-medium">{email.receiver || '(Unknown Recipient)'}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                    <span className="text-slate-400 font-medium min-w-[60px]">ID:</span>
                    <span className="text-slate-300 font-mono text-xs bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">{email.msg_id}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                    <span className="text-slate-400 font-medium min-w-[60px]">Date:</span>
                    <span className="text-slate-200 font-medium">{email.date}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Sample usage component to demonstrate the theme
const EmailCardDemo = () => {
  const [selectedEmails, setSelectedEmails] = useState([])
  
  const sampleEmails = [
    {
      msg_id: '1',
      subject: 'Rider Order Alert - New Delivery Request',
      sender: 'notifications@digistall.in',
      receiver: 'rider@digistall.in',
      date: '2024-01-15T10:30:00Z',
      body: `<!DOCTYPE html> <html> <head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Rider Notification</title> </head> <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;"> <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"> <!-- Header with gradient background --> <div style="background: linear-gradient(to right, #4776E6, #8E54E9); padding: 20px; border-radius: 8px 8px 0 0; text-align: center; margin-bottom: 20px;"> <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Rider Order Alert!</h1> </div> <!-- Main content --> <div style="padding: 0 20px 20px 20px;"> <h2 style="color: #333333; font-size: 20px; margin-top: 0;">Hello Test M,</h2> <p style="color: #555555; font-size: 16px; line-height: 1.6;"> A new Rider Order has arrived and is waiting for you to accept it. </p> <!-- Call to action button --> <div style="text-align: center; margin: 30px 0;"> <a href="https://rider.digistall.in" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block; font-size: 16px;">Check Your Orders</a> </div> <p style="color: #555555; font-size: 16px; line-height: 1.6;"> Please take action as soon as possible to ensure prompt delivery. </p> <!-- Separator line --> <div style="border-bottom: 1px solid #eeeeee; margin: 20px 0;"></div> <!-- Footer section --> <div style="text-align: center;"> <p style="color: #888888; font-size: 14px; margin-bottom: 5px;">Thank you for your prompt attention,</p> <p style="color: #555555; font-size: 16px; font-weight: bold; margin-top: 0;">Digistall Team</p> </div> </div> <!-- Footer with contact info --> <div style="background-color: #f9f9f9; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #eeeeee;"> <p style="color: #888888; font-size: 12px; margin: 0;"> © 2025 Digistall. All rights reserved. </p> <p style="color: #888888; font-size: 12px; margin: 5px 0 0 0;"> If you need assistance, contact us at <p><strong>Email:</strong> <a href="mailto:humansofruralindia@gmail.com">humansofruralindia@gmail.com</a></p> <p><strong>Phone:</strong> +91 9461852060</p> </p> </div> </div> </body> </html>`
    },
    {
      msg_id: '2',
      subject: 'Weekly Newsletter - Tech Updates',
      sender: 'newsletter@techblog.com',
      receiver: 'subscriber@email.com',
      date: '2024-01-14T08:00:00Z',
      body: 'Welcome to this week\'s tech newsletter! Here are the latest updates from the world of technology, including AI breakthroughs, new framework releases, and industry trends you should know about.\n\nThis week\'s highlights:\n- New AI models released by major tech companies\n- React 19 beta features announced\n- Cybersecurity updates and best practices\n- Mobile development trends for 2024\n\nStay tuned for more updates next week!'
    },
    {
      msg_id: '3',
      subject: 'Account Security Alert',
      sender: 'security@bankingsystem.com',
      receiver: 'customer@email.com',
      date: '2024-01-13T15:45:00Z',
      body: `<html><body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;"><div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><div style="background-color: #d32f2f; color: white; padding: 20px; text-align: center;"><h1 style="margin: 0; font-size: 24px;">⚠️ Security Alert</h1></div><div style="padding: 30px;"><h2 style="color: #333; margin-top: 0;">Unusual Account Activity Detected</h2><p style="color: #666; line-height: 1.6;">We've detected some unusual activity on your account. Please review the following details and take immediate action if you don't recognize this activity.</p><div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;"><strong>Activity Details:</strong><br>Login attempt from new device<br>Location: Mumbai, India<br>Time: Today at 3:45 PM</div><p style="color: #666; line-height: 1.6;">If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately.</p><div style="text-align: center; margin: 30px 0;"><a href="#" style="background-color: #d32f2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Secure My Account</a></div></div></div></body></html>`
    }
  ]

  const handleSelect = (emailId, isSelected) => {
    setSelectedEmails(prev => 
      isSelected 
        ? [...prev, emailId]
        : prev.filter(id => id !== emailId)
    )
  }

  const handleDelete = (emailId) => {
    console.log('Email deleted:', emailId)
  }

  return (
    <div 
      className="min-h-screen p-6"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c0a09 100%)' }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Email Management</h1>
          <p className="text-slate-300">Manage your emails with style</p>
        </div>
        
        <EmailCard
          email={sampleEmails[0]}
          type="important"
          onDelete={handleDelete}
          selected={selectedEmails.includes(sampleEmails[0].msg_id)}
          onSelect={handleSelect}
        />
        
        <EmailCard
          email={sampleEmails[1]}
          type="regular"
          onDelete={handleDelete}
          selected={selectedEmails.includes(sampleEmails[1].msg_id)}
          onSelect={handleSelect}
        />
        
        <EmailCard
          email={sampleEmails[2]}
          type="delete"
          onDelete={handleDelete}
          selected={selectedEmails.includes(sampleEmails[2].msg_id)}
          onSelect={handleSelect}
        />
      </div>
    </div>
  )
}

export default EmailCard