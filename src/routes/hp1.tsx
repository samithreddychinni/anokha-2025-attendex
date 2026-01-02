import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { 
  getParticipantByQR, 
  updateParticipantMock, 
  HOSTELS, 
  type Participant 
} from '../lib/hp1-data'
import { toast } from 'sonner'
import { 
  LogOut, 
  QrCode, 
  Save, 
  AlertCircle 
} from 'lucide-react'

export const Route = createFileRoute('/hp1')({
  component: HP1Dashboard,
})

function HP1Dashboard() {
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form States
  const [hospitalityQr, setHospitalityQr] = useState('')
  const [selectedHostel, setSelectedHostel] = useState('')
  const [collegeName, setCollegeName] = useState('')
  const [isDayScholar, setIsDayScholar] = useState(false)

  const handleScan = async (result: string) => {
    if (!result) return
    setIsScanning(false)
    setLoading(true)
    try {
      // Extract raw text if it's a URL or complex string, simplified for mock
      const rawQr = result 
      const data = await getParticipantByQR(rawQr)
      
      if (data) {
        setParticipant(data)
        // Initialize form fields
        setCollegeName(data.college)
        setIsDayScholar(data.day_scholar)
        setHospitalityQr(data.hospitality_qr || '')
        setSelectedHostel(data.hostel_assigned || '')
        toast.success(`Loaded ${data.name}`)
      } else {
        toast.error('Participant not found')
      }
    } catch (e) {
      toast.error('Scan failed')
    } finally {
      setLoading(false)
    }
  }

  // Debug Helper
  const simulateScan = (qr: string) => handleScan(qr)

  const handleSave = async () => {
    if (!participant) return
    
    // Validation: If acco required and NOT day scholar, needs hostel
    // Logic: if participant.req_accommodation is TRUE, and they are NOT marked as Day Scholar
    // then they MUST have a hostel assigned?
    // Prompt says: "Assign hostel if required". 
    // Let's enforce: If req_acco is true AND !isDayScholar AND no hostel selected -> Warning
    if (participant.req_accommodation && !isDayScholar && !selectedHostel) {
       toast.warning("Please assign a hostel for this participant.")
       return
    }

    const updated: Participant = {
      ...participant,
      college: collegeName,
      day_scholar: isDayScholar,
      hospitality_qr: hospitalityQr || null,
      hostel_assigned: selectedHostel || null,
      status: hospitalityQr ? 'MAPPED' : participant.status
    }

    setLoading(true)
    await updateParticipantMock(updated)
    setParticipant(updated)
    setLoading(false)
    toast.success('Changes saved')
  }

  const handleCheckout = async () => {
    if (!confirm('Are you sure you want to checkout this participant? This cannot be undone.')) return
    
    setLoading(true)
    await updateParticipantMock({ ...participant!, status: 'CHECKED_OUT' })
    setParticipant(prev => prev ? ({ ...prev, status: 'CHECKED_OUT' }) : null)
    setLoading(false)
    toast.success('Checked out successfully')
  }

  const reset = () => {
    setParticipant(null)
    setHospitalityQr('')
    setSelectedHostel('')
    setCollegeName('')
    setIsDayScholar(false)
  }

  if (loading) {
     return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
     </div>
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-indigo-900">Hospitality Desk</h1>
          <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">HP1</span>
        </div>
        {participant && (
           <button onClick={reset} className="text-gray-500 hover:text-gray-700 text-sm">
             Close
           </button>
        )}
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-md mx-auto space-y-6">
        
        {/* SCANNER VIEW */}
        {!participant && (
          <div className="flex flex-col items-center justify-center space-y-8 mt-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Scan Participant</h2>
              <p className="text-gray-500 mb-6">Scan Profile QR to begin mapping</p>
              
              <button 
                onClick={() => setIsScanning(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl shadow-md transition-all active:scale-95"
              >
                Scan QR Code
              </button>

              {/* Debug Tools */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Debug / Simulate</p>
                <div className="flex gap-2">
                  <button onClick={() => simulateScan('PROF-001')} className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 py-2 rounded text-gray-600">
                    Arjun (Acco)
                  </button>
                  <button onClick={() => simulateScan('PROF-002')} className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 py-2 rounded text-gray-600">
                    Sneha (Ext)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DETAILS VIEW */}
        {participant && (
          <>
            {/* Status Status */}
            <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-3 rounded-xl border border-blue-100">
              <AlertCircle size={18} />
              <div className="flex-1">
                <p className="text-xs font-bold uppercase opacity-70">Current Status</p>
                <p className="font-semibold">{participant.status.replace('_', ' ')}</p>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profile Details</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">{participant.profile_qr}</span>
               </div>
               <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                    <div className="text-lg font-bold text-gray-900">{participant.name}</div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">College (Editable)</label>
                    <input 
                      type="text" 
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      className="w-full border-b border-gray-300 focus:border-indigo-500 outline-none py-1 bg-transparent text-gray-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                      <div className="text-sm font-medium text-gray-700">{participant.category.replace(/_/g, ' ')}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Req Access</label>
                      <div className={`text-sm font-bold ${participant.req_accommodation ? 'text-green-600' : 'text-gray-400'}`}>
                        {participant.req_accommodation ? 'YES' : 'NO'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="text-sm font-medium text-gray-700">Day Scholar?</label>
                    <button 
                      onClick={() => setIsDayScholar(!isDayScholar)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDayScholar ? 'bg-indigo-600' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDayScholar ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
               </div>
            </div>

            {/* Mapping Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <QrCode size={16} className="text-indigo-600" />
                Hospitality Mapping
              </h3>
              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-500">Hospitality QR Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Scan or Enter HOSP-xxx"
                    value={hospitalityQr}
                    onChange={(e) => setHospitalityQr(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                  />
                  <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg text-gray-600">
                    <QrCode size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Hostel Assignment - Only if req_accommodation is TRUE */}
            {participant.req_accommodation && (
               <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${isDayScholar ? 'opacity-50 pointer-events-none' : ''}`}>
               <h3 className="text-sm font-bold text-gray-900 mb-4">Hostel Assignment</h3>
               <div className="space-y-3">
                 <label className="block text-xs font-medium text-gray-500">Select Hostel</label>
                 <select 
                   value={selectedHostel}
                   onChange={(e) => setSelectedHostel(e.target.value)}
                   className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-base focus:ring-2 focus:ring-indigo-100 outline-none"
                   disabled={isDayScholar}
                 >
                   <option value="">-- Select Hostel --</option>
                   {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
                 </select>
                 {isDayScholar && <p className="text-xs text-orange-500">Disabled: Participant is Day Scholar</p>}
               </div>
             </div>
            )}
            
            <div className="h-20"></div> {/* Spacer */}
          </>
        )}
      </main>

      {/* Floating Actions */}
      {participant && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg safe-area-pb">
          <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
             {participant.status !== 'CHECKED_OUT' ? (
                <>
                  <button 
                    onClick={handleCheckout}
                    className="flex items-center justify-center gap-2 bg-red-50 text-red-600 font-semibold py-3 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <LogOut size={18} />
                    Checkout
                  </button>
                  <button 
                     onClick={handleSave}
                     className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
                  >
                    <Save size={18} />
                    Save
                  </button>
                </>
             ) : (
                <div className="col-span-2 text-center text-red-600 font-bold py-3 bg-red-50 rounded-xl">
                   CHECKED OUT 
                </div>
             )}
          </div>
        </div>
      )}

      {/* Scanner Modal Overlay */}
      {isScanning && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
           <div className="flex justify-between items-center p-4 text-white">
              <span className="font-bold">Scan QR</span>
              <button onClick={() => setIsScanning(false)} className="bg-white/20 px-3 py-1 rounded-full text-sm">Close</button>
           </div>
           <div className="flex-1 relative">
             <Scanner 
                onResult={res => handleScan(res)} 
                onError={err => console.error(err)}
                options={{ }}
             />
           </div>
           <div className="p-8 text-center text-gray-400 text-sm">
             Point camera at Participant Profile QR
           </div>
        </div>
      )}
    </div>
  )
}
