import { useState } from 'react'
import { DonorShell } from '../../components/donor/DonorShell'
import { DashboardHeader } from '../../components/layout/DashboardLayout'
import { AchievementsPanel } from '../../components/donor/AchievementsPanel'
import { ProfileOverview, ProfileData } from '../../components/donor/ProfileOverview'
import { EditProfileModal } from '../../components/donor/EditProfileModal'
import { useAuth } from '../../context/AuthContext'
import { useDonationStats } from '../../hooks/useDonationStats'

export default function DonorProfilePage() {
  const { user } = useAuth()
  const { stats } = useDonationStats()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const donorProfileData: ProfileData = {
    avatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&auto=format&fit=crop',
    name: user?.name || 'Unknown Donor',
    organization: user?.organization || 'Food Bridge Partner',
    email: user?.email || '',
    phone: user?.phone || 'Not provided',
    address: user?.address || 'Not provided',
    memberSince: '2026',
    isVerified: user?.status === 'approved',
    metrics: [
      { label: 'Total donations', value: stats.totalDonationEvents },
      { label: 'Total meals donated', value: stats.totalMeals },
    ],
    badge: { label: stats.totalMeals > 500 ? 'Gold Member' : 'New Member' }
  }

  return (
    <DonorShell fab={false}>
      <DashboardHeader
        title="Organization Profile"
        subtitle={`Professional profile for ${user?.organization || user?.name || 'your organization'}  verification, contact details, and impact history.`}
      />

      <ProfileOverview 
        profile={donorProfileData} 
        onEditProfile={() => setIsEditModalOpen(true)}
      />
      <AchievementsPanel />
      
      {isEditModalOpen && (
        <EditProfileModal onClose={() => setIsEditModalOpen(false)} />
      )}
    </DonorShell>
  )
}

