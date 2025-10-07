import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { applicationsApi } from '../api/applications'
import { useAuth } from '../hooks/useAuth'

const ProfilePage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('applications')

  const { data: applications, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationsApi.getMyApplications(),
  })

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
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
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
          <h1 className="text-3xl font-bold text-gray-900">個人資料</h1>
          <p className="mt-2 text-gray-600">管理您的帳戶設定和領養申請</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">{user?.username}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'applications'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  我的申請
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'profile'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  個人資料設定
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'notifications'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  通知設定
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'applications' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-6">我的領養申請</h2>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                ) : applications && applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((application: any) => (
                      <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
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
                                {application.animal?.species === 'DOG' ? '狗狗' : '貓咪'} • 
                                {application.animal?.age} 歲
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
                            {getStatusText(application.status)}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>申請時間: {new Date(application.submittedAt).toLocaleDateString('zh-TW')}</p>
                          {application.reviewedAt && (
                            <p>審核時間: {new Date(application.reviewedAt).toLocaleDateString('zh-TW')}</p>
                          )}
                          {application.reviewNotes && (
                            <p className="mt-2">
                              <span className="font-medium">審核備註:</span> {application.reviewNotes}
                            </p>
                          )}
                        </div>

                        {application.status === 'PENDING' && (
                          <div className="mt-4">
                            <button className="text-sm text-primary-600 hover:text-primary-700">
                              修改申請
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">還沒有申請記錄</h3>
                    <p className="text-gray-600 mb-4">開始瀏覽可愛的寵物，提交您的第一個領養申請！</p>
                    <button
                      onClick={() => window.location.href = '/listings'}
                      className="btn-primary"
                    >
                      瀏覽寵物
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-6">個人資料設定</h2>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        名字
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.firstName || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        姓氏
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.lastName || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      用戶名稱
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.username || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      電子郵件
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      電話號碼
                    </label>
                    <input
                      type="tel"
                      defaultValue={user?.phoneNumber || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary">
                      儲存變更
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-6">通知設定</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">申請狀態更新</h3>
                      <p className="text-gray-600 text-sm">當您的領養申請狀態有變更時通知您</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">新寵物通知</h3>
                      <p className="text-gray-600 text-sm">當有新的寵物可供領養時通知您</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">系統公告</h3>
                      <p className="text-gray-600 text-sm">接收重要的系統公告和更新</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">電子郵件通知</h3>
                      <p className="text-gray-600 text-sm">透過電子郵件接收通知</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <button className="btn-primary">
                    儲存設定
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage