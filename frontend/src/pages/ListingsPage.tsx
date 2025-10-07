import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listingsApi } from '../api/listings'
import { FilterOptions } from '../types'

const ListingsPage = () => {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [showFilters, setShowFilters] = useState(false)

  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['listings', page, filters],
    queryFn: () => listingsApi.getListings(page, 12, filters),
    placeholderData: (previousData) => previousData,
  })

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }))
    setPage(1) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setFilters({})
    setPage(1)
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">載入失敗</h1>
          <p className="text-gray-600">無法載入寵物列表，請稍後再試。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">等待領養的寵物</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary md:hidden"
          >
            篩選 🔍
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="card p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">篩選條件</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  清除全部
                </button>
              </div>

              <div className="space-y-6">
                {/* Species Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    動物種類
                  </label>
                  <select
                    value={filters.species || ''}
                    onChange={(e) => handleFilterChange('species', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">全部</option>
                    <option value="DOG">狗狗</option>
                    <option value="CAT">貓咪</option>
                  </select>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    性別
                  </label>
                  <select
                    value={filters.gender || ''}
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">全部</option>
                    <option value="MALE">男生</option>
                    <option value="FEMALE">女生</option>
                  </select>
                </div>

                {/* Size Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    體型
                  </label>
                  <select
                    value={filters.size || ''}
                    onChange={(e) => handleFilterChange('size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">全部</option>
                    <option value="SMALL">小型</option>
                    <option value="MEDIUM">中型</option>
                    <option value="LARGE">大型</option>
                  </select>
                </div>

                {/* Age Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    年齡
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="最小"
                      value={filters.minAge || ''}
                      onChange={(e) => handleFilterChange('minAge', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <input
                      type="number"
                      placeholder="最大"
                      value={filters.maxAge || ''}
                      onChange={(e) => handleFilterChange('maxAge', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Health Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    健康狀況
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.isVaccinated || false}
                        onChange={(e) => handleFilterChange('isVaccinated', e.target.checked || undefined)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">已疫苗接種</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.isSpayedNeutered || false}
                        onChange={(e) => handleFilterChange('isSpayedNeutered', e.target.checked || undefined)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">已結紮</span>
                    </label>
                  </div>
                </div>

                {/* Max Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最高領養費用
                  </label>
                  <input
                    type="number"
                    placeholder="NT$"
                    value={filters.maxFee || ''}
                    onChange={(e) => handleFilterChange('maxFee', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="lg:w-3/4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
              </div>
            ) : listings && listings.data && listings.data.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {listings.data.map((pet) => (
                    <div key={pet.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                      {pet.images.length > 0 && (
                        <img
                          src={pet.images[0]}
                          alt={pet.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold">{pet.name}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            pet.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {pet.status === 'AVAILABLE' ? '可領養' : '待審核'}
                          </span>
                        </div>
                        
                        <div className="text-gray-600 mb-2">
                          {pet.species === 'DOG' ? '🐕 狗狗' : '🐱 貓咪'} • {pet.age} 歲
                          {pet.breed && ` • ${pet.breed}`}
                        </div>
                        
                        <div className="text-gray-600 mb-2">
                          {pet.gender === 'MALE' ? '♂ 男生' : pet.gender === 'FEMALE' ? '♀ 女生' : '性別未知'} • 
                          {pet.size === 'SMALL' ? ' 小型' : pet.size === 'MEDIUM' ? ' 中型' : ' 大型'}
                        </div>

                        <div className="flex items-center mb-4 space-x-4 text-sm text-gray-600">
                          {pet.isVaccinated && (
                            <span className="flex items-center">
                              <span className="text-green-500 mr-1">✓</span>
                              已疫苗
                            </span>
                          )}
                          {pet.isSpayedNeutered && (
                            <span className="flex items-center">
                              <span className="text-green-500 mr-1">✓</span>
                              已結紮
                            </span>
                          )}
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {pet.description}
                        </p>

                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-primary-600">
                            NT$ {pet.adoptionFee.toLocaleString()}
                          </span>
                          <Link
                            to={`/listings/${pet.id}`}
                            className="btn-primary"
                          >
                            了解更多
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {listings && listings.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一頁
                    </button>
                    
                    <span className="px-3 py-2 text-sm text-gray-700">
                      第 {page} 頁，共 {listings.totalPages} 頁
                    </span>
                    
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === listings.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一頁
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🐾</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">沒有找到符合條件的寵物</h2>
                <p className="text-gray-600 mb-4">試著調整篩選條件，或稍後再來看看</p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  清除篩選條件
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListingsPage