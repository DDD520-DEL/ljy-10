import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import AnimalList from '@/pages/AnimalList'
import AnimalForm from '@/pages/AnimalForm'
import AnimalDetail from '@/pages/AnimalDetail'
import AnimalBatchImport from '@/pages/AnimalBatchImport'
import TNROperation from '@/pages/TNROperation'
import LifecycleTimeline from '@/pages/LifecycleTimeline'
import AdoptionCenter from '@/pages/AdoptionCenter'
import AdoptionApply from '@/pages/AdoptionApply'
import AdoptionReview from '@/pages/AdoptionReview'
import AdoptionAgreement from '@/pages/AdoptionAgreement'
import FollowupCalendar from '@/pages/FollowupCalendar'
import FollowupSubmit from '@/pages/FollowupSubmit'
import TransferList from '@/pages/TransferList'
import TransferForm from '@/pages/TransferForm'
import TransferDetail from '@/pages/TransferDetail'
import StationManagement from '@/pages/StationManagement'
import Profile from '@/pages/Profile'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/animals" element={<AnimalList />} />
          <Route path="/animals/new" element={<AnimalForm />} />
          <Route path="/animals/batch-import" element={<AnimalBatchImport />} />
          <Route path="/animals/:id" element={<AnimalDetail />} />
          <Route path="/animals/:id/edit" element={<AnimalForm />} />
          <Route path="/animals/:id/tnr" element={<TNROperation />} />
          <Route path="/animals/:id/lifecycle" element={<LifecycleTimeline />} />
          <Route path="/adoption" element={<AdoptionCenter />} />
          <Route path="/adoption/apply/:animalId" element={<AdoptionApply />} />
          <Route path="/adoption/review" element={<AdoptionReview />} />
          <Route path="/adoption/agreement/:applicationId" element={<AdoptionAgreement />} />
          <Route path="/followup" element={<FollowupCalendar />} />
          <Route path="/followup/submit/:id" element={<FollowupSubmit />} />
          <Route path="/transfer" element={<TransferList />} />
          <Route path="/transfer/new" element={<TransferForm />} />
          <Route path="/transfer/:id" element={<TransferDetail />} />
          <Route path="/station" element={<StationManagement />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  )
}
