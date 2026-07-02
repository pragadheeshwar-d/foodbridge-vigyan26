import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Upload, Image, X } from 'lucide-react'
import { DashboardHeader } from '../../components/layout/DashboardLayout'
import { Input, Select, Textarea } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { DonorShell } from '../../components/donor/DonorShell'
import { useToast } from '../../context/ToastContext'

import { useAuth } from '../../context/AuthContext'
import { addDonation } from '../../services/donationService'
import { compressImageToBase64 } from '../../lib/imageUtils'

export default function AddDonationPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [imageData, setImageData] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [foodName, setFoodName] = useState('')
  const [category, setCategory] = useState('main')
  const [vegType, setVegType] = useState<'veg' | 'nonveg' | 'vegan'>('veg')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState<'meals' | 'kg'>('meals')
  const [preparationTime, setPreparationTime] = useState('')
  const [expiryTime, setExpiryTime] = useState('')
  const [pickupAddress, setPickupAddress] = useState('')
  const [preferredPickupTime, setPreferredPickupTime] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('Please upload an image file', 'error')
      return
    }
    try {
      const base64 = await compressImageToBase64(file, 800, 0.7)
      setImageData(base64)
    } catch (err) {
      console.error('Image compression failed', err)
      toast('Failed to process image', 'error')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast('You must be logged in to donate', 'error')
      return
    }
    if (!foodName || !quantity || !expiryTime || !pickupAddress) {
      toast('Fill in the required fields before submitting.', 'warning')
      return
    }

    setLoading(true)
    try {
      await addDonation({
        donorId: user.id,
        donorName: user.name,
        donorOrganization: user.organization || 'Individual',
        food_name: foodName,
        food_type: foodName,
        category,
        veg_type: vegType,
        image: imageData || '',
        quantity: Number(quantity),
        unit,
        preparation_time: preparationTime || '',
        preferred_pickup_time: preferredPickupTime || '',
        special_instructions: specialInstructions || '',
        expiry_time: new Date(expiryTime).toISOString(),
        pickup_address: pickupAddress,
      })
      toast('Donation submitted successfully!', 'success')
      setFoodName('')
      setCategory('main')
      setVegType('veg')
      setQuantity('')
      setUnit('meals')
      setPreparationTime('')
      setExpiryTime('')
      setPickupAddress('')
      setPreferredPickupTime('')
      setSpecialInstructions('')
      setImageData('')
    } catch (error) {
      console.error('Failed to submit donation', error)
      toast('Failed to submit donation', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DonorShell fab={false}>
      <DashboardHeader
        title="Add Donation"
        subtitle={`List surplus food from ${user?.organization || 'your kitchen'} and help nearby NGOs pick it up quickly.`}
      />

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div
          className={`relative mb-8 border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            handleFile(e.dataTransfer.files?.[0])
          }}
        >
          {imageData ? (
            <div className="relative inline-block">
              <img src={imageData} alt="Donation preview" className="max-h-64 rounded-xl mx-auto" />
              <button
                type="button"
                onClick={() => setImageData('')}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="font-semibold mb-1">Upload food photograph for NGO review</p>
              <p className="text-sm text-text-secondary mb-4">PNG or JPG up to 10MB  FSSAI-compliant packaging preferred</p>
              <Button variant="secondary" type="button" icon={Image} onClick={() => fileInputRef.current?.click()}>
                Choose File
              </Button>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        <div className="glass-card p-6 md:p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Food Name" placeholder="e.g. Chettinad Vegetable Biryani" required value={foodName} onChange={(e) => setFoodName(e.target.value)} />
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'main', label: 'Main Course' },
                { value: 'snacks', label: 'Snacks' },
                { value: 'dessert', label: 'Dessert' },
                { value: 'beverages', label: 'Beverages' },
                { value: 'fruits', label: 'Fresh Fruits' },
                { value: 'breakfast', label: 'Breakfast' },
              ]}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Select
              label="Food Type"
              value={vegType}
              onChange={(e) => setVegType(e.target.value as 'veg' | 'nonveg' | 'vegan')}
              options={[
                { value: 'veg', label: 'Vegetarian' },
                { value: 'nonveg', label: 'Non-Vegetarian' },
                { value: 'vegan', label: 'Vegan' },
              ]}
            />
            <Input label="Quantity" placeholder="e.g. 120" type="number" min="1" required value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <Select
              label="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'meals' | 'kg')}
              options={[
                { value: 'meals', label: 'Meals / servings' },
                { value: 'kg', label: 'Kilograms (kg)' },
              ]}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Preparation Time" type="time" value={preparationTime} onChange={(e) => setPreparationTime(e.target.value)} />
            <Input label="Expiry Time" type="datetime-local" required value={expiryTime} onChange={(e) => setExpiryTime(e.target.value)} />
          </div>

          <Input label="Pickup Address" placeholder="ITC Grand Chola, 63 Mount Road..." required value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} />

          <p className="text-sm text-text-secondary">
            Provide a complete pickup address and landmark so the team can confirm the location before collection.
          </p>

          <Input label="Preferred Pickup Time" type="time" value={preferredPickupTime} onChange={(e) => setPreferredPickupTime(e.target.value)} />

          <Textarea label="Special Instructions" placeholder="Allergens, halal/veg kitchen separation, loading bay Gate 3 access..." value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} />

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="primary" type="submit" loading={loading} className="flex-1 sm:flex-none">
              Submit Donation
            </Button>
            <Link to="/donor">
              <Button variant="secondary" type="button">Cancel</Button>
            </Link>
          </div>
        </div>
      </form>
    </DonorShell>
  )
}
