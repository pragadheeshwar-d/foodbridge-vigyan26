/** Tamil Nadu region defaults */
export const TN_REGION = {
  name: 'Tamil Nadu',
  capital: 'Chennai',
  lat: 13.0827,
  lng: 80.2707,
  phone: '+91 44 4567 8901',
  email: 'hello@foodbridge.tn',
  address: 'T. Nagar, Chennai, Tamil Nadu 600017',
} as const

export const stats = {
  mealsSaved: 2847563,
  activeDonations: 1247,
  ngosConnected: 892,
  foodWastePrevented: 1423,
  co2Reduced: 856420,
  dailyPeopleFed: 8420,
}

export const networkStats = {
  restaurantsConnected: 3420,
  ngosConnected: 892,
  citiesCovered: 15,
  successfulDeliveries: 78500,
}

export const howItWorks = [
  { step: 1, title: 'Donate Food', description: 'Restaurants, hotels & households across Tamil Nadu list surplus food', icon: 'UtensilsCrossed' },
  { step: 2, title: 'Smart Matching', description: 'Smart algorithm matches food with nearby NGOs in your district instantly', icon: 'Brain' },
  { step: 3, title: 'Pickup Request', description: 'Volunteers or NGOs request pickup with one tap', icon: 'Truck' },
  { step: 4, title: 'QR Verification', description: 'Secure QR codes verify pickup and delivery across TN', icon: 'QrCode' },
  { step: 5, title: 'Distribution', description: 'Food reaches shelters & communities — impact tracked live statewide', icon: 'Heart' },
]

export const recentDonations = [
  {
    id: '1',
    food: 'Vegetable Biryani',
    restaurant: 'Saravana Bhavan, T. Nagar',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d29c?w=400&h=300&fit=crop',
    type: 'veg' as const,
    meals: 45,
    pickupTime: '6:30 PM',
    distance: '2.3 km',
    status: 'available' as const,
  },
  {
    id: '2',
    food: 'South Indian Meals & Salads',
    restaurant: 'ITC Grand Chola, Guindy',
    image: 'https://images.unsplash.com/photo-1529042410799-b791f8c9140f?w=400&h=300&fit=crop',
    type: 'veg' as const,
    meals: 120,
    pickupTime: '8:00 PM',
    distance: '4.1 km',
    status: 'pending' as const,
  },
  {
    id: '3',
    food: 'Chettinad Chicken & Rice',
    restaurant: 'Anjappar Chettinad, Velachery',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    type: 'nonveg' as const,
    meals: 80,
    pickupTime: '7:15 PM',
    distance: '1.8 km',
    status: 'available' as const,
  },
  {
    id: '4',
    food: 'Fresh Fruit Platters',
    restaurant: 'The Leela Palace, Adyar',
    image: 'https://images.unsplash.com/photo-1610348726531-8431f7a38810?w=400&h=300&fit=crop',
    type: 'veg' as const,
    meals: 60,
    pickupTime: '5:45 PM',
    distance: '3.5 km',
    status: 'claimed' as const,
  },
]

export const testimonials = [
  {
    name: 'Lakshmi Venkatesan',
    role: 'Director, Udhavum Ullangal, Chennai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    quote: 'Food Bridge transformed how we receive donations across Chennai. The live matching saves us hours every day.',
  },
  {
    name: 'Karthikeyan Raman',
    role: 'Head Chef, ITC Grand Chola',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    quote: 'Listing surplus is one tap now. Our kitchen team loves it.',
  },
  {
    name: 'Anitha Suresh',
    role: 'Volunteer Lead, No Food Waste',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    quote: 'Pickup coordination finally feels effortless — I can focus on the community instead of logistics.',
  },
]

export const faqs = [
  {
    q: 'How does Food Bridge work?',
    a: 'Donors across Tamil Nadu list surplus food, nearby NGOs request what they need, volunteers pick up and deliver with QR verification — all tracked in real-time.',
  },
  {
    q: 'Which cities in Tamil Nadu does Food Bridge cover?',
    a: 'We operate in 15 major cities including Chennai, Coimbatore, Madurai, Trichy, Salem, Tirunelveli, Erode, Vellore, Thanjavur, and more — with plans to expand to all 38 districts.',
  },
  {
    q: 'Is there a cost to use the platform?',
    a: 'Food Bridge is free for verified NGOs and donors. We sustain operations through CSR partnerships with hospitality groups.',
  },
  {
    q: 'How is food safety ensured?',
    a: 'Every donation requires a photo, time of preparation, and FSSAI-compliant packaging. Pickups are QR verified at both ends.',
  },
  {
    q: 'Can households donate small quantities?',
    a: 'Yes — any surplus from a wedding, party, or even daily cooking can be listed. We aggregate small donations into NGO-friendly pickups.',
  },
]

