import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin'
import toast from 'react-hot-toast'

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('applications')
  const [applicationPage, setApplicationPage] = useState(1)
  const [listingsPage, setListingsPage] = useState(1)
  const queryClient = useQueryClient()

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
  })

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['admin-applications', applicationPage],
    queryFn: () => adminApi.getApplications(applicationPage, 10),
  })

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['admin-listings', listingsPage],
    queryFn: () => adminApi.getAllListings(listingsPage, 10),
    enabled: activeTab === 'listings',
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.reviewApplication(id, data),
    onSuccess: () => {
      toast.success('申請已處理')
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (error: any) => {
      toast.error(error.message || '處理申請失敗')
    },
  })

  const updateListingStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'AVAILABLE' | 'PENDING' | 'ADOPTED' | 'WITHDRAWN' }) => adminApi.updateListingStatus(id, status),
    onSuccess: () => {
      toast.success('寵物狀態已更新')
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (error: any) => {
      toast.error(error.message || '更新狀態失敗')
    },
  })

  const handleReviewApplication = (applicationId: string, status: 'APPROVED' | 'REJECTED', notes?: string) => {
    reviewMutation.mutate({
      id: applicationId,
      data: { status, reviewNotes: notes },
    })
  }

  const handleUpdateListingStatus = (listingId: string, status: 'AVAILABLE' | 'PENDING' | 'ADOPTED' | 'WITHDRAWN') => {
    updateListingStatusMutation.mutate({
      id: listingId,
      status,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800'
      case 'ADOPTED':
        return 'bg-blue-100 text-blue-800'
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string, type: 'application' | 'listing' = 'application') => {
    if (type === 'listing') {
      switch (status) {
        case 'AVAILABLE':
          return '可領養'
        case 'PENDING':
          return '待審核'
        case 'ADOPTED':
          return '已領養'
        case 'WITHDRAWN':
          return '已下架'
        default:
          return '未知'
      }
    }
    
    switch (status) {
      case 'PENDING':
        return '待審核'
      case 'UNDER_REVIEW':
        return '審核中'
      case 'APPROVED':
        return '已通過'
      case 'REJECTED':
        return '已拒絕'
      default:
        return '未知'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">管理後台</h1>
          <p className="mt-2 text-gray-600">管理領養申請和寵物清單</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="text-3xl mb-2">🐾</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">總寵物數</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalListings}</p>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center">
                <div className="text-3xl mb-2">📋</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">總申請數</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center">
                <div className="text-3xl mb-2">⏰</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">待審核</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</p>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center">
                <div className="text-3xl mb-2">🏠</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">成功領養</p>
                  <p className="text-2xl font-bold text-green-600">{stats.adoptedAnimals}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('applications')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'applications'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                領養申請管理
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'listings'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                寵物清單管理
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'applications' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">領養申請</h2>
                
                {applicationsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                ) : applications && applications.data.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {applications.data.map((application: any) => (
                        <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-4">
                              {application.animal?.images?.[0] && (
                                <img
                                  src={application.animal.images[0]}
                                  alt={application.animal.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {application.animal?.name || '未知寵物'}
                                </h3>
                                <p className="text-gray-600">
                                  申請人: {application.personalInfo?.name || '未知'} • 
                                  申請時間: {new Date(application.submittedAt).toLocaleDateString('zh-TW')}
                                </p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
                              {getStatusText(application.status)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <span className="font-medium">年齡:</span> {application.personalInfo?.age}
                            </div>
                            <div>
                              <span className="font-medium">職業:</span> {application.personalInfo?.occupation}
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">地址:</span> {application.personalInfo?.address}
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">住房類型:</span> {application.livingSituation?.housingType}
                            </div>
                            {application.additionalInfo?.reason && (
                              <div className="col-span-2">
                                <span className="font-medium">領養動機:</span>
                                <p className="mt-1 text-gray-700">{application.additionalInfo.reason}</p>
                              </div>
                            )}
                          </div>

                          {application.status === 'PENDING' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleReviewApplication(application.id, 'APPROVED')}
                                disabled={reviewMutation.isPending}
                                className="btn-primary"
                              >
                                通過申請
                              </button>
                              <button
                                onClick={() => handleReviewApplication(application.id, 'REJECTED')}
                                disabled={reviewMutation.isPending}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                              >
                                拒絕申請
                              </button>
                            </div>
                          )}

                          {application.reviewNotes && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-md">
                              <span className="font-medium">審核備註:</span>
                              <p className="mt-1 text-gray-700">{application.reviewNotes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {applications.totalPages > 1 && (
                      <div className="flex justify-center items-center space-x-2 mt-6">
                        <button
                          onClick={() => setApplicationPage(applicationPage - 1)}
                          disabled={applicationPage === 1}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          上一頁
                        </button>
                        
                        <span className="px-3 py-2 text-sm text-gray-700">
                          第 {applicationPage} 頁，共 {applications.totalPages} 頁
                        </span>
                        
                        <button
                          onClick={() => setApplicationPage(applicationPage + 1)}
                          disabled={applicationPage === applications.totalPages}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          下一頁
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">沒有申請需要處理</h3>
                    <p className="text-gray-600">目前沒有待審核的領養申請</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'listings' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">寵物清單</h2>
                
                {listingsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                ) : listings && listings.data.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {listings.data.map((listing: any) => (
                        <div key={listing.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {listing.images.length > 0 && (
                            <img
                              src={listing.images[0]}
                              alt={listing.name}
                              className="w-full h-48 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{listing.name}</h3>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                                {getStatusText(listing.status, 'listing')}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mb-2">
                              {listing.species === 'DOG' ? '狗狗' : '貓咪'} • {listing.age} 歲
                            </p>
                            
                            <p className="text-gray-700 mb-4 line-clamp-2">
                              {listing.description}
                            </p>
                            
                            <div className="space-y-2">
                              <select
                                value={listing.status}
                                onChange={(e) => handleUpdateListingStatus(listing.id, e.target.value as 'AVAILABLE' | 'PENDING' | 'ADOPTED' | 'WITHDRAWN')}
                                disabled={updateListingStatusMutation.isPending}
                                className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                              >
                                <option value="AVAILABLE">可領養</option>
                                <option value="PENDING">待審核</option>
                                <option value="ADOPTED">已領養</option>
                                <option value="WITHDRAWN">已下架</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {listings.totalPages > 1 && (
                      <div className="flex justify-center items-center space-x-2">
                        <button
                          onClick={() => setListingsPage(listingsPage - 1)}
                          disabled={listingsPage === 1}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          上一頁
                        </button>
                        
                        <span className="px-3 py-2 text-sm text-gray-700">
                          第 {listingsPage} 頁，共 {listings.totalPages} 頁
                        </span>
                        
                        <button
                          onClick={() => setListingsPage(listingsPage + 1)}
                          disabled={listingsPage === listings.totalPages}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          下一頁
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🐾</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">還沒有寵物清單</h3>
                    <p className="text-gray-600">開始新增寵物到平台上吧！</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage