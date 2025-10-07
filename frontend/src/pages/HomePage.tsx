import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listingsApi } from '../api/listings'

const HomePage = () => {
  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['featured-listings'],
    queryFn: () => listingsApi.getListings(1, 6),
  })

  if (error) {
    console.error('API Error:', error)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              給毛孩子一個溫暖的家
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              每一個生命都值得被愛護，每一份愛都值得被珍惜
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/listings"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                瀏覽所有寵物
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                註冊成為飼主
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Pets Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              等待家庭的毛孩子
            </h2>
            <p className="text-lg text-gray-600">
              他們正在等待一個溫暖的家
            </p>
          </div>
          
          {isLoading && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">載入中...</p>
            </div>
          )}

          {error && (
            <div className="text-center">
              <p className="text-red-600">載入失敗，請稍後再試</p>
            </div>
          )}
          
          {listings?.data && listings.data.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6">
              {listings.data.map((pet) => {
                let photos = [];
                try {
                  photos = pet.photos ? JSON.parse(pet.photos) : [];
                } catch (e) {
                  console.error('Error parsing photos:', e);
                }
                
                return (
                  <div key={pet.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {photos.length > 0 && (
                      <img
                        src={photos[0]}
                        alt={`${pet.species} - ${pet.breed || '混種'}`}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">
                        {pet.breed || pet.species} • {pet.ageEstimate || '未知'} 歲
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {pet.species === 'dog' ? '狗' : '貓'} • {pet.gender || '未知'} • {pet.location}
                      </p>
                      <p className="text-gray-700 mb-4">
                        {pet.description || '這是一隻可愛的寵物，正在尋找溫暖的家'}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {pet.spayedNeutered ? '已結紮' : '未結紮'}
                        </span>
                        <Link
                          to={`/listings/${pet.id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          了解更多
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {listings?.data && listings.data.length > 0 && (
            <div className="text-center mt-8">
              <Link
                to="/listings"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                查看更多寵物
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            準備好迎接新家庭成員了嗎？
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            加入我們的愛心大家庭，給毛孩子一個充滿愛的家
          </p>
          <Link
            to="/listings"
            className="bg-blue-600 text-white text-lg px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            開始尋找你的毛孩子
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage