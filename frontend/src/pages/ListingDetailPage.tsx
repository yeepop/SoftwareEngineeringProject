import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { listingsApi } from '../api/listings'
import { applicationsApi } from '../api/applications'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const ListingDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getListingById(id!),
    enabled: !!id,
  })

  const applicationMutation = useMutation({
    mutationFn: (data: any) => applicationsApi.createApplication(data),
    onSuccess: () => {
      toast.success('申請已提交！我們會盡快審核您的申請。')
      setShowApplicationForm(false)
    },
    onError: (error: any) => {
      toast.error(error.message || '提交申請失敗')
    },
  })

  const handleApply = () => {
    if (!user) {
      toast.error('請先登入')
      navigate('/login')
      return
    }
    setShowApplicationForm(true)
  }

  const handleSubmitApplication = (formData: any) => {
    applicationMutation.mutate({
      animalId: id!,
      personalInfo: {
        name: formData.name,
        age: parseInt(formData.age),
        occupation: formData.occupation,
        address: formData.address,
      },
      livingSituation: {
        housingType: formData.housingType,
        hasYard: formData.hasYard === 'yes',
        hasOtherPets: formData.hasOtherPets === 'yes',
        otherPetsDetails: formData.otherPetsDetails,
      },
      experienceWithPets: {
        hasPreviousExperience: formData.hasPreviousExperience === 'yes',
        experienceDetails: formData.experienceDetails,
      },
      additionalInfo: {
        reason: formData.reason,
        timeCommitment: formData.timeCommitment,
      },
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">找不到此寵物</h1>
          <p className="text-gray-600 mb-4">此寵物可能已被領養或不存在。</p>
          <button
            onClick={() => navigate('/listings')}
            className="btn-primary"
          >
            返回列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            {listing.images.length > 0 ? (
              <div>
                <div className="mb-4">
                  <img
                    src={listing.images[currentImageIndex]}
                    alt={listing.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                {listing.images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {listing.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          index === currentImageIndex ? 'border-primary-500' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${listing.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-6xl">🐾</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{listing.name}</h1>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  listing.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {listing.status === 'AVAILABLE' ? '可領養' : '待審核'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-gray-600">種類:</span>
                  <span className="ml-2 font-semibold">
                    {listing.species === 'DOG' ? '🐕 狗狗' : '🐱 貓咪'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">年齡:</span>
                  <span className="ml-2 font-semibold">{listing.age} 歲</span>
                </div>
                <div>
                  <span className="text-gray-600">性別:</span>
                  <span className="ml-2 font-semibold">
                    {listing.gender === 'MALE' ? '♂ 男生' : listing.gender === 'FEMALE' ? '♀ 女生' : '性別未知'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">體型:</span>
                  <span className="ml-2 font-semibold">
                    {listing.size === 'SMALL' ? '小型' : listing.size === 'MEDIUM' ? '中型' : '大型'}
                  </span>
                </div>
                {listing.breed && (
                  <div className="col-span-2">
                    <span className="text-gray-600">品種:</span>
                    <span className="ml-2 font-semibold">{listing.breed}</span>
                  </div>
                )}
                {listing.color && (
                  <div className="col-span-2">
                    <span className="text-gray-600">顏色:</span>
                    <span className="ml-2 font-semibold">{listing.color}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-6 mb-6 text-sm">
                {listing.isVaccinated && (
                  <span className="flex items-center text-green-600">
                    <span className="mr-1">✓</span>
                    已疫苗接種
                  </span>
                )}
                {listing.isSpayedNeutered && (
                  <span className="flex items-center text-green-600">
                    <span className="mr-1">✓</span>
                    已結紮
                  </span>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">關於 {listing.name}</h3>
                <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              </div>

              {listing.healthInfo && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">健康狀況</h3>
                  <p className="text-gray-700 leading-relaxed">{listing.healthInfo}</p>
                </div>
              )}

              {listing.behaviorNotes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">行為特徵</h3>
                  <p className="text-gray-700 leading-relaxed">{listing.behaviorNotes}</p>
                </div>
              )}

              {listing.specialNeeds && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">特殊需求</h3>
                  <p className="text-gray-700 leading-relaxed">{listing.specialNeeds}</p>
                </div>
              )}

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-gray-600">領養費用</span>
                    <div className="text-2xl font-bold text-primary-600">
                      NT$ {listing.adoptionFee.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600">地點</span>
                    <div className="font-semibold">{listing.location}</div>
                  </div>
                </div>

                {listing.status === 'AVAILABLE' && (
                  <button
                    onClick={handleApply}
                    className="w-full btn-primary text-lg py-3"
                    disabled={applicationMutation.isPending}
                  >
                    {applicationMutation.isPending ? '提交中...' : '我要申請領養'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <ApplicationForm
          onSubmit={handleSubmitApplication}
          onClose={() => setShowApplicationForm(false)}
          isLoading={applicationMutation.isPending}
        />
      )}
    </div>
  )
}

// Simple Application Form Component
const ApplicationForm = ({ onSubmit, onClose, isLoading }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    occupation: '',
    address: '',
    housingType: '',
    hasYard: '',
    hasOtherPets: '',
    otherPetsDetails: '',
    hasPreviousExperience: '',
    experienceDetails: '',
    reason: '',
    timeCommitment: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">領養申請表</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名 *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年齡 *
                </label>
                <input
                  type="number"
                  name="age"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                職業 *
              </label>
              <input
                type="text"
                name="occupation"
                required
                value={formData.occupation}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                地址 *
              </label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                住房類型 *
              </label>
              <select
                name="housingType"
                required
                value={formData.housingType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">請選擇</option>
                <option value="apartment">公寓</option>
                <option value="house">透天厝</option>
                <option value="condo">社區大樓</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                是否有庭院？ *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasYard"
                    value="yes"
                    checked={formData.hasYard === 'yes'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  是
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasYard"
                    value="no"
                    checked={formData.hasYard === 'no'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  否
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                領養動機 *
              </label>
              <textarea
                name="reason"
                required
                rows={4}
                value={formData.reason}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="請說明您想要領養寵物的原因..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isLoading}
              >
                取消
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? '提交中...' : '提交申請'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ListingDetailPage