export const monthlyTrends = [
  { month: 'Jan', donations: 520, meals: 9600 },
  { month: 'Feb', donations: 580, meals: 11200 },
  { month: 'Mar', donations: 610, meals: 12000 },
  { month: 'Apr', donations: 540, meals: 10500 },
  { month: 'May', donations: 590, meals: 11800 },
  { month: 'Jun', donations: 650, meals: 13000 },
]

export const donorStats = {
  todayDonations: 12,
  mealsDonated: 340,
  pendingPickups: 3,
  wastePrevented: 45.2,
  carbonSaved: 128.5,
}

export const adminStats = {
  totalUsers: 15420,
  totalDonations: 89234,
  mealsSaved: 2847563,
  pendingPickups: 47,
  complaints: 12,
  carbonSaved: 856420,
}

export const topDonors = [
  { name: 'ITC Grand Chola, Chennai', meals: 12450 },
  { name: 'Saravana Bhavan', meals: 8920 },
  { name: 'Anjappar Chettinad', meals: 7650 },
  { name: 'Sangeetha Veg Restaurant', meals: 5430 },
  { name: 'Tamil Wedding Caterers', meals: 4210 },
]

export const topNGOs = [
  { name: 'Akshaya Patra Foundation', meals: 45200 },
  { name: 'Robin Hood Army', meals: 38900 },
  { name: 'No Food Waste', meals: 32100 },
  { name: 'Udhavum Ullangal', meals: 28700 },
  { name: 'Feeding India', meals: 22400 },
]

export const activeCities = [
  { city: 'Chennai', donations: 12400 },
  { city: 'Coimbatore', donations: 9800 },
  { city: 'Madurai', donations: 8700 },
  { city: 'Trichy', donations: 6500 },
  { city: 'Salem', donations: 5400 },
  { city: 'Tirunelveli', donations: 4800 },
]

export const leaderboard = [
  { rank: 1, name: 'Karthik M.', meals: 2450, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop' },
  { rank: 2, name: 'Lakshmi R.', meals: 2180, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop' },
  { rank: 3, name: 'Arun V.', meals: 1920, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop' },
  { rank: 4, name: 'Deepa S.', meals: 1650, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop' },
  { rank: 5, name: 'Venkatesh K.', meals: 1420, avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=40&h=40&fit=crop' },
]

export const myDonations = [
  { id: 'FB-DN-2026-0844', food: 'South Indian Breakfast Spread', meals: 35, status: 'completed', date: '2026-06-26', receiver: 'Udhavum Ullangal' },
  { id: 'FB-DN-2026-0842', food: 'Vegetable Meals & Sambar Rice', meals: 50, status: 'in_transit', date: '2026-06-27', receiver: 'Akshaya Patra Foundation' },
  { id: 'FB-DN-2026-0845', food: 'Fresh Fruit Platters', meals: 20, status: 'pending', date: '2026-06-27', receiver: '—' },
  { id: 'FB-DN-2026-0840', food: 'Chettinad Biryani', meals: 45, status: 'completed', date: '2026-06-25', receiver: 'No Food Waste' },
  { id: 'FB-DN-2026-0838', food: 'Paneer Tikka & Naan', meals: 30, status: 'completed', date: '2026-06-24', receiver: 'Helping Hands Foundation' },
]

export const pickupRequests = [
  { id: 'FB-PK-2026-0312', food: 'Vegetable Meals & Sambar Rice', ngo: 'Akshaya Patra Foundation', time: '7:00 PM', status: 'accepted' },
  { id: 'FB-PK-2026-0313', food: 'Fresh Fruit Platters & Salads', ngo: 'Helping Hands Foundation', time: '6:30 PM', status: 'pending' },
  { id: 'FB-PK-2026-0314', food: 'Chettinad Biryani & Raita', ngo: 'No Food Waste', time: '8:15 PM', status: 'pending' },
]

export const notifications = [
  { id: '1', title: 'Pickup confirmed', message: 'Akshaya Patra Chennai will pick up Vegetable Meals at 7:00 PM', time: '5 min ago', read: false },
  { id: '2', title: 'New match found', message: 'Your Fruit Salad has been matched with 3 nearby NGOs in Chennai', time: '12 min ago', read: false },
  { id: '3', title: 'Certificate ready', message: 'Your June donation certificate is available', time: '1 hr ago', read: true },
  { id: '4', title: 'Achievement unlocked', message: 'You earned the Eco Warrior badge!', time: '2 hrs ago', read: true },
]

export const nearbyFood = recentDonations.map((d) => ({
  ...d,
  timeLeft: '45 min',
  lat: TN_REGION.lat + (Math.random() - 0.5) * 0.08,
  lng: TN_REGION.lng + (Math.random() - 0.5) * 0.08,
}))

export const acceptedPickups = [
  { id: 'A001', food: 'Vegetable Biryani', donor: 'Saravana Bhavan', status: 'en_route', eta: '15 min', progress: 65 },
  { id: 'A002', food: 'South Indian Meals', donor: 'ITC Grand Chola', status: 'picked_up', eta: '25 min', progress: 40 },
]

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